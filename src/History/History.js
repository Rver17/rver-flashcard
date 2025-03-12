import React, { useState, useEffect } from "react";
import SecureLS from "secure-ls";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
} from "@mui/material";
import { Link } from "react-router-dom";
import DefaultHeader from "../DefaultHeader";

const ls = new SecureLS({ encodingType: "aes" });

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const storedHistory = ls.get("studyHistory");
      if (storedHistory && Array.isArray(storedHistory)) {
        setHistory(storedHistory);
      }
    } catch (error) {
      console.error("Error loading study history:", error);
      setHistory([]);
    }
  }, []);

  return (
    <>
      <DefaultHeader />
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Study History
        </Typography>
        {history.filter((session) => session.category && session.total > 0)
          .length === 0 ? (
          <Typography variant="body1" align="center">
            No study history available.
          </Typography>
        ) : (
          history
            .filter((session) => session.category && session.total > 0)
            .map((session, index) => {
              const percentage = (
                (session.score / session.total) *
                100
              ).toFixed(2);
              return (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">
                      Category: {session.category}
                    </Typography>
                    <Typography variant="body2">
                      Date: {new Date(session.date).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Score: {session.score} / {session.total} ({percentage}%)
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle1">Details:</Typography>
                      {session.sessionResults.map((result, idx) => (
                        <Box key={idx} sx={{ ml: 2 }}>
                          <Typography variant="body2">
                            {result.title} -{" "}
                            {result.isCorrect ? "Correct" : "Incorrect"}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              );
            })
        )}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button component={Link} to="/" variant="contained">
            Back to Home
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default History;
