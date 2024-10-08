const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');


const JWT_SECRET = 'mysecretkey123'; // Use environment variables in production
const validUsername = 'admin';
const validPassword = 'password123';

const app = express();
app.use(bodyParser.json()); // Middleware to parse JSON bodies

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: user.expiresIn || '5m' });
};

// REST API route for login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    const expiresIn = req.query.expiresIn;
  
    if (username === validUsername && password === validPassword) {
      const token = generateToken({ username, expiresIn });
      return res.json({ token });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  });
  

// Middleware to check JWT token before the request reaches Apollo Server
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    if (authHeader) {
      const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
      } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
    } else {
      return res.status(401).json({ message: 'Authorization header missing' });
    }
  };
  
app.get("/downloadFile", authenticateToken, (req, res) => {
    if (req.query.fileType === "jpg" ) return res.download("./onepiece_ace2.jpg");
    return res.download("./sample.txt");
});

const port = process.env.PORT || 3000;

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
