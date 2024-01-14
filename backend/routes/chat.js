const express = require("express");
const { createConversation, getListConversations, createMessage, getConversation, setRead, deleteMessage, deleteConversation} = require("../controllers/chat");
const { authUser } = require("../middlwares/auth");


const router = express.Router();

router.post("/createConversation", authUser, createConversation);
router.post("/getListConversations", authUser, getListConversations);
router.post("/createMessage", authUser, createMessage);
router.post("/getConversation", authUser, getConversation);
router.post("/setRead", authUser, setRead);
router.post("/deleteMessage", authUser, deleteMessage);
router.post("/deleteConversation", authUser, deleteConversation);

module.exports = router;
