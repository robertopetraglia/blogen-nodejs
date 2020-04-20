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

router.post('/user/category/editsave/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        req.flash('error', 'Invalid updates!')
        return res.redirect('/user/category/edit?_id=' + req.params.id)
    }

    try {
        const category = await Category.findOne({ _id: req.params.id })

        if (!category) {
            return res.status(404).send()
        }

        updates.forEach((update) => category[update] = req.body[update])
        await category.save()

        req.flash('success', 'Category successfully saved')
        return res.redirect('/user/category/edit?_id=' + req.params.id)
    } catch (e) {
        req.flash('error', 'Invalid updates!')
        return res.redirect('/user/category/edit?_id=' + req.params.id)
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

router.get('/user/categorysearch', auth, async (req, res) => {
    try {
        const categories = await Category.find({
            title: { 
                $regex: req.query.qs, 
                $options: 'i',
            }
        })        
        .sort({'createdAt': -1})
        
        res.render('categories', {
            type: 'categories',
            categories,
            totalPages: categories.length,
            documentsForPage: 1,
            isSearchPage: true,
            searchString: req.query.qs,
            pageTitle: 'You are searching for ' + req.query.qs + ' | Blogen Search Category'
        })
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

router.get('/user/category/search', auth, async (req, res) => {
    try {
        const documentsForPage = 1

        let skip = 0
        if (req.query.pn !== undefined) {
            skip = (parseInt(req.query.pn) * documentsForPage) - documentsForPage
        }

        const categories = await Category.find({
            title: { 
                $regex: req.query.qs, 
                $options: 'i',
            }
        })
        .sort({'createdAt': -1})
        .skip(skip)
        .limit(documentsForPage)
        
        res.json({
            type: 'categories',
            categories,
            totalPages: Math.ceil(categories.length / documentsForPage),
            documentsForPage
        })
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

router.get('/user/category/edit', auth, async (req, res) => {
    try {
        const category = await Category.findOne({ _id: req.query._id })
        
        if (!category) {
            res.status(404).send()
        }

        res.render('editcategory', {
            category,
            pageTitle: 'Edit category ' + category.title + ' | Blogen Edit Category'
        })
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

router.get('/user/post/delete/:id', auth, async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        
        if (!post) {
            return res.status(404).send()
        }

        req.flash('success', 'Blog ' + post.title + ' deleted successfully')
        res.redirect('/user/dashboard')
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

router.get('/user/category/delete/:id', auth, async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({ _id: req.params.id })
        
        if (!category) {
            return res.status(404).send()
        }

        req.flash('success', 'Category ' + category.title + ' deleted successfully')
        res.redirect('/user/dashboard')
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

module.exports = router