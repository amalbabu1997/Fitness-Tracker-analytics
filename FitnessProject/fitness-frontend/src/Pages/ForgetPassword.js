import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/password-reset/", { email });
      setMessage("If the email is correct, you will receive a reset link.");
    } catch (error) {
      setMessage("Something went wrong. Try again.");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h5" align="center">
          Forgot Password
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
          <Button variant="contained" fullWidth type="submit">
            Send Reset Link
          </Button>
        </form>
        {message && (
          <Typography variant="body2" color="primary" align="center">
            {message}
          </Typography>
        )}
      </Box>
    </Container>
  );
}
