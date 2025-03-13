import { pool } from "../utils/dbConnector.js";

class JobService {
  /**
   * Updates the job status when a responder completes a job.
   * Also updates the responder's details (IP, OS, last seen) and marks them as healthy.
   */
  async updateJobStatus(req, res) {
    try {
      const { token, result, ip_address, operating_system } = req.body;

      // Find the responder by token
      const [responders] = await pool.execute(
        "SELECT id FROM responders WHERE token = ?",
        [token]
      );

      if (responders.length === 0) {
        return res.status(401).json({ error: "Unauthorized responder" });
      }

      const responderId = responders[0].id;

      // Check if there is a pending job for this responder
      const [jobs] = await pool.execute(
        "SELECT id FROM jobs WHERE assigned_to = ? AND status = 'pending'",
        [responderId]
      );

      if (jobs.length === 0) {
        return res
          .status(400)
          .json({ error: "No pending job for this responder." });
      }

      const jobId = jobs[0].id;

      // Update the job status and save the result
      await pool.execute(
        "UPDATE jobs SET status = 'completed', result = ?, completed_at = NOW() WHERE id = ? AND assigned_to = ?",
        [result, jobId, responderId]
      );

      // Update the responder's information
      await pool.execute(
        "UPDATE responders SET ip_address = ?, operating_system = ?, last_seen = NOW(), status = 'healthy' WHERE id = ?",
        [ip_address, operating_system, responderId]
      );

      console.log(
        `✅ Responder '${responderId}' completed job ${jobId} and is now healthy`
      );
      res.status(200).json({
        responderId: responderId,
        jobId: jobId,
        message: "Job completed, responder updated as healthy",
      });
    } catch (error) {
      console.error("❌ Error updating job:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  /**
   * Assigns a new job to a specific responder.
   */
  async assignJob(req, res) {
    const { responderId } = req.body;
    try {
      const jobDescription = "Automated system checkup task";

      // Insert a new job for the responder
      const [job] = await pool.execute(
        "INSERT INTO jobs (description, assigned_to, status) VALUES (?, ?, 'pending')",
        [jobDescription, responderId]
      );

      console.log(`🛠️ New job assigned to responder '${responderId}'`);
      res.status(200).json({ jobId: job.insertId });
    } catch (error) {
      console.error("❌ Error assigning new job:", error);
    }
  }
  /**
   * Retrieves the pending job for a responder if available.
   */
  async getPendingJob(req, res) {
    try {
      const { token } = req.body;

      // Find responder by token
      const [responders] = await pool.execute(
        "SELECT id FROM responders WHERE token = ?",
        [token]
      );

      if (responders.length === 0) {
        return res.status(401).json({ error: "Unauthorized responder" });
      }

      const responderId = responders[0].id;

      // Get the pending job for this responder
      const [jobs] = await pool.execute(
        "SELECT id, description FROM jobs WHERE assigned_to = ? AND status = 'pending' LIMIT 1",
        [responderId]
      );

      if (jobs.length === 0) {
        return res.status(200).json({ message: "No pending jobs" });
      }

      res
        .status(200)
        .json({ jobId: jobs[0].id, description: jobs[0].description });
    } catch (error) {
      console.error("❌ Error fetching pending job:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default new JobService();
