import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

import HomePage from "./Pages/HomePage";
import Signup from "./Pages/SignUp";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";

export default function App() {
  const [tokens, setTokens] = useState(null);

  useEffect(() => {
    fetch("/theme.json")
      .then((res) => res.json())
      .then(setTokens)
      .catch(console.error);
  }, []);

  if (!tokens) return null;

  const theme = createTheme({
    palette: tokens.palette,
    typography: { fontFamily: tokens.fonts.default },
    components: {
      ...tokens.components,
      MuiButton: {
        styleOverrides: {
          root: {
            color: tokens.palette.primary.contrastText,
            textShadow: tokens.shadows.buttonText,
            boxShadow: tokens.shadows.buttonBox,
            borderRadius: 50,
            textTransform: "none",
          },
        },
      },
    },
    images: tokens.images,
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
