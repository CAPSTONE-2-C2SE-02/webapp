import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "react-router";

export default function RootLayout() {
  return <>
    <Toaster position="top-right" />
    <Outlet />
  </>
}
