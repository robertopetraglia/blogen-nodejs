const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

router.get('/login', (req, res) => {
    res.render('login', {
        pageTitle: 'Login | Blogen'
    })
})

router.post('/user/create', async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        
        const token = await user.generateAuthToken()
        
        res.redirect('/user/dashboard/?token=' + token)
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/login')
    }
})

router.post('/user/auth', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.redirect('/user/dashboard/?token=' + token)
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/login')
    }
})

router.get('/user/dashboard', auth, async (req, res) => {
    try {
        await req.user.populate({
            path: 'posts'
        }).execPopulate()
        console.log(req.user.posts)
        res.render('dashboard', {
            name: req.user.name,
            pageTitle: 'Dashboard | Blogen',
            posts: req.user.posts 
        })
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.session.token
        })
        await req.user.save()

        req.flash('success', 'Logout successfull')
        res.redirect('/login');
    } catch (e) {
        req.flash('error', 'Please authenticate')
        res.redirect('/login')
    }
})

module.exports = router