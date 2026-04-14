const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// CORS configuration - sabse pehle
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// OPTIONS requests ko handle karo
app.options('*', cors());

// Body parser
app.use(express.json());

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '.')));

// Temporary storage
let users = [];

// Signup endpoint
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;

    console.log('📝 Signup request received:', { name, email });

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);

    console.log('✅ User created:', newUser);
    console.log('👥 Total users:', users.length);

    res.status(201).json({
        message: 'User created successfully',
        user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email);

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        console.log('❌ Invalid credentials');
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Login successful:', user.email);

    res.json({
        user: { id: user.id, name: user.name, email: user.email },
        token: 'dummy-token-' + user.id
    });
});

// Debug endpoint
app.get('/api/users', (req, res) => {
    res.json({
        count: users.length,
        users: users.map(u => ({ id: u.id, name: u.name, email: u.email }))
    });
});

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve login.html for login route
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});