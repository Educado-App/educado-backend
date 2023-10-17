const router = require("express").Router();
const { ContentCreator } = require("../models/ContentCreatorApplication");
const bcrypt = require('bcrypt');

const jwt = require("jsonwebtoken");
const { compare, encrypt } = require("../helpers/password");


/**
* Signup Route.
* Creates a new Content Creator Application.
*
* @param {JSON} Form Which includes the following fields:
* @param {String} name Name of the Content Creator
* @param {String} email Email of the Content Creator (Will be used for login)
* @param {String} password Password of the Content Creator (Will be encrypted)
* @returns {JSON} Returns response status code
*/
router.post("/signup", async (req, res) => {
  const form = req.body;
  const email = req.body.email;
  const hashpassword = encrypt(req.body.password)
  form.password = hashpassword;

try {
  if(await ContentCreator.findOne({ email: email })){
    console.log("Wrong Email") 
    res.status(400).json({error: errorCodes['E0201']}); //An account with his email already exists
}

  const doc = ContentCreatorApplication(form);
  const created = doc.save();

    res.status(201);
    res.send(created);
    
  } catch (err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }
  }
});

/**
* Login Route.
* Validates Content Creator credentials on attempted logins.
*
* @param {JSON} Form Which includes the following fields:
* @param {String} email Name of the Content Creator
* @param {String} password Password of the Content Creator (Will be encrypted)
* @returns {JSON} Returns response status code and validation token
*/
router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //Find the specific content creator by their email for subsequent use
  const contentCreator = await ContentCreator.findOne({ email: email })
  
  try {
     
    //If the email isn't found, an error will be thrown, which can be displayed in the frontend
    if(!contentCreator){
      console.log("Wrong User")
      res.status(404).json({error: errorCodes['E0101']}); //A user with this email does not exist
    }
    
    //If the passwords don't match, an error will be thrown, which can also be displayed in the frontend
    if (!compare(password, contentCreator.password)){
      console.log("Wrong Password")
      res.status(404).json({error: errorCodes['E0101'] }); //Wrong password

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
