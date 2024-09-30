const { ContentCreatorModel } = require('../../../models/ContentCreators');
const { UserModel } = require('../../../models/Users');
const mail = require('../../../helpers/email');

const helloPrint = () => {
    console.log('oihasdog;ihjasdgliuasdfgiuhdfgisdf');
}

const approve = async (id) => {

		//Find the content creator whose "baseUser" id matches the above id, and update their "approved" field to "true"
		const returnDoc = await ContentCreatorModel.findOneAndUpdate(
			{ baseUser: id },
			{ $set: { approved: true, rejected: false }},
            { returnDocument: 'after' } // 'after' returns the updated document
		);
		
		//Find the user whose id matches the above id
		const contentCreator = await UserModel
		.findOne({ _id: id })
		.select('email');
		
		const to = contentCreator.email;
		const subject = 'Content Creator Application Approved';
		const html = '<p>Congratulations! Your application to become a Content Creator has been approved!</p>';
		//Send an email to the content creator to let them know that they have been approved
		await mail.sendMail({ to, subject, html });
		
		//Return successful response
        if(returnDoc.approved) {
            //Return successful response
            return true;
        } else {
            return false;
        }
}

const reject = async (id) => {

		//Find the content creator whose "baseUser" id matches the above id, and update their "approved" field to "true"
		const returnDoc = await ContentCreatorModel.findOneAndUpdate(
			{ baseUser: id },
			{ $set: { approved: false, rejected: true }},
            { returnDocument: 'after' } // 'after' returns the updated document
		);
		
		//Find the user whose id matches the above id
		const contentCreator = await UserModel
		.findOne({ _id: id })
		.select('email');
		console.log(contentCreator.email);
		const to = contentCreator.email;
		const subject = 'Content Creator Application Rejected';
		const html = '<p>Your application has been rejected, Unfortunately your application for the status of content creator has been rejected upon the following reason. If you believe this is an error, please feel free to contact us!\n\nBest regards, the Educado team<./p>';
		
		//Send an email to the content creator to let them know that they have been approved
		await mail.sendMail({ to, subject, html });
		
		//Return successful response
        if(returnDoc.rejected) {
            //Return successful response
            return true;
        } else {
            return false;
        }
}

module.exports = { approve, reject};
