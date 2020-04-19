const express = require('express')
const Post = require('../models/post')
const Category = require('../models/category')
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

router.post('/user/post/editsave/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'category', 'body']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        req.flash('error', 'Invalid updates!')
        return res.redirect('/user/post/edit?_id=' + req.params.id)
    }

    try {
        const post = await Post.findOne({ _id: req.params.id, owner: req.user._id })
        if (!post) {
            return res.status(404).send()
        }

        updates.forEach((update) => post[update] = req.body[update])
        await post.save()

        req.flash('success', 'Post successfully saved')
        return res.redirect('/user/post/edit?_id=' + req.params.id)
    } catch (e) {
        req.flash('error', 'Invalid updates!')
        return res.redirect('/user/post/edit?_id=' + req.params.id)
    }
})

router.get('/user/posts', auth, async (req, res) => {
    try {
        const documentsForPage = 3
        const totalPosts = await Post.countDocuments({})

        res.render('posts', {
            totalPages: Math.ceil(totalPosts / documentsForPage),
            documentsForPage,
            pageTitle: 'Posts | Blogen Search Post'
        })
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/user/posts/getall', auth, async (req, res) => {
    try {
        const documentsForPage = 3

        let pn = req.query.pn === undefined ? 1 : req.query.pn
        
        let skip = (pn * documentsForPage) - documentsForPage
        if (skip <= 0) {
            skip = 0
        }

        await req.user.populate({
            path: 'posts',
            options: {
                limit: documentsForPage,
                skip,
                sort: { 'createdAt': -1 }
            }
        }).execPopulate()

        const allCategories = await Category.getAllCategories()

        req.user.posts.map(post => {
            let category = allCategories.find(category => category._id == post.category)
            post.category = category.title
        });

        const totalPosts = await Post.countDocuments({})

        res.json({
            type: 'posts',
            posts: req.user.posts,
            documentsForPage,
            totalPages: Math.ceil(totalPosts / documentsForPage)
        })
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/user/postsearch', auth, async (req, res) => {
    try {
        const posts = await Post.find({
            title: { 
                $regex: req.query.qs, 
                $options: 'i',
            },
            owner: req.user._id
        })        
        .sort({'createdAt': -1})
        
        res.render('posts', {
            type: 'posts',
            posts,
            totalPages: posts.length,
            isSearchPage: true,
            searchString: req.query.qs,
            pageTitle: 'You are searching for ' + req.query.qs + ' | Blogen Search Post'
        })
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

router.get('/user/post/search', auth, async (req, res) => {
    try {
        const documentsForPage = 1

        let skip = 0
        if (req.query.pn !== undefined) {
            skip = (parseInt(req.query.pn) * documentsForPage) - documentsForPage
        }

        const posts = await Post.find({
            title: { 
                $regex: req.query.qs, 
                $options: 'i',
            },
            owner: req.user._id
        })
        .sort({'createdAt': -1})
        .skip(skip)
        .limit(documentsForPage)

        const allCategories = await Category.getAllCategories()
        posts.map(post => {
            let category = allCategories.find(category => category._id == post.category)
            post.category = category.title
        });
        
        res.json({
            type: 'posts',
            posts,
            totalPages: Math.ceil(posts.length / documentsForPage),
            documentsForPage
        })
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

router.get('/user/post/edit', auth, async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.query._id, owner: req.user._id })
        const allCategories = await Category.getAllCategories()
        res.render('editpost', {
            post,
            allCategories,
            pageTitle: 'Edit post ' + post.title + ' | Blogen Edit Post'
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

module.exports = router