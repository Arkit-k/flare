import express from 'express';
import jwt from "jsonwebtoken"
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from './middleware';

const app = express();

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  
  // TODO: Implement user registration logic
  res.status(201).json({ message: "User registered successfully" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  
  // TODO: Implement actual user authentication logic
  const userId = "user123"; // This should come from database
  
  const token = jwt.sign({
    userId,
    username
  }, JWT_SECRET, { expiresIn: "1h" });

  res.json({
    token
  });
});

app.post("/room", middleware, (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  
  // TODO: Implement room creation logic
  res.status(201).json({
    message: "Room created successfully",
    roomId: `room_${Date.now()}`,
    createdBy: req.userId
  });
});

app.listen(3001);



