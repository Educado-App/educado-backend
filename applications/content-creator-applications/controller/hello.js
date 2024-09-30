const { ContentCreatorModel } = require("../../../models/ContentCreators");

const approve = async (body) => {
    //Get id from the request parameters
		const id = body.id;
        console.log(id);
        
		//Find the content creator whose "baseUser" id matches the above id, and update their "approved" field to "true"
		const returnDoc = await ContentCreatorModel.findOneAndUpdate(
			{ baseUser: id },
			{ $set: { approved: true, rejected: false }},
            { returnDocument: 'after' } // 'after' returns the updated document
		);

        if(returnDoc.approved) {
            //Return successful response
            return true;
        } else {
            return false;
        }
}

module.exports = { approve };
