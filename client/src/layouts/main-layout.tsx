import Header from "@/components/layout/header";
import { Outlet } from "react-router";

const MainLayout = () => {
  return (
    <div className="flex flex-col w-full">
      <Header />
      <main className="max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout;