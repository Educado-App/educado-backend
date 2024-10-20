const { ContentCreatorModel } = require('../../../models/ContentCreators');
const { UserModel } = require('../../../models/Users');
const mail = require('../../../helpers/email');

const kindRegardsPT = 'Atenciosamente, Equipe Educado';

const approve = async (id) => {

	//Find the content creator whose "baseUser" id matches the above id, and update their "approved" field to "true"
	const returnDoc = await ContentCreatorModel.findOneAndUpdate(
		{ baseUser: id },
		{ $set: { approved: true, rejected: false } },
		{ returnDocument: 'after' } // 'after' returns the updated document
	);

	//If the document was not updated correctly, return false
	if (!returnDoc) {
		return false;
	}


	//Find the user whose id matches the above id
	const contentCreator = await UserModel
		.findOne({ _id: id })
		.select('email');

	const to = contentCreator.email;
	const subject = 'Aplicação de Criador de Conteúdo Aprovada';
	const html = '<p>Parabéns! Sua aplicação para se tornar um Criador de Conteúdo foi aprovada!</p> <p><a href="https://app-staging.educado.io/welcome">faça login aqui</a>.</p> <p>' + kindRegardsPT + '</p>';
	//Send an email to the content creator to let them know that they have been approved
	mail.sendMail({ to, subject, html });

	//Return successful response
	return true;
};

const reject = async (id, reason) => {
	// Find the content creator whose "baseUser" id matches the above id, and update their "rejected" field to true

	const returnDoc = await ContentCreatorModel.findOneAndUpdate(
		{ baseUser: id },
		{ $set: { approved: false, rejected: true } },  // Correct update logic
		{ returnDocument: 'after' } // 'after' returns the updated document
	);

	// If the document was not updated correctly, return false
	if (!returnDoc) {
		return false;
	}


	// Find the user whose id matches the above id
	const contentCreator = await UserModel.findOne({ _id: id }).select('email');

	// Prepare the rejection email
	const to = contentCreator.email;
	const subject = 'Aplicação de Criador de Conteúdo Rejeitada';
	const html = '<p>Infelizmente, sua aplicação para se tornar um Criador de Conteúdo foi rejeitada.</p><p> Motivo:' + reason + '</p><p>Para tentar novamente, <a href="https://app-staging.educado.io/welcome">clique aqui</a>.</p><p>' + kindRegardsPT + '</p>';
	console.log(id);

	// Send an email to the content creator to inform them of the rejection
	mail.sendMail({ to, subject, html });

	// Return success based on whether the document was updated correctly
	return true;
};


module.exports = { approve, reject };
