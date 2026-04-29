const BASE_URL = "http://localhost:3000/api";

export async function getStudentAttendance(rollNo: string) {
  const res = await fetch(`${BASE_URL}/attendance/summary/${rollNo}`);
  const data = await res.json();
  return data.summary;
}

export async function getTeacherStudents() {
  const res = await fetch(`${BASE_URL}/teacher/students`);
  const data = await res.json();
  return data.students;
}

export async function startSessionAPI(professorId: number, subjectId: number) {
  const res = await fetch('http://localhost:3000/api/session/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ professor_id: professorId, subject_id: subjectId }),
  });
  return res.json();
}

export async function getActiveSessionAPI(professorId?: string) {
  const url = professorId 
    ? `http://localhost:3000/api/session/active/professor/${professorId}`
    : `http://localhost:3000/api/session/active`;
  const res = await fetch(url);
  return res.json();
}

export async function markAttendanceAPI(sessionId: number, rollNo: string, otpEntered: string) {
  console.log('API call: markAttendanceAPI', { sessionId, rollNo, otpEntered });
  
  try {
    const res = await fetch('http://localhost:3000/api/attendance/mark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, roll_no: rollNo, otp_entered: otpEntered }),
    });
    console.log('API response status:', res.status);
    const result = await res.json();
    console.log('API response result:', result);
    return result;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

export async function getSessionAttendance(sessionId: number) {
  const res = await fetch(`http://localhost:3000/api/session/attendance/${sessionId}`);
  return res.json();
}

export async function getMonthlyTrends(subjectId: number) {
  const res = await fetch(`http://localhost:3000/api/attendance/monthly/${subjectId}`);
  return res.json();
}

export async function getAIInsight(attendanceData: any[]) {
  const res = await fetch('http://localhost:3000/api/ai/insight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attendanceData }),
  });
  return res.json();
}
