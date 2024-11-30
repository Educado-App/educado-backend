// Mongoose model class for User
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Class description
const studentSchema = new Schema({
	points: {
		type: Number,
		default: 0
	},
	currentExtraPoints: {
		type: Number,
		default: 0
	},
	level: {
		type: Number,
		default: 0
	},
	studyStreak: {
		type: Number,
		default: 0
	},
	lastStudyDate: {
		type: Date,
		default: () => {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			return yesterday;
		}
	},
	subscriptions: [{
		type: Schema.Types.ObjectId,
		ref: 'Courses'
	}],
	profilePhoto: {
		type: String,
	},
	courses: [
		{
			courseId: {
				type: Schema.Types.ObjectId,
				ref: 'Courses'
			},
			totalPoints: {
				type: Number,
				default: 0
			},
			isComplete: {
				type: Boolean,
				default: true
			},
			completionDate: {
				type: Date,
				default: Date.now
			},
			sections: [
				{
					sectionId: {
						type: Schema.Types.ObjectId,
						ref: 'Sections'
					},
					totalPoints: {
						type: Number,
						default: 0
					},
					extraPoints: {
						type: Number,
						default: 0
					},
					isComplete: {
						type: Boolean,
						default: true
					},
					completionDate: {
						type: Date,
						default: Date.now
					},
					components: [
						{
							compId: {
								type: Schema.Types.ObjectId,
							},
							compType: {
								type: String,
								enum: ['lecture', 'exercise']
							},
							isComplete: {
								type: Boolean,
								default: true
							},
							isFirstAttempt: {
								type: Boolean,
								default: true
							},
							completionDate: {
								type: Date,
								default: Date.now
							},
							pointsGiven: Number
						}
					]
				}
			]
		}
	],
	baseUser: {
		type: Schema.Types.ObjectId,
		ref: 'Users'
	}
});

const StudentModel = mongoose.model('students', studentSchema);

module.exports = { StudentModel };

