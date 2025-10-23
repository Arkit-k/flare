import axios from "axios";
import { ChatRoom } from "../../../components/Chatroom";
import { BACKEND_URL } from "./config"


async function getRoom(slug: string) {
     const response = await axios.get(`${BACKEND_URL}/room/${slug}`)
     return response.data.room.id

}

export default async function ChatRoom1({
      params
}: {
      params: {
             slug: string
      }
}) {
      const slug = (await params).slug;
      const roomId = await getRoom(slug);
      

      return <ChatRoom id={roomId}></ChatRoom>
}