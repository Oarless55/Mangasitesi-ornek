const mongoose = require('mongoose')
const { autoIncrement } = require('mongoose-plugin-autoinc')

const ReactionSchema = new mongoose.Schema({
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
    type: {
        type: Number,
        required: true
        // 1: Beğendim, 2: Sinir Bozucu, 3: Mükemmel, 4: Şaşırtıcı, 5: Sakin Olmalıyım, 6: Bölüm Bitti
    },
    createdAt: {
        type: Number,
        default: Date.now()
    }
})

ReactionSchema.plugin(autoIncrement, 'Reaction')
module.exports = mongoose.model('Reaction', ReactionSchema)
