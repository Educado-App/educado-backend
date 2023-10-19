const router = require('express').Router();

const { makeExpressCallback } = require('../helpers/express');
const { contentCreatorApplicationController } = require('../applications/content-creator-applications/controller');

router.get('', makeExpressCallback(contentCreatorApplicationController));
router.get('/:id', makeExpressCallback(contentCreatorApplicationController));
router.post('/:id', makeExpressCallback(contentCreatorApplicationController));
    
module.exports = router;