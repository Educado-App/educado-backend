const router = require("express").Router();
const { ContentCreatorApplication } = require("../models/ContentCreatorApplication");
const bcrypt = require('bcrypt');

const jwt = require("jsonwebtoken");

// Content Creator Application Route
router.post("/signup", async (req, res) => {
  bcrypt.hash(req.body.password, 5)
  .then(hash => {
    req.body.password = hash;
    const form = req.body;

    const doc = ContentCreatorApplication(form);
    const created = doc.save();

    res.status(201);
    res.send(created);
  })

  try {
    console.log(req.body.password)
    
  } catch (error) {
    res.status(400);
    res.send(error.message);
  }
  

  // Validate form ...
  
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  try {
     
    const contentCreator = await ContentCreatorApplication.findOne({ email: email })
    if(!contentCreator){
      console.log("Wrong User")
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
      const token = jwt.sign({email: contentCreator.email, password: contentCreator.password},'secretfortoken',{ expiresIn: '3h' });

      res.status(200).json({ token: token, email: contentCreator.email, password: contentCreator.password, name: contentCreator.name});
      console.log("Successful Login")
    }
  } catch (err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }
  }

});

module.exports = router;
