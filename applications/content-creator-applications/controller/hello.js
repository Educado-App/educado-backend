
const helloPrint = () => {
    console.log('oihasdog;ihjasdgliuasdfgiuhdfgisdf');
}

const approve = async (body) => {
    //Get id from the request parameters
		const { id } = body.id;
        
		//Find the content creator whose "baseUser" id matches the above id, and update their "approved" field to "true"
		await ContentCreatorModel.findOneAndUpdate(
			{ baseUser: id },
			{ approved: true }
		);
        
		//Return successful response
		return res.status(200).json();
}

module.exports = { helloPrint, approve };
