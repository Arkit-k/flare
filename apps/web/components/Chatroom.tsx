import axios from "axios"
import { BACKEND_URL } from "../app/room/[slug]/config"
import { ChatRoomClient } from "./chatroomClient"


async function getChats(roomId: string): Promise<{ message: string }[]> {
      const response = await axios.get<{ message: string }[]>(`${BACKEND_URL}/chats/${roomId}`);
      return response.data;
}
export async function ChatRoom({id}: {
      id:string
}) {
      const messages = await getChats(id);
      return <ChatRoomClient id={id} messages={messages} />

}
  