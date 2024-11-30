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
	// Lấy token từ header
	const authHeader = req.header('Authorization')
	const token = authHeader && authHeader.split(' ')[1]

	// Nếu không có token
	if (!token) {
		return res
			.status(401)
			.json({message: 'Access Denied. No Token Provided.'})
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		req.user = decoded // Gắn user vào req
		next()
	} catch (err) {
		return res.status(403).json({message: 'Invalid token'})
	}
}

module.exports = {verifyToken, verifyAdmin, authMiddleware}
