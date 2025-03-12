import { Outlet } from "react-router";

const MainLayout = () => {
  return (
    <div>
      <header>Header Content</header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout;