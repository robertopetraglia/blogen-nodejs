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

router.get('/user/categories', auth, async (req, res) => {
    try {
        const documentsForPage = 1
        const totalCategories = await Category.countDocuments({})

        res.render('categories', {
            totalCategories: totalCategories / documentsForPage,
            pageTitle: 'Posts | Blogen Categories'
        })
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/user/categories/getall', auth, async (req, res) => {
    try {
        const documentsForPage = 1
        const allCategories = await Category.find({})
            .limit(documentsForPage)
            .skip(parseInt(req.query.pn) - documentsForPage)
            .sort({'createdAt': -1})

        res.json({
            type: 'categories',
            categories: allCategories,
            totalPosts: allCategories.length / documentsForPage
        })
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

module.exports = router