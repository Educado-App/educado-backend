const router = require("express").Router();
const { ContentCreator } = require("../models/ContentCreators");
const { Course } = require("../models/Courses");
const {
  ContentCreatorCertificate,
} = require("../models/CertificateContentCreator");
const errorCodes = require("../helpers/errorCodes");

router.post("/api/creator-certificates", async (req, res) => {
  try {
    const { creatorId, courseId } = req.body; // Expect these fields from the request
    const certificate = await createCertificate(creatorId, courseId);
    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ error: "Error creating certificate" });
  }
});

router.get("/api/creator-certificates/:creatorId", async (req, res) => {
  try {
    const { creatorId } = req.params;
    const certificates = await CertificateContentCreatorModel.find({
      contentCreator: creatorId,
    })
      .populate("course") // Optionally, populate related course information
      .exec();

    res.status(200).json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ error: "Error fetching certificates" });
  }
});

module.exports = router;
