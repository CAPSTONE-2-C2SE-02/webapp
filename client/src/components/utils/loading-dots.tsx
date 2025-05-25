const LoadingDots = () => {
    return (
        <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
        </div>
    )
}

export default LoadingDots;