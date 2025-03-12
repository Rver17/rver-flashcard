import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline, IconButton } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Home from "./Home";
import Flashcards from "./Flashcard/Flashcard";
import Study from "./Study/Study";
import { ThemeContext, ThemeProviderComponent } from "./ThemeContext";

function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <IconButton
      onClick={toggleDarkMode}
      color="inherit"
      sx={{ position: "absolute", top: 10, right: 10 }}
    >
      {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
}

function HomeWithDarkMode() {
  return (
    <>
      <DarkModeToggle />
      <Home />
    </>
  );
}

function App() {
  return (
    <ThemeProviderComponent>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<HomeWithDarkMode />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/study" element={<Study />} />
        </Routes>
      </Router>
    </ThemeProviderComponent>
  );
}

export default App;
