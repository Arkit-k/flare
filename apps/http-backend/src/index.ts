import { prismaClient } from '@repo/db';
import express from 'express';
import jwt from "jsonwebtoken"
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from './middleware';
import {createUserSchema , SigninSchema , CreateRoomSchema } from "@repo/common/types"



const app = express();

app.post("/register", (req, res) => {
  
  const data =  createUserSchema.safeParse(req.body);
  if(!data.success) {
    return res.json({
      message:"incorrect input"
    })
  }
  res.json({
    userId: "123"
  })
})

app.post("/login", (req, res) => {
  const data = SigninSchema.safeParse(req.body);
  if (!data.success) {
    return res.json ({
    })
  }
  // TODO: Implement actual user authentication logic
  const userId = "user123"; // This should come from database
  
  const token = jwt.sign({
    userId,
  }, JWT_SECRET, { expiresIn: "1h" });

  res.json({
    token
  });
});

app.post("/room", middleware, (req, res) => {
 const data = CreateRoomSchema.safeParse(req.body);
 if (!data.success) {
  return res.json ({
    
  })
 }
  
  // TODO: Implement room creation logic
  res.status(201).json({
    message: "Room created successfully",
    roomId: `room_${Date.now()}`,
    createdBy: req.userId
  });
});

app.listen(3000);



