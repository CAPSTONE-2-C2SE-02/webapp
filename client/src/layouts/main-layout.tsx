import Chatbot from "@/components/chat/chatbot";
import Header from "@/components/layout/header";
import ScrollUpButton from "@/components/layout/scroll-up-button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
        <ScrollUpButton />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Chatbot />
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-sky-700 text-white">
              <p className="text-sm">Chat with our assistant</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </main>
    </div>
  )
}

export default MainLayout;