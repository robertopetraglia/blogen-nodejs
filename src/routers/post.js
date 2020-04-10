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
        await req.user.populate({
            path: 'posts'
        }).execPopulate()

        const allCategories = await Category.getAllCategories()

        req.user.posts.map(post => {
            let category = allCategories.find(category => category._id == post.category)
            post.category = category.title
        });

        res.render('posts', {
            posts: req.user.posts
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
                $options: 'i' 
            },
            owner: req.user._id
        })
        
        res.render('posts', {
            posts
        })
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

module.exports = router