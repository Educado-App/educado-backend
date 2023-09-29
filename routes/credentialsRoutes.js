const router = require("express").Router();
const { ContentCreatorApplication } = require("../models/ContentCreatorApplication");

const jwt = require("jsonwebtoken");

// Content Creator Application Route
router.post("/signup", async (req, res) => {
  const form = req.body;

  // Validate form ...
  try {
    const doc = ContentCreatorApplication(form);
    const created = await doc.save();

    res.status(201);
    res.send(created);
  } catch (error) {
    res.status(400);
    res.send(error.message);
  }
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  try {
     
    const contentCreator = await ContentCreatorApplication.findOne({ email: email })
    if(!contentCreator){
      console.log("No User")
      const error = new Error("An account with this email does not exist!");
      res.status(401);
      error.statusCode = 401;
      throw error;
    }
    
    if (password !== contentCreator.password){
      console.log("Wrong Password")
      const error = new Error("Wrong password");
      res.status(401);
      error.statusCode = 401;
      throw error;
      
    }
    if (password == contentCreator.password && email == contentCreator.email){
    res.status(200).json({ email: contentCreator.email, password: contentCreator.password});
    console.log("Successful Login")
    }
  } catch (err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }
  }

});

module.exports = router;
