# AIR Server - Responder Monitoring System

## 📌 Overview

AIR Server is a **near-real-time responder monitoring system** designed for tracking, registering, and managing responders efficiently. The system consists of three main components:

- **Backend** (Node.js & Express) - API handling responder registration, job assignment, and completion.
- **Frontend** (React) - Dashboard for monitoring responders and job statuses.
- **Responder Agent** (CLI Application) - Agents that communicate with the server for job assignments.

## 📂 Project Structure

```
│── Air-Server/
│   ├── backend/            # Backend API (Node.js, Express)
│   │   ├── src/            # Backend source code
│   │   ├── .env            # Environment variables (Pushed to repository)
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

## 🛠️ Prerequisites

Before setting up the project, ensure you have the following installed:

1. **[Node.js](https://nodejs.org/) (version 18 or later)**

   - Required to run the backend server and install dependencies.
   - The responder agent also runs using Node.js.

2. **[Docker](https://www.docker.com/) & Docker Compose**

   - Required to containerize the backend, frontend, and database.
   - Helps in managing and deploying services easily.

3. **[MySQL](https://www.mysql.com/) (if not using Docker for the database)**

   - Used as the primary database for storing responders and jobs.
   - If running without Docker, ensure MySQL is installed and configured.

4. **Git (for cloning the repository)**
   - Required to fetch the project from GitHub and manage version control.

These dependencies ensure a smooth setup and execution of the AIR Server system. 🚀

---

## 🛠️ Setup & Installation

### 1️⃣ Clone Repository

```sh
git clone https://github.com/emresavul/air-server.git
cd Air-Server
```

### 2️⃣ Configure Environment Variables

An `.env` file is already included in the repository. You can modify it as needed:

```ini
DB_HOST=air-db        #  Use container name, NOT 127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=airdb
DB_PORT=3306

APP_PORT=5001
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
npm install
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

## 📌 Running Ports

| Service  | Default Port |
| -------- | ------------ |
| Backend  | 5001         |
| Frontend | 3000         |
| Database | 3306         |

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
APP_PORT=5001
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

- **Event-Driven Job Assignment**: When a responder **completes a job**, it **immediately requests a new job**, instead of waiting for a scheduled job assignment.
- **Single Job Execution per Responder**: Each responder **can only work on one job at a time**, and once completed, a new job is assigned. However, **completed jobs are logged as separate records in the database** to maintain a full history.
- **Multiple AIR Server Support**: The system supports **multiple AIR Server instances** by modifying **Docker Compose and port configurations**. To direct agents to a new instance, the **endpoint inside the Responder Agent must be updated manually**.
- **Health Monitoring**: Each responder updates its **last_seen** timestamp, and unhealthy responders **do not receive new jobs**.

---

## 🤝 Contributing

If you'd like to contribute, feel free to open a pull request! 🛠️

🚀 **Happy Coding!** 🎉
