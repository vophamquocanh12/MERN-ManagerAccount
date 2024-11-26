const {Account, Post, Comment} = require('../models/models')

const mongoose = require('mongoose')

const PostController = {
	// TẠO BÀI VIẾT
	createPost: async (req, res) => {
		const {title, content} = req.body
		const userId = req.userId // Lấy ID người dùng từ token đã xác thực
		if (!title || !content) {
			return res
				.status(400)
				.json({message: 'Title and content are required'})
		}

		try {
			const newPost = new Post({
				title,
				content,
				author: userId,
			})
			await newPost.save()
			return res
				.status(201)
				.json({message: 'Post created successfully', post: newPost})
		} catch (error) {
			return res
				.status(500)
				.json({success: false, message: 'Server error'})
		}
	},
	// SỪA BÀI VIẾT
	editPost: async (req, res) => {
		const {title, content} = req.body
		const postId = req.params.id

		try {
			const post = await Post.findById(postId)
			if (!post) {
				return res
					.status(404)
					.json({success: false, message: 'Post not found'})
			}
			// kiểm tra quyền tác giả
			if (post.author.toString() !== userId) {
				return res.status(403).json({
					success: false,
					message: 'You are not authorized to edit this post',
				})
			}
			// cập nhật thông tin bài viết
			post.title = title || post.title
			post.content = content || post.content
			post.updatedAt = Date.now() // Cập nhật thời gian sửa đổi

			await post.save()
			return res.status(200).json({
				success: true,
				message: 'Post updated successfully',
				post,
			})
		} catch (error) {
			return res.status(500).json({
				success: false,
				message: 'Server error',
			})
		}
	},
	//XÓA BÀI VIẾT
	deletePost: async (req, res) => {
		const postId = req.params.id //id bài viết cần xóa

		try {
			const post = await Post.findById(postId)
			if (!post) {
				return res
					.status(404)
					.json({success: false, message: 'Post not found'})
			}

			// kiểm tra xem người yêu cầu có phải tác giả của bài viết không
			if (post.author.toString() !== req.userId) {
				return res.status(403).json({
					success: false,
					message: 'You are not authorized to delete this post',
				})
			}
			await post.remove()
			return res.status(200).json({
				success: true,
				message: 'Post deleted successfully',
			})
		} catch (error) {
			return res
				.status(500)
				.json({success: false, message: 'Server error'})
		}
	},
	// LIKE BÀI VIẾT
	likeOnPost: async (req, res) => {
		const postId = req.params.id // id bài viết
		const userId = req.userId //id của người dùng

		try {
			const post = await Post.findById(postId)
			if (!post) {
				return res
					.status(404)
					.json({success: false, message: 'Post not found'})
			}
			// Kiểm tra xem người dùng đã like bài viết chưa
			if (post.likes.includes(userId)) {
				return res.status(400).json({
					success: false,
					message: 'You have already liked this post',
				})
			}
			// Thêm người dùng vào danh sách like
			post.likes.push(userId)
			post.likeCount += 1 // cập nhật số lượng likes
			await post.save()
			return res.status(200).json({
				success: true,
				message: 'Post liked successfully',
			})
		} catch (error) {
			return res
				.status(500)
				.json({success: false, message: 'Server error: '})
		}
	},
	// COMMENT BÀI VIẾT
	commentOnPost: async (req, res) => {
		const {content} = req.body // lấy nội dung bình luận
		const postId = req.params.id // id bài viết
		const userId = req.userId // id người dùng

		try {
			const post = await Post.findById(postId)
			if (!post) {
				return res
					.status(404)
					.json({success: false, message: 'Post not found'})
			}

			const newComment = new Comment({
				postId,
				author: userId,
				content,
			})
			await newComment.save()

			post.comments.push(newComment._id)
			post.commentCount += 1
			await post.save()
			return res.status(201).json({
				success: true,
				message: 'Comment added successfully',
				comment: newComment,
			})
		} catch (error) {
			return res
				.status(500)
				.json({success: false, message: 'Server error: '})
		}
	},
	// XEW DANH SÁCH BÀI VIẾT
	getPosts: async (req, res) => {
		const userId = req.userId

		try {
			const user = await Account.findById(userId)
			if (!user) {
				return res
					.status(404)
					.json({success: false, message: 'User not found'})
			}
			const posts = await Post.find({
				$or: [
					{author: userId}, // Bài viết của chính người dùng
					{author: {$in: user.friends}}, // Bài viết của bạn bè
				],
			}).sort({createdAt: -1}) // Sắp xếp theo thời gian đăng giảm dần
			return res.status(200).json({success: true, posts})
		} catch (error) {
			return res
				.status(500)
				.json({success: false, message: 'Server error: '})
		}
	},
	// XEM SỐ LƯỢNG LIKE VÀ COMMENT
	getPostStatus: async (req, res) => {
		const postId = req.params.id

		try {
			// tìm bài post theo id
			const post = await Post.findById(postId)
			// kiểm tra xem bài viết có tồn tại không
			if (!post) {
				return res
					.status(404)
					.json({success: false, message: 'Post not found'})
			}

			// số lương like và comment của bài viết
			const likeCount = post.likes.length
			const commentCount = post.comments.length

			// trả về kết quả
			return res.status(200).json({
				success: true,
				likeCount,
				commentCount,
			})
		} catch (error) {
			return res
				.status(500)
				.json({success: false, message: 'Server error: '})
		}
	},
}

module.exports = PostController
