const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
	const authHeader = req.header('Authorization')
	const token = authHeader && authHeader.split(' ')[1]

	if (!token)
		return res
			.status(401)
			.json({success: false, message: 'Access token not found!'})
	try {
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
		req.userId = decoded.userId
		req.role = decoded.role
		next()
	} catch (error) {
		console.log(error)
		return res.status(403).json({success: false, message: 'Invalid token'})
	}
}

const verifyAdmin = (req, res, next) => {
	if (req.role !== 'admin') {
		return res.status(403).json({
			success: false,
			message: 'Permission denied. Admin only.',
		})
	}
	next()
}

const authMiddleware = async (req, res, next) => {
	const token = req.header('Authorization')

	if (!token) {
		return res.status(403).json({message: 'Access denied'})
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		req.userId = decoded.userId // Lưu userId vào req để sử dụng trong các route
		const user = await Account.findById(req.userId)

		if (!user) {
			return res.status(404).json({message: 'User not found'})
		}
		next() // Tiến hành xử lý tiếp theo trong route controller
	} catch (error) {
		return res.status(401).json({message: 'Invalid or expired token'})
	}
}


module.exports = {verifyToken, verifyAdmin, authMiddleware}
