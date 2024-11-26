const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')

const Comment = require('../models/Comment');


module.exports = router