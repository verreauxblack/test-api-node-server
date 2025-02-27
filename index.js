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
const logRequestUrlMiddleWare = async (req, res, next) => {
  console.log("request for" + req.originalUrl)
  next();
}

app.use(logRequestUrlMiddleWare);
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

function downloadFile(req, res) {
  let filePath = "./files/sample.txt";
  switch (req.query.fileType) {
    case "jpg":
      filePath = "./files/onepiece_ace2.jpg";
      break;
    case "pdf":
      filePath = "./files/g-economicwild.pdf";
      if (req.query.size === "medium") {
        filePath = "./files/One-Piece-Volume-001.pdf";
      }
      break;
    case "yobi_pdf":
      filePath = "./files/WilfulDefaultForm_67aafa57c2a1b6477ef97b4d_s3.pdf";
      break;
    case "text:
      filePath = "./files/sample.txt";
      break;
    default:
      filePath = "./files/sample.txt";
      res.status(404);
      break;      
  }
  return res.download(filePath);
}

app.get("/downloadFile", authenticateToken, downloadFile);

app.get("/no_auth/downloadFile", downloadFile);

const port = process.env.PORT || 3000;

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
