const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const messageSchema = new mongoose.Schema({
    sender: {
        type: ObjectId,
        ref: "User"
    },
    receiver: {
        type: ObjectId,
        ref: "User"
    },
    content: {
        type: String,
    },
    unread: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
