const router = require("express").Router();

const { ContentCreatorApplication } = require("../models/ContentCreatorApplication");
const mail = require("../helpers/email");

router.post("/:id", async (req, res) => {
    const ALLOWED_ACTIONS = [
        "approve",
        "reject"
    ];

    const queryParams = req.query;
    const action = queryParams.action;
    const rejectionReason = queryParams.rejectionReason;

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
        //checks to see if it was approved, and if not approved gives a rejection reason.
        //sends an email from the outcome
        let applicationIsApproved = action == 'approve';
        application.approved = applicationIsApproved;
        if(applicationIsApproved) {
            mail.sendMail(application.email,"Congratulations!",
            "Congratulations! "+application.firstName+" "+application.lastName+
            "\n\nYour content creator application has been approved! "+
            "\n\nBest regards, the Educado team");
        }
        else{
            application.rejectionReason = typeof rejectionReason == "undefined" ? "No reason given." : rejectionReason;
            mail.sendMail(application.email,"Your application has been rejected.",
            "We regret to inform you that your application for the status of content creator "+
            'has been rejected upon the following reason "'+application.rejectionReason+
            '"\nIf you believe this is an error, please feel free to contact us!'+
            '\n\nBest regards, the Educado team');
        }
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


//approve application
router.get("/approve/:id", async (req, res) => {
    setTimeout(async () => {
      try{
        console.log(id);
        mail.sendMail(req.param('email'),"Congratulations!","Congratulations!\n\nYour content creator application has been approved! \n\nBest regards, the Educado team");
        res.status(200);
        res.send("Mail successfully sent!");
      }catch(error){
        res.status(400);
        res.send(error.message);
      }
    }, 1500);
  });

module.exports = router;