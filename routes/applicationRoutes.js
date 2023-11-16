const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const { ApplicationModel } = require('../models/Applications');
const { ContentCreatorModel } = require('../models/ContentCreators');
const { UserModel } = require('../models/Users');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
    try {
        const contentCreators = await ContentCreatorModel.find({ approved: false, rejected: false })
        const baseUserArray = contentCreators.map(array => array.baseUser);
        
        const applicators = await UserModel.find({ _id: { $in: baseUserArray } });

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
        const applicator = await UserModel.findOne({_id: id}).select("-password")
        const application = await ApplicationModel.findOne({baseUser: id})
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
        
        await ContentCreatorModel.findOneAndUpdate(
            { baseUser: id },
            { approved: true }
        );
        
        return res.status(200).json();

    } catch(error) {
        return res.status(500).json({ 'error': errorCodes['E0000'] });
    }
});

router.put('/:id?reject', async (req, res) => {
    try  {
        const { id } = req.params;
        
        await ContentCreatorModel.findOneAndUpdate(
            { baseUser: id },
            { rejeted: true }
        );

        return res.status(200).json();

    } catch(error) {
        return res.status(500).json({ 'error': errorCodes['E0000'] });
    }
});

router.post('/newapplication', async (req, res) => {
    try{
        const data = req.body;
        console.log(data)
        ApplicationModel(data).save();
        
        return res.status(200).json();
    } catch{
        return res.status(500).json({ 'error': errorCodes['E0000'] });
    }
})

module.exports = router;