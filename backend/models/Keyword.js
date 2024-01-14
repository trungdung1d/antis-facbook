const mongoose = require("mongoose");
const reactSchema = new mongoose.Schema({
  keyword: {
    type: String
  },
});

module.exports = mongoose.model("Keyword", reactSchema);
  