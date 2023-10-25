const router = require('express').Router();

// Models
const { SectionModel } = require('../models/Sections');
const { LectureModel } = require('../models/Lecture');

// Get all sections
router.get('/', async (req, res) => {
  const list = await SectionModel.find();
  res.send(list);
});

// Get specific section
// router.get('/:id', async (req, res) => {
//   const { id } = req.params;
//   const section = await SectionModel.findById(id);
//   res.send(section);
// });

//CREATED BY VIDEOSTREAMING TEAM
//get section by id
router.get("/:sectionId", async (req, res) => {
  if (!req.params.sectionId)
    return res.send(
      "Missing query parameters. use endpoint like this: /section/section_id"
    );

  const section_id = req.params.sectionId;

  let section = await SectionModel.findById(section_id).catch((err) => {
    console.log(err);
  });



  if (section === null)
    return res.send("No section found with id: " + section_id);

  //get lectures
  console.log("section_id", section_id);
  console.log("section", section);
  const lectures = await LectureModel.find({
    parentSection: section_id,
  }).catch((err) => {
    console.log(err);
  });

  console.log(lectures);

  // Convert the Mongoose document to a plain JavaScript object
  let _tempSection = section.toObject();

  // Now you can modify it
  _tempSection.components = lectures;

  //log lectures
  console.log(lectures);

  return res.send(_tempSection);
});


module.exports = router;