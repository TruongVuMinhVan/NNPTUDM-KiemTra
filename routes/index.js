var express = require('express');
var router = express.Router();

// Nhúng Model vào
const User = require('../models/User');
const Role = require('../models/Roles');

/* GET home page */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// ==========================================
// YÊU CẦU 1: CRUD CƠ BẢN & XÓA MỀM
// ==========================================

// --- CRUD ROLE ---
router.post('/roles', async (req, res) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json(role);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.get('/roles', async (req, res) => {
  try {
    const roles = await Role.find({ isDeleted: false });
    res.json(roles);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/roles/:id', async (req, res) => {
  try {
    const role = await Role.findOne({ _id: req.params.id, isDeleted: false });
    if (!role) return res.status(404).json({ message: 'Không tìm thấy Role' });
    res.json(role);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/roles/:id', async (req, res) => {
  try {
    const role = await Role.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, req.body, { new: true });
    if (!role) return res.status(404).json({ message: 'Không tìm thấy Role' });
    res.json(role);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.delete('/roles/:id', async (req, res) => {
  try {
    await Role.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ message: 'Đã xóa mềm Role thành công' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});


// --- CRUD USER ---
router.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// GET ALL USER (Có query theo username dạng includes)
router.get('/users', async (req, res) => {
  try {
    const { username } = req.query;
    let query = { isDeleted: false };

    // Nếu URL có ?username=abc thì query bằng regex (tương đương LIKE '%abc%')
    if (username) {
      query.username = { $regex: username, $options: 'i' };
    }

    const users = await User.find(query).populate('role');
    res.json(users);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isDeleted: false }).populate('role');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy User' });
    res.json(user);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy User' });
    res.json(user);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ message: 'Đã xóa mềm User thành công' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});


// ==========================================
// YÊU CẦU 2 & 3: POST /users/enable VÀ /users/disable
// ==========================================
router.post('/users/enable', async (req, res) => {
  try {
    const { email, username } = req.body;
    const user = await User.findOneAndUpdate(
      { email, username, isDeleted: false },
      { status: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'Sai email hoặc username' });
    res.json({ message: 'Đã kích hoạt (enable) user', user });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/users/disable', async (req, res) => {
  try {
    const { email, username } = req.body;
    const user = await User.findOneAndUpdate(
      { email, username, isDeleted: false },
      { status: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'Sai email hoặc username' });
    res.json({ message: 'Đã vô hiệu hóa (disable) user', user });
  } catch (error) { res.status(500).json({ error: error.message }); }
});


// ==========================================
// YÊU CẦU 4: GET /roles/:id/users
// ==========================================
router.get('/roles/:id/users', async (req, res) => {
  try {
    const users = await User.find({ role: req.params.id, isDeleted: false }).populate('role');
    res.json(users);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;