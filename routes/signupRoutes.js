const router = require("express").Router();
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
    res.send("Error 400: Password is required");
    return;
  }

  try {
    validateName(form.firstName);
    validateName(form.lastName);
    validateEmail(form.email);
    const doc = User(form);
    const created = await doc.save();

    res.status(201);
    res.send(created);
  } catch (error) {
    res.status(400);
    res.send("Error: " + error.message);
  }
});

module.exports = router;

function validateEmail(input) {
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
  if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input))) {
    throw new Error("Invalid email")
  }

  return true;
}

function validateName(input) {
  if (isMissing(input)) {
    throw new Error("Name is required");
  }
  if (input.length < 1 || input.length > 50) {
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

