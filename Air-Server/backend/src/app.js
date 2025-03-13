import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ResponderService from "./services/responderService.js";
import JobService from "./services/jobService.js";
import { initializeDB } from "./utils/dbConnector.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Responder Routes
app.post("/api/responders/register", (req, res) =>
  ResponderService.registerResponder(req, res)
);
app.post("/api/responders/deregister", (req, res) =>
  ResponderService.deregisterResponder(req, res)
);
app.get("/api/responders", (req, res) =>
  ResponderService.getAllResponders(req, res)
);

// Job Routes
app.post("/api/jobs/assign", (req, res) => JobService.assignJob(req, res));

app.post("/api/jobs/pending", (req, res) => JobService.getPendingJob(req, res));

app.post("/api/jobs/complete", (req, res) =>
  JobService.updateJobStatus(req, res)
);

// Start the server
const PORT = process.env.APP_PORT;

initializeDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Database Initialization Failed:", error);
  });

export default app;
