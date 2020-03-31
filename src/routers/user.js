const express = require('express')
const User = require('../models/user')
const router = new express.Router()

router.get('/login', async (req, res) => {
    res.render('login', {
        pageTitle: 'Login | Blogen'
    })
})

module.exports = router