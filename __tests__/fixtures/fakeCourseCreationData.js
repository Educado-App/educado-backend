module.exports = function makeFakeCreateCourseData(creatorId) {

	const courseInfo = {
		title: 'yaay',
		category: 'health and workplace safety',
		difficulty: '2',
		creator: creatorId,
		description: 'woows',
		coverImg: {
			id: '0',
			file: {
				path: 'path/to/testimage.png'
			},
			parentType: 'c'
		},
		status: 'draft'
	};

	const sections = [
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
					video: null,
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
	];

	return {
		course: {
			courseInfo: courseInfo, 
			sections: sections
		},
		UserId: creatorId
	};
};