const mongoose = require('mongoose');
const { FeedbackOptionsModel } = require('../models/FeedbackOptions');



const feedbackOptionsList = [
	{'name': 'Aulas interessantes'},
	{'name': 'Profissionais didáticos'},
	{'name': 'Aulas dinâmicas'},
	{'name': 'Conteúdo informativo'},
	{'name': 'Bom material didático'},
]

//populate the db with new feedback options so they don't appear empty
async function populate() {
    try {
		const existingOptions = await FeedbackOptionsModel.find({});
		const optionsToInsert = feedbackOptionsList.filter(option => {
			return !existingOptions.some(existingOption => existingOption.name === option.name);
		})
        await FeedbackOptionsModel.insertMany(optionsToInsert);
        console.log('Feedback options saved successfully');
    } catch (error) {
        console.error('Error saving feedback options', error);
    }
}

module.exports = { populate }

