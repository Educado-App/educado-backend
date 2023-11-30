const router = require("express").Router();


// Models
const { ComponentModel } = require("../models/Components");
const {ContentCreatorApplication,} = require("../models/ContentCreators");
const { SectionModel } = require("../models/Sections");
const { LectureModel } = require("../models/Lectures");
const { ExerciseModel } = require("../models/Exercises");

// Get all exercises
router.get('/:type/:id', async (req, res) => {
    
    const { type, id } = req.params;
    let resTemp = {id: id, title: ""};
    if(type === 'exercise'){
        await ExerciseModel.findById(id).then(comp => {
            console.log("comp 1",id, comp);
            resTemp.title = comp.title;
            res.send(resTemp);
        });
        
    }
    else{
        await LectureModel.findById(id).then(comp => {
            console.log("comp 2", id, comp);
            resTemp.title = comp.title;
            res.send(resTemp);
        });
    }

    
});

/**
 * route to patch the components in a section
 * @param {string} sectionId
 */
router.patch("/:sectionId", async (req, res) => {
    const { sectionId } = req.params;
    const { components } = req.body;

    const section = await SectionModel.findById(sectionId);
    section.components = components;
    await section.save();
    res.send(section);
});

module.exports = router;
