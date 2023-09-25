const router = require("express").Router();
const { ContentCreatorApplication } = require("../models/ContentCreatorApplication");

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


router.post("/content-creator/delete", async (req, res) => {
  const {account_id } = req.body



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
    //validateEmail(form.email);
    //validateName(form.name);
    const doc = UserModel(form);
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
  if (input.length < 3) {
    throw new Error("Email must be at least 3 characters");
  }
  if (!input.includes("@") || !input.includes(".")) {
    throw new Error("Email must contain '@' and '.'");
  }
  if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input))) {
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
  if(!(input.match(/^(\p{L}+ )*\p{L}+$/u))){
    throw new Error("Name must contain only letters (seperate names with spaces)");
  }

  return true;
}


function isMissing(input) {
  return input === undefined || input === null || input === "";
}



module.exports = router;
