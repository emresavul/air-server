import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
} from "@mui/material";

const API_URL = "http://localhost:5001/api/responders";

export default function ResponderDashboard() {
  const [responders, setResponders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResponders();
    const interval = setInterval(fetchResponders, 15000); // Auto-refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchResponders = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setResponders(data);
    } catch (error) {
      console.error("Error fetching responders:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <TableContainer component={Paper} elevation={3} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>IP Address</strong>
              </TableCell>
              <TableCell>
                <strong>Operating System</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell>
                <strong>Last Seen</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : responders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No responders available.
                </TableCell>
              </TableRow>
            ) : (
              responders.map((responder) => (
                <TableRow key={responder.id}>
                  <TableCell>{responder.name}</TableCell>
                  <TableCell>{responder.ip_address || "N/A"}</TableCell>
                  <TableCell>{responder.operating_system || "N/A"}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        responder.status.charAt(0).toUpperCase() +
                        responder.status.slice(1)
                      }
                      color={
                        responder.status === "healthy" ? "success" : "error"
                      }
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>
                  <TableCell>
                    {responder.last_seen
                      ? new Date(responder.last_seen).toLocaleString()
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
