const router = require("express").Router();
const { ContentCreator } = require("../models/ContentCreators");
const { Course } = require("../models/Courses");
const {
  CertificateContentCreatorModel,
} = require("../models/CertificateContentCreator");
const errorCodes = require("../helpers/errorCodes");

router.post("/creator-certificates", async (req, res) => {
  try {
    const { creatorId, courseId } = req.body;
    const certificate = await createCertificate(creatorId, courseId);
    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ error: "Error creating certificate" });
  }
});

router.get("/creator-certificates/:creatorId", async (req, res) => {
  try {
    const { creatorId } = req.params;
    const certificates = await CertificateContentCreatorModel.findOne({
      _id: creatorId,
    })
      .populate("creator-certificates")
      .exec();

    res.status(200).json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ error: "Error fetching certificates" });
  }
});

module.exports = router;
