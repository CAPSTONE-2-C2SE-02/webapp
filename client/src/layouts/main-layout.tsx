import Chatbot from "@/components/chat/chatbot";
import Header from "@/components/layout/header";
import { useAppSelector } from "@/hooks/redux";
import { useGetUserAuthQuery } from "@/services/root-api";
import { setAuthUser } from "@/stores/slices/auth-slice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router";

const MainLayout = () => {
  const { isAuthenticated, userInfo } = useAppSelector(state => state.auth);
  const dispatch = useDispatch();
  const { data, isSuccess } = useGetUserAuthQuery(undefined, {
    skip: !isAuthenticated || !!userInfo,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (isSuccess && data.result) {
      dispatch(setAuthUser(data.result))
    }
  }, [data, isSuccess, dispatch]);

  return (
    <div className="flex flex-col w-full">
      <Header />
      <main className="max-w-7xl w-full mx-auto px-2 lg:px-0">
        <Outlet />
        <Chatbot />
      </main>
    </div>
  )
}

export default MainLayout;