const express = require('express')
const Post = require('../models/post')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/user/post/save', auth, async (req, res) => {
    const post = new Post({
        ...req.body,
        owner: req.user._id
    })

    try {
        await post.save()
        res.redirect('/user/dashboard')
    } catch (e) {
        res.status(400).send({ error: true })
    }
})

module.exports = router