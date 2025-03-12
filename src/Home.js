import React, { useContext } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import ArticleIcon from "@mui/icons-material/Article";
import SchoolIcon from "@mui/icons-material/School";
import { ThemeContext } from "./ThemeContext";
import { keyframes } from "@mui/system";

// Define a bounce keyframe animation
const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(-10px);
  }
  70% {
    transform: translateY(-5px);
  }
  90% {
    transform: translateY(-2px);
  }
`;

function Home() {
  const theme = useTheme();
  const { darkMode } = useContext(ThemeContext);

  return (
    <Box
      sx={{
        minHeight: "100vh", // Make it full screen height
        textAlign: "center",
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        pt: 8, // padding top
      }}
    >
      <Typography variant="h2" gutterBottom>
        Rver Flashcards
      </Typography>

      <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
        {/* FLASHCARDS CARD */}
        <Grid item>
          <Card
            sx={{
              width: { xs: 200, sm: 250 }, // responsive width
              height: { xs: 200, sm: 250 }, // responsive height
              bgcolor: darkMode ? "grey.800" : "white",
              // Add a hover bounce effect:
              transition: "transform 0.3s",
              "&:hover": {
                animation: `${bounce} 1s`,
              },
            }}
          >
            <CardActionArea
              component={Link}
              to="/flashcards"
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ArticleIcon sx={{ fontSize: 60, mb: 1 }} />
              <CardContent>
                <Typography variant="h6">Flashcards</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        {/* STUDY CARD */}
        <Grid item>
          <Card
            sx={{
              width: { xs: 200, sm: 250 },
              height: { xs: 200, sm: 250 },
              bgcolor: darkMode ? "grey.800" : "white",
              transition: "transform 0.3s",
              "&:hover": {
                animation: `${bounce} 1s`,
              },
            }}
          >
            <CardActionArea
              component={Link}
              to="/study"
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <SchoolIcon sx={{ fontSize: 60, mb: 1 }} />
              <CardContent>
                <Typography variant="h6">Study</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Home;
