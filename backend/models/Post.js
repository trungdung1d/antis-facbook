const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["profilePicture", "coverPicture", null],
      default: null,
    },
    text: {
      type: String,
    },
    images: {
      type: Array,
    },
    video: [
      {
        name: {
          type: String,
        },
        url: {
          type: String,
        },
        description: {
          type: String
        }
      }
    ],
    user: {
      type: ObjectId,
      ref: "User",
    },
    is_felt: {
      type: Boolean,
      default: false,
    },
    feel: {
      type: String,
      default: "0",
    },
    background: {
      type: String,
    },
    comments: [
      {
        index: {
          type: String
        },
        count: {
          type: String
        },
        type: {
          type: String
        },
        comment: {
          type: String,
        },
        image: {
          type: String,
        },
        commentBy: {
          type: ObjectId,
          ref: "User",
        },
        commentAt: {
          type: Date, 
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

autoIncrement.initialize(mongoose.connection)
postSchema.plugin(autoIncrement.plugin, {
  model: "Post",
  field: "index",
  startAt: 1,
  incrementBy: 1
})

module.exports = mongoose.model("Post", postSchema);
