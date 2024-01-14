const React = require('../models/React');
const Post = require('../models/Post');
const mongoose = require("mongoose");
const User = require('../models/User');
exports.reactPost = async (req, res) => {
  try {
    const { postId, react } = req.body;
    const user = await User.findById(req.user.id)
    const check = await React.findOne({
      postRef: postId,
      reactBy: mongoose.Types.ObjectId(req.user.id),
    });
    if (check == null) {
      if(user.coins >= 1){
        const newReact = new React({
          react: react,
          postRef: postId,
          reactBy: req.user.id,
        })
        await newReact.save();
        user.coins = user.coins - 1
        user.save()
        return res.status(200).json({ message: `this post have been ${react}` })
      }else{
        res.status(404).json({ message: "Account not enough coins" })
      }
    } else {
      if (check.react == react) {
        await React.findByIdAndRemove(check._id);
        return res.status(200).json({ message: `${react} has been removed` })
      } else {
        if(user.coins >=1 ){
          await React.findByIdAndUpdate(check._id, {
            react: react,
          });
          user.coins = user.coins - 1
          user.save()
          return res.status(200).json({ message: "this post have been updated emotion" })
        } else {
          res.status(404).json({ message: "Account not enough coins" })
        }
      }
    }
  } catch (error) {

  }
};

exports.checkfeel = async (req, res) => {
  try {
    const { reactId, postRef } = req.body
    const check = await React.findById(reactId)
    if(check){
      await Post.findByIdAndUpdate(postRef, {is_felt: true, feel: React.length})
      res.status(200).json({message: "Feeling is updated"})
    }
      res.status(400).json({message: "Failed"})
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}