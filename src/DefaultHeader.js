import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import { ThemeContext } from "./ThemeContext"; // Adjust the path if needed

function DefaultHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  // Determine title dynamically based on the current path
  const getTitle = () => {
    if (location.pathname.includes("flashcard")) return "Flashcards";
    if (location.pathname.includes("study")) return "Study Mode";
    return "Menu";
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Go back to Home */}
        <IconButton edge="start" color="inherit" onClick={() => navigate("/")}>
          <ArrowBackIcon />
        </IconButton>

        {/* Centered Title */}
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
          {getTitle()}
        </Typography>

        {/* Toggle Dark/Light Mode */}
        <IconButton color="inherit" onClick={toggleDarkMode}>
          {darkMode ? <WbSunnyIcon /> : <DarkModeIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default DefaultHeader;
