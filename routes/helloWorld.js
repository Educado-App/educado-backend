const router = require("express").Router();

const { makeExpressCallback } = require('../helpers/express')

router.get("/helloworld", async (req, res) => {
    res.send("Hello World!")
});
    
module.exports = router;