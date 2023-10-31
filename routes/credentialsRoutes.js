const router = require("express").Router();
const { ContentCreator } = require("../models/ContentCreatorApplication");
const bcrypt = require('bcrypt');
const errorCodes = require('../helpers/errorCodes');

const jwt = require("jsonwebtoken");
const { compare, encrypt } = require("../helpers/password");
const { signAccessToken } = require("../helpers/token");
const user = require("../users/user");
const { makeExpressCallback } = require("../helpers/express");
const { authEndpointHandler } = require("../auth");

router.post('/', makeExpressCallback(authEndpointHandler))
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
    if (await ContentCreator.findOne({ email: email })) {
      return res.status(400).send({ error: errorCodes['E0201'] }); //An account with his email already exists
    }

    const doc = ContentCreator(form);
    const created = doc.save();

    return res.status(201).send(created);

  } catch (err) {
    return res.status(500).send({error: errorCodes['E0000']}); //Something went wrong
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
  try {
    const password = req.body.password;
    const email = req.body.email;
    //Find the specific content creator by their email for subsequent use
    const contentCreator = await ContentCreator.findOne({ email: email })

    //If the email isn't found, an error will be thrown, which can be displayed in the frontend
    if(!contentCreator){
      return res.status(401).json({error: errorCodes['E0101']}); //A user with this email does not exist
    }

    //If the passwords don't match, an error will be thrown, which can also be displayed in the frontend
    if (!compare(password, contentCreator.password)) {
      return res.status(401).json({ error: errorCodes['E0105'] }); //Wrong password
    }

    //If both email and passwords match, a 202 response will be generated, and used in the frontend to validate the login
    if (compare(password, contentCreator.password) && email == contentCreator.email) {
      const token = jwt.sign({ id: contentCreator._id, email: contentCreator.email }, 'secretfortoken', { expiresIn: '3h' });
      return res.status(202).json({
        status: 'login successful',
        accessToken: token,
        userInfo: {
          name: contentCreator.name,
          email: contentCreator.email,
          id: contentCreator._id,
        },
      });
    }

  } catch (err) {
    return res.status(500).json({error: errorCodes['E0000']}); //Something went wrong
  }
});

module.exports = router;