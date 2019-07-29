const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema({
    date: String,
    user: String,
    content: String,
    topicId: String,
    userPhoto: String,
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', CommentSchema);
