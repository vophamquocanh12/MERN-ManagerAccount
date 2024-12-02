const {Account, Post, Comment} = require('../models/models')

const mongoose = require('mongoose')

const PostController = {
	// TẠO BÀI VIẾT
	createPost: async (req, res) => {
		const {title, content, link} = req.body
		const accountId = req.user.userId // Lấy ID người dùng từ token đã xác thực

		console.log(accountId)

		if (!title || !content) {
			return res
				.status(400)
				.json({message: 'Title and content are required'})
		}

		try {
			const newPost = new Post({
				title,
				content,
				link: link.startsWith('http://') ? link : `http://${link}`,
				author: accountId,
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
		const {title, content, link} = req.body
		const postId = req.params.id

		try {
			const post = await Post.findById(postId)

			if (!post) {
				return res
					.status(404)
					.json({success: false, message: 'Post not found'})
			}
			// kiểm tra quyền tác giả
			if (post.author.toString() !== req.user.userId) {
				return res.status(403).json({
					success: false,
					message: 'You are not authorized to edit this post',
				})
			}
			// cập nhật thông tin bài viết
			post.title = title || post.title
			post.content = content || post.content
			post.link = link || post.link
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
			if (post.author.toString() !== req.user.userId) {
				return res.status(403).json({
					success: false,
					message: 'You are not authorized to delete this post',
				})
			}
			// Xóa tất cả các comment liên quan đến bài viết
			await Comment.deleteMany({postId: postId})

			// Cập nhật số lượng like cho các bài viết khác (nếu cần)
			const userId = post.author.toString()
			await Post.updateMany({likes: userId}, {$pull: {likes: userId}})

			await Post.findByIdAndDelete(postId)
			return res.status(200).json({
				success: true,
				message: 'Post deleted successfully',
			})
		} catch (error) {
			console.log(error)

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
		const userId = req.user.userId // id người dùng

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
				comment: newComment.populate(),
			})
		} catch (error) {

			return res
				.status(500)
				.json({success: false, message: 'Server error: '})
		}
	},
	// XEW DANH SÁCH BÀI VIẾT
	getPosts: async (req, res) => {
		const userId = req.user.userId
		
		try {
			const user = await Account.findById(userId)
			console.log(user);
			
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
	//XEM CHI TIẾT BÀI VIẾT
	getPostDetail: async (req, res) => {
		const postId = req.params.id

		try {
			const post = await Post.findById(postId).populate(
				'author',
				'username'
			) // populate tác giả bài viết nếu cần
			if (!post) {
				return res
					.status(404)
					.json({success: false, message: 'Post not found'})
			}

			// Trả về chi tiết bài viết (bao gồm nội dung bài viết, tác giả, likes, comments...)
			return res.status(200).json({
				success: true,
				post: {
					title: post.title,
					content: post.content,
					link: post.link,
					author: post.author.username,
					likes: post.likes,
					comments: post.comments,
					likeCount: post.likeCount,
					commentCount: post.commentCount,
					createdAt: post.createdAt,
					updatedAt: post.updatedAt,
				},
			})
		} catch (error) {
			return res
				.status(500)
				.json({success: false, message: 'Server error'})
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
