const express = require('express')
const User = require('../models/user')
const Category = require('../models/category')
const auth = require('../middleware/auth')
const router = new express.Router()

router.get('/login', (req, res) => {
    res.render('login', {
        pageTitle: 'Login | Blogen'
    })
})

router.post('/user/create', async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        
        const token = await user.generateAuthToken()
        req.session.token = token

        res.redirect('/user/dashboard')
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/login')
    }
})

router.post('/user/auth', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        req.session.token = token
        res.redirect('/user/dashboard')
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/login')
    }
})

router.get('/user/dashboard', auth, async (req, res) => {
    try {
        await req.user.populate({
            path: 'posts'
        }).execPopulate()

        const totUsers = await User.countUsers()
        const totCategories = await Category.countCategories()
        const allCategories = await Category.getAllCategories()

        req.user.posts.map(post => {
            let category = allCategories.find(category => category._id == post.category)
            post.category = category.title
        });

        res.render('dashboard', {
            name: req.user.name,
            pageTitle: 'Dashboard | Blogen',
            posts: req.user.posts,
            totUsers,
            totCategories,
            allCategories,
            totalPosts: Math.ceil(req.user.posts.length / 3),
            documentsForPage: 3
        })
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/user/addnew/save', auth, async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()

        res.redirect('/user/dashboard')
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/user/dashboard')
    }
})

router.post('/user/users/editsave/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        req.flash('error', 'Invalid updates!')
        return res.redirect('/user/users/edit?_id=' + req.params.id)
    }

    try {
        const user = await User.findOne({ _id: req.params.id })

        if (!user) {
            return res.status(404).send()
        }

        updates.forEach((update) => user[update] = req.body[update])
        await user.save()

        req.flash('success', 'User successfully saved')
        return res.redirect('/user/users/edit?_id=' + req.params.id)
    } catch (e) {
        req.flash('error', 'Invalid updates!')
        return res.redirect('/user/users/edit?_id=' + req.params.id)
    }
})

router.get('/user/logout', auth, async (req, res) => {
    try {
        // req.user.tokens = req.user.tokens.filter((token) => {
        //     return token.token !== req.session.token
        // })
        req.user.tokens = []
        await req.user.save()

        req.flash('success', 'Logout successfull')
        res.redirect('/login');
    } catch (e) {
        req.flash('error', 'Please authenticate')
        res.redirect('/login')
    }
})

router.get('/user/users', auth, async (req, res) => {
    try {
        const documentsForPage = 2
        const totalUsers = await User.countDocuments({})

        res.render('users', {
            totalPages: Math.ceil(totalUsers / documentsForPage),
            documentsForPage,
            pageTitle: 'Users | Blogen Search User'
        })
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/user/users/getall', auth, async (req, res) => {
    try {
        const documentsForPage = 2

        let pn = req.query.pn === undefined ? 1 : req.query.pn
        
        let skip = (pn * documentsForPage) - documentsForPage
        if (skip <= 0) {
            skip = 0
        } 

        const allUsers = await User.find({})
            .limit(documentsForPage)
            .skip(skip)
            .sort({'createdAt': -1})

        const totalUsers = await User.countDocuments({})

        res.json({
            type: 'users',
            users: allUsers,
            totalPages: Math.ceil(totalUsers / documentsForPage),
            documentsForPage
        })
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

router.get('/user/usersearch', auth, async (req, res) => {
    try {
        const users = await User.find({
            name: { 
                $regex: req.query.qs, 
                $options: 'i',
            }
        })        
        .sort({'createdAt': -1})
        
        res.render('users', {
            type: 'users',
            users,
            totalPages: users.length,
            documentsForPage: 1,
            isSearchPage: true,
            searchString: req.query.qs,
            pageTitle: 'You are searching for ' + req.query.qs + ' | Blogen Search Users'
        })
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

router.get('/user/users/search', auth, async (req, res) => {
    try {
        const documentsForPage = 1

        let skip = 0
        if (req.query.pn !== undefined) {
            skip = (parseInt(req.query.pn) * documentsForPage) - documentsForPage
        }

        const users = await User.find({
            name: { 
                $regex: req.query.qs, 
                $options: 'i',
            }
        })
        .sort({'createdAt': -1})
        .skip(skip)
        .limit(documentsForPage)
        
        res.json({
            type: 'users',
            users,
            totalPages: Math.ceil(users.length / documentsForPage),
            documentsForPage
        })
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

router.get('/user/users/edit', auth, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.query._id })
        
        if (!user) {
            res.status(404).send()
        }

        res.render('edituser', {
            user,
            pageTitle: 'Edit user ' + user.title + ' | Blogen Edit User'
        })
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

router.get('/user/users/delete/:id', auth, async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ _id: req.params.id })
        
        if (!user) {
            return res.status(404).send()
        }

        req.flash('success', 'User ' + user.title + ' deleted successfully')
        res.redirect('/user/dashboard')
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

module.exports = router