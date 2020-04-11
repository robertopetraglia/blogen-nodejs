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
    const documentsForPage = 1

    try {
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

        const totPosts = await Post.countDocuments({})
        const pages = []
        for (let i = 1; i <= (totPosts / documentsForPage); i++) {
            pages.push({
                pageNum: i,
                skip: (i * documentsForPage) - documentsForPage,
                active: (i == 1 && req.query.pn === undefined || req.query.pn == i) ? true : false
            })
        }

        let nextPageNum = 2
        if (req.query.pn !== undefined) {
            nextPageNum = parseInt(req.query.pn) + 1 
        }

        let prevPageNum = 0
        if (req.query.pn !== undefined) {
            prevPageNum = parseInt(req.query.pn) - 1 
        }

        console.log(prevPageNum, nextPageNum)

        res.render('posts', {
            posts: req.user.posts,
            pages,
            nextPageNum,
            prevPageNum
        })
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/user/post/search', auth, async (req, res) => {
    try {
        const posts = await Post.find({
            title: { 
                $regex: req.query.qs, 
                $options: 'i',
            },
            owner: req.user._id
        })
        .sort({'createdAt': -1})

        req.user.posts.map(post => {
            let category = allCategories.find(category => category._id == post.category)
            post.category = category.title
        });
        
        res.render('posts', {
            posts
        })
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

module.exports = router