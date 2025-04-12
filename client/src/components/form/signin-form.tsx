import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useLoginMutation } from "@/services/root-api";
import { useAppDispatch } from "@/hooks/redux";
import { setCredentials } from "@/stores/slices/auth-slice";
import { useEffect } from "react";
import { loginSchema, LoginValues } from "@/lib/validations";
import { toast } from "sonner";
import { ErrorResponse } from "@/lib/types";
import { PasswordInput } from "../ui/password-input";
import GoogleLoginButton from "../user/google-login-button";

const SigninForm = () => {
  const [login, { isLoading, isError, isSuccess, error, data }] = useLoginMutation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // check if user is logged in >> redirect to home page
  useEffect(() => {
    const registered = searchParams.get("registered");
    if (registered) {
      toast.success("Account created successfully", {
        description: "You can now login to your account.",
      });
      setSearchParams({});
    }
  }, [searchParams]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values).unwrap();
    } catch (error) {
      console.error("Login error:", error);
      toast.error((error as ErrorResponse).data?.error || "Error when logging in.");
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error((error as ErrorResponse).data?.error || "Error when creating account.");
    }
    if (isSuccess) {
      if (data.success && data.result?.token) {
        dispatch(setCredentials({ token: data?.result?.token }));
        toast.success(data?.message);
        navigate("/");
      }
    }
  }, [isError, error, isSuccess, data, dispatch, navigate]);

  return (
    <>
      <h2 className="text-2xl font-semibold text-center mt-10">Welcome Back</h2>
      <p className="text-center text-gray-500 mb-5">
        Let&apos;s explore this exciting platform together!
      </p>

      <GoogleLoginButton />

      <div className="flex items-center my-4">
        <hr className="flex-grow border-gray-300" />
        <span className="px-3 text-gray-400 text-xs">OR</span>
        <hr className="flex-grow border-gray-300" />
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-600">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="tripconnect@gmail.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel className="text-gray-600">Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full mt-4"
            disabled={isLoading}
          >
            Login
          </Button>
        </form>
      </Form>
      <p className="text-center mt-4 text-sm text-gray-500">
        Don't have an account?{" "}
        <Link to="/register" className="text-[hsl(174,100%,33%)] font-medium">
          Sign Up
        </Link>
      </p>
    </>
  );
};

export default SigninForm;
