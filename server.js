const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');

const app = express();
app.use(express.json()); // Để server đọc được dữ liệu JSON từ Postman

// ==========================================
// KẾT NỐI MONGODB TRÊN DOCKER
// ==========================================
mongoose.connect('mongodb://admin:password123@localhost:27017/kt_db?authSource=admin')
    .then(() => console.log('✅ Đã kết nối MongoDB trên Docker thành công!'))
    .catch(err => console.error('❌ Lỗi kết nối DB:', err));


// ==========================================
// YÊU CẦU 1: CRUD CƠ BẢN & XÓA MỀM
// ==========================================

// --- CRUD ROLE ---
app.post('/roles', async (req, res) => {
    try {
        const role = await Role.create(req.body);
        res.status(201).json(role);
    } catch (error) { res.status(400).json({ error: error.message }); }
});

app.get('/roles', async (req, res) => {
    try {
        // Chỉ lấy những bản ghi chưa bị xóa mềm
        const roles = await Role.find({ isDeleted: false });
        res.json(roles);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/roles/:id', async (req, res) => {
    try {
        const role = await Role.findOne({ _id: req.params.id, isDeleted: false });
        if (!role) return res.status(404).json({ message: 'Không tìm thấy Role' });
        res.json(role);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/roles/:id', async (req, res) => {
    try {
        const role = await Role.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, req.body, { new: true });
        res.json(role);
    } catch (error) { res.status(400).json({ error: error.message }); }
});

app.delete('/roles/:id', async (req, res) => {
    try {
        // Xóa mềm: Không xóa hẳn mà cập nhật isDeleted = true
        await Role.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.json({ message: 'Đã xóa mềm Role thành công' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});


// --- CRUD USER ---
app.post('/users', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) { res.status(400).json({ error: error.message }); }
});

// GET ALL USER (Có query theo username dạng includes)
app.get('/users', async (req, res) => {
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

app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, isDeleted: false }).populate('role');
        if (!user) return res.status(404).json({ message: 'Không tìm thấy User' });
        res.json(user);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/users/:id', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, req.body, { new: true });
        res.json(user);
    } catch (error) { res.status(400).json({ error: error.message }); }
});

app.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.json({ message: 'Đã xóa mềm User thành công' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});


// ==========================================
// YÊU CẦU 2 & 3: POST /users/enable VÀ /users/disable
// ==========================================
app.post('/users/enable', async (req, res) => {
    try {
        const { email, username } = req.body;
        // Tìm user khớp email, username và cập nhật status = true
        const user = await User.findOneAndUpdate(
            { email, username, isDeleted: false },
            { status: true },
            { new: true } // Trả về data mới sau khi update
        );
        if (!user) return res.status(404).json({ message: 'Sai email hoặc username' });
        res.json({ message: 'Đã kích hoạt (enable) user', user });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/users/disable', async (req, res) => {
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
app.get('/roles/:id/users', async (req, res) => {
    try {
        // Tìm tất cả user có trường 'role' khớp với :id trên param
        const users = await User.find({ role: req.params.id, isDeleted: false });
        res.json(users);
    } catch (error) { res.status(500).json({ error: error.message }); }
});


// --- KHỞI ĐỘNG SERVER ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});