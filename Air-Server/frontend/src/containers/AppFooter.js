import React from "react";
import { Box, Typography, Link, Container } from "@mui/material";

const AppFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#ffffff",
        py: 1,
        mt: "auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid #e0e0e0",
      }}
    >
      <Container
        maxWidth="xxl"
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        {/* Left Side */}
        <Box>
          <Typography component="span" sx={{ mr: 1 }}>
            Developed by
          </Typography>
          <Link
            href=""
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: "inherit",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Emre Savul
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default AppFooter;
