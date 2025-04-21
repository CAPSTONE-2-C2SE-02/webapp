import { Outlet } from "react-router";

const ChatLayout = () => {
  return (
    <div className="mt-2 grid grid-cols-4 gap-2 w-full h-[calc(100vh-90px)]">
      <Outlet />
    </div>
  )
}

export default ChatLayout