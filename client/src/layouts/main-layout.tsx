import Header from "@/components/layout/header";
import { Outlet } from "react-router";

const MainLayout = () => {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout;