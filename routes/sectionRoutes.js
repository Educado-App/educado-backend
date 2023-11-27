const router = require("express").Router();

// Models
const { SectionModel } = require('../models/Sections');
const { LectureModel } = require('../models/Lecture');
const { CourseModel } = require("../models/Courses");
const { ExerciseModel } = require('../models/Exercises');
const { ComponentModel } = require("../models/Components");
const {  ContentCreatorApplication } = require("../models/ContentCreators");
const requireLogin = require("../middlewares/requireLogin");
const { mongo, Mongoose } = require("mongoose");

// Get all sections
router.get('/', async (req, res) => {
  const list = await SectionModel.find();
  res.send(list);
});

const ComponentType = {
  LECTURE: 'lecture',
  EXERCISE: 'exercise'
}

const LectureType = {
  TEXT: 'text',
  VIDEO: 'video',
};


//CREATED BY VIDEOSTREAMING TEAM
//get section by id
router.get("/:sectionId", async (req, res) => {
  if (!req.params.sectionId)
    return res.send(
      "Missing query parameters. use endpoint like this: /section/section_id"
    );

  const section_id = req.params.sectionId;

  let section = await SectionModel.findById(section_id).catch((err) => {
    throw err;
  });

  if (section === null)
    return res.send("No section found with id: " + section_id);

  return res.send(section);
});


module.exports = router;
/**
 * Create section for course
 *  
 * @param {string} course_id - course id
 * @param {string} title - section title
 * @returns {object} course
 * 
 */
router.put("/:course_id", /*requireLogin,*/ async (req, res) => {
  const {title} = req.body; //Handles the data in "data" from the request
  const course_id = req.params.course_id; //Handles the data in "params" from the request
  
  const section = new SectionModel({
    parentCourse: course_id,
    title: title,
    description: "",
    dateCreated: Date.now(),
    dateUpdated: Date.now(),
    totalPoints: 0,
    lectures: [],
    exercises: [],
  });

  try {
    await section.save();
    course = await CourseModel.findById(course_id);
    await course.sections.push(section._id);
    await course.save();
	  res.status(201).send(section);
  } catch (err) {
    res.status(400).send(err);
  }
});


/**
 * Update section by id with the update button
 * 
 * @param {string} id - section id
 * @param {object} section - section object
 * @returns {string} - Just sends a message to confirm that the update is complete
 */
router.patch("/:id", /*requireLogin,*/ async (req, res) => {
  const section = req.body;
  const { id } = req.params;

  const dbSection = await SectionModel.findByIdAndUpdate(
    id,
    {
      title: section.title,
      description: section.description,
      dateUpdated: Date.now()
    },
    function (err, docs) {
      if (err) {
        res.status(400).send(err);
      }
    }
  );
  res.status(200).send(dbSection);
});


/**
 * Delete section by id
 * Remove it from the course section array
 * Delete all lectures and excercises in the section
 * 
 * @param {string} id - section id
 * @returns {string} - Just sends a message to confirm that the deletion is complete
 */
router.delete("/:id"/*, requireLogin*/, async (req, res) => {
  const { id } = req.params;

  // Get the section object
  const section = await SectionModel.findById(id).catch((err) => {
    res.status(204).send(err);

  });

  // Get the course, from the section object
  const course_id = section.parentCourse;
  const course = await CourseModel.findById(course_id)


  // Remove the section from the course section array
  await CourseModel.updateOne({_id: section.parentCourse}, {$pull: {sections: section._id}})


  // Get lecture array from section
  const lectureIds = section.lectures;
  const exerciseIds = section.exercises;

  // Delete all lectures and excercises in the section
  lectureIds.map(async (lecture_id) => {
    // Delete the lecture
    await LectureModel.findByIdAndDelete( lecture_id);
  });

  // Loop through all exercises in section
	exerciseIds.map(async (exercise_id) => {
		// Delete the exercise
		await ExerciseModel.findByIdAndDelete(exercise_id);
	}); 

  // Delete the section
  await SectionModel.deleteOne({ _id: id }).catch((err) => res.status(204).send(err));



  // Send response
  res.status(200).send("Section Deleted");
});

router.get("/:id/components", async (req, res) => {
  try {
    const { id } = req.params;

    const section = await SectionModel.findById(id);
    if (!section) {
      return res.status(404).json({ error: errorCodes['E0007'] });
    }

    let obj = {
      component: null,
      type: null,
      lectureType: null,
    };

    const components = [];

    for (let comp of section.components) {
      if (comp.compType === ComponentType.LECTURE) {
        const lecture = await LectureModel.findById(comp.compId);
        if (!lecture) {
          return res.status(404).json({ error: errorCodes['E0007'] });
        }
        obj = {
          component: lecture,
          type: ComponentType.LECTURE,
          lectureType: lecture.video ? LectureType.VIDEO : LectureType.TEXT,
        };
      } else {
        const exercise = await ExerciseModel.findById(comp.compId);
        if (!exercise) {
          return res.status(404).json({ error: errorCodes['E0007'] });
        }
        obj = {
          component: exercise,
          type: ComponentType.EXERCISE,
        };
      }
      components.push(obj);
    }

    res.status(200).send(components);
  } catch (error) {
    throw error;
  }
})

module.exports = router;
