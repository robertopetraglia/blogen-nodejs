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

router.get('/user/posts', auth, async (req, res) => {
    try {
        const documentsForPage = 1
        const totalPosts = await Post.countDocuments({})

        res.render('posts', {
            totalPosts: totalPosts / documentsForPage
        })
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/user/posts/getall', auth, async (req, res) => {
    try {
        const documentsForPage = 1

        await req.user.populate({
            path: 'posts',
            options: {
                limit: documentsForPage,
                skip: parseInt(req.query.pn) - documentsForPage,
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
            posts: req.user.posts,
            totalPosts: totalPosts / documentsForPage
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
            posts,
            totalPosts: posts.length,
            isSearchPage: true,
            searchString: req.query.qs
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
            posts,
            totalPosts: posts.length / documentsForPage
        })
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

module.exports = router