const mongoose = require('mongoose')
const { autoIncrement } = require('mongoose-plugin-autoinc')

const CommentSchema = new mongoose.Schema({
    story: {
        type: Number,
        required: true,
        index: true
    },
    user: {
        type: Number,
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    likes: {
        type: [Number],
        default: []
    },
    parent: {
        type: Number,
        default: null,
        index: true
    },
    createdAt: {
        type: Number,
        default: Date.now()
    }
})

CommentSchema.plugin(autoIncrement, 'Comment')
module.exports = mongoose.model('Comment', CommentSchema)
