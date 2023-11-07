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
    message: "Email must contain '@' and '.'"
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

	// E09 - Answer Exercises Errors
	E0901: {
		code: 'E0901',
		message: 'This exercise is already in completedExercises.'
	},
};