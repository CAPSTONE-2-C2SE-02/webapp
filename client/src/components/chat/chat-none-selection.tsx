import discussionIcon from '@/assets/discussion.svg';

const ChatNoneSelection = () => {
  return (
    <div className="bg-white col-span-3 border border-border rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-2">
        <img src={discussionIcon} alt="discussionIcon" className="max-w-56" />
        <h5 className="text-xl font-semibold text-primary">It's nice to chat with someone</h5>
        <p className="max-w-48 text-sm text-center text-gray-500">Pick a person from left menu and start your conversation</p>
      </div>
    </div>
  )
}

export default ChatNoneSelection