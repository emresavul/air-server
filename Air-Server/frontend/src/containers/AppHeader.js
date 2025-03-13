import React from "react";
import { AppBar, Toolbar, Typography, Avatar, Box, Link } from "@mui/material";
import userImage from "../assets/user.jpg";

const AppHeader = () => {
  return (
    <AppBar
      position="sticky"
      sx={{
        mb: 4,
        backgroundColor: "#ffffff", // Grey background
        boxShadow: "none",
        borderBottom: "1px solid #e0e0e0", // Subtle bottom border for modern feel
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Typography
            variant="h6"
            href="/"
            sx={{
              textDecoration: "none",
              fontWeight: "bold",
              color: "#333", // Dark grey text
            }}
          >
            Air Server
          </Typography>

          {/* Navigation Links */}
          <Box sx={{ display: "flex", gap: 3 }}>
            <Link
              href="/responders"
              underline="none"
              sx={{
                color: "#333",
                "&:hover": { color: "#1976d2" },
              }}
            >
              Responders
            </Link>
            <Link
              href="/statuses"
              underline="none"
              sx={{
                color: "#333",
                "&:hover": { color: "#1976d2" },
              }}
            >
              Statuses
            </Link>
          </Box>
        </Box>

        {/* User Info - Right Aligned */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="body1"
            sx={{ color: "#333", fontWeight: "bold" }}
          >
            Air User
          </Typography>
          <Avatar src={userImage} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
