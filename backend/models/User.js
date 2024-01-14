const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

const userSchema = mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "first name is required"],
      trim: true,
      text: true,
    },
    last_name: {
      type: String,
      required: [true, "last name is required"],
      trim: true,
      text: true,
    },
    username: {
      type: String,
      required: [true, "username is required"],
      trim: true,
      text: true,
      unique: true,
    },

    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    picture: {
      type: String,
      trim: true,
      default:
        "https://res.cloudinary.com/dmhcnhtng/image/upload/v1643044376/avatars/default_pic_jeaybr.png",
    },
    cover: {
      type: String,
      trim: true,
      default:
        "https://res.cloudinary.com/dmhcnhtng/image/upload/v1643044376/avatars/default_pic_jeaybr.png",
    },
    gender: {
      type: String,
      required: [true, "gender is required"],
      trim: true,
    },
    bYear: {
      type: Number,
      required: true,
      trim: true,
    },
    bMonth: {
      type: Number,
      required: true,
      trim: true,
    },
    bDay: {
      type: Number,
      required: true,
      trim: true,
    },
    is_friend: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    coins: {
      type: Number,
      default: 10,
    },
    description:{
      type: String
    },
    listing: {
      type: Number
    },
    link: {
      type: String,
      default: 'https://www.facebook.com/profile.php?id=100040171447381'
    },
    online: {
      type: String,
      default: 'online'
    },
    friends: [
      {
        type: ObjectId,
        ref: "User",
      }
    ],
    following: [
      {
        type: ObjectId,
        ref: "User",
      }
    ],
    followers: [
      {
        type: ObjectId,
        ref: "User",
      }
    ],
    requests: [
      {
        type: ObjectId,
        ref: "User",
      }
    ],
    blocks: [
      {
        type: ObjectId,
        ref: "User",
      }
    ],
    setting: [
      {
        like_comment: {
          type: Number,
          default: 0,
        }
        ,

        from_friend: {
          type: Number,
          default: 0,
        }
        ,

        requested_friend: {
          type: Number,
          default: 0,
        }
        ,

        suggested_friend: {
          type: Number,
          default: 0,
        }
        ,

        birthday: {
          type: Number,
          default: 0,
        }
        ,

        video: {
          type: Number,
          default: 0,
        }
        ,

        report: {
          type: Number,
          default: 0,
        }
        ,

        sound_on: {
          type: Number,
          default: 0,
        }
        ,

        notification_on: {
          type: Number,
          default: 0,
        }
        ,

        vibrant_on: {
          type: Number,
          default: 0,
        }
        ,

        let_on: {
          type: Number,
          default: 0,
        }
      },
    ],
    search: [
      {
        keyword: {
          type: String,
          require: true,
        },
        createdAt: {
          type: Date,
          require: true
        },
      },
    ],
    details: {
      bio: {
        type: String,
      },
      otherName: {
        type: String,
      },
      job: {
        type: String,
      },
      workplace: {
        type: String,
      },
      highSchool: {
        type: String,
      },
      college: {
        type: String,
      },
      currentCity: {
        type: String,
      },
      hometown: {
        type: String,
      },
      relationship: {
        type: String,
        enum: ["Single", "In a relationship", "Married", "Divorced"],
      },
      instagram: {
        type: String,
      },
    },
    savedPosts: [
      {
        post: {
          type: ObjectId,
          ref: "Post",
        },
        savedAt: {
          type: Date,
          default: new Date(),
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
