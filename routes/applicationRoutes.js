const router = require("express").Router();

const { ContentCreatorApplication } = require("../models/ContentCreatorApplication");

router.post("/:id", async (req, res) => {
    const ALLOWED_ACTIONS = [
        "approve",
        "decline"
    ];

    const queryParams = req.query;
    const action = queryParams.action;

    if (!action || !ALLOWED_ACTIONS.includes(action)) {
        res.status(400);
        res.send({
            status: 400,
            success: false,
            errors: [{
                message: `Invalid action. Valid actions include ${ALLOWED_ACTIONS}`,
            }]
        })

        return;
    }

    try {
        const application = await ContentCreatorApplication.findById(req.params.id);

        if (!application) {
            res.status(404);
            res.send({
                status: 404,
                success: false,
                errors: [{
                    message: `Content creator application with ${req.params.id} not found`,
                }]
            })

            return;
        }

        application.approved = action == 'approve' ? true : false;
        application.save();

    } catch (error) {
        res.status(400);
        res.send({
            status: 400,
            success: false,
            errors: [{
                message: error.message,
            }]
        })

        return;
    }

    res.sendStatus(200);

});

module.exports = router;