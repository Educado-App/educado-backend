const router = require('express').Router();


router.get('/online/', async (req, res) => {
  return res.send(true);
});


module.exports = router;