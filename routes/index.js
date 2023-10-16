const router = require('express').Router();

// Routes
const CourseRoutes = require('./courseRoutes');
const AWSRoutes = require('./bucketRoutes');
const AuthRoutes = require('./authRoutes');
const ApplicationRoutes = require('./applicationRoutes');
const MailRoutes = require('./mailRoutes');
const UserRoutes = require('./userRoutes');
const requireLogin = require('../middlewares/requireLogin');
const TestRoutes = require('../routes/testRoutes');

const CredentialsRoutes = require('./credentialsRoutes.js');
const ApplicationRoutes = require('./applicationRoutes');
const MailRoutes = require('./mailRoutes');

// Print all routes defined in app
router.get('/api', (req, res) => {
	res.send(router.stack);
});

router.use('/api', CourseRoutes)
router.use('', AWSRoutes)
router.use('/api', AuthRoutes)
router.use('/api/credentials', CredentialsRoutes)
router.use('/api/application', ApplicationRoutes)
router.use('/api/mail',MailRoutes)
router.use('/api/users', UserRoutes);

// Test route
router.use('/api/test', TestRoutes);

module.exports = router;