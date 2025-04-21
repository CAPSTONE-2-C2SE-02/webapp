import ChatContainer from "@/components/chat/chat-container";
import ChatInformation from "@/components/chat/chat-information";
import ChatSidebar from "@/components/chat/chat-sidebar";
import { useState } from "react";

const ChatPage = () => {
  const [isShowInformation, setShowInformation] = useState(false);
  return (
    <>
      {/* chat user sidebar */}
      <ChatSidebar />
      {/* chat interface */}
      <ChatContainer showInformation={isShowInformation} onShowInformation={setShowInformation} />
      {/* chat information */}
      <ChatInformation isShow={isShowInformation} />
    </>
  );
};

export default ChatPage;
