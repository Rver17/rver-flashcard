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

// Utility to shuffle arrays once
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
  const [optionsByCard, setOptionsByCard] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [sessionDeck, setSessionDeck] = useState([]);
  const [lives, setLives] = useState(5);
  const [isWaiting, setIsWaiting] = useState(false);
  const [blink, setBlink] = useState(false);

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

  // Generate multiple-choice options only once per card
  useEffect(() => {
    if (
      selectedCategory &&
      sessionDeck.length > 0 &&
      currentIndex < sessionDeck.length
    ) {
      const currentCard = sessionDeck[currentIndex];
      if (optionsByCard[currentCard.id]) {
        setOptions(optionsByCard[currentCard.id]);
      } else {
        // Ensure correct answer is always included; pick up to 3 distractors
        let distractors = sessionDeck
          .filter((card) => card.id !== currentCard.id)
          .map((card) => card.answer)
          .filter(
            (ans) =>
              ans.trim().toLowerCase() !==
              currentCard.answer.trim().toLowerCase()
          )
          .slice(0, 3);

        const optionSet = [currentCard.answer, ...distractors];
        const generatedOptions = shuffleArray(optionSet);
        setOptionsByCard((prev) => ({
          ...prev,
          [currentCard.id]: generatedOptions,
        }));
        setOptions(generatedOptions);
      }
    } else {
      setOptions([]);
    }
    // Reset selection & feedback each time we load a new card
    setSelectedAnswer("");
    setFeedback("");
  }, [selectedCategory, currentIndex, sessionDeck, optionsByCard]);

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

  // Select category, build a deck
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const deck = flashcards.filter((fc) => fc.category === category);
    setSessionDeck(deck);
    setCurrentIndex(0);
    setSelectedAnswer("");
    setFeedback("");
    setScore(0);
    setSessionResults([]);
    setSessionSaved(false);
    setLives(5);
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

  // react-swipeable
  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    trackMouse: true,
  });

  // Handle user choice
  const handleOptionClick = (option) => {
    if (selectedAnswer || isWaiting) return;

    const currentCard = sessionDeck[currentIndex];
    console.log("User clicked:", option);
    console.log("Currently displayed question:", currentCard.title);
    console.log("Correct answer:", currentCard.answer);

    setSelectedAnswer(option);
    const isCorrect =
      option.trim().toLowerCase() === currentCard.answer.trim().toLowerCase();

    // Record the attempt
    setSessionResults((prev) => [
      ...prev,
      {
        cardId: currentCard.id,
        title: currentCard.title,
        answerRecord: isCorrect ? option : `${option} -> ${currentCard.answer}`,
        isCorrect,
      },
    ]);

    if (isCorrect) {
      setFeedback("Correct");
      setScore((prevScore) => prevScore + 1);
      setTimeout(() => {
        setFeedback("");
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, 1000);
    } else {
      if (lives > 0) {
        setFeedback("Incorrect");
        setBlink(true);
        setLives((prevLives) => Math.max(prevLives - 1, 0));
        setIsWaiting(true);
        // Clear selectedAnswer immediately so buttons become enabled
        setSelectedAnswer("");
        setTimeout(() => {
          setBlink(false);
          setFeedback("");
          setIsWaiting(false);
          // Requeue the wrong card without incrementing progress:
          const newDeck = [...sessionDeck];
          const [wrongCard] = newDeck.splice(currentIndex, 1);
          newDeck.push(wrongCard);
          setSessionDeck(newDeck);
          // Do NOT increment currentIndex here so the same progress remains.
        }, 1000);
      } else {
        setFeedback(`Incorrect. Correct answer: ${currentCard.answer}`);
        setIsWaiting(true);
        setTimeout(() => {
          setFeedback("");
          setIsWaiting(false);
          setCurrentIndex((prevIndex) => prevIndex + 1);
        }, 1000);
      }
    }
  };

  // Back to categories
  const handleBackToCategories = () => {
    setSelectedCategory("");
    setCurrentIndex(0);
    setSelectedAnswer("");
    setFeedback("");
    setScore(0);
    setSessionResults([]);
    setSessionSaved(false);
  };

  // If no category is chosen, list categories
  if (!selectedCategory) {
    return (
      <>
        <DefaultHeader />
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Select a Deck to Study
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

  // If category is selected but no cards exist
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

  // Finished all cards in category
  if (currentIndex === sessionDeck.length) {
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
  const currentCard = sessionDeck[currentIndex];

  // Card background based on feedback
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
        <Box sx={{ mt: 1 }}>
          <Typography variant="body1">
            Lives: {"❤️".repeat(lives)} {"🤍".repeat(Math.max(5 - lives, 0))}
          </Typography>
          <Typography variant="body2">
            Progress: {currentIndex + 1} / {sessionDeck.length}
          </Typography>
        </Box>

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
                    : lives < 0
                    ? `Incorrect. Correct answer: ${currentCard.answer}`
                    : "Incorrect"
                  : "Select an option below"}
              </Typography>
            </CardContent>
          </Card>

          {/* MULTIPLE CHOICE OPTIONS */}
          <Grid container spacing={2} justifyContent="center">
            {options.map((option, idx) => {
              // Determine color
              let buttonColor = "primary";
              if (selectedAnswer) {
                const correct =
                  option.trim().toLowerCase() ===
                  currentCard.answer.trim().toLowerCase();
                if (correct) buttonColor = "success";
                else if (option === selectedAnswer) buttonColor = "error";
              }
              return (
                <Grid item xs={12} sm={6} key={idx}>
                  <Button
                    variant="contained"
                    color={buttonColor}
                    fullWidth
                    onClick={() => handleOptionClick(option)}
                    disabled={!!selectedAnswer}
                  >
                    {option}
                  </Button>
                </Grid>
              );
            })}
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
