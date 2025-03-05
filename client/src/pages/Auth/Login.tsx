import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import Logo from "@/assets/logo.png"
//import { UserRound } from "lucide-react"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
const signInchema = z.object({
    email: z.string().email("message"),
    password: z.string().min(8, "message"),
})

type LoginValue = z.infer<typeof signInchema>;
const LoginForm = () => {
    const form = useForm<LoginValue>({
        resolver: zodResolver(signInchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })
    function onSubmit(values: LoginValue) {
        console.log(values)
    }
    return (
        <div className="flex min-h-screen items-center justify-center border-8 rounded-lg border-sky-800 z-30">
            <div className="w-full max-w-md bg-white p-8 z-10">
                {/* Hình tròn lớn ở góc dưới bên trái */}
                <div className="absolute bottom-[-10px] left-[-100px] w-72 h-72 bg-blue-500 opacity-30 rounded-full "></div>

                {/* Hình tròn nhỏ hơn bên trái */}
                <div className="absolute top-[300px] left-[-60px] w-40 h-40 bg-blue-500 opacity-30 rounded-full "></div>

                {/* Hình tròn lớn bên phải */}
                <div className="absolute top-[-50px] right-[-150px] w-96 h-96 bg-blue-500 opacity-30 rounded-full "></div>
                <div className="flex justify-center">
                    <img src={Logo} alt="TripConnect Logo" className="h-16" />
                </div>

                <h2 className="text-2xl font-semibold text-center mt-10">Welcome Back</h2>
                <p className="text-center text-gray-500">Let’s explore this exciting platform together!</p>


                <button className="w-full mt-4 flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-md">
                    Using Google account
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
                                        <Input placeholder="******" type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className='w-full bg-blue-950 mt-4' >Login</Button>
                    </form>
                </Form>
                <p className="text-center mt-4">
                    Don't have an account? <a href="#" className="text-blue-600">Sign Up</a>
                </p>
            </div>
        </div>
    )
}

export default LoginForm