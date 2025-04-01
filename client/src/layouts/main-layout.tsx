import Header from "@/components/layout/header";
import { useAppSelector } from "@/hooks/redux";
import { useGetUserAuthQuery } from "@/services/root-api";
import { setAuthUser } from "@/stores/slices/auth-slice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router";

const MainLayout = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const { data, isSuccess } = useGetUserAuthQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (isSuccess && data.result) {
      dispatch(setAuthUser(data.result))
    }
  }, [data, isSuccess, dispatch]);

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