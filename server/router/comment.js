const express = require('express')
const router = express.Router()
const {authMiddleware} = require('../middleware/auth')

const CommentController = require('../controllers/CommentController');

//TẠO BÀI VIẾT
router.post('/:postId', authMiddleware, CommentController.createComment);
//SỬA BÌNH LUẬN
router.put('/:commentId', authMiddleware, CommentController.editComment);
//XÓA BÌNH LUẬN
router.delete('/:commentId', authMiddleware, CommentController.deleteComment)
//XEM DANH SÁCH BÌNH LUẬN CỦA BÀI VIẾT
router.get('/:postId', CommentController.getCommentsByPost)
//XEM CHI TIẾT BÌNH LUẬN CỦA BÀI VIẾT
router.get('/:commentId', CommentController.getCommentDetail)

module.exports = router