"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({
      messages,
      id
}: {
      messages: {message: string}[];
      id: string
}) {  
      const [chats , setChats] = useState(messages);
      const {socket , loading} = useSocket();
      const [currentMessage , setCurrentMessage] = useState<string>('')

      useEffect(() => {
            if (socket && !loading) {

                  socket.send(JSON.stringify({
                        type:"join_room",
                        roomId: id
                  }));
                  socket.onmessage = (event) => {
                        const parsedata  = JSON.parse(event.data);
                        if (parsedata.type === "chat") {

                            setChats(c => [...c , {message: parsedata.message}])
                        }
                    }
                }
      },  [socket, loading , id])

      return <div>
            {chats.map((m, i) => <div key={i}>{m.message}</div>)}
            <input type="text" value={currentMessage} onChange={e => {
                  setCurrentMessage(e.target.value);
            }}/>
            <button onClick={() => {
                  socket?.send(JSON.stringify({
                              type:"chat",
                              roomId:id,
                              message: currentMessage

                  }))
                  setCurrentMessage("");
            }}>Send message</button>
      </div>
}