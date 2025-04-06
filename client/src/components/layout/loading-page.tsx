import logo from "@/assets/tripconnect.svg";

const LoadingPage = () => {
  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-white">
      <div className="absolute animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-emerald-400"></div>
      <img src={logo} alt="logo" className="rounded-full h-12 w-12" />
    </div>
  )
}

export default LoadingPage