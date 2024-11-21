const router = require("express").Router();
const { CourseModel } = require("../models/Courses");
const {
  CertificateContentCreatorModel,
} = require("../models/CertificateContentCreator");
const errorCodes = require("../helpers/errorCodes");

// Get creator certificate
router.get("/get-creator-certificates/:creatorId&:courseId", async (req, res) => {
  try {
    const creatorId = req.params.creatorId;
    const courseId = req.params.courseId;

    const course = await CourseModel.findOne({ _id: courseId });

    if (!course) {
      return res.status(400).send({ error: errorCodes['E0006'] }); // E0006 - Course not found
    }

    const certificate = await CertificateContentCreatorModel.findOneAndUpdate(
			{ course: courseId },
			{
				numOfSubscriptions: course.numOfSubscriptions, // Is the field needed for certificate creator table? We have the info in course
				dateUpdated: Date.now(),
			},
			function (err) {
				if (err) {
					return res.status(400).send(err);
				}
			}

      // TODO: Make error code for this

      // if (!course) {
      //   return res.status(400).send({ error: errorCodes['E0006'] }); // E0006 - Course not found
      // }
		)
      .populate("creator-certificates")
      .exec();

    res.status(200).json(certificate);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ error: "Error fetching certificates" });
  }
});

// Create certificate route 
router.put('/create-creator-certificate', async (req, res) => {
	const { courseId, creatorId } = req.body;

  const course = await CourseModel.findOne({ _id: courseId, });

  if (!course) {
		return res.status(400).send({ error: errorCodes['E0006'] }); // E0006 - Course not found
	}

	const contentCreatorCertificate = new CertificateContentCreatorModel({
		title: course.title,
		category: course.category,
		creator: creatorId,
    course: courseId,
    rating: course.rating,
    numOfSubscriptions: 0,
		dateCreated: Date.now(),
		dateUpdated: Date.now(),
	});

	try {
		const result = contentCreatorCertificate.save({ new: true })
			//As id is generated at save, we need to .then() and then save
			.then(savedContentCreatorCertificate => {
				return savedContentCreatorCertificate.save();
			});
		return res.status(201).send(result);
	} catch (err) {
		return res.status(400).send(err);
	}
});

module.exports = router;
