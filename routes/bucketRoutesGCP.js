const router = require('express').Router()

const { Storage } = require('@google-cloud/storage');

// Models
const { CourseModel } = require("../models/Courses")
const { ComponentModel } = require("../models/Components")

// Get image from GCP bucket
router.get("/download-s3", requireLogin, async (req, res) => {
    // Creates a client using Application Default Credentials

    // create new S3 instance
    const storage = new Storage();

    // get s3link from query
    const { s3link } = req.query;
    if (!s3link) {
        res.send("no image found");
        return;
    }

    // create download object
    const objectSpecs = {
        Bucket: keys.s3Bucket,
        Key: s3link,
    };

});
