import React, { useState, useEffect } from "react";
import SecureLS from "secure-ls";
import Swal from "sweetalert2";
import DefaultHeader from "../DefaultHeader";
import sampleFlashcards from "./Demo";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ls = new SecureLS({ encodingType: "aes" });

function Flashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [newFlashcard, setNewFlashcard] = useState({
    title: "",
    answer: "",
    category: "",
  });

  useEffect(() => {
    try {
      let storedFlashcards = ls.get("flashcards");
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

  const saveFlashcards = (cards) => {
    ls.set("flashcards", cards);
  };

  const handleDialogOpen = (card = null) => {
    if (card) {
      setEditMode(true);
      setCurrentId(card.id);
      setNewFlashcard({
        title: card.title,
        answer: card.answer,
        category: card.category,
      });
    } else {
      setEditMode(false);
      setCurrentId(null);
      setNewFlashcard({ title: "", answer: "", category: "" });
    }
    setOpen(true);
  };

  // Add this function in your Flashcards component
  const handleDelete = (id) => {
    const newFlashcards = flashcards.filter((f) => f.id !== id);
    setFlashcards(newFlashcards);
    saveFlashcards(newFlashcards);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setNewFlashcard({ title: "", answer: "", category: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFlashcard((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredFlashcards = flashcards.filter(
    (card) =>
      card.title.toLowerCase().includes(searchQuery) ||
      card.category.toLowerCase().includes(searchQuery)
  );

  const groupedFlashcards = filteredFlashcards.reduce((groups, card) => {
    const { category } = card;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(card);
    return groups;
  }, {});

  return (
    <>
      <DefaultHeader />
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          FLASHCARD
        </Typography>
        <TextField
          label="Search by Title or Category"
          variant="outlined"
          fullWidth
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={() => handleDialogOpen()}
          sx={{ m: 1 }}
        >
          Add Flashcard
        </Button>
        <Button
          variant="outlined"
          onClick={() => setFlashcards(sampleFlashcards)}
          sx={{ m: 1 }}
        >
          Load Sample Data
        </Button>

        <Divider sx={{ my: 2 }} />

        <Dialog open={open} onClose={handleDialogClose}>
          <DialogTitle>
            {editMode ? "Edit Flashcard" : "Add Flashcard"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Title"
              name="title"
              fullWidth
              value={newFlashcard.title}
              onChange={handleInputChange}
            />
            <TextField
              label="Answer"
              name="answer"
              fullWidth
              value={newFlashcard.answer}
              onChange={handleInputChange}
            />
            <TextField
              label="Category"
              name="category"
              fullWidth
              value={newFlashcard.category}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button
              onClick={() => saveFlashcards(filteredFlashcards)}
              variant="contained"
            >
              {editMode ? "Update" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        {Object.keys(groupedFlashcards).length === 0 ? (
          <Typography variant="body1" sx={{ mt: 2 }}>
            No flashcards found.
          </Typography>
        ) : (
          Object.keys(groupedFlashcards).map((category, idx) => (
            <Box key={idx} sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="h5" gutterBottom>
                Category: {category}
              </Typography>
              {groupedFlashcards[category].map((card) => (
                <Card key={card.id} sx={{ mb: 2, mx: "auto", maxWidth: 400 }}>
                  <CardContent>
                    <Typography variant="h6">{card.title}</Typography>
                    <Typography color="text.secondary">
                      {card.answer}
                    </Typography>
                    <IconButton onClick={() => handleDialogOpen(card)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(card.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ))
        )}
      </Box>
    </>
  );
}

export default Flashcards;
