// src/Pages/HomePage.jsx
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  CssBaseline,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function VisitorLandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: `url(${theme.images.landingBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, color: "#fff" }}>
              FitnessMe
            </Typography>
            <Button
              onClick={() => navigate("/ecommerce")}
              sx={{
                mr: 2,
                color: "#fff",
                textShadow: "0px 1px 3px rgba(0,0,0,0.8)",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              E-Commerce
            </Button>
            <Button
              onClick={() => navigate("/faq")}
              sx={{
                mr: 2,
                color: "#fff",
                textShadow: "0px 1px 3px rgba(0,0,0,0.8)",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              FAQ
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/signup")}
              sx={{ mr: 2 }}
            >
              Sign Up
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/login")}
            >
              Log In
            </Button>
          </Toolbar>
        </AppBar>

        <Container
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            color: "#fff",
            px: 2,
          }}
        >
          <Typography variant="h3" gutterBottom>
            Welcome to FitnessMe!
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, maxWidth: 500, opacity: 0.9 }}
          >
            Explore our fitness plans, track your progress, and achieve your
            health goals with personalized recommendations.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate("/explore")}
            sx={{ mr: 2 }}
          >
            EXPLORE FITNESSME
          </Button>
        </Container>
      </Box>
    </>
  );
}
