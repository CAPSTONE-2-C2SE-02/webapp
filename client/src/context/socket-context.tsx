import { useAppSelector } from "@/hooks/redux";
import { socketService } from "@/services/socket-service";
import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { token, userInfo } = useAppSelector(state => state.auth);
  
  useEffect(() => {
    if (userInfo && token) {
      const newSocket = socketService.connect(token || undefined);
      newSocket.emit("addNewUser", userInfo?._id);

      setSocket(newSocket);
    }
    return () => {
      socket?.disconnect();
    }
  }, [userInfo, token, socket])
  
  return (
    <SocketContext value={socket}>
      {children}
    </SocketContext>
  );
}