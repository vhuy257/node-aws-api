const mongoose = require('mongoose');
var Tags = mongoose.Schema({
    name: String,
}, {
    timestamps: true
});

const TopicSchema = mongoose.Schema({
    user: String,
    title: String,
    image: String,
    slug: String,
    excerpt: String,
    content: String,
    tags: [Tags]
}, {
    timestamps: true
});

TopicSchema.index({title: "text", content: "text"});

module.exports = mongoose.model('Topic', TopicSchema);
