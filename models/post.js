const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    author: { type: String, required: true },
    authorUsername: { type: String, required: true},
    upvotes: { type: Number }
})

module.exports = mongoose.model("Post", PostSchema);