const router = require('express').Router();


// Models
const { LectureModel } = require('../models/Lectures');
const { ExerciseModel } = require('../models/Exercises');

// Get all exercises
router.get('/:type/:id', async (req, res) => {
    
	const { type, id } = req.params;
	let resTemp = {id: id, title: ''};
	if(type === 'exercise'){
		await ExerciseModel.findById(id).then(comp => {
			console.log('comp 1',id, comp);
			resTemp.title = comp.title;
			res.send(resTemp);
		});
        
	}
	else{
		await LectureModel.findById(id).then(comp => {
			console.log('comp 2', id, comp);
			resTemp.title = comp.title;
			res.send(resTemp);
		});
	}

    
});

/**
 * route to patch the components in a section
 * @param {string} sectionId
 */
//temporarily disabled functionality as this function was unintentionally deleting database entries.
//The database handling is done dynamically in react for now 
router.patch('/:sectionId', async (req, res) => {
	// const { sectionId } = req.params;
	// const { components } = req.body;

	// for (let i = 0; i < components.length; i++) {
	// 	const comp = components[i];
        
	// 	comp._id = mongoose.Types.ObjectId(comp._id);
	// 	comp.compId = mongoose.Types.ObjectId(comp.compId);
	// }

	// const section = await SectionModel.findById(sectionId);

	// section.updateOne(
	// 	{ $set:
	// 		{
	// 			components : components
	// 		}
	// 	}
	// ).catch(err => {
	// 	console.log(err);
	// });

	// // section.components = components;
	// // await section.save();
	// res.send(section);
	res.send('OK');
});

module.exports = router;
