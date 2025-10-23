import { JWT_SECRET } from '@repo/backend-common/config'
import { IncomingMessage } from "http";
import { WebSocketServer } from "ws";
import WebSocket from 'ws';
import jwt, { JwtPayload } from 'jsonwebtoken'
import { prismaClient } from '@repo/db/client'

const wss = new WebSocketServer({ port: 8080});

console.log('WebSocket server starting on port 8080...');

interface User {
      ws:WebSocket,
      rooms: string[],
      userId: string
}
const users:User[] =[] ;


function checkUser(token: string | null): JwtPayload | null {
      if (!token) {
            return null;
      }

      try {
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload | string;

            if (typeof decoded == 'string') {
                  return null;
            }
            if (!decoded || !decoded.userId){
                  return null;
            }

            return decoded;
      } catch (e) {
            return null;
      }
}

wss.on('connection' , function connection(ws , request: IncomingMessage) {
      console.log('New WebSocket connection attempt');
      const url = request.url;
      if(!url) {
            console.log('No URL provided in connection request');
            return;
      }

      const queryParams = new URLSearchParams(url.split('?')[1]);
      const token = queryParams.get('token') || "";
      console.log('Connection attempt with token:', token ? 'present' : 'missing');

      const userPayload = checkUser(token);

      if (userPayload === null) {
            console.log('Authentication failed for connection');
            ws.close()
            return null;
      }

      const userId = userPayload.userId;
      console.log('User connected successfully:', userId);
      users.push({
       userId: userId,
       rooms:[],
       ws
      })



      ws.on('message' , async function message(data){
            console.log('Received message:', data.toString());
            try {
                  const parsedata = JSON.parse(data as unknown as string)
                  console.log('Parsed message type:', parsedata.type);
           
                  if (parsedata.type === 'join_room') {
                        const user = users.find(x => x.ws === ws);
                        if (user) {
                              user.rooms.push(parsedata.roomId.toString());
                              console.log('User joined room:', parsedata.roomId);
                        }
                  }

                  if (parsedata.type === "leave_room") {
                        const user = users.find(x => x.ws === ws);
                        if (!user) {
                              console.log('User not found for leave_room');
                              return;
                        }
                        user.rooms = user?.rooms.filter(x => x === parsedata.room.toString());
                        console.log('User left room:', parsedata.room);
                  }

                  if (parsedata.type === "chat") {
                        const roomId = parseInt(parsedata.roomId);
                        const message = parsedata.message;

                        const user = users.find(x => x.ws === ws);
                        if (!user) {
                              console.log('User not found for chat message');
                              return;
                        }
                        
                        if (isNaN(roomId)) {
                              console.log('Invalid roomId provided:', parsedata.roomId);
                              return;
                        }
                        
                        console.log('Creating chat message in room:', roomId, 'by user:', user.userId);
                        await prismaClient.chat.create({
                              data: {
                                    roomId: roomId,
                                    message,
                                    userId: user.userId
                              }
                        });

                        let broadcastCount = 0;
                        users.forEach(user => {
                              if(user.rooms.includes(roomId.toString())) {
                                    user.ws.send(JSON.stringify({
                                          type:"chat",
                                          message:message,
                                          roomId: roomId.toString()
                                    }))
                                    broadcastCount++;
                              }
                        });
                        console.log('Broadcasted message to', broadcastCount, 'users in room:', roomId);
                  }
            } catch (error) {
                  console.error('Error processing message:', error);
            }
      });
});

