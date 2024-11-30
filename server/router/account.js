const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const {verifyToken, verifyAdmin} = require('../middleware/auth')

const AccountController = require('../controllers/AccountController');

//ĐĂNG KÝ TÀI KHOẢN
router.post('/register', AccountController.register)
//ĐĂNG NHẬP TÀI KHOẢN
router.post('/login', AccountController.login)
//PHÂN QUYỀN (chỉ Admin)
router.put('/manage-role', verifyToken, AccountController.manageRoles)
//TÌM KIẾM TÀI KHOẢN
router.get('/search', verifyToken, AccountController.searchAccounts)
//KẾT BẠN
router.post('/add-friend', verifyToken, AccountController.addFriend)
//XEM DANH SÁCH TÀI KHOẢN ROLE USER
router.get('/user', verifyToken, AccountController.getAllUsers)
//CHỈNH SỬA TÀI KHOẢN ROLE USER
router.put('/user/update', verifyToken, AccountController.updateUser)
// XEM DANH SÁCH BẠN BÈ
router.get('/friends', verifyToken, AccountController.getFriends);
//XÓA TÀI KHOẢN USER
router.delete('/user/:id', verifyToken, verifyAdmin, AccountController.deleteUser)
//XÓA BẠN
router.delete('/delete-friend/:id', verifyToken, AccountController.deleteFriend)

module.exports = router