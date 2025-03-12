import React, { useState, useEffect } from "react";
import SecureLS from "secure-ls";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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

  const filteredHistory = history
    .filter((session) => session.category && session.total > 0)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Within your History component, after filteredHistory is defined:
  const aggregateStats = (session) => {
    const stats = session.attemptsStats || {};
    const totalAttempts = Object.values(stats).reduce(
      (sum, val) => sum + val,
      0
    );
    const numCards = Object.keys(stats).length;
    const averageAttempts = numCards
      ? (totalAttempts / numCards).toFixed(2)
      : "0";
    return { totalAttempts, averageAttempts, stats };
  };

  const { totalAttempts, averageAttempts } = aggregateStats(
    filteredHistory[0] || {}
  );

  return (
    <>
      <DefaultHeader />
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Study History
        </Typography>
        <Card sx={{ mb: 2, p: 2 }}>
          <Typography variant="h6" align="center">
            Overall Attempts Statistics
          </Typography>
          <Typography variant="body1" align="center">
            Total Attempts: {totalAttempts} | Average Attempts per Card:{" "}
            {averageAttempts}
          </Typography>
        </Card>
        {filteredHistory.length === 0 ? (
          <Typography variant="body1" align="center">
            No study history available.
          </Typography>
        ) : (
          filteredHistory.map((session, index) => {
            const percentage = ((session.score / session.total) * 100).toFixed(
              2
            );
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
                  {(() => {
                    const totalAttempts = Object.values(
                      session.attemptsStats || {}
                    ).reduce((sum, a) => sum + a, 0);
                    const perAttemptPercentage = totalAttempts
                      ? ((session.score / totalAttempts) * 100).toFixed(2)
                      : "0.00";
                    return (
                      <Typography variant="body2">
                        Total Attempts: {totalAttempts} (Correct Rate:{" "}
                        {perAttemptPercentage}%)
                      </Typography>
                    );
                  })()}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Details:</Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Card</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Answer Record</TableCell>
                          <TableCell>Attempts</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {session.sessionResults.map((result, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{result.title}</TableCell>
                            <TableCell>
                              {result.isCorrect ? "Correct" : "Incorrect"}
                            </TableCell>
                            <TableCell>{result.answerRecord}</TableCell>
                            <TableCell>
                              {session.attemptsStats &&
                              session.attemptsStats[result.cardId]
                                ? session.attemptsStats[result.cardId]
                                : "1"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
