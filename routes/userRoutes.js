const router = require("express").Router();

// Models
const { User } = require("../models/User");

// Middlewares
const requireLogin = require("../middlewares/requireLogin");

router.delete("/delete/:id", requireLogin, async (req, res) => {
  try {
    // Get the authenticated user's ID from req.user.id
    const { id } = req.params;

    // Use Mongoose to find and delete the user by ID
    console.log("Deleting user with ID:", id)
    await User.findByIdAndDelete(id);

    // Send a success response
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    // Handle any errors and send an error response
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "An error occurred while deleting the user" });
  }
});

  
  module.exports = router;