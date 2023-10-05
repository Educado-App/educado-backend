const router = require("express").Router();
const { encrypt } = require("../helpers/password");
const { patterns } = require("../helpers/patterns");
const { ContentCreatorApplication } = require("../models/ContentCreatorApplication");
const {User} = require("../models/User");

// Content Creator Application Route
router.post("/content-creator", async (req, res) => {
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

router.post("/user", async (req, res) => {
  const form = req.body;
  form.joinedAt = Date.now();
  form.modifiedAt = Date.now();

  // Validate form ...
  if(isMissing(form.password)){
    res.status(400);
    res.send("Error 400: const { encrypt } = require('../../helpers/password'); is required");
    return;
  }

  try {
    validateEmail(form.email);
    validateName(form.name);

    // Hashing the password for security
    const hashedPassword = encrypt(form.password);
    //Overwriting the plain text password with the hashed password 
    form.password = hashedPassword;

    const doc = User(form);
    const created = await doc.save();

    res.status(201);
    res.send(created);
  } catch (error) {
    switch(error) {
      case "unique" | "user defined":
        res.status(400);
        res.send("Error 400: Email already exists");
        return;
      case "required":
        res.status(400);
        res.send("Error 400: Email is required");
        return;
      default:
        break;
    }
    res.status(400);
    res.send({ message: error.message });
  }
});

module.exports = router;

function validateEmail(input) {
  const emailPattern = patterns.email;
  if (isMissing(input)) {
    throw new Error("Email is required");
  }
  if (input.length < 6) {
    throw new Error("Email must be at least 6 characters");
  }
  if (!input.includes("@") || !input.includes(".")) {
    throw new Error("Email must contain '@' and '.'");
  }
  /**
   * Email must contain a sequence of any letters, numbers or dots
   * followed by an @ symbol, followed by a sequence of any letters
   * followed by a dot, followed by a sequence of two to four domain 
   * extension letters.
   */
  if (!(emailPattern.test(input))) {
    throw new Error("Invalid email")
  }

  return true;
}

function validateName(input) {
  if (isMissing(input)) {
    throw new Error("Name is required");
  }
  if (input.length < 2 || input.length > 50) {
    throw new Error("Name must be between 2 and 50 characters");
  }
  /**
   * Name can contain a sequence of any letters (including foreign 
   * language letters such as ñ, Д, and 盘) followed by
   * a space, hyphen or apostrophe, repeated any number of times,
   * and ending with a sequence of any letters (at least one name). 
   */
  if(!(input.match(/^(\p{L}+[ -'])*\p{L}+$/u))){
    throw new Error("Name must contain only letters (seperate names with spaces, - or ')");
  }

  return true;
}


function isMissing(input) {
  return input === undefined || input === null || input === "";
}

