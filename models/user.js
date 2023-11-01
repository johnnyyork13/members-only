const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    displayName: { type: String, required: true },
    membershipType: { type: String, enum: ["basic", "member", "admin"] },
    posts: []
})

module.exports = mongoose.model("User", UserSchema);