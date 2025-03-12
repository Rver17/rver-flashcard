import React, { useState, useEffect } from "react";
import SecureLS from "secure-ls";
import { useSwipeable } from "react-swipeable";
import DefaultHeader from "../DefaultHeader";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
} from "@mui/material";

const ls = new SecureLS({ encodingType: "aes" });

// Utility to shuffle arrays
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function Study() {
  const [flashcards, setFlashcards] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0); // Track correct answers
  const [sessionResults, setSessionResults] = useState([]); // Detailed results per flashcard
  const [sessionSaved, setSessionSaved] = useState(false); // Ensure we save history only once

  // Load flashcards from SecureLS
  useEffect(() => {
    try {
      const storedFlashcards = ls.get("flashcards");
      if (storedFlashcards && Array.isArray(storedFlashcards)) {
        setFlashcards(storedFlashcards);
      } else {
        setFlashcards([]);
      }
    } catch (error) {
      console.error("Error loading flashcards:", error);
      setFlashcards([]);
    }
  }, []);

  // All unique categories
  const categories = Array.from(
    new Set(flashcards.map((fc) => fc.category))
  ).filter(Boolean);

  // Cards for the currently selected category
  const categoryCards = flashcards.filter(
    (fc) => fc.category === selectedCategory
  );

  // Generate multiple-choice options whenever we move to a new flashcard
  useEffect(() => {
    if (
      selectedCategory &&
      categoryCards.length > 0 &&
      currentIndex < categoryCards.length
    ) {
      const currentCard = categoryCards[currentIndex];
      let distractors = categoryCards
        .filter((card) => card.id !== currentCard.id)
        .map((card) => card.answer);
      distractors = shuffleArray(distractors).slice(0, 3);
      const allOptions = shuffleArray([currentCard.answer, ...distractors]);
      setOptions(allOptions);
    } else {
      setOptions([]);
    }
    setSelectedAnswer("");
    setFeedback("");
    // eslint-disable-next-line
  }, [selectedCategory, currentIndex]);

  // Save study session to SecureLS when finished (only once)
  useEffect(() => {
    if (currentIndex === categoryCards.length && !sessionSaved) {
      const newSession = {
        category: selectedCategory,
        date: new Date().toISOString(),
        score,
        total: categoryCards.length,
        sessionResults,
      };
      const existingHistory = ls.get("studyHistory") || [];
      const updatedHistory = [...existingHistory, newSession];
      ls.set("studyHistory", updatedHistory);
      setSessionSaved(true);
    }
  }, [
    currentIndex,
    sessionSaved,
    categoryCards.length,
    selectedCategory,
    score,
    sessionResults,
  ]);

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentIndex(0);
    setSelectedAnswer("");
    setFeedback("");
    setScore(0);
    setSessionResults([]);
    setSessionSaved(false);
  };

  // Swipe handlers
  const handleNext = () => {
    if (currentIndex < categoryCards.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // react-swipeable setup
  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    trackMouse: true,
  });

  // Handle user choice and record detailed result
  const handleOptionClick = (option) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
    const currentCard = categoryCards[currentIndex];
    const isCorrect = option === currentCard.answer;
    if (isCorrect) {
      setFeedback("Correct");
      setScore((prevScore) => prevScore + 1);
    } else {
      setFeedback("Incorrect");
    }
    setSessionResults((prevResults) => [
      ...prevResults,
      {
        cardId: currentCard.id,
        title: currentCard.title,
        userAnswer: option,
        correctAnswer: currentCard.answer,
        isCorrect,
      },
    ]);
  };

  // Reset to category selection
  const handleBackToCategories = () => {
    setSelectedCategory("");
    setCurrentIndex(0);
    setSelectedAnswer("");
    setFeedback("");
    setScore(0);
    setSessionResults([]);
    setSessionSaved(false);
  };

  // If no category is chosen yet, show categories
  if (!selectedCategory) {
    return (
      <>
        <DefaultHeader />
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Select a Category to Study
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {categories.map((category, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card
                  sx={{ p: 2, cursor: "pointer" }}
                  onClick={() => handleCategorySelect(category)}
                >
                  <CardContent>
                    <Typography variant="h6" align="center">
                      {category}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {categories.length === 0 && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              No flashcards available. Please add some flashcards first.
            </Typography>
          )}
        </Box>
      </>
    );
  }

  // If category is selected but no cards exist for it
  if (categoryCards.length === 0) {
    return (
      <>
        <DefaultHeader />
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            No flashcards found for "{selectedCategory}".
          </Typography>
          <Button variant="contained" onClick={handleBackToCategories}>
            Back to Categories
          </Button>
        </Box>
      </>
    );
  }

  // Final screen: Show session results after finishing all flashcards
  if (currentIndex === categoryCards.length) {
    const percentage = (score / categoryCards.length) * 100;
    return (
      <>
        <DefaultHeader />
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Study Session Completed!
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: percentage >= 50 ? "green" : "red" }}
          >
            Score: {score} / {categoryCards.length} ({percentage.toFixed(2)}%)
          </Typography>
          <Button
            variant="contained"
            onClick={handleBackToCategories}
            sx={{ mt: 2 }}
          >
            Back to Categories
          </Button>
        </Box>
      </>
    );
  }

  // Current flashcard
  const currentCard = categoryCards[currentIndex];

  // Dynamic background color based on feedback
  const cardBackground =
    feedback === "Correct"
      ? "success.light"
      : feedback === "Incorrect"
      ? "error.light"
      : "background.paper";

  return (
    <>
      <DefaultHeader />
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Studying Category: {selectedCategory}
        </Typography>

        {/* SWIPE AREA */}
        <Box {...swipeHandlers} sx={{ mx: "auto", maxWidth: 500 }}>
          <Card sx={{ mb: 2, backgroundColor: cardBackground }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {currentCard.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feedback
                  ? feedback === "Correct"
                    ? "You got it!"
                    : `Correct answer: ${currentCard.answer}`
                  : "Select an option below"}
              </Typography>
            </CardContent>
          </Card>

          {/* MULTIPLE CHOICE OPTIONS */}
          <Grid container spacing={2} justifyContent="center">
            {options.map((option, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Button
                  variant="contained"
                  color={
                    selectedAnswer
                      ? option === currentCard.answer
                        ? "success"
                        : option === selectedAnswer
                        ? "error"
                        : "primary"
                      : "primary"
                  }
                  fullWidth
                  onClick={() => handleOptionClick(option)}
                  disabled={!!selectedAnswer}
                >
                  {option}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* NAVIGATION BUTTONS */}
        <Box sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            sx={{ mr: 2 }}
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            onClick={handleNext}
            disabled={currentIndex === categoryCards.length}
          >
            Next
          </Button>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button variant="contained" onClick={handleBackToCategories}>
            Back to Categories
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default Study;
