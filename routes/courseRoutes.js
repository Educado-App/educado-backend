const router = require("express").Router();

const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Models
const { CourseModel } = require("../models/Courses");
const { SectionModel } = require("../models/Sections");
const { ComponentModel } = require("../models/Components");
const { User } = require("../models/User");
const {
  ContentCreatorApplication,
} = require("../models/ContentCreatorApplication");
const requireLogin = require("../middlewares/requireLogin");
const { UserModel } = require("../models/User");
const { IdentityStore } = require("aws-sdk");

//Why is all this out commented? Have it been replaced whit something else?
/*
// Content Creator Application Route
router.post("/course/", async (req, res) => {
  const { title, description } = req.body;

  const course = new CourseModel({
    title: title,
    description: description,
    category: "",
    _user: req.user.id,
    dateCreated: Date.now(),
    dateUpdated: Date.now(),
    sections: [],
  });

  try {
    await course.save();
    res.send(course);
  } catch (err) {
    res.status(422).send(err);
  }
});

// Course routes

router.post("/courses", async (req, res) => {
  const { title, description } = req.body;

  const course = new CourseModel({
    title: title,
    description: description,
    category: "",
    _user: req.user.id,
    dateCreated: Date.now(),
    dateUpdated: Date.now(),
    sections: [],
  });

  try {
    await course.save();
    res.send(course);
  } catch (err) {
    res.status(422).send(err);
  }
});

// Update Course
router.post("/course/update", requireLogin, async (req, res) => {
  const { course } = req.body;
  const dbCourse = await CourseModel.findByIdAndUpdate(
    course._id,
    {
      title: course.title,
      description: course.description,
      sections: course.sections,
    },
    function (err, docs) {
      if (err) {
        console.log("Error:", err);
        res.send(err);
      } else {
        console.log("Updated Course: ", docs);
      }
    }
  );
  res.send("Course Update Complete");
});




// Get all courses id
router.get("/courses/all/id", async (req, res) => {

  try {
    // Searching for all courses in database
    const course = await CourseModel.find();
    console.log("ID: " + course._id);
    if (!course) {
      // If no course is found, return an error message
      console.log("No courses found")
      return res.status(404).json({
        "message": "No courses found"
      });
    } else {
      console.log("ID: " + course.id);
      return res.status(202).json({
        status: 'course fetched successful',
        course: {
          id: course.id,
        },
      });
  }
  } catch (err) { 
    console.log(err)
    return res.status(500).json({ 
      "error": { "code": 500, "message": "Server could not be reached" }
    });
  }
});


// Update course title
router.post("/course/update/title", async (req, res) => {
  const { text, course_id } = req.body;

  // find object in database and update title to new value
  (await CourseModel.findOneAndUpdate({ _id: course_id }, { title: text }))
    .save;
  course = await CourseModel.findById(course_id);

  // Send response
  res.send(course);
});

// Update course description
router.post("/course/update/description", async (req, res) => {
  const { text, course_id } = req.body;

  // find object in database and update title to new value
  (
    await CourseModel.findOneAndUpdate(
      { _id: course_id },
      { description: text }
    )
  ).save;
  course = await CourseModel.findById(course_id);

  // Send response
  res.send(course);
});

// Update course category
router.post("/course/update/category", async (req, res) => {
  const { text, course_id } = req.body;

  // find object in database and update title to new value
  (await CourseModel.findOneAndUpdate({ _id: course_id }, { category: text }))
    .save;
  course = await CourseModel.findById(course_id);

  // Send response
  res.send(course);
});

// Update course published state
router.post("/course/update/published", async (req, res) => {
  const { published, course_id } = req.body;

  // find object in database and update title to new value
  (
    await CourseModel.findOneAndUpdate(
      { _id: course_id },
      { published: published }
    )
  ).save;
  course = await CourseModel.findById(course_id);

  // Send response
  res.send(course);
});

// Delete all documents for user - the Nueclear option.
router.post("/course/delete", requireLogin, async (req, res) => {
  const { course_id } = req.body;
  let course;
  try {
    course = await CourseModel.findById(course_id).catch((err) => {
      console.log(err);
    });
  } catch (error) {
    res.status(422).send(err);
  }
  const sectionIds = course.sections;

  sectionIds.map(async (section_id, index) => {
    let section;
    try {
      section = await SectionModel.findById(section_id).catch((err) => {
        console.log(err);
      });
    } catch (error) {
      res.status(422).send(err);
    }
    const componentIds = section.components;
    componentIds.map(async (component_id, index) => {
      await ComponentModel.deleteOne({ _id: component_id }, (err) => {
        console.log(err);
      });
    });
    await SectionModel.deleteOne({ _id: section_id }, (err) => {
      console.log(err);
    });
  });

  await CourseModel.deleteOne({ _id: course_id }, (err) => {
    console.log(err);
  });

  res.send("Completed");
});

// Section routes

router.post("/section/create", requireLogin, async (req, res) => {
  const { title, course_id } = req.body; // Or query?...

  const section = new SectionModel({
    title: title,
    description: "",
    dateCreated: Date.now(),
    dateUpdated: Date.now(),
    components: [],
  });

  try {
    await section.save();
    course = await CourseModel.findById(course_id);
    await course.sections.push(section._id);
    await course.save();
    res.send(course);
  } catch (err) {
    res.status(422).send(err);
  }
});

// Get all sections
router.post("/course/sections", requireLogin, async (req, res) => {
  const { sections } = req.body;
  let list = [];
  for (let i = 0; i < sections.length; i++) {
    const temp = await SectionModel.findOne({ _id: sections[i] });
    list.push(temp);
  }
  res.send(list);
});

// Update section title
router.post("/course/update/sectiontitle", async (req, res) => {
  // ...
  // get new value & section ID
  const { value, sectionId } = req.body;

  // find object in database and update title to new value
  (await SectionModel.findOneAndUpdate({ _id: sectionId }, { title: value }))
    .save;

  // Send response
  res.send("Completed");
});

// Update course description
router.post("/section/update/title", async (req, res) => {
  const { text, section_id } = req.body;

  // find object in database and update title to new value
  (await SectionModel.findOneAndUpdate({ _id: section_id }, { title: text }))
    .save;
  section = await SectionModel.findById(section_id);

  // Send response
  res.send(section);
});

// Update section description
router.post("/section/update/description", async (req, res) => {
  const { text, section_id } = req.body;

  // find object in database and update title to new value
  (
    await SectionModel.findOneAndUpdate(
      { _id: section_id },
      { description: text }
    )
  ).save;
  section = await SectionModel.findById(section_id);

  // Send response
  res.send(section);
});

// Update sections order
router.post("/course/update/sectionsorder", async (req, res) => {
  // Get sections from request
  const { sections, course_id } = req.body;
  // REPORT NOTE: Måske lav performance test, for om det giver bedst mening at wipe array og overskrive, eller tjekke 1 efter 1 om updates
  // Overwrite existing array
  (
    await CourseModel.findOneAndUpdate(
      { _id: course_id },
      { sections: sections }
    )
  ).save;

  course = await CourseModel.findById(course_id);

  // Send response
  res.send(course);
});

// Delete component for user
router.post("/section/delete", requireLogin, async (req, res) => {
  const { section_id, course_id } = req.body;

  const course = await CourseModel.findById(course_id).catch((err) => {
    console.log(err);
  });

  let sectionIds = course.sections;

  let index = sectionIds.indexOf(section_id);
  if (index !== -1) {
    sectionIds.splice(index, 1);
  }

  (
    await CourseModel.findOneAndUpdate(
      { _id: course_id },
      { sections: sectionIds }
    )
  ).save;

  await SectionModel.deleteOne({ _id: section_id }, (err) => {
    console.log(err);
  });

  res.send(sectionIds);
});

// Create Component
router.post("/component/create", async (req, res) => {
  const { type, section_id } = req.body; // Or query?...

  const component = new ComponentModel({
    type: type,
    file: "",
    text: "",
    dateCreated: Date.now(),
    dateUpdated: Date.now(),
  });

  try {
    await component.save();
    section = await SectionModel.findById(section_id);
    await section.components.push(component._id);
    await section.save();
    res.send(section);
  } catch (err) {
    res.status(422).send(err);
  }
});

//Get all components
router.post("/component/all", async (req, res) => {
  const { components } = req.body;
  let list = [];
  for (let i = 0; i < components.length; i++) {
    const temp = await ComponentModel.findOne({ _id: components[i] });
    list.push(temp);
  }
  res.send(list);
});

//Update Component order
router.post("/component/updatecomponentorder", async (req, res) => {
  // Get components from request
  const { components, section_id } = req.body;
  (
    await SectionModel.findOneAndUpdate(
      { _id: section_id },
      { components: components }
    )
  ).save;
  section = await SectionModel.findById(section_id);
  // Send response
  res.send(section);
});

// Update section title
router.post("/component/text/update", async (req, res) => {
  const { text, component_id } = req.body;

  // find object in database and update title to new value
  (await ComponentModel.findOneAndUpdate({ _id: component_id }, { text: text }))
    .save;
  component = await ComponentModel.findById(component_id);

  // Send response
  res.send(component);
});

// Delete all documents for user
router.post("/component/delete", requireLogin, async (req, res) => {
  const { component_id, section_id } = req.body;

  const section = await SectionModel.findById(section_id).catch((err) => {
    console.log(err);
  });

  let componentIds = section.components;

  let index = componentIds.indexOf(component_id);
  if (index !== -1) {
    componentIds.splice(index, 1);
  }

  (
    await SectionModel.findOneAndUpdate(
      { _id: section_id },
      { components: componentIds }
    )
  ).save;

  await ComponentModel.deleteOne({ _id: component_id }, (err) => {
    console.log(err);
  });

  res.send(componentIds);
});

// Delete all documents for user
router.get("/course/delete_all", requireLogin, async (req, res) => {
  await CourseModel.deleteMany({ _user: req.user.id }, (err) => {
    console.log(err);
  });
  await SectionModel.deleteMany({}, (err) => {
    console.log(err);
  });
  await ComponentModel.deleteMany({}, (err) => {
    console.log(err);
  });
  res.send("Completed");
});

// User route
router.post("/user/", async (req, res) => {
  const { googleID } = req.body;

  const user = new UserModel({
    googleID: googleID,
    email: email,
    password: password,
    joinedAt: Date.now(),
    modifiedAt: Date.now(),
    subscriptions: []
  });

  try {
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(422).send(err);
  }
});

*/

/*** COURSE, SECTIONS AND EXERCISE ROUTES ***/


//Get all courses
router.get("/courses/all", async (req, res) => {

  try {
    // find all courses in the database
    const list = await CourseModel.find();
    res.send(list);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
  
});


// Get specific course
router.get("/courses/:id", async (req, res) => {

  try {
    const { id } = req.params; 

    // find a course based on it's id
    const course = await CourseModel.findById(id);
    res.send(course);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }

})


// Get all sections from course
router.get("/courses/:id/sections/all", async (req, res) => {

  try {
    const { id } = req.params; 

    // find all sections based on a course's id  
    const sections = await SectionModel.find({ parentCourse: id} );

    res.send(sections);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }

});

// Get a specififc section 
router.get("/courses/:courseId/sections/:sectionId", async (req, res) => {

  try{
  const { courseId, sectionId } = req.params; 

  // find a specific section within the given course by both IDs
  const section = await SectionModel.findOne({ parentCourse: courseId, _id: sectionId });
  res.send(section);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }

});

// Get all excercies from a section
router.get("/courses/:courseId/sections/:sectionId/exercises/all", async (req, res) => {

  try {
  const { courseId, sectionId } = req.params; 

  // find a specific section within the given course by both IDs
  const exercises = await ExerciseModel.find({ parentSection: sectionId });
  res.send(exercises);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }

});

/*** SUBSCRIPTION ROUTES ***/

// Subscribe to course 
router.post("/courses/:id/subscribe",  async (req, res) => {

  try {
    const { id } = req.params;
    const { user_id} = req.body;

    
    // find user based on id, and add the course's id to the user's subscriptions field
    (await User.findOneAndUpdate(
      { _id: user_id }, 
      { $push: { subscriptions: id} }))
      .save;

    let user = await User.findById(user_id);
    res.send(user)

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }

});

// Unsubscribe to course
router.post("/courses/:id/unsubscribe",  async (req, res) => {
  
  try {
    const { id } = req.params;
    const { user_id} = req.body;

    // find user based on id, and remove the course's id from the user's subscriptions field
    (await User.findOneAndUpdate(
      { _id: user_id }, 
      { $pull: { subscriptions: id} }))
      .save;

    let user = await User.findById(user_id);
    res.send(user)

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }

});

// Get users subscriptions
router.get("/users/:id/subscriptions/all", async (req, res) => {
  try {
    const userId = req.params.id;
    // Find the user by _id and select the 'subscriptions' field
    const user = await User.findById(userId).select('subscriptions -_id');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const subscribedCourses = user.subscriptions;

    // Find courses based on the subscribed course IDs
    const list = await CourseModel.find({ '_id': { $in: subscribedCourses } });

    res.send(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Checks if user is subscribed to a specific course
router.get('/user', async (req, res) => {
    
  try {

    const { course_id, user_id } = req.query; 

    // checks if the course id exist in the users subscriptions field
    const user = await User.findOne({ _id: user_id, subscriptions: course_id });

    // return true if it exist and false if it does not
    if(user == null) {
      res.send("false");
    } else {
      res.send("true");
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
