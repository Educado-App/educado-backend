const router = require("express").Router();

// Models
const { User } = require("../models/User");

// Middlewares
const requireLogin = require("../middlewares/requireLogin");

router.delete("/delete/:id", requireLogin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "An error occurred while deleting the user" });
  }
});

// Update User Email route
router.put("/update-email/:id", requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newEmail } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { email: newEmail },
      { new: true } // This ensures that the updated user document is returned
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Email updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).json({ error: "An error occurred while updating the email" });
  }
});

// Update User first name route
router.put("/update-first_name/:id", requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newFirstName } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstName: newFirstName },
      { new: true } // This ensures that the updated user document is returned
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "First name updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating first name:", error);
    res.status(500).json({ error: "An error occurred while updating the first name" });
  }
});

// Update User last name route
router.put("/update-last_name/:id", requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newLastName } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { lastName: newLastName },
      { new: true } // This ensures that the updated user document is returned
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Last name updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating last name:", error);
    res.status(500).json({ error: "An error occurred while updating the last name" });
  }
});
  
  module.exports = router;