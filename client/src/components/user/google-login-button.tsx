import publicApi from "@/config/public.api";
import { useAppDispatch } from "@/hooks/redux";
import { setCredentials } from "@/stores/slices/auth-slice";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLoginGoogle = async (credentialResponse: CredentialResponse) => {
    try {
      const response = await publicApi.post("/auth/login-google", { tokenGoogle: credentialResponse.credential })
      const data = response.data;
      if (data.success) {
        dispatch(setCredentials({ token: data?.result?.token }));
        toast.success(data.message || "Login Successfully");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleLoginGoogle}
        onError={() => console.log("Login Failed")}
      />
    </div>
  )
}

export default GoogleLoginButton