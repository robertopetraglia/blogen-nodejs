const express = require('express')
const Category = require('../models/category')
const auth = require('../middleware/auth')
const router = new express.Router()

const { ErrorHandler, asyncErrorWrapper } = require('../helpers/errors')

router.post('/user/category/save', auth, asyncErrorWrapper(async (req, res) => {
    const category = new Category({
        ...req.body
    })

    try {
        await category.save()
        res.redirect('/user/dashboard')
    } catch (e) {
        throw new ErrorHandler('500', e.message, 'render', { pageTitle: '500 Internal server Error'})
    }
}))

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
            return res.status(404).render('404', {
                pageTitle: '404 Category not found',
                message: 'Category Not Found'
            })
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

router.get('/user/categories', auth, asyncErrorWrapper(async (req, res) => {
    try {
        const documentsForPage = 2
        const totalCategories = await Category.countDocuments({})

        res.render('categories', {
            name: req.user.name,
            totalPages: Math.ceil(totalCategories / documentsForPage),
            documentsForPage,
            pageTitle: 'Categories | Blogen Categories'
        })
    } catch (e) {
        throw new ErrorHandler('500', e.message, 'render', { pageTitle: '500 Internal server Error'})
    }
}))

router.get('/user/categories/getall', auth, asyncErrorWrapper(async (req, res) => {
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
        throw new ErrorHandler('500', undefined, 'json', { message: e.message})
    }
}))

router.get('/user/categorysearch', auth, asyncErrorWrapper(async (req, res) => {
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
        throw new ErrorHandler('500', e.message, 'render', { pageTitle: '500 Internal server Error'})
    }
}))

router.get('/user/category/search', auth, asyncErrorWrapper(async (req, res) => {
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
        throw new ErrorHandler('500', undefined, 'json', { message: e.message})
    }
}))

router.get('/user/category/edit', auth, asyncErrorWrapper(async (req, res) => {
    try {
        const category = await Category.findOne({ _id: req.query._id })
        
        if (!category) {
            return res.status(404).render('404', {
                pageTitle: '404 Category not found',
                message: 'Category Not Found'
            })
        }

        res.render('editcategory', {
            name: req.user.name,
            category,
            pageTitle: 'Edit category ' + category.title + ' | Blogen Edit Category'
        })
    } catch (e) {
        throw new ErrorHandler('500', e.message, 'render', { pageTitle: '500 Internal server Error'})
    }
}))

router.get('/user/category/delete/:id', auth, asyncErrorWrapper(async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({ _id: req.params.id })
        
        if (!category) {
            return res.status(404).render('404', {
                pageTitle: '404 Category not found',
                message: 'User not found'
            })
        }

        req.flash('success', 'Category ' + category.title + ' deleted successfully')
        res.redirect('/user/dashboard')
    } catch (e) {
        throw new ErrorHandler('500', e.message, 'render', { pageTitle: '500 Internal server Error'})
    }
}))

module.exports = router