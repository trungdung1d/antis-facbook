const { ObjectId, default: mongoose } = require("mongoose");
const Post = require("../models/Post")
const Keyword = require("../models/Keyword")
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});
exports.createPost = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.coins >= 4) {
            const newPost = await new Post(req.body).save();
            user.coins = user.coins - 4;
            user.save()
            res.json({
                newPost,
                coins: user.coins
            });
        } else {
            res.status(400).json({ message: "Account not enough coins to creat post" })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
        res.json(posts)
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.getPost = async (req, res) => {
    try {
        const { id } = req.body
        const post = await Post.findOne({ _id: id })
        const comment = post.comments
        let a = 0, b = 0
        for(let i = 0; i< comment.length; i++) {
            if(comment[i].type == "fake"){
                a = a + 1
            }else if(comment[i].type == "trust"){
                b = b + 1
            }
        }

        const user_id = post.user
        const user = await User.findById(user_id).select({id: 1, username: 1, picture: 1, coins: 1, listing: 1})
        res.json({
            post,
            author: user,
            fake: a,
            trust: b,
            state: "normal",
            is_blocked: false,
            can_edit: true,
            banned: false,
            url: post.background,

        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.updatePost = async (req, res) => {
    try {
        const body = req.body
        const { id } = req.body
        const post = await Post.findByIdAndUpdate({ _id: id },
            {
                ...body
            },
            {
                new: true
            }
        )
        res.json(post)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.deletePost = async (req, res) => {
    try {
        const data = await Post.findByIdAndDelete(req.params.id)
        if (data) {
            res.status(200).json({ message: "Delete post successfully" })
        }else{
            res.status(404).json({ message: "Not Found post" })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.reportPost = async (req, res) => {
    try {
        const { subject, details } = req.body
        const post = await Post.findOne({ _id: req.params.id })
        if (!post) {
            return res.status(400).json({ message: "The post has not been found" })
        } else {
            post.subject = subject
            post.details = details
            await post.save()
            return res.status(200).json({ message: "The post has been reported successfully" })
        }

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.comment = async (req, res) => {
    try {
        const { type, comment, image, postId, index, count } = req.body;
        const post = await Post.findOne({ _id: postId })
        const comments = post.comments
        let countComment = comments.length
        const indexs = comments.length
        const user = await User.findById(req.user.id)
        let newComments = await Post.findByIdAndUpdate(
            postId,
            {
                $push: {
                    comments: {
                        index: index,
                        count: count,
                        type: type,
                        comment: comment,
                        image: image,
                        commentBy: req.user.id,
                        commentAt: new Date(),
                    },
                }
            },
            {
                new: true,
                safe: true,
                upsert: true,
            }
        ).populate("comments.commentBy", "picture first_name last_name username");
        res.json(newComments.comments,);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { postId, index, count } = req.body
        const post = await Post.findOne({ "_id": postId }, { comments: { $elemMatch: { index: index, count: count } } }).populate("comments.commentBy", "first_name last_name username")

        res.json(post.comments)
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.searchPost = async (req, res) => {
    try {
        const { user_id, index, count } = req.body
        const keyword = req.body.keyword
        const normalizedKeyword = keyword.toLowerCase().trim();
        const post = await Post.find({
            $and: [
                { user: user_id },
                { comments: { $elemMatch: { index: index } } },
                { comments: { $elemMatch: { count: count } } }
            ]
        })

        
        const check = await Keyword.findOne({ keyword })
        if (!check) {
            await Keyword.insertMany({
                keyword: normalizedKeyword
            })

            await User.findByIdAndUpdate(user_id, {
                $push: {
                    search: {
                        keyword: normalizedKeyword,
                        createdAt: new Date(),
                    }
                }
            })
        }

        res.json(post)

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.getListSearch = async (req, res) => {
    try {
        const { user_id } = req.body
        const user = await User.findById(user_id)
        if (user) {
            res.json(user.search)
        }

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.deleteSearch = async (req, res) => {
    try {
        const { user_id, search_id } = req.body
        const user = await User.findByIdAndUpdate(user_id, {
            $pull: {
                search: {
                    _id: search_id
                }
            }
        })
        await User.updateOne({ user_id }, user);
        res.json(user.search)
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.getListVideo = async (req, res) => {
    try {
        const { user_id } = req.body


        const post = await Post.find({ user: user_id }, { video: 1, _id: 1, user: 1, feel: 1, is_felt: 1, }).populate("comments.commentBy", "first_name last_name username")
        if (post.length > 0) {
            return res.json(post);
        } else {
            return res.json({ message: "Không tìm thấy video nào của user này" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

