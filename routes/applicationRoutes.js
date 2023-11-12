const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const { ApplicationsModel } = require('../models/Applications')
const { UserModel } = require('../models/Users');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
    try {
        const applicators = await UserModel.find({status: "pending" });
        
        res.send({success: true,
            status: 200,
            data: applicators});
            
    } catch (error) {
        return res.status(500).json({ 'error': errorCodes['E0003'] });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const applicator = await UserModel.findOne({_id: id})
        const application = await ApplicationsModel.findOne({ContentCreatorId: id})
        res.send({success: true,
            status: 200,
            application: application,
            applicator: applicator});
        
        
    } catch(error) {
        return res.status(500).json({ 'error': errorCodes['E0003'] });
    }
});

router.put('/:id?approve', async (req, res) => {
    try  {
        const { id } = req.params;
        
        await UserModel.findByIdAndUpdate(
            { _id: id },
            { status: "approved" }
        );
        
        return res.status(200).json();

    } catch(error) {
        return res.status(500).json({ 'error': errorCodes['E0003'] });
    }
});

router.put('/:id?reject', async (req, res) => {
    try  {
        const { id } = req.params;
        
        await UserModel.findByIdAndUpdate(
            { _id: id },
            { status: "rejected" }
        );

        return res.status(200).json();

    } catch(error) {
        return res.status(500).json({ 'error': errorCodes['E0003'] });
    }
});

module.exports = router;