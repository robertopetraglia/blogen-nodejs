const express = require('express')
const User = require('../models/user')
const Category = require('../models/category')
const auth = require('../middleware/auth')
const bcrypt = require('bcryptjs')
const router = new express.Router()

const { ErrorHandler } = require('../helpers/errors')

let asyncErrorWrapper = fn => (...args) => fn(...args).catch(args[2]);

router.get('/login', (req, res) => {
    try {
        res.render('login', {
            pageTitle: 'Login | Blogen'
        })
    } catch (e) {
        throw new ErrorHandler('500', e.message, 'render', { pageTitle: '500 Internal Server Error'})
    }    
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
        throw new ErrorHandler('500', e.message, 'render', { pageTitle: '500 Internal Server Error'})
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
            throw new ErrorHandler('404', 'User not found', 'render', { pageTitle: '404 Page Not Found'})
        }

        updates.forEach((update) => user[update] = req.body[update])
        await user.save()

        req.flash('success', 'User successfully saved')
        return res.redirect('/user/users/edit?_id=' + req.params.id)
    } catch (e) {
        req.flash('error', 'Invalid updates!...' + e.message)
        return res.redirect('/user/users/edit?_id=' + req.params.id)
    }
})

router.get('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        req.flash('success', 'Logout successfull')
        res.redirect('/login');
    } catch (e) {
        req.flash('error', 'Please authenticate')
        res.redirect('/login')
    }
})

router.get('/user/users', auth, asyncErrorWrapper(async (req, res) => {
    try {
        const documentsForPage = 2
        const totalUsers = await wser.countDocuments({})

        res.render('users', {
            name: req.user.name,
            totalPages: Math.ceil(totalUsers / documentsForPage),
            documentsForPage,
            pageTitle: 'Users | Blogen Search User'
        })
    } catch (e) {
        throw new ErrorHandler('500', e.message, 'render', { pageTitle: '500 Internal server Error'})
    }
}))

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
            name: req.user.name,
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

router.get('/user/profile', auth, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id })
        
        if (!user) {
            res.status(404).send()
        }

        let avatar = null
        if (user.avatar) {
            let avatarBuffer = new Buffer(req.user.avatar, 'base64')
            avatar = 'data:image/png;base64,' + avatarBuffer.toString('base64')
        } else {
            avatar = '/img/avatar.png'
        }

        res.render('userprofile', {
            name: req.user.name,
            user,
            avatar,
            pageTitle: 'User profile | Blogen Edit User'
        })
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

router.post('/user/profile/save', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'biography']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        req.flash('error', 'Invalid updates!')
        return res.redirect('/user/profile')
    }

    try {
        const user = await User.findOne({ _id: req.user.id })

        if (!user) {
            return res.status(404).send()
        }

        updates.forEach((update) => user[update] = req.body[update])
        await user.save()

        req.flash('success', 'User successfully saved')
        return res.redirect('/user/profile')
    } catch (e) {
        req.flash('error', 'Invalid updates!')
        return res.redirect('/user/profile')
    }
})

router.post('/user/profile/changepassword', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        req.flash('error', 'Invalid updates!')
        return res.redirect('/user/profile')
    }

    let pwdEqualPrev = bcrypt.compareSync(req.body.password, req.user.password)
    if (pwdEqualPrev) {
        req.flash('error', 'Invalid updates!...New password must be different from previous')
        return res.redirect('/user/profile')
    }

    try {
        const user = await User.findOne({ _id: req.user.id })

        if (!user) {
            return res.status(404).send()
        }

        updates.forEach((update) => user[update] = req.body[update])
        await user.save()

        req.flash('success', 'User successfully saved')
        return res.redirect('/user/profile')
    } catch (e) {
        req.flash('error', 'Invalid updates!... Error message: ' + e.message)
        return res.redirect('/user/profile')
    }
})

router.get('/user/profile/delete', auth, async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ _id: req.user.id })
        
        if (!user) {
            return res.status(404).send()
        }

        await req.user.remove()

        req.flash('success', 'User ' + user.name + ' deleted successfully')
        res.redirect('/login')
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

const multer = require('multer')
const sharp = require('sharp')
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload a JPG or PNG image'))
        }
        cb(undefined, true)
    }
})

router.post('/user/profile/saveavatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.hasOwnProperty('file')) {
            throw new Error('Error! You should send an image')
        }

        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        req.user.avatar = buffer
        await req.user.save()

        let avatarBuffer = new Buffer(req.user.avatar, 'base64')
        res.send({
            'success': true,
            'message': 'Image upload successfully',
            'image': avatarBuffer.toString('base64')
        })
    } catch (e) {
        console.log(e.message)
        res.send({
            'success': false,
            'message': e.message
        })
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/user/profile/deleteavatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()

        req.flash('success', 'Avatar deleted successfully')
        res.redirect('/user/profile')
    } catch (e) {
        console.log(e.message)
        res.status(500).send()
    }
})

module.exports = router