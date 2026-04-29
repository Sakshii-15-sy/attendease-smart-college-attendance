const mysql2 = require('mysql2');
const fs = require('fs');
require('dotenv').config();

const db = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  multipleStatements: true
});

const sql = fs.readFileSync('C:\\Users\\SAKSHI\\Downloads\\attendance_schema.sql', 'utf8');

const cleanSql = sql
  .replace(/CREATE DATABASE.*?;/gs, '')
  .replace(/USE.*?;/g, '')
  .trim();

db.connect((err) => {
  if (err) {
    console.log('❌ Connection failed:', err.message);
    return;
  }
  console.log('✅ Connected! Running SQL...');
  db.query(cleanSql, (err) => {
    if (err) {
      console.log('❌ SQL Error:', err.message);
    } else {
      console.log('✅ All tables created successfully!');
    }
    db.end();
  });
});