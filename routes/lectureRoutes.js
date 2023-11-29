const router = require('express').Router();
const express = require('express');
const errorCodes = require('../helpers/errorCodes');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Models
const { SectionModel } = require('../models/Sections');
const { LectureModel } = require('../models/Lecture');

//get lecture by id
router.get('/:id', async (req, res) => {
  if (!req.params.id) return res.send('Missing query parameters');
  const lectureId = req.params.id;

  let lecture = await LectureModel.findById(lectureId).catch((err) => {
    throw err;
  });
  if (lecture === null)
    return res.send('No section found with id: ' + lectureId);
  return res.send(lecture);
});
/**
 * Create Lecture for section
 *  
 * @param {string} section_id - section id
 * @param {string} title - lecture title
 * @returns {object} course NOT SURE
 * 
 */
router.put('/:section_id', /*requireLogin,*/ async (req, res) => {
  const {title, description, contentType} = req.body; //Handles the data in "data" from the request
  const section_id = req.params.section_id; //Handles the data in "params" from the request

  const lecture = new LectureModel ({
    parentSection: section_id,
    title: title,
    description: description,
    contentType: contentType,
    content: '',
    dateCreated: Date.now(),
    dateUpdated: Date.now()
  });

  try {
    const section = await SectionModel.findById(section_id);
    
    if(section.components.length >= 10){
      res.status(400).send({error: errorCodes['E1101']});
    }
    await lecture.save();
    await section.components.push({compId: lecture._id, compType: 'lecture'});
    await section.save();
    res.status(201).send(lecture);
  } catch (err) {
    res.status(400).send({error: errorCodes['E0000']});
  }
});
/**
 * Update the lecture
 * 
 * @param {string} id - lecture id
 * @returns {string} - Just sends a message to confirm that the update is complete
 */
router.patch('/:id', /*requireLogin,*/ async (req, res) => {
  const lecture = req.body;
  const { id } = req.params;
  // Find the lecture object by ID and update it
  const dbLecture = await LectureModel.findByIdAndUpdate(
    id,
    {
      title: lecture.title,
      description: lecture.description,
      dateUpdated: Date.now(),
    },
    function (err) {
      if (err) {
        res.status(400).send(err);
      }
    }
  );
  res.status(200).send(dbLecture);
});
/**
 * Get all lectures from a specific section id
 * @param {string} sid - section id
 * @returns {object} - lectures
 */
router.get('/section/:id', async (req, res) => {
  const id = req.params.id; // destructure params
  const lecture = await LectureModel.find({parentSection: id});
  res.send(lecture);
});

/**
 * Delete lecture from id
 * Remove it from the section lectures array
 * 
 * @param {string} id - lecture id
 * @returns {string} - Just sends a message to confirm that the deletion is complete
 */
router.delete('/:id'/*, requireLogin*/, async (req, res) => {
  const { id } = req.params; // destructure params
  // Get the lecture object
  const lecture = await LectureModel.findById(id).catch((err) => res.status(204).send(err));
  // Remove the lecture from the section lectures array
  await SectionModel.updateOne({_id: lecture.parentSection}, {$pull: {components:{compId: lecture._id}}});
  // Delete the lecture object
  await LectureModel.findByIdAndDelete(id).catch((err) => {
    res.status(204).send(err);
  });
  res.status(200).send('Lecture Deleted');
});

module.exports = router;