const mongoose = require('mongoose');

const feedbackSchemaAi = new mongoose.Schema({
	userPrompt: { type: String, required: true },
	chatbotResponse: { type: String, required: true },
	feedback: { type: Boolean, required: true }, // true for thumbs up, false for thumbs down
	timestamp: { type: Date, default: Date.now } // Auto-populates with current date/time
},
{collection: 'ai_feedback'}
);

module.exports = mongoose.model('FeedbackAi', feedbackSchemaAi);