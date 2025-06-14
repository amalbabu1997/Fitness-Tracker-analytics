// src/theme/coreTheme.js
import { createTheme } from "@mui/material/styles";

const coreTheme = createTheme({
  palette: {
    primary: { main: "#ff6b81" },
    secondary: { main: "#1e90ff" },
  },
  typography: {
    fontFamily: "Montserrat, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          textTransform: "none",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    // … other shared overrides …
  },
});

export default coreTheme;
