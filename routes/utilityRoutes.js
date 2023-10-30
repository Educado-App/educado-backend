const router = require('express').Router();


router.get('/online/', async (req, res) => {
	res.send(true);
});


module.exports = router;