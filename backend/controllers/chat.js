const User = require('../models/User')
const Chat = require('../models/Chat')
const Message = require('../models/Message')

exports.createConversation = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body
        const user1 = await User.findById(senderId)
        const user2 = await User.findById(receiverId)
        if (user1 && user2) {
        const newConversation = await new Chat({ members: [senderId , receiverId] }).save()
        res.json(newConversation)
        } else if (user1 && !user2){
            res.status(400).json({ message: "Not found user2"})
        }else if (!user1 && user2){
            res.status(404).json({ message: "Not found user1"})
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getListConversations = async (req, res) => {
    const list = await Chat.find()
    let arr1 = []
    let arr2 = []
    let count = 0
    for (const user of list) {
        for (let i = 0; i < user.members.length; i++) {
            const user1 = await User.findById(user.members[i]).select({ id: 1, username: 1, picture: 1 })
            const mess = await Message.find({ sender: { $in: user.members[i] } }).select({ id: 1, content: 1, unread: 1 })
            arr1.push(user1)
            arr2.push(mess)
        }
    }

    for (let i = 0; i < arr2.length; i++) {
        if (arr2[0][i].unread == false) {
            count++;
        }
    }


    res.json({
        id: list.id,
        partner: arr1,
        LastMessage: arr2,
        numNewMessage: count
    })

}

exports.createMessage = async (req, res) => {
    try {
        const newMessage = await new Message(req.body).save()
        res.json(newMessage)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getConversation = async (req, res) => {
    try {
        var is_blocked = false
        let user
        const { partner_id, conversation_id } = req.body
        const conversation = await Message.findById(conversation_id).select({ id: 1, content: 1, unread: 1, sender: 1, receiver: 1 })


        if (req.user.id !== partner_id) {
            const sender = await User.findById(partner_id)
            const receiver = await User.findById(req.user.id)
            if (sender.blocks.includes(receiver._id)) {
                is_blocked = true
            }
        }

        if (partner_id == conversation.sender._id || partner_id == conversation.receiver._id) {
            user = await User.findById(partner_id).select({ id: 1, username: 1, picture: 1 })

            res.json({
                conversation: conversation,
                sender: user,
                is_blocked
            })
        } else {
            res.status(400).json({ message: "Can not found partner in conversation" })
        }


    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.setRead = async (req, res) => {
    try {
        const { partner_id, conversation_id } = req.body
        const conversation = await Message.findById(conversation_id)
        const user = await User.findById(partner_id)
        if (conversation && user) {
            await Message.findByIdAndUpdate(conversation_id, { unread: true })
            res.status(200).json({ message: "Message has been read" })
        } else if(!conversation && user){
            res.status(404).json({ message: "Not found message" })
        } else if(!user && conversation){
            res.status(404).json({ message: "Not found user" })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.deleteMessage = async (req, res) => {
    try {
        const { partner_id, conversation_id } = req.body
        const conversation = await Message.findById(conversation_id)
        const user = await User.findById(partner_id)
        if (conversation && user) {
            await Message.findByIdAndDelete(conversation_id)
            res.status(200).json({ message: "Message has been delete" })
        } else if(!conversation && user){
            res.status(404).json({ message: "Not found message" })
        } else if(!user && conversation){
            res.status(404).json({ message: "Not found user" })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.deleteConversation = async (req, res) => {
    try {
        const { partner_id, conversation_id } = req.body
        const conversation = await Chat.findById(conversation_id)
        const user = await User.findById(partner_id)
        if (conversation && user) {
            await Chat.findByIdAndDelete(conversation_id)
            res.status(200).json({ message: "Conversation has been delete" })
        } else if(!conversation && user){
            res.status(404).json({ message: "Not found conversation" })
        } else if(!user && conversation){
            res.status(404).json({ message: "Not found user" })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}