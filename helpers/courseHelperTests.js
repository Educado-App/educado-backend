const { createCourse, saveFullCourse } = require('../helpers/courseHelpers');


const request = {
	'courseInfo':{
		title: 'yaay',
		category: 'health and workplace safety',
		difficulty: '2',
		description: 'woows',
		coverImg: '0_c',
		status: 'draft'
	},
	'sections': [
		{
			title: 'sec1',
			description: 'ahhaa',
			components: [
				{
					compType: 'lecture',
					component: {
						_id: '1',
						title: 'videooo',
						description: 'yaay',
						contentType: 'video',
						parentSection: '1'
					},
					video: {
						id: '1',
						file: {},
						parentType: 'l'
					}
				},
				{
					compType: 'lecture',
					component: {
						_id: '2',
						title: 'teeex',
						description: 'suduudd',
						contentType: 'text',
						content: '<p>woow fancy</p>',
						parentSection: '1'
					},
					video: null
				},
				{
					compType: 'exercise',
					component: {
						title: 'Exercisses',
						question: 'whaaat',
						answers: [
							{
								text: 'a',
								correct: true,
								feedback: 'y'
							},
							{
								text: 'b',
								correct: false,
								feedback: 'c'
							}
						],
						parentSection: '1',
						_id: '3'
					},
					video: null
				}
			]
		}
	]
};

const courseInfo = request.courseInfo;
const sections = request.sections;

const course = createCourse(courseInfo, sections);
const saved = await saveFullCourse(course);

console.log(saved.acknowledged);
console.log('------------------')
console.log(saved);

console.log(course);