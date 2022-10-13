const router = require("express").Router();
const mail = require("../helpers/email");

//send an email
router.get("/send_mail", async (req, res) => {
  setTimeout(async () => {
    try{
      mail.sendMail(req.param('email'),req.param('subject'),req.param('text'));
      res.status(200);
      res.send("Mail successfully sent!");
    }catch(error){
      res.status(400);
      res.send(error.message);
    }
  }, 1500);
});

//send mail that tells the user that the application has been received
router.get("/send_mail/awaiting_approval", async (req, res) => {
  setTimeout(async () => {
    try{
      mail.sendMail(req.param('email'),"Successfully applied for content creator status!","Congratulations!\n\nYou have successfully applied for content creator status! Please wait while our moderators review your application. This can take anywhere from 1-10 days. If you haven't heard back from us then, feel free to reach out to us! \n\nBest regards, the Educado team");
      res.status(200);
      res.send("Mail successfully sent!");
    }catch(error){
      res.status(400);
      res.send(error.message);
    }
  }, 1500);
});

//send mail that tells the user that the application has approved
router.get("/send_mail/approve_application", async (req, res) => {
  setTimeout(async () => {
    try{
      mail.sendMail(req.param('email'),"Congratulations!","Congratulations!\n\nYour content creator application has been approved! \n\nBest regards, the Educado team");
      res.status(200);
      res.send("Mail successfully sent!");
    }catch(error){
      res.status(400);
      res.send(error.message);
    }
  }, 1500);
});

//send mail that tells the user that the application has rejected
router.get("/send_mail/reject_application", async (req, res) => {
  setTimeout(async () => {
    try{
      mail.sendMail(req.param('email'),"Your application has been rejected.",'Unfortunately your application for the status of content creator has been rejected upon the following reason "'+req.param("reason")+'"\nIf you believe this is an error, please feel free to contact us!\n\nBest regards, the Educado team');
      res.status(200);
      res.send("Mail successfully sent!");
    }catch(error){
      res.status(400);
      res.send(error.message);
    }
  }, 1500);
});


module.exports = router;
