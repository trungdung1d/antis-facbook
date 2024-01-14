const {
  validateEmail,
  validateLength,
  validateUsername,
} = require("../helpers/validation");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { generateToken } = require("../helpers/tokens");
const { sendVerificationEmail } = require("../helpers/mailer");
exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      username,
      bYear,
      bMonth,
      bDay,
      gender,
    } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "invalid email address",
      });
    }
    const check = await User.findOne({ email });
    if (check) {
      return res.status(400).json({
        message:
          "This email address already exists,try with a different email address",
      });
    }

    if (!validateLength(first_name, 3, 30)) {
      return res.status(400).json({
        message: "first name must between 3 and 30 characters.",
      });
    }
    if (!validateLength(last_name, 3, 30)) {
      return res.status(400).json({
        message: "last name must between 3 and 30 characters.",
      });
    }
    if (!validateLength(password, 6, 40)) {
      return res.status(400).json({
        message: "password must be atleast 6 characters.",
      });
    }

    if(first_name == null || last_name == null || email == null || password == null || 
      bYear == null || bMonth == null || bDay == null || gender == null){
        return res.status(400).json({message: `${first_name} is not empty`})
      }
    
    const cryptedPassword = await bcrypt.hash(password, 12);

    let tempUsername = first_name + last_name;
    let newUsername = await validateUsername(tempUsername);
    const user = await new User({
      first_name,
      last_name,
      email,
      password: cryptedPassword,
      username: newUsername,
      bYear,
      bMonth,
      bDay,
      gender,
    }).save();
    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );
    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.first_name, url);
    const token = generateToken({ id: user._id.toString() }, "7d");
    res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
      verified: user.verified,
      message: "Register Success ! please activate your email to start",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const { token } = req.body;
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    const check = await User.findById(user.id);
    if (check.verified == true) {
      return res
        .status(400)
        .json({ message: "this email is already activated" });
    } else {
      await User.findByIdAndUpdate(user.id, { verified: true });
      return res
        .status(200)
        .json({ message: "Account has beeen activated successfully." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "the email address you entered is not connected to an account." });
    }
    if (user.verified == false) {
      return res.status(400).json({ message: "this email is not already activated" });
    }

    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      return res.status(400).json({
        message: "Invalid credentials.Please try again.",
      });
    }
    const token = generateToken({ id: user._id.toString() }, "7d");
    res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
      verified: user.verified,
      message: "Login successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateInfo = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      bYear,
      bMonth,
      bDay,
      gender,
    } = req.body;
    const cryptedPassword = await bcrypt.hash(password, 12);
    const user = await User.findOne({ email })
    if (user) {
      user.first_name = first_name
      user.last_name = last_name
      user.password = cryptedPassword
      user.bYear = bYear
      user.bMonth = bMonth
      user.bDay = bDay
      user.gender = gender
    }
    await user.save()
    return res.status(200).json({ message: "Update successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Please check info again!" });
  }
}

