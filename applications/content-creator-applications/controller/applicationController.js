const { UserModel } = require('../../../models/Users');
const mail = require('../../../helpers/email');

const kindRegardsPT = 'Atenciosamente, Equipe Educado';

const approveEmail = async (id) => {

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

const rejectionEmail = async (id, reason) => {

	// Find the user whose id matches the above id
	const contentCreator = await UserModel.findOne({ _id: id }).select('email');

	// Prepare the rejection email
	const to = contentCreator.email;
	const subject = 'Aplicação de Criador de Conteúdo Rejeitada';
	const html = '<p>Infelizmente, sua aplicação para se tornar um Criador de Conteúdo foi rejeitada.</p><p> Motivo:' + reason + '</p><p>Para tentar novamente, <a href="https://app-staging.educado.io/welcome">clique aqui</a>.</p><p>' + kindRegardsPT + '</p>';

	// Send an email to the content creator to inform them of the rejection
	mail.sendMail({ to, subject, html });

	// Return success based on whether the document was updated correctly
	return true;
};


module.exports = { approveEmail, rejectionEmail };
