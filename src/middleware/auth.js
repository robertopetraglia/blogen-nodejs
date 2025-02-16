const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.session.token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token})

        if (!user) {
            throw new Error()
        }

        req.session.token = token
        req.user = user

        next()
    } catch (e) {
        console.log('auth middleware error: ', e.message)
        req.flash('error', 'Please authenticate')
        res.redirect('/login')
    }
}

module.exports = auth