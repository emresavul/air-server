import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DB_HOST = process.env.DB_HOST || "air-db";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "airdb";

// Function to wait for MySQL container to be ready
const waitForDB = async (retries = 10, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Attempting to connect to MySQL (${i + 1}/${retries})...`);
      const connection = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
      });
      console.log("✅ MySQL is ready!");
      await connection.end();
      return;
    } catch (error) {
      console.warn(
        `⚠️ MySQL not ready yet. Retrying in ${delay / 1000} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  console.error("❌ Failed to connect to MySQL. Exiting...");
  process.exit(1);
};

// Function to create database if it doesn't exist
const ensureDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    console.log(`✅ Database '${DB_NAME}' ensured.`);
    await connection.end();
  } catch (error) {
    console.error("❌ Error ensuring database:", error);
    process.exit(1);
  }
};

// Ensure database before creating the pool
await waitForDB();
await ensureDatabase();

// Create connection pool **AFTER** ensuring the database exists
export const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME, // Now safe to use
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to initialize tables
export const initializeDB = async () => {
  try {
    const connection = await pool.getConnection();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS responders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        ip_address VARCHAR(50),
        operating_system VARCHAR(50),
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('healthy', 'unhealthy') DEFAULT 'healthy',
        token VARCHAR(255) NOT NULL UNIQUE,
        is_registered BOOLEAN DEFAULT TRUE
      )
    `);
    console.log("✅ Responders table ensured.");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        description TEXT NOT NULL,
        assigned_to INT NULL,
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        result TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (assigned_to) REFERENCES responders (id) ON DELETE SET NULL
      )
    `);
    console.log("✅ Jobs table ensured.");

    connection.release();
  } catch (error) {
    console.error("❌ Database Initialization Error:", error);
    process.exit(1);
  }
};

// 🏁 Run database setup before starting backend
await initializeDB();
