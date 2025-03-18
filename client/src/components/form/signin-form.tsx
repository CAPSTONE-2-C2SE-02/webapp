import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import LogoGG from "@/assets/google_icon.svg";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Link, useNavigate } from "react-router";
import { useLoginMutation } from "@/services/root-api";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setCredentials } from "@/stores/slices/auth-slice";
import { useEffect } from "react";
import { loginSchema, LoginValues } from "@/lib/validation";

const SigninForm = () => {
  const [login, { isLoading }] = useLoginMutation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // check if user is logged in >> redirect to home page
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const result = await login(values).unwrap();

      if (result.success && result.token) {
        dispatch(setCredentials({ userInfo: null, token: result.token }));
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-semibold text-center mt-10">Welcome Back</h2>
      <p className="text-center text-gray-500">
        Let&apos;s explore this exciting platform together!
      </p>

      <button className="w-full mt-4 flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-md">
        <img src={LogoGG} alt="gg Logo" className="h-5" /> Using Google account
      </button>

      <div className="flex items-center my-4">
        <hr className="flex-grow border-gray-300" />
        <span className="px-3 text-gray-400">OR</span>
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
                  <Input placeholder="********" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-blue-950 mt-4"
            disabled={isLoading}
          >
            Login
          </Button>
        </form>
      </Form>
      <p className="text-center mt-4">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-600">
          Sign Up
        </Link>
      </p>
    </>
  );
};

export default SigninForm;
