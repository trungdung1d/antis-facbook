const express = require("express");
const { createPost, getAllPosts, getPost, updatePost, deletePost, reportPost, comment , getComments, searchPost, getListSearch, deleteSearch, getListVideo} = require("../controllers/post");
const { authUser } = require("../middlwares/auth");
const storage = require("../helpers/multer")

const router = express.Router();

router.post("/createPost", authUser, createPost);
router.get("/getAllPosts", authUser, getAllPosts)
router.get("/getPost", authUser, getPost)
router.put("/updatePost", authUser, updatePost)
router.delete("/deletePost/:id", authUser, deletePost)
router.post("/reportPost/:id", authUser, reportPost)
router.post("/comment", authUser, comment)
router.get("/getComment", authUser, getComments)
router.post("/search", authUser, searchPost)
router.post("/getSearch",authUser ,getListSearch)
router.post("/deleteSearch", authUser, deleteSearch)
router.post("/getVideo", authUser, getListVideo)


module.exports = router;
