const express = require("express");
const { register, activateAccount, login, updateInfo, addFriend, cancelRequest, acceptRequest, getListFriends, getListSuggestFriends, setSetting, getSetting, setBlock, unBlock, getListBlock, setInfo, getInfo, buyToken, transferToken } = require("../controllers/user");
const { authUser } = require("../middlwares/auth");
const upload = require("../middlwares/upload");
const router = express.Router();

router.post("/register", register);
router.get("/activate", authUser,activateAccount);
router.post("/login", login);
router.post("/update", updateInfo);
router.post("/addFriend/:id", authUser, addFriend)
router.post("/cancelRequest/:id", authUser, cancelRequest)
router.post("/acceptRequest/:id", authUser, acceptRequest)
router.post("/getListFriend", authUser, getListFriends)
router.post("/getListSuggestFriend", authUser, getListSuggestFriends)
router.post("/setSetting/:id", authUser, setSetting)
router.post("/getSetting/:id", authUser, getSetting)
router.post("/setBlock/:id", authUser, setBlock)
router.post("/unBlock/:id", authUser, unBlock)
router.post("/getBlock", authUser, getListBlock)
router.post("/setInfo", authUser, upload.single('cover'), setInfo)
router.post("/getInfo", authUser, getInfo)
router.post("/buyToken", authUser, buyToken)
router.post("/transferToken", authUser, transferToken)

module.exports = router;
