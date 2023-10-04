const router = require('express').Router()

// Routes
const CourseRoutes = require('./courseRoutes')
const AWSRoutes = require('./bucketRoutes')
const AuthRoutes = require('./authRoutes')
const SignupRoutes = require('./signupRoutes')
const ApplicationRoutes = require('./applicationRoutes')
const MailRoutes = require('./mailRoutes')
const UserRoutes = require('./userRoutes')
const requireLogin = require('../middlewares/requireLogin')

// Print all routes defined in app
router.get('/api', (req, res) => {
    res.send(router.stack)
})

router.use('/api', CourseRoutes)
router.use('', AWSRoutes)
router.use('/api', AuthRoutes)
router.use('/api/signup', SignupRoutes)
router.use('/api/applications', ApplicationRoutes)
router.use('/api/mail',MailRoutes)
router.use('/api/user', UserRoutes)

module.exports = router