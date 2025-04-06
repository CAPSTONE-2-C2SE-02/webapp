import { useAppSelector } from "./redux";

export default function useAuthInfo() {
  return useAppSelector(state => state.auth.userInfo);
};