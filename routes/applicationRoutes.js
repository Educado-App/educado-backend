const router = require('express').Router();

const { makeExpressCallback } = require('../helpers/express');
const { contentCreatorController } = require('../applications/content-creator-applications/controller');

router.get('', makeExpressCallback(contentCreatorController));
router.get('/:id', makeExpressCallback(contentCreatorController));
router.post('/:id', makeExpressCallback(contentCreatorController));
    
module.exports = router;