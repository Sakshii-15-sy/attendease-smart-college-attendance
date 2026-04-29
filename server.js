const express = require('express');
const mysql2 = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) {
    console.log('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected!');
  }
});

// ── Student Login ──
app.post('/api/student/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM students WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0)
      return res.status(401).json({ message: 'Invalid credentials' });
    const student = results[0];
    const match = await bcrypt.compare(password, student.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ success: true, student });
  });
});

// ── Teacher Login ──
app.post('/api/teacher/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM professors WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0)
      return res.status(401).json({ message: 'Invalid credentials' });
    const teacher = results[0];
    const match = await bcrypt.compare(password, teacher.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ success: true, teacher });
  });
});

// ── Start Session + Generate OTP ──
app.post('/api/session/start', (req, res) => {
  const { professor_id, subject_id } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otp_expires_at = new Date(Date.now() + 30000); // 30 seconds
  db.query(
    'INSERT INTO sessions (professor_id, subject_id, otp_code, otp_expires_at, status) VALUES (?, ?, ?, ?, "active")',
    [professor_id, subject_id, otp, otp_expires_at],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed to start session' });
      res.json({ success: true, session_id: result.insertId, otp, otp_expires_at });
    }
  );
});

// ── Mark Attendance ──
app.post('/api/attendance/mark', (req, res) => {
  const { session_id, roll_no, otp_entered } = req.body;
  db.query(
    'SELECT * FROM sessions WHERE id = ? AND otp_code = ? AND otp_expires_at > NOW() AND status = "active"',
    [session_id, otp_entered],
    (err, results) => {
      if (err || results.length === 0)
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      const today = new Date().toISOString().split('T')[0];
      db.query(
        'INSERT INTO attendance (session_id, student_roll_no, date, present, in_campus) VALUES (?, ?, ?, 1, 1) ON DUPLICATE KEY UPDATE present = 1',
        [session_id, roll_no, today],
        (err2) => {
          if (err2) return res.status(500).json({ message: 'Failed to mark attendance' });
          res.json({ success: true, message: 'Attendance marked!' });
        }
      );
    }
  );
});

// ── Get Student Attendance Summary ──
app.get('/api/attendance/summary/:roll_no', (req, res) => {
  const { roll_no } = req.params;
  db.query(
    'SELECT * FROM v_student_attendance_summary WHERE student_roll_no = ?',
    [roll_no],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed to fetch summary' });
      res.json({ success: true, summary: results });
    }
  );
});

// ── Get All Students (for Teacher) ──
app.get('/api/teacher/students', (req, res) => {
  db.query('SELECT * FROM v_student_attendance_summary', (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch students' });
    res.json({ success: true, students: results });
  });
});

// ── Get Active Session (for student polling) ──
app.get('/api/session/active', (req, res) => {
  db.query(
    'SELECT * FROM sessions WHERE status = "active" AND otp_expires_at > NOW() ORDER BY started_at DESC LIMIT 1',
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Error' });
      if (results.length === 0) return res.json({ active: false });
      res.json({ active: true, session: results[0] });
    }
  );
});

// ── End Session ──
app.post('/api/session/end', (req, res) => {
  const { session_id } = req.body;
  db.query(
    'UPDATE sessions SET status = "completed" WHERE id = ?',
    [session_id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error' });
      res.json({ success: true });
    }
  );
});

app.get('/api/teacher/subjects/:professorId', (req, res) => {
  db.query(
    'SELECT * FROM professor_subjects WHERE professor_id = ?',
    [req.params.professorId],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Error' });
      res.json({ subjects: results });
    }
  );
});
// ── Get Monthly Attendance Trends ──
app.get('/api/attendance/monthly/:subjectId', (req, res) => {
  db.query(
    `SELECT 
      MONTHNAME(a.date) as month,
      MONTH(a.date) as month_num,
      COUNT(*) as total,
      SUM(a.present) as present,
      SUM(CASE WHEN a.present = 0 THEN 1 ELSE 0 END) as absent
     FROM attendance a
     JOIN sessions s ON s.id = a.session_id
     WHERE s.subject_id = ?
     GROUP BY MONTH(a.date), MONTHNAME(a.date)
     ORDER BY month_num`,
    [req.params.subjectId],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Error' });
      res.json({ success: true, trends: results });
    }
  );
});

// ── AI Insight ──
app.post('/api/ai/insight', async (req, res) => {
  const { attendanceData } = req.body;
  
  const prompt = `You are an attendance analysis assistant. Based on this attendance data: ${JSON.stringify(attendanceData)}, provide a 2-sentence insight about attendance patterns and one actionable recommendation for the teacher. Be specific and concise.`;

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_GEMINI_API_KEY', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await response.json();
    const insight = data.candidates[0].content.parts[0].text;
    res.json({ success: true, insight });
  } catch (err) {
    res.json({ success: false, insight: "Unable to generate insight at this time." });
  }
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── AI Insight ──
app.post('/api/ai/insight', async (req, res) => {
  const { attendanceData } = req.body;
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `You are an attendance analysis assistant for a college. Based on this attendance data: ${JSON.stringify(attendanceData)}, provide exactly 2 sentences: one about the attendance pattern and one actionable recommendation for the teacher. Be specific and concise.`
        }
      ],
      model: 'llama3-8b-8192',
    });
    const insight = completion.choices[0].message.content;
    res.json({ success: true, insight });
  } catch (err) {
    console.error('AI Insight Error:', err);
    res.json({ success: false, insight: "Unable to generate insight at this time." });
  }
});

app.listen(3000, () => console.log('🚀 Server running on port 3000'));