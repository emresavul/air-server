import { pool } from "../utils/dbConnector.js";
import crypto from "crypto";

class ResponderService {
  /**
   * Retrieves all registered responders with their details.
   */
  async getAllResponders(req, res) {
    try {
      const [rows] = await pool.execute(
        "SELECT id, name, ip_address, operating_system, status, last_seen FROM responders WHERE is_registered = TRUE"
      );
      res.status(200).json(rows);
    } catch (error) {
      console.error("❌ Error fetching responders:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  /**
   * Registers a responder.
   * If a token is provided and valid, it re-registers the responder.
   * Otherwise, it creates a new responder with a unique token.
   */
  async registerResponder(req, res) {
    try {
      const { token } = req.body;

      if (token) {
        // Check if a responder with this token exists
        const [rows] = await pool.execute(
          "SELECT * FROM responders WHERE token = ?",
          [token]
        );

        if (rows.length > 0) {
          // If responder is already registered, return 400
          if (rows[0].is_registered) {
            console.log(
              `⚠️ Responder '${rows[0].name}' is already registered.`
            );
            return res.status(400).json({
              error: "Responder already registered.",
            });
          }

          // If responder is not registered, generate a new token
          const newToken = crypto.randomBytes(16).toString("hex");
          await pool.execute(
            "UPDATE responders SET status = 'healthy', last_seen = NOW(), token = ?, is_registered = TRUE WHERE token = ?",
            [newToken, token]
          );

          console.log(
            `🔄 Responder '${rows[0].name}' re-registered with new token.`
          );
          return res.status(201).json({
            id: rows[0].id,
            name: rows[0].name,
            token: newToken,
            message: "Registered with new token",
          });
        }
      }

      // If no token exists, create a new responder
      const newToken = crypto.randomBytes(16).toString("hex");
      const responderName = `Responder-${Math.floor(Math.random() * 1000)}`;
      // Generate a random status: 75% chance 'healthy', 25% chance 'unhealthy'
      const status = Math.random() < 0.75 ? "healthy" : "unhealthy";

      const [result] = await pool.execute(
        "INSERT INTO responders (name, token, status, is_registered) VALUES (?, ?, ?, TRUE)",
        [responderName, newToken, status]
      );

      console.log(`✅ New responder created: ${responderName}`);
      res.status(200).json({
        id: result.insertId,
        name: responderName,
        token: newToken,
        status: status,
        message: "Registered with new token",
      });
    } catch (error) {
      console.error("❌ Error registering responder:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  /**
   * Deregisters a responder by updating its `is_registered` status to false.
   */
  async deregisterResponder(req, res) {
    try {
      const { token } = req.body;

      // Check if the responder exists
      const [rows] = await pool.execute(
        "SELECT * FROM responders WHERE token = ?",
        [token]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Responder not found" });
      }

      // If responder is already deregistered, return 400
      if (!rows[0].is_registered) {
        console.log(`⚠️ Responder '${rows[0].name}' is already deregistered.`);
        return res.status(400).json({
          error: "Responder already deregistered",
        });
      }

      // Update responder is_register to false instead of deleting it
      await pool.execute(
        "UPDATE responders SET is_registered = FALSE, last_seen = NOW() WHERE token = ?",
        [token]
      );

      console.log(`⚠️ Responder '${rows[0].name}' marked as deregistered.`);
      res.status(200).json({ message: "Responder deregistered successfully" });
    } catch (error) {
      console.error("❌ Error deregistering responder:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default new ResponderService();
