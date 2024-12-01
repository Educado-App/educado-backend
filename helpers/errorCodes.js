module.exports = {


	// E00 - General errors
	E0000: {
		code: 'E0000',
		message: 'Unknown error'
	},
	E0001: {
		code: 'E0001',
		message: 'Authentication token is invalid or expired.'
	},
	E0002: {
		code: 'E0002',
		message: 'Users role does not have the necessary permissions for this action'
	},
	E0003: {
		code: 'E0003',
		message: 'Server could not be reached'
	},
	E0004: {
		code: 'E0004',
		message: 'User not found'
	},
	E0005: {
		code: 'E0005',
		message: 'No courses found'
	},
	E0006: {
		code: 'E0006',
		message: 'Course not found'
	},
	E0007: {
		code: 'E0007',
		message: 'No sections found'
	},
	E0008: {
		code: 'E0008',
		message: 'Section not found'
	},
	E0009: {
		code: 'E0009',
		message: 'Course does not contain sections'
	},
	E0010: {
		code: 'E0010',
		message: 'Email could not be sent'
	},
	E0011: {
		code: 'E0011',
		message: 'No exercises found'
	},
	E0012: {
		code: 'E0012',
		message: 'Exercise not found'
	},
	E0013: {
		code: 'E0013',
		message: 'Content creator not found'
	},
	E0014: {
		code: 'E0014',
		message: 'Invalid id'
	},
	E0015: {
		code: 'E0015',
		message: 'Invalid time interval. Use \'day\', \'week\', \'month\' or \'all\'.'
	},
	E0016: {
		code: 'E0016',
		message: 'Invalid parameters'
	},
	E0017: {
		code: 'E0017',
		message: 'Service Unavailable'
	},
	E0018: {
		code: 'E0018',
		message: 'Failed to delete all account data from database!'
	},

	// E01 - Login errors
	E0101: {
		code: 'E0101',
		message: 'Invalid email'
	},
	E0102: {
		code: 'E0102',
		message: 'Account is locked due to multiple failed login attempts. Please try again later.'
	},
	E0103: {
		code: 'E0103',
		message: 'Account is not verified. Please check your email for a verification link.'
	},
	E0104: {
		code: 'E0104',
		message: 'Account is suspended or blocked by an administrator.'
	},
	E0105: {
		code: 'E0105',
		message: 'Invalid password'
	},

	// E02 - Signup errors
	E0201: {
		code: 'E0201',
		message: 'User with the provided email already exists.'
	},
	E0202: {
		code: 'E0202',
		message: 'Password does not meet the minimum requirements.'
	},
	E0203: {
		code: 'E0203',
		message: 'Invalid email format.'
	},
	E0204: {
		code: 'E0204',
		message: 'User registration is currently disabled.'
	},
	E0205: {
		code: 'E0205',
		message: 'Could not send a verification email. Please try again later.'
	},
	E0206: {
		code: 'E0206',
		message: 'Email must contain \'@\' and \'.\''
	},
	E0207: {
		code: 'E0207',
		message: 'Email must be at least 6 characters.'
	},
	E0208: {
		code: 'E0208',
		message: 'Email is required.'
	},
	E0209: {
		code: 'E0209',
		message: 'First and last name are required.'
	},
	E0210: {
		code: 'E0210',
		message: 'Names must be between 1 and 50 characters.'
	},
	E0211: {
		code: 'E0211',
		message: 'Name must only contain letters, spaces, hyphens and apostrophes.'
	},
	E0212: {
		code: 'E0212',
		message: 'Password is required.'
	},
	E0213: {
		code: 'E0213',
		message: 'Password must be at least 8 characters.'
	},
	E0214: {
		code: 'E0214',
		message: 'Password must contain at least one letter.'
	},
	E0215: {
		code: 'E0215',
		message: 'Verification token is invalid or expired.'
	},

	// E03 - Logout errors
	E0301: {
		code: 'E0301',
		message: 'User is not authenticated. Logout is not possible.'
	},

	// E04 - Password reset errors
	E0401: {
		code: 'E0401',
		message: 'The provided email is not associated with any account.'
	},
	E0402: {
		code: 'E0402',
		message: 'Password reset link has expired.'
	},
	E0403: {
		code: 'E0403',
		message: 'Password reset link is invalid or has already been used.'
	},
	E0404: {
		code: 'E0404',
		message: 'Password reset code has expired.'
	},
	E0405: {
		code: 'E0405',
		message: 'Password reset code is invalid or has already been used.'
	},
	E0406: {
		code: 'E0406',
		message: 'Too many requests. Please try again later.'
	},

	// E05 - Verification errors
	E0501: {
		code: 'E0501',
		message: 'Account is already verified.'
	},
	E0502: {
		code: 'E0502',
		message: 'Verification link has expired.'
	},
	E0503: {
		code: 'E0503',
		message: 'Verification link is invalid or has already been used.'
	},

	// E06 - Subscription errors
	E0601: {
		code: 'E0601',
		message: 'Could not subscribe to course'
	},
	E0602: {
		code: 'E0602',
		message: 'Could not unsubscribe to course'
	},
	E0603: {
		code: 'E0603',
		message: 'Could not get users subscriptions'
	},
	E0604: {
		code: 'E0604',
		message: 'Could not check users subscriptions'
	},
	E0605: {
		code: 'E0605',
		message: 'Cannot subscribe to course: User is already subscribed to course.'
	},
	E0606: {
		code: 'E0606',
		message: 'Cannot unsubscribe from course: User is not subscribed to course.'
	},

	// E07 - Point system errors
	E0701: {
		code: 'E0701',
		message: 'Points added is less than or equal to 0.'
	},
	E0702: {
		code: 'E0702',
		message: 'Points must be of type integer'
	},
	E0703: {
		code: 'E0703',
		message: 'Points are required.'
	},
	E0704: {
		code: 'E0704',
		message: 'Max level reached.'
	},

	// Model update errors:
	E0801: {
		code: 'E0801',
		message: 'Attempted to update illegal field name'
	},
	E0802: {
		code: 'E0802',
		message: 'Field value is identical to the current value.'
	},
	E0803: {
		code: 'E0803',
		message: 'Cannot update password directly.'
	},
	E0804: {
		code: 'E0804',
		message: 'Points must be a positive number.'
	},
	E0805: {
		code: 'E0805',
		message: 'Old and new password required.'
	},
	E0806: {
		code: 'E0806',
		message: 'Old password is incorrect.'
	},
	E0807: {
		code: 'E0807',
		message: 'Failed to update student study streak!'
	},

	// E09 - Answer Exercises Errors
	E0901: {
		code: 'E0901',
		message: 'This exercise is already in completedExercises.'
	},
	E0902: {
		code: 'E0902',
		message: 'This section could not be found in the completedSections array.'
	},
	E0903: {
		code: 'E0903',
		message: 'This course could not be found in the completedCourses array.'
	},

	// E10 - Content Creator Approval Errors
	E1001: {
		code: 'E1001',
		message: 'This Content Creator has not been approved'
	},

	E1002: {
		code: 'E1002',
		message: 'This Content Creator has been rejected'
	},

	E1003: {
		code: 'E1003',
		message: 'Could not approve Content Creator'
	},

	E1004: {
		code: 'E1004',
		message: 'Could not reject Content Creator'
	},

	E1005: {
		code: 'E1005',
		message: 'Could not get Content Creator application'
	},

	E1006: {
		code: 'E1006',
		message: 'Could not upload application'
	},

	E1007: {
		code: 'E1007',
		message: 'Could not save Content Creator application forms to database!'
	},

	// E11 - Component Errors
	E1101: {
		code: 'E1101',
		message: 'The component array has reached its maximum size'
	},

	E1102: {
		code: 'E1102',
		message: 'The component array reached its maximum number of lectures'
	},

	E1103: {
		code: 'E0013',
		message: 'No exercises found'
	},
	E1104: {
		code: 'E1104',
		message: 'Exercise not found'
	},
	E1105: {
		code: 'E1105',
		message: 'No lectures found'
	},
	E1106: {
		code: 'E1106',
		message: 'Lecture not found'
	},

	// E12 - Institutinal Onboarding Errors
	E1201: {
		code: 'E1201',
		message: 'Could not upload Institution'
	},
	E1202: {
		code: 'E1202',
		message: 'This Institution already exists'
	},
	E1203: {
		code: 'E1203',
		message: 'This Email Domain already exists as part of another Institution'
	},
	E1204: {
		code: 'E1204',
		message: 'This Secondary Email Domain already exists as part of another Institution'
	},
	E1205: {
		code: 'E1205',
		message: 'This name already exists as part of another Institution'
	},
	E1206: {
		code: 'E1206',
		message: 'Institution not found'
	},

	// E13 - Feedback Errors
	E1301: {
		code: 'E1301',
		message: 'No Feedbackoptions found'
	},
	E1302: {
		code: 'E1302',
		message: 'Could not save feedback entry'
	},
	E1303: {
		code: 'E1303',
		message: 'Feedback must contain a rating'
	},
	E1304: {
		code: 'E1304',
		message: 'Feedback options must be an array'
	},
	E1305: {
		code: 'E1305',
		message: 'Could not save feedback options when populating database'
	},
	E1306: {
		code: 'E1306',
		message: 'Rating must be between 1 and 5'
	},
	E1307: {
		code: 'E1307',
		message: 'Could not find any feedback for this course'
	},
	//course creation errors
	E1401: {
		code: 'E1401',
		message: 'Could not save course'
	},
	E1402: {
		code: 'E1402',
		message: 'Could not save sections'
	},
	E1403: {
		code: 'E1403',
		message: 'Could not save components'
	},
	E1404: {
		code: 'E1404',
		message: 'Could not save lecture'
	},
	E1405: {
		code: 'E1405',
		message: 'Could not save exercise'
	},
	E1406: {
		code: 'E1406',
		message: 'Could not save media'
	},
	E1407: {
		code: 'E1407',
		message: 'Could not delete sections'
	},
	E1408: {
		code: 'E1408',
		message: 'Could not delete components'
	},
	E1409: {
		code: 'E1409',
		message: 'Could not update exercise'
	},
	E1410: {
		code: 'E1410',
		message: 'Could not update lecture'
	},
	E1411: {
		code: 'E1411',
		message: 'Could not update section'
	},
	E1412: {
		code: 'E1412',
		message: 'Could not update course'
	},
	E1413: {
		code: 'E1413',
		message: 'Could not find section in database'
	},
};