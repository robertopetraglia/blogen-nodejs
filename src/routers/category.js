const express = require('express')
const Category = require('../models/category')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/user/category/save', auth, async (req, res) => {
    const category = new Category({
        ...req.body
    })

    try {
        await category.save()
        res.redirect('/user/dashboard')
    } catch (e) {
        res.status(400).send({ error: true })
    }
})

module.exports = router