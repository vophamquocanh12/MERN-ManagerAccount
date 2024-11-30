const express = require('express')
const router = express.Router()
const {authMiddleware} = require('../middleware/auth')
const PostController = require('../controllers/PostController');

// TẠO BÀI VIẾT
router.post('/create', authMiddleware, PostController.createPost)
// SỪA BÀI VIẾT
router.put('/edit/:id', authMiddleware, PostController.editPost)
//XÓA BÀI VIẾT
router.delete('/delete/:id', authMiddleware, PostController.deletePost)
// LIKE BÀI VIẾT
router.post('/like/:id', authMiddleware, PostController.likeOnPost)
// COMMENT BÀI VIẾT
router.post('/comment/:id', authMiddleware, PostController.commentOnPost)
// XEW DANH SÁCH BÀI VIẾT
router.get('/posts', authMiddleware, PostController.getPosts)
// XEM CHI TIẾT BÀI VIẾT
router.get('/detail/:id', authMiddleware, PostController.getPostDetail)
// XEM SỐ LƯỢNG LIKE VÀ COMMENT
router.get('/status/:id', authMiddleware, PostController.getPostStatus)

module.exports = router