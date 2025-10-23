import { JWT_SECRET } from '@repo/backend-common/config'
import { IncomingMessage } from "http";
import { WebSocketServer } from "ws";
import WebSocket from 'ws';
import jwt, { JwtPayload } from 'jsonwebtoken'

const wss = new WebSocketServer({ port: 8080});

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
      const url = request.url;
      if(!url) {
            return;
      }

      const queryParams = new URLSearchParams(url.split('?')[1]);
      const token = queryParams.get('token') || "";
      const userPayload = checkUser(token);

      if (userPayload === null) {
            ws.close()
            return null;
      }

      users.push({
       userId: userPayload.userId,
       rooms:[],
       ws
      })



      ws.on('message' , function message(data){
            const parsedata = JSON.parse(data as unknown as string)
           
            if (parsedata.type === 'join_room') {
                  const user = users.find(x => x.ws === ws);
                  user?.rooms.push(parsedata.roomId)
            }

            if (parsedata.type === "leave_room") {
                  const user = users.find(x => x.ws === ws);
                  if (!user) {
                        return;
                  }
                  user.rooms = user?.rooms.filter(x => x === parsedata.room)
            }

            if (parsedata.type === "chat") {
                  const roomId = parsedata.roomId;
                  const message = parsedata.message;

                  users.forEach(user => {
                        if(user.rooms.includes(roomId)) {
                              user.ws.send(JSON.stringify({
                                    type:"chat",
                                    message:message,
                                    roomId
                              }))
                        }
                  })
            }
      });
});

