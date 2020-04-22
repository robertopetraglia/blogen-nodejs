const mongoose = require('mongoose')
const moment = require('moment')

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    }, 
    category: {
        type: String,
        required: true
    },
    body: {
        type: String,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

postSchema.methods.toJSON = function () {
    const post = this
    const postObject = post.toObject()

    postObject.createdAt = moment(postObject.createdAt).utc().format('MMM D YYYY HH:mm')

    return postObject
}

const Post = mongoose.model('Post', postSchema)

module.exports = Post