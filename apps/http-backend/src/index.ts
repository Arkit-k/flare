import { prismaClient } from "@repo/db/client";
import express from 'express';
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from './middleware';
import {createUserSchema , SigninSchema , CreateRoomSchema } from "@repo/common/types"



const app = express();
app.use(express.json())

app.post("/register", async (req, res) => {
  
  const parsedata = createUserSchema.safeParse(req.body);
  if(!parsedata.success) {
    return res.status(400).json({
      message: "incorrect input"
    });
  }
  try {
    const user = await prismaClient.user.create({
      data: {
        email: parsedata.data.username,
        name: parsedata.data.name,
        password: await bcrypt.hash(parsedata.data.password, 10),
      }
    });
    res.json({
      userId: user.id
    })
  } catch (error) {
    return res.status(411).json({
      message: "user already exist"
    });
  }
})

app.post("/login", async (req, res) => {
  const data = SigninSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({
      message: "Invalid login credentials"
    });
  }
  try {
    const user = await prismaClient.user.findUnique({
      where: { email: data.data.username }
    });
    
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }
    
    const isPasswordValid = await bcrypt.compare(
      data.data.password,
      user.password
    );
    
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }
    
    const token = jwt.sign({
      userId: user.id,
    }, JWT_SECRET, { expiresIn: "1h" });
    
    res.json({
      token
    });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
  
});
app.post("/room", middleware, async (req, res) => {
 const parsedata = CreateRoomSchema.safeParse(req.body);
 if (!parsedata.success) {
  return res.status(400).json({
    message: "Invalid room data"
  });
 }
 
 // Ensure we have an authenticated user id before creating the room
 const userId = req.userId;
 if (!userId) {
  return res.status(401).json({
    message: "Unauthorized"
  });
 }

 try {
  const room = await prismaClient.room.create({
   data: {
       slug: parsedata.data.name,
       adminId: userId
   }
  });
  res.status(201).json({ roomId: room.id, slug: room.slug });
 } catch (error) {
  console.error("Room creation error:", error);
  res.status(500).json({ message: "Internal server error" });
 }
});

app.get("/chats/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);
  const messages =  prismaClient.chat.findMany({
    where:{
      roomId:roomId
    },
    orderBy: {
        id:"desc"
    },
    take:50
  });


  res.json({
    messages
  })

})

app.listen(3001, () => {
  console.log('Server is running on port 3000');
});



