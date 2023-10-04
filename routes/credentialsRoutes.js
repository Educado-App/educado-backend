const router = require("express").Router();
const { ContentCreatorApplication } = require("../models/ContentCreatorApplication");
const bcrypt = require('bcrypt');

const jwt = require("jsonwebtoken");
const { compare, encrypt } = require("../helpers/password");

// Content Creator Application Route
router.post("/signup", async (req, res) => {
  const hashpassword = encrypt(req.body.password)
    
  const form = req.body;
  form.password = hashpassword;

  const doc = ContentCreatorApplication(form);
  const created = doc.save();


  try {
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
  const contentCreator = await ContentCreatorApplication.findOne({ email: email })
  
  try {
     
    if(!contentCreator){
      console.log("Wrong User")
      res.status(404).json({ msg: "An Account with this email does not exist"  });
    }
    
    if (!compare(password, contentCreator.password)){
      console.log("Wrong Password")
      res.status(404).json({ msg: "Wrong Password" });

    }
    
    if (compare(password, contentCreator.password) && email == contentCreator.email){
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
