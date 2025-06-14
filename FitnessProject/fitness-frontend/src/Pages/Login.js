// src/Pages/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  TextField,
  CssBaseline,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setCredentials((c) => ({ ...c, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // login + verify
      await axios.post("http://localhost:8000/api/login/", credentials, {
        withCredentials: true,
      });
      const profile = await axios.get("http://localhost:8000/api/profile/", {
        withCredentials: true,
      });
      if (profile.status === 200) navigate("/dashboard");
      else setError("Could not verify authentication.");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Invalid credentials, please try again."
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${theme.images.profileBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: theme.spacing(2),
      }}
    >
      <CssBaseline />

      <Container
        maxWidth="xs"
        sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: theme.shadows[1],
          p: theme.spacing(4),
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ mb: theme.spacing(3) }}
        >
          Log In
        </Typography>

        {error && (
          <Typography
            variant="body2"
            color="error"
            align="center"
            sx={{ mb: theme.spacing(2) }}
          >
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="username"
                label="Username"
                value={credentials.username}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="password"
                label="Password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: theme.spacing(2),
                  backgroundColor: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                Log In
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </Box>
  );
}
