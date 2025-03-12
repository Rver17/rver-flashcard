import React, { useState, useEffect } from "react";
import SecureLS from "secure-ls";
import Swal from "sweetalert2";
import DefaultHeader from "../DefaultHeader";
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

  const handleDialogClose = () => {
    setOpen(false);
    setNewFlashcard({ title: "", answer: "", category: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFlashcard((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveFlashcard = () => {
    let updatedFlashcards;
    if (editMode) {
      updatedFlashcards = flashcards.map((card) =>
        card.id === currentId ? { ...card, ...newFlashcard } : card
      );
    } else {
      updatedFlashcards = [...flashcards, { id: Date.now(), ...newFlashcard }];
    }
    setFlashcards(updatedFlashcards);
    saveFlashcards(updatedFlashcards);
    handleDialogClose();
  };

  const handleDeleteFlashcard = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this flashcard!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedFlashcards = flashcards.filter((card) => card.id !== id);
        setFlashcards(updatedFlashcards);
        saveFlashcards(updatedFlashcards);
        Swal.fire("Deleted!", "Your flashcard has been deleted.", "success");
      }
    });
  };

  const groupedFlashcards = flashcards.reduce((groups, card) => {
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
        <Button variant="contained" onClick={() => handleDialogOpen()}>
          Add Flashcard
        </Button>

        <Divider sx={{ my: 2 }} />

        <Dialog open={open} onClose={handleDialogClose}>
          <DialogTitle>
            {editMode ? "Edit Flashcard" : "Add Flashcard"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              name="title"
              fullWidth
              variant="outlined"
              value={newFlashcard.title}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              label="Answer"
              name="answer"
              fullWidth
              variant="outlined"
              value={newFlashcard.answer}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              label="Category"
              name="category"
              fullWidth
              variant="outlined"
              value={newFlashcard.category}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleSaveFlashcard} variant="contained">
              {editMode ? "Update" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        {Object.keys(groupedFlashcards).length === 0 ? (
          <Typography variant="body1" sx={{ mt: 2 }}>
            No flashcards added yet.
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
                    <IconButton onClick={() => handleDeleteFlashcard(card.id)}>
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
