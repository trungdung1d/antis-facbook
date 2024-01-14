const express = require("express");
const { reactPost, checkfeel } = require("../controllers/react");
const { authUser } = require("../middlwares/auth");

const router = express.Router();

router.post("/reactPost", authUser, reactPost)
router.post("/checkfeel", authUser, checkfeel)



module.exports = router;
