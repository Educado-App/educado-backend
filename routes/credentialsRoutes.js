const router = require("express").Router();
const { ContentCreatorApplication } = require("../models/ContentCreatorApplication");
const bcrypt = require('bcrypt');

const jwt = require("jsonwebtoken");
const { compare, encrypt } = require("../helpers/password");

// Content Creator Signup Route
router.post("/signup", async (req, res) => {

  //Password is first and foremost hashed, and subsequently redifined in the form below
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

  //Find the specific content creator by their email for subsequent use
  const contentCreator = await ContentCreatorApplication.findOne({ email: email })
  
  try {
     
    //If the email isn't found, an error will be thrown, which can be displayed in the frontend
    if(!contentCreator){
      console.log("Wrong User")
      res.status(404).json({ msg: "Não existe uma conta com este e-mail"  }); //A user with this email does not exist
    }
    
    //If the passwords don't match, an error will be thrwn, which can also be displayed in the frontend
    if (!compare(password, contentCreator.password)){
      console.log("Wrong Password")
      res.status(404).json({ msg: "Senha incorreta" }); //Wrong password

    }
    
    //If both email and passwords match, a 200 response will be generated, and used in the frontend to validate the login
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
