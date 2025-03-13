import { Outlet } from "react-router";
import Logo from "@/assets/Logo_TC.jpg"
const AuthLayout = () => {
  return (
      <div className="flex min-h-screen items-center justify-center border-8 rounded-lg border-sky-800 z-30 overflow-hidden relative">
        <div className="w-full max-w-md bg-white p-8 z-10">
          {/* Hình tròn lớn ở góc dưới bên trái */}
          <div className="absolute bottom-[-10px] left-[-100px] w-72 h-72 bg-blue-500 opacity-30 rounded-full "></div>

          {/* Hình tròn nhỏ hơn bên trái */}
          <div className="absolute top-[300px] left-[-60px] w-40 h-40 bg-blue-500 opacity-30 rounded-full "></div>

          {/* Hình tròn lớn bên phải */}
          <div className="absolute top-[-50px] right-[-150px] w-96 h-96 bg-blue-500 opacity-30 rounded-full "></div>
          <div className="flex justify-center">
            <img src={Logo} alt="TripConnect Logo" className="h-16" />
          </div>
          <Outlet />
        </div>
      </div>
  )
}

export default AuthLayout