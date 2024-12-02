const {Comment, Post} = require('../models/models')

const CommentController = {
	//TẠO BÌNH LUẬN
	createComment: async (req, res) => {
		const {content} = req.body
		const postId = req.params.postId
		const accountId = req.user.userId

		if (!content) {
			return res.status(400).json({message: 'Content is required'})
		}
		try {
			const post = await Post.findById(postId)
			if (!post) {
				return res.status(404).json({message: 'Post not found'})
			}
			const newComment = new Comment({
				content,
				postId,
				author: accountId,
			})
			await newComment.save()

			post.comments.push(newComment._id)
			post.commentCount += 1
			await post.save()
			return res.status(201).json({
				message: 'Comment created successfully',
				comment: newComment,
			})
		} catch (error) {
			return res.status(500).json({message: 'Server error'})
		}
	},
	///SỬA BÌNH LUẬN
	editComment: async (req, res) => {
		const {content} = req.body
		const commentId = req.params.commentId

		try {
			const comment = await Comment.findById(commentId)
			if (!comment) {
				return res
					.status(404)
					.json({success: false, message: 'Comment not found'})
			}

			// kiểm tra quyền chỉnh sửa
			if (comment.author.toString() !== req.user.userId) {
				return res.status(403).json({
					success: false,
					message: 'You are not authorized to edit this comment',
				})
			}

			comment.content = content || comment.content
			comment.updatedAt = new Date().now()
			await comment.save()
			return res.status(200).json({
				success: true,
				message: 'Comment updated successfully',
				comment,
			})
		} catch (error) {
			return res
				.status(500)
				.json({success: false, message: 'Server error'})
		}
	},
	//XÓA BÌNH LUẬN
	deleteComment: async (req, res) => {
		const commentId = req.params.commentId
		try {
			const comment = await Comment.findById(commentId)
			if (!comment) {
				return res
					.status(404)
					.json({success: false, message: 'Comment not found'})
			}

			// Kiểm tra quyền xóa
			if (comment.author.toString() !== req.user.userId) {
				return res.status(403).json({
					success: false,
					message: 'You are not authorized to delete this comment',
				})
			}

			// Xóa bình luận
			await Comment.findByIdAndDelete(commentId)

			// Cập nhật bài viết liên quan
			const post = await Post.findById(comment.postId)
			if (post) {
				post.comments = post.comments.filter(
					(id) => id.toString() !== commentId
				)
				post.commentCount -= 1
				await post.save()
			}

			return res.status(200).json({
				success: true,
				message: 'Comment deleted successfully',
			})
		} catch (error) {
			return res
				.status(500)
				.json({success: false, message: 'Server error'})
		}
	},
	//LẤY DANH SÁCH BÌNH LUẬN CỦA BÀI VIẾT
	getCommentsByPost: async (req, res) => {
		const postId = req.params.postId

		try {
			const post = await Post.findById(postId)
			if (!post) {
				return res
					.status(404)
					.json({success: false, message: 'Post not found'})
			}

			const comments = await Comment.find({postId}).populate(
				'author',
				'username'
			)
			return res.status(200).json({success: true, comments})
		} catch (error) {
			return res
				.status(500)
				.json({success: false, message: 'Server error'})
		}
	},
	// XEM CHI TIẾT BÌNH LUẬN
	getCommentDetail: async (req, res) => {
		const commentId = req.params.commentId

		try {
			const comment = await Comment.findById(commentId).populate(
				'author',
				'username'
			)
			if (!comment) {
				return res
					.status(404)
					.json({success: false, message: 'Comment not found'})
			}

			return res.status(200).json({success: true, comment})
		} catch (error) {
			return res
				.status(500)
				.json({success: false, message: 'Server error'})
		}
	},
}
module.exports = CommentController