exports.addFriend = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (
        !receiver.requests.includes(sender._id) &&
        !receiver.friends.includes(sender._id)
      ) {
        await receiver.updateOne({
          $push: { requests: sender._id },
        });
        await receiver.updateOne({
          $push: { followers: sender._id },
        });
        await sender.updateOne({
          $push: { following: receiver._id },
        });

        res.json({
          id: sender.id,
          username: sender.username,
          picture: sender.picture,
          createdAt: new Date()
        });
      } else {
        return res.status(400).json({ message: "Already sent" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "You can't send a request to yourself" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.cancelRequest = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (
        receiver.requests.includes(sender._id) &&
        !receiver.friends.includes(sender._id)
      ) {
        await receiver.updateOne({
          $pull: { requests: sender._id },
        });
        await receiver.updateOne({
          $pull: { followers: sender._id },
        });
        await sender.updateOne({
          $pull: { following: sender._id },
        });
        res.json({ message: "you successfully canceled request" });
      } else {
        return res.status(400).json({ message: "Already Canceled" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "You can't cancel a request to yourself" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.acceptRequest = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const receiver = await User.findById(req.user.id);
      const sender = await User.findById(req.params.id);
      if (receiver.requests.includes(sender._id)) {
        await receiver.update({
          $push: { friends: sender._id, following: sender._id },
        });
        await sender.update({
          $push: { friends: receiver._id, followers: receiver._id },
        });
        await receiver.updateOne({
          $pull: { requests: sender._id },
        });
        res.json({ message: "friend request accepted" });
      } else {
        return res.status(400).json({ message: "Already friends" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "You can't accept a request from  yourself" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.getListFriends = async (req, res) => {
  try {
    const { user_id } = req.body
    const user = await User.findById(user_id)

    if (user) {
      const friends = await User.find({ _id: { $in: user.friends } }).select({ id: 1, username: 1, picture: 1 })
      res.json(friends);
    } else {
      res.json({ message: "User not found" })
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.getListSuggestFriends = async (req, res) => {
  try {
    const users = await User.find();
    const ids = await users.map((user) => user._id)
    const user = await User.find({ _id: { $in: ids } }).select({ id: 1, username: 1, picture: 1 });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.setSetting = async (req, res) => {
  try {
    const {
      like_comment,
      from_friend,
      requested_friend,
      suggested_friend,
      birthday,
      video,
      report,
      sound_on,
      notification_on,
      vibrant_on,
      let_on
    } = req.body
    await User.findByIdAndUpdate({ _id: req.params.id },
      {
        $push: {
          setting: {
            like_comment: like_comment,
            from_friend: from_friend,
            requested_friend: requested_friend,
            suggested_friend: suggested_friend,
            birthday: birthday,
            video: video,
            report: report,
            sound_on: sound_on,
            notification_on: notification_on,
            vibrant_on: vibrant_on,
            let_on: let_on,
          }
        }
      },
      {
        new: true,
        safe: true,
        upsert: true,
      }
    )
    res.json({ message: "New setting is saved successfully!" })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

exports.getSetting = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    res.json(user.setting)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

exports.setBlock = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (!sender.blocks.includes(receiver._id)) {
        await sender.updateOne({
          $push: { blocks: receiver._id },
        });
        await sender.updateOne({
          $pull: { friends: receiver._id },
        });
        await receiver.updateOne({
          $pull: { friends: sender._id },
        });
        return res.status(200).json({ message: "Blocked successfully!" });
      } else {
        return res.status(400).json({ message: "Already blocked!" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "You can't send a request to yourself" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.unBlock = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (sender.blocks.includes(receiver._id)) {
        await sender.updateOne({
          $pull: { blocks: receiver._id },
        });
        res.json({ message: "You successfully unblocked" });
      } else {
        return res.status(400).json({ message: "You don't block this person" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "You can't block yourself" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.getListBlock = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (user) {
      const blocks = await User.find({ _id: { $in: user.blocks } }).select({ id: 1, username: 1, picture: 1 })
      res.json(blocks)
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.setInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    user.username = req.body.username
    user.description = req.body.description
    user.address = req.body.address
    user.city = req.body.city
    user.country = req.body.country
    user.link = req.body.link
    if (req.file) {
      //user.picture = req.files.path
      user.cover = req.file.path
    }
    user.save()

    const user1 = await User.findById(req.user.id).select({ username: 1, description: 1, address: 1, city: 1, country: 1, link: 1, picture: 1, cover: 1 })

    res.json(user1);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getInfo = async (req, res) => {
  try {
    const { user_id } = req.body
    if (req.user.id !== user_id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(user_id);
      if (sender.friends.includes(receiver._id)) {
        const listing = receiver.friends.length
        await User.findByIdAndUpdate(receiver.id, { is_friend: true, listing: listing })
      }
      const user = await User.findById(user_id).select({ username: 1, description: 1, address: 1, city: 1, country: 1, link: 1, picture: 1, cover: 1, listing: 1, is_friend: 1, coins: 1, online: 1 })
      res.json(user)
    } else if (user_id === null || req.user.id === user_id) {
      const sender = await User.findById(req.user.id);
      const listing = sender.friends.length
      await User.findByIdAndUpdate(sender.id, { listing: listing })
      const user = await User.find({ _id: { $in: sender.id } }).select({ username: 1, description: 1, address: 1, city: 1, country: 1, link: 1, picture: 1, cover: 1, listing: 1, coins: 1, online: 1 })
      res.json(user)
    }

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.buyToken = async (req, res) => {
  try {
    const { user_id, coins } = req.body
    const user = await User.findByIdAndUpdate(user_id)
    await user.updateOne({ coins: (user.coins + coins) })
    res.status(200).json({ message: "Buy coins successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.transferToken = async (req, res) => {
  try {
    const { user_id, coins } = req.body
    const sender = await User.findById(req.user.id);
    const receiver = await User.findById(user_id);
    if (sender.coins > 0) {
      await sender.updateOne({ coins: (sender.coins - coins) })
      await receiver.updateOne({ coins: (receiver.coins + coins) })
      res.status(200).json({ message: "You transferred " + coins + " coins successfully" })
    }else{
      res.status(400).json({ message: "Your account not enough coins" })
    }

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}