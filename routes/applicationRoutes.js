const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const { ApplicationsModel } = require('../models/Applications')
const mongoose = require('mongoose');
const { CourseModel } = require('../models/Courses');

router.get('/', async (req, res) => {
    try {
        const applications = await ApplicationsModel.find();
        res.send({success: true,
            status: 200,
            data: applications});

    } catch (error) {
        return res.status(500).json({ 'error': errorCodes['E0003'] });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const application = await ApplicationsModel.findOne({_id: id})
        res.send({success: true,
            status: 200,
            data: application});
    } catch(error) {
        return res.status(500).json({ 'error': errorCodes['E0003'] });
    }

});
module.exports = router;