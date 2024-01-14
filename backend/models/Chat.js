const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const chatSchema = new mongoose.Schema({
    members: [
        {
            type: ObjectId,
            ref: "User"
        }
    ],
    lastMessage: {
        type: ObjectId,
        ref: "Message",
    },
},
    { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
