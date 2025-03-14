import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "../ui/button"
import LogoGG from "@/assets/google_icon.svg"
//import { UserRound } from "lucide-react"
import {
  Form,
  FormControl,

  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import { Link } from 'react-router'
const signInSchema = z.object({
  email: z.string().email("message"),
  password: z.string().min(8, "message"),
})

type LoginValue = z.infer<typeof signInSchema>;
const SigninForm = () => {
  const form = useForm<LoginValue>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })
  function onSubmit(values: LoginValue) {
    console.log(values)
  }
  return (
    <>
      <h2 className="text-2xl font-semibold text-center mt-10">Welcome Back</h2>
      <p className="text-center text-gray-500">Let’s explore this exciting platform together!</p>


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
                <FormLabel className='text-gray-600'>Email</FormLabel>
                <FormControl>
                  <Input placeholder="tripconnect@gmail.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className='mt-4'>
                <FormLabel className='text-gray-600'>Password</FormLabel>
                <FormControl>
                  <Input placeholder="********" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className='w-full bg-blue-950 mt-4' >Login</Button>
        </form>
      </Form>
      <p className="text-center mt-4">
        Don't have an account? <Link to="/register" className="text-blue-600">Sign Up</Link>
      </p>
    </>
  )
}

export default SigninForm