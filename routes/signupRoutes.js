const router = require("express").Router();
const { encrypt } = require("../helpers/password");
const { patterns } = require("../helpers/patterns");
const { ContentCreatorApplication } = require("../models/ContentCreatorApplication");
const {User} = require("../models/User");
const errorCodes = require("../helpers/errorCodes");

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
  

  try {
    // Validate user info
    if(isMissing(form.password)){
      throw errorCodes['E0212']; // Password is required
    }
    const nameValid = validateName(form.firstName) &&
                      validateName(form.lastName);
                      
    const emailValid = await validateEmail(form.email);

    if(nameValid && emailValid) {
      // Hashing the password for security
      const hashedPassword = encrypt(form.password);
      //Overwriting the plain text password with the hashed password 
      form.password = hashedPassword;
      const doc = User(form);
      const created = await doc.save();  // Save user
      res.status(201);
      res.send(created);
    } 
  
  } catch (error) {
    console.log(error);
    res.status(400);
    res.send({
      error: error
    });
  }
});

module.exports = router;

// Might have to make this function async if nothing works
function validateEmail(input) {
  const emailPattern = patterns.email;

  if (isMissing(input)) {
    throw errorCodes['E0208']; // Email is required
  }
  if (input.length < 6) {
    throw errorCodes['E0207']; // Email must be at least 6 characters
  }
  if (!input.includes("@") || !input.includes(".")) {
    throw errorCodes['E0206']; // Email must contain "@" and "."
  }
  /**
   * Email must contain a sequence of any letters, numbers or dots
   * followed by an @ symbol, followed by a sequence of any letters
   * followed by a dot, followed by a sequence of two to four domain 
   * extension letters.
   */

  if (await User.findOne({email: input}) != null) {
    throw errorCodes['E0201']; // User with the provided email already exists

  if (!(emailPattern.test(input))) {
    throw errorCodes['E0203']; // Invalid email format
  }

  return true;
}

function validateName(input) {
  if (isMissing(input)) {
    throw errorCodes['E0209']; // First and last name are required
  }
  if (input.length < 1 || input.length > 50) {
    throw errorCodes['E0210']; // Names must be between 1 and 50 characters
  }
 
  /**
   * Name can contain a sequence of any letters (including foreign 
   * language letters such as ñ, Д, and 盘) followed by
   * a space, hyphen or apostrophe, repeated any number of times,
   * and ending with a sequence of any letters (at least one name). 
   */
  if(!(input.match(/^(\p{L}+[ -'])*\p{L}+$/u))){
    throw errorCodes['E0211']; // Name must only contain letters, spaces, hyphens and apostrophes.
  }

  return true;
}

function isMissing(input) {
  return input === undefined || input === null || input === "";
}