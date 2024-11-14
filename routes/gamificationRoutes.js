const router = require('express').Router();
const errorCodes = require('../helpers/errorCodes');
const requireLogin = require('../middlewares/requireLogin');
const mongoose = require('mongoose');
const { StudentModel } = require('../models/Students');

// Constants for point values (you might want to move these to a config file)
const POINT_VALUES = {
	EXERCISE_COMPLETION: 10,
	FIRST_ATTEMPT_BONUS: 5,
	SECTION_COMPLETION_BONUS: 20,
	COURSE_COMPLETION_BONUS: 50
};

// Get user's points and level
router.get('/:userId/points', requireLogin, async (req, res) => {
	try {
		const { userId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).json({ error: errorCodes['E0014'] });
		}

		const student = await StudentModel.findOne({ baseUser: userId })
			.select('points currentExtraPoints level');

		if (!student) {
			return res.status(404).json({ error: errorCodes['E0004'] });
		}

		res.status(200).json({
			points: student.points,
			currentExtraPoints: student.currentExtraPoints,
			level: student.level
		});
	} catch (error) {
		return res.status(500).json({ error: errorCodes['E0003'] });
	}
});

// Award points for completing an exercise
router.post('/:userId/exercise-completion', requireLogin, async (req, res) => {
	try {
		const { userId } = req.params;
		const { exerciseId, isFirstAttempt = false } = req.body;

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).json({ error: errorCodes['E0014'] });
		}

		const pointsToAward = isFirstAttempt 
			? POINT_VALUES.EXERCISE_COMPLETION + POINT_VALUES.FIRST_ATTEMPT_BONUS
			: POINT_VALUES.EXERCISE_COMPLETION;

		const student = await StudentModel.findOneAndUpdate(
			{ baseUser: userId },
			{ 
				$inc: { 
					points: pointsToAward,
					'courses.$[course].sections.$[section].components.$[component].pointsGiven': pointsToAward
				}
			},
			{ 
				new: true,
				arrayFilters: [
					{ 'course.courseId': req.body.courseId },
					{ 'section.sectionId': req.body.sectionId },
					{ 'component.compId': exerciseId }
				]
			}
		).select('points currentExtraPoints level');

		if (!student) {
			return res.status(404).json({ error: errorCodes['E0004'] });
		}

		// Check if level up is needed (example: every 100 points = 1 level)
		const newLevel = Math.floor(student.points / 100) + 1;
		if (newLevel > student.level) {
			student.level = newLevel;
			await student.save();
		}

		res.status(200).json({
			pointsGained: pointsToAward,
			newTotal: student.points,
			currentLevel: student.level
		});
	} catch (error) {
		return res.status(500).json({ error: errorCodes['E0003'] });
	}
});

// Award bonus points for completing a section
router.post('/:userId/section-completion', requireLogin, async (req, res) => {
	try {
		const { userId } = req.params;
		const { courseId, sectionId } = req.body;

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).json({ error: errorCodes['E0014'] });
		}

		const student = await StudentModel.findOneAndUpdate(
			{ baseUser: userId },
			{ 
				$inc: { 
					points: POINT_VALUES.SECTION_COMPLETION_BONUS,
					'courses.$[course].sections.$[section].extraPoints': POINT_VALUES.SECTION_COMPLETION_BONUS
				}
			},
			{ 
				new: true,
				arrayFilters: [
					{ 'course.courseId': courseId },
					{ 'section.sectionId': sectionId }
				]
			}
		).select('points currentExtraPoints level');

		if (!student) {
			return res.status(404).json({ error: errorCodes['E0004'] });
		}

		res.status(200).json({
			pointsGained: POINT_VALUES.SECTION_COMPLETION_BONUS,
			newTotal: student.points
		});
	} catch (error) {
		return res.status(500).json({ error: errorCodes['E0003'] });
	}
});

// Award bonus points for completing a course
router.post('/:userId/course-completion', requireLogin, async (req, res) => {
	try {
		const { userId } = req.params;
		const { courseId } = req.body;

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).json({ error: errorCodes['E0014'] });
		}

		const student = await StudentModel.findOneAndUpdate(
			{ baseUser: userId },
			{ 
				$inc: { 
					points: POINT_VALUES.COURSE_COMPLETION_BONUS,
					'courses.$[course].totalPoints': POINT_VALUES.COURSE_COMPLETION_BONUS
				}
			},
			{ 
				new: true,
				arrayFilters: [
					{ 'course.courseId': courseId }
				]
			}
		).select('points currentExtraPoints level');

		if (!student) {
			return res.status(404).json({ error: errorCodes['E0004'] });
		}

		res.status(200).json({
			pointsGained: POINT_VALUES.COURSE_COMPLETION_BONUS,
			newTotal: student.points
		});
	} catch (error) {
		return res.status(500).json({ error: errorCodes['E0003'] });
	}
});

module.exports = router;