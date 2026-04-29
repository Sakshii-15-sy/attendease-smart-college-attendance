const mysql2 = require('mysql2');
const bcrypt = require('bcrypt');
require('dotenv').config();

const db = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

async function seed() {
  db.connect();
  console.log('🌱 Seeding data...');

  const hash = await bcrypt.hash('password123', 10);

  // Step 1 — Teachers
  db.query(
    'INSERT INTO professors (username, password_hash, edit_pass_hash) VALUES ?',
    [[
      ['Dr. V. S. Shirwal', hash, hash],
      ['Prof. U. A. Bongale', hash, hash],
      ['Prof. S. S. Dhotre', hash, hash],
      ['Dr. P. D. Bahirgonde', hash, hash],
      ['Prof. A. A. Chandanshive', hash, hash],
    ]],
    (err) => {
      if (err) { console.log('❌ Teachers error:', err.message); db.end(); return; }
      console.log('✅ Teachers added!');

      // Step 2 — Subjects
      db.query(
        'INSERT INTO professor_subjects (professor_id, subject_name) VALUES ?',
        [[
          [1, 'Microprocessor'],
          [1, 'Mini Project'],
          [2, 'Antenna and Wave Propagation'],
          [2, 'Technical Writing'],
          [3, 'Digital Communication'],
          [3, 'Data Structures'],
          [4, 'VLSI Design'],
          [4, 'Theory of Computation'],
          [5, 'IoT'],
          [5, 'Industry 4.0'],
        ]],
        (err) => {
          if (err) { console.log('❌ Subjects error:', err.message); db.end(); return; }
          console.log('✅ Subjects added!');

          // Step 3 — Students
          db.query(
            'INSERT INTO students (username, password_hash, roll_no, phone, mac_address) VALUES ?',
            [[
              ['Sakshi', hash, 'TY-73', '9100000001', 'AA:BB:CC:DD:EE:01'],
              ['Priyanka', hash, 'TY-65', '9100000002', 'AA:BB:CC:DD:EE:02'],
              ['Sanjivani', hash, 'TY-33', '9100000003', 'AA:BB:CC:DD:EE:03'],
              ['Pushkaraj', hash, 'TY-41', '9100000004', 'AA:BB:CC:DD:EE:04'],
              ['Aditya', hash, 'TY-45', '9100000005', 'AA:BB:CC:DD:EE:05'],
            ]],
            (err) => {
              if (err) { console.log('❌ Students error:', err.message); db.end(); return; }
              console.log('✅ Students added!');

              // Step 4 — Session
              db.query(
                'INSERT INTO sessions (professor_id, subject_id, otp_code, otp_expires_at, status) VALUES (1, 1, "123456", NOW(), "completed")',
                (err, result) => {
                  if (err) { console.log('❌ Session error:', err.message); db.end(); return; }
                  console.log('✅ Session added!');

                  const sessionId = result.insertId;

                  // Step 5 — Attendance
                  db.query(
                    'INSERT INTO attendance (session_id, student_roll_no, date, present, in_campus) VALUES ?',
                    [[
                      [sessionId, 'TY-73', '2026-04-01', 1, 1],
                      [sessionId, 'TY-65', '2026-04-01', 1, 1],
                      [sessionId, 'TY-33', '2026-04-01', 0, 0],
                      [sessionId, 'TY-41', '2026-04-01', 1, 1],
                      [sessionId, 'TY-45', '2026-04-01', 0, 1],
                    ]],
                    (err) => {
                      if (err) console.log('❌ Attendance error:', err.message);
                      else console.log('✅ Attendance added!');
                      db.end();
                      console.log('🎉 All done! Database is ready.');
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}

seed();