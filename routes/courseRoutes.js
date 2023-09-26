const router = require("express").Router();

// Models
const { CourseModel } = require("../models/Courses");
const { SectionModel } = require("../models/Sections");
const { ComponentModel } = require("../models/Components");
const { User } = require("../models/User");
const {
  ContentCreatorApplication,
} = require("../models/ContentCreatorApplication");
const requireLogin = require("../middlewares/requireLogin");

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

router.get("/course/getHome", async (req, res) => {

  res.send(["Hello course","Hello course 242424","Hello test"]);
});

//Route that fetched all subscribed courses of logged in user. It is using a fixed user now, but the out commented function is for the logged in user 
router.get("/course/getSubscribedCourses", async (req, res) => {
  const subscribedCourses = JSON.parse(JSON.stringify(await UserModel.findById('650c26466fe6094f6214a4a4', 'subscriptions -_id'))).subscriptions;
  //const subscribedCourses = JSON.parse(JSON.stringify(await UserModel.findById(req.user.id, 'subscriptions -_id'))).subscriptions;
  const list = await CourseModel.find({'_id': { $in: subscribedCourses }});
  console.log(list)
  res.send(list);
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

// Get all courses for user
router.get("/course/getall", async (req, res) => {
  const list = await CourseModel.find({ _user: req.user.id });
  res.send(list);
});

// Get all courses for user
router.get("/course/eml/getall", async (req, res) => {
  const list = await CourseModel.find();
  res.send(list);
});

// FIXME: no error handling, just needed the endpoint - Mvh. Frederik
router.get("/course/:id", async (req, res) => {
  const { id } = req.params; // destructure params
  const course = await CourseModel.findById(id);
  res.send(course);
})

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
router.post("/course/getallsections", requireLogin, async (req, res) => {
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

//Create Component
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
router.post("/component/getallcomponents", async (req, res) => {
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

router.post("/eml/course/getallsections", async (req, res) => {
  const { sections } = req.body;
  let list = [];
  for (let i = 0; i < sections.length; i++) {
    const temp = await SectionModel.findOne({ _id: sections[i] });
    list.push(temp);
  }
  res.send(list);
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

// Subscribe to course TODO: check for duplicates

router.post("/course/:id/subscribe",  async (req, res) => {
  const { user_id, course_id} = req.body;

  (await User.findOneAndUpdate(
    { _id: user_id }, 
    { $push: { subscriptions: course_id} }))
    .save;

  user = await User.findById(user_id);
  res.send(user)

});

router.post("/user/subscriptions/unsubscribe",  async (req, res) => {
  const { user_id, course_id} = req.body;

  (await User.findOneAndUpdate(
    { _id: user_id }, 
    { $pull: { subscriptions: course_id} }))
    .save;

  user = await User.findById(user_id);
  res.send(user)

});

// Get users subscriptions
router.get("/user/subscriptions/getAll", async (req, res) => {
  const {user_id} = req.body
  const subscribedCourses = (await User.findById(user_id, 'subscriptions -_id')).subscriptions;
  const list = await CourseModel.find({'_id': { $in: subscribedCourses }});

  res.send(list);
});


module.exports = router;
