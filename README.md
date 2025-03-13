# AIR Server - Responder Monitoring System

## 📌 Overview

AIR Server is a **real-time responder monitoring system** designed for tracking, registering, and managing responders efficiently. The system consists of three main components:

- **Backend** (Node.js & Express) - API handling responder registration, job assignment, and completion.
- **Frontend** (React) - Dashboard for monitoring responders and job statuses.
- **Responder Agent** (CLI Application) - Agents that communicate with the server for job assignments.

## 📂 Project Structure

```
│── Air-Server/
│   ├── backend/            # Backend API (Node.js, Express)
│   │   ├── src/            # Backend source code
│   │   ├── .env            # Environment variables
│   │   ├── Dockerfile      # Docker configuration for backend
│   │   ├── package.json    # Node.js dependencies
│   │   ├── package-lock.json
│   ├── frontend/           # Frontend UI (React)
│   │   ├── src/            # Frontend source code
│   │   ├── public/         # Static assets
│   │   ├── Dockerfile      # Docker configuration for frontend
│   │   ├── package.json    # React dependencies
│   │   ├── package-lock.json
│   ├── docker-compose.yml  # Docker Compose setup
│── Responder-Agent/
│   ├── responderAgent.js   # Responder agent script
│── .gitignore
│── README.md
```

---

## 🛠️ Setup & Installation

### 1️⃣ Clone Repository

```sh
git clone https://github.com/emresavul/air-server.git
cd Air-Server
```

### 2️⃣ Configure Environment Variables

Create a `.env` file inside `backend/` and define:

```ini
DB_HOST=air-db
DB_USER=root
DB_PASSWORD=
DB_NAME=airdb
DB_PORT=3306
PORT=5001
```

### 3️⃣ Start Services (Docker)

Ensure Docker is installed and run:

```sh
docker-compose up --build
```

### 4️⃣ Running Services Manually

**Backend:**

```sh
cd backend
npm install  # If running for the first time
npm start
```

**Frontend:**

```sh
cd frontend
npm install
npm start
```

**Responder Agent:**

```sh
cd Responder-Agent
node responderAgent.js
```

---

## 📊 Database Schema & Tables

The system uses **MySQL** to store responder and job details.

### **1️⃣ Responders Table**

```sql
CREATE TABLE responders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50) NULL,
    operating_system VARCHAR(50) NULL,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('healthy', 'unhealthy') DEFAULT 'healthy',
    token VARCHAR(255) NOT NULL UNIQUE,
    is_registered BOOLEAN DEFAULT TRUE
);
```

### **2️⃣ Jobs Table**

```sql
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT NOT NULL,
    assigned_to INT NULL,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    result TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (assigned_to) REFERENCES responders(id) ON DELETE SET NULL
);
```

### **Database Schema Diagram**

```
+----------------+
|  Responders    |
+----------------+
| id (PK)        |
| name           |
| ip_address     |
| operating_system |
| last_seen      |
| status         |
| token (Unique) |
| is_registered  |
+----------------+
        |
        | (FK: assigned_to)
        v
+----------------+
|   Jobs        |
+----------------+
| id (PK)       |
| description   |
| assigned_to   |
| status        |
| result        |
| created_at    |
| completed_at  |
+----------------+
```

---

## 📌 API Endpoints

### **Responder API**

- **Register Responder**: `POST /api/responders/register`
- **Deregister Responder**: `POST /api/responders/deregister`
- **Get All Responders**: `GET /api/responders`

### **Job API**

- **Assign Job to Responder**: `POST /api/jobs/assign`
- **Get Pending Jobs**: `POST /api/jobs/pending`
- **Complete Job**: `POST /api/jobs/complete`

---

## 📌 Responder Agent

The **Responder Agent** is a CLI-based application that registers itself with the Air Server, fetches assigned jobs, and completes them before requesting new ones.

### **Running Responder Agent**

```sh
cd Responder-Agent
node responderAgent.js
```

### **CLI Commands**

- `register` - Register an agent to Air-Server
- `deregister` - Deregister an agent
- `register<number>` (e.g., `register10`) - Spawn multiple agents
- `deregisterall` - Deregister all spawned agents
- `exit` - Quit the application

---

## 🚀 Running Multiple Backend Instances

If you want to run multiple backend instances on different ports:

1. Change the **PORT** in `.env` file:

```ini
PORT=5002
```

2. Run the backend service on the new port:

```sh
cd backend
PORT=5002 npm start
```

3. Update your `docker-compose.yml` to expose new ports:

```yaml
services:
  air-server-backend-2:
    build: ./backend
    ports:
      - "5002:5002"
    environment:
      - PORT=5002
```

4. Start the new service:

```sh
docker-compose up --build air-server-backend-2
```

---

## 📈 General Approach & Event-Driven Architecture

- **Event-Driven Job Assignment**: When a responder completes a job, it **immediately requests a new job**, instead of waiting for a scheduled job assignment.
- **Batch Updates**: To avoid API overload, responders update job completion in **batches**.
- **Efficient Database Transactions**: Instead of inserting multiple jobs for a responder, we **override existing rows**, ensuring only **one active job per responder**.
- **Health Monitoring**: Each responder updates its **last_seen** timestamp, and unhealthy responders do not receive new jobs.

---

## 🤝 Contributing

If you'd like to contribute, feel free to open a pull request! 🛠️

🚀 **Happy Coding!** 🎉
