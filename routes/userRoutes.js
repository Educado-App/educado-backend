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

// Update User Email route
router.put("/update-email/:id", requireLogin, async (req, res) => {
  try {
    // Get the authenticated user's ID from req.user.id
    const { id } = req.params;

    // Get the new email from the request body
    const { newEmail } = req.body;

    // Use Mongoose to find the user by ID and update the email
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { email: newEmail },
      { new: true } // This ensures that the updated user document is returned
    );

    if (!updatedUser) {
      // User with the specified ID was not found
      return res.status(404).json({ error: "User not found" });
    }

    // Send the updated user data as a response
    res.status(200).json({ message: "Email updated successfully", user: updatedUser });
  } catch (error) {
    // Handle any errors and send an error response
    console.error("Error updating email:", error);
    res.status(500).json({ error: "An error occurred while updating the email" });
  }
});

// Update User first name route
router.put("/update-first_name/:id", requireLogin, async (req, res) => {
  try {
    // Get the authenticated user's ID from req.user.id
    const { id } = req.params;

    // Get the new name from the request body
    const { newFirstName } = req.body;

    // Use Mongoose to find the user by ID and update the name
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstName: newFirstName },
      { new: true } // This ensures that the updated user document is returned
    );

    if (!updatedUser) {
      // User with the specified ID was not found
      return res.status(404).json({ error: "User not found" });
    }

    // Send the updated user data as a response
    res.status(200).json({ message: "First name updated successfully", user: updatedUser });
  } catch (error) {
    // Handle any errors and send an error response
    console.error("Error updating first name:", error);
    res.status(500).json({ error: "An error occurred while updating the first name" });
  }
});

// Update User last name route
router.put("/update-last_name/:id", requireLogin, async (req, res) => {
  try {
    // Get the authenticated user's ID from req.user.id
    const { id } = req.params;

    // Get the new name from the request body
    const { newLastName } = req.body;

    // Use Mongoose to find the user by ID and update the name
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { lastName: newLastName },
      { new: true } // This ensures that the updated user document is returned
    );

    if (!updatedUser) {
      // User with the specified ID was not found
      return res.status(404).json({ error: "User not found" });
    }

    // Send the updated user data as a response
    res.status(200).json({ message: "Last name updated successfully", user: updatedUser });
  } catch (error) {
    // Handle any errors and send an error response
    console.error("Error updating last name:", error);
    res.status(500).json({ error: "An error occurred while updating the last name" });
  }
});
  
  module.exports = router;