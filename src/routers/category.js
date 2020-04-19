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
        const documentsForPage = 2
        const totalCategories = await Category.countDocuments({})

        res.render('categories', {
            totalPages: Math.ceil(totalCategories / documentsForPage),
            documentsForPage,
            pageTitle: 'Categories | Blogen Categories'
        })
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/user/categories/getall', auth, async (req, res) => {
    try {
        const documentsForPage = 2

        let pn = req.query.pn === undefined ? 1 : req.query.pn
        
        let skip = (pn * documentsForPage) - documentsForPage
        if (skip <= 0) {
            skip = 0
        } 

        const allCategories = await Category.find({})
            .limit(documentsForPage)
            .skip(skip)
            .sort({'createdAt': -1})

        const totalCategories = await Category.countDocuments({})

        res.json({
            type: 'categories',
            categories: allCategories,
            totalPages: Math.ceil(totalCategories / documentsForPage),
            documentsForPage
        })
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

module.exports = router