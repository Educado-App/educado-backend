const router = require('express').Router()

// Routes
const CourseRoutes = require('./courseRoutes')
const AWSRoutes = require('./bucketRoutes')
const AuthRoutes = require('./authRoutes')
const CredentialsRoutes = require('./credentialsRoutes')
const ApplicationRoutes = require('./applicationRoutes')
const MailRoutes = require('./mailRoutes')

// Print all routes defined in app
router.get('/api', (req, res) => {
    res.send(router.stack)
})

router.use('/api', CourseRoutes)
router.use('', AWSRoutes)
router.use('/api', AuthRoutes)
router.use('/api/credentials', CredentialsRoutes)
router.use('/api/application', ApplicationRoutes)
router.use('/api/mail',MailRoutes)

module.exports = router