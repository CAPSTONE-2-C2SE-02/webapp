import ChatContainer from "@/components/chat/chat-container";
import ChatInformation from "@/components/chat/chat-information";
import { fetchUserById } from "@/services/users/user-api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router";

const ChatPage = () => {
  const [isShowInformation, setShowInformation] = useState(false);

  const { userId } = useParams() as { userId: string };
  const { data: selectedUser } = useQuery({
    queryKey: ["userSelected", userId],
    queryFn: () => fetchUserById(userId),
  });

  return (
    <>
      {/* chat interface */}
      <ChatContainer
        user={selectedUser}
        showInformation={isShowInformation}
        onShowInformation={setShowInformation}
      />
      {/* chat information */}
      <ChatInformation isShow={isShowInformation} />
    </>
  );
};

export default ChatPage;
