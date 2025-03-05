import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import logo from "../../assets/logo.png";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserPen, UserRound } from "lucide-react";

const signUpschema = z.object({
    email: z.string().email("Invalid email address"),
    fullName: z.string().min(3, "Full Name must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    role: z.enum(["traveller", "tourguide"]),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type SignUpValue = z.infer<typeof signUpschema>;

const SignUp = () => {
    const [role, setRole] = useState("traveller");

    const form = useForm<SignUpValue>({
        resolver: zodResolver(signUpschema),
        defaultValues: {
            email: "",
            fullName: "",
            password: "",
            confirmPassword: "",
            phoneNumber: "",
            role: "traveller",
        },
    });

    function onSubmit(values: SignUpValue) {
        console.log(values);
    }

    return (
        <div className="flex items-center justify-center overflow-hidden relative h-screen">
            <div className="container w-[600px] max-w-lg mx-auto overflow-auto max-h-screen h-full px-4 md:px-0 scrollbar-hide">
                <div className="flex mt-12 md:mt-16 items-center justify-center">
                    <img src={logo} alt="TripConnect Logo" className="w-10 h-10 md:w-12 md:h-12 mr-2" />
                    <h2 className="text-2xl md:text-3xl font-bold mt-1">TRIPCONNECT</h2>
                </div>

                <div className="text-center flex flex-col items-center mt-12 md:mt-16">
                    <h3 className="text-xl md:text-2xl font-bold">Welcome to Heaven</h3>
                    <span className="text-sm md:text-base mt-1">Let's explore this exciting platform together!</span>
                </div>

                <div className="mt-5">
                    <Button className="flex items-center justify-center w-full border border-gray-200 bg-white text-black hover:bg-sky-700 hover:text-white">
                        <span className="text-sm font-medium">Using Google account</span>
                    </Button>
                </div>

                <div className="flex items-center my-4 justify-center">
                    <div className="w-1/3 border-t border-gray-300"></div>
                    <span className="mx-4 text-gray-500 text-sm">OR</span>
                    <div className="w-1/3 border-t border-gray-300"></div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="tripconnect@gmail.com" type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter password" type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Confirm password" type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+84 123 456 789" type="tel" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Role</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2">
                                            <div
                                                className={`flex-1 p-4 border rounded flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${role === "tourguide" ? "border-sky-400 text-sky-400" : "border-gray-300"
                                                    }`}
                                                onClick={() => {
                                                    setRole("tourguide");
                                                    field.onChange("tourguide");
                                                }}
                                            >
                                                <UserPen size={18} />
                                                <span className="text-sm">Tour Guide</span>
                                            </div>
                                            <div
                                                className={`flex-1 p-4 border rounded flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${role === "traveller" ? "border-sky-400 text-sky-400" : "border-gray-300"
                                                    }`}
                                                onClick={() => {
                                                    setRole("traveller");
                                                    field.onChange("traveller");
                                                }}
                                            >
                                                <UserRound size={18} />
                                                <span className="text-sm">Traveller</span>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>

                    <Button
                        type="submit"
                        className="w-full bg-sky-900 hover:bg-sky-700 text-white py-2 px-4 rounded mt-6 transition-colors"
                        onClick={form.handleSubmit(onSubmit)}
                    >
                        Create New Account
                    </Button>
                </Form>

                <p className="text-center mt-4 mb-6 text-sm">
                    Already have an account? <a href="#" className="text-blue-600 hover:underline">Sign In</a>
                </p>
            </div>

            {/* Decorative Circles */}
            <div className="fixed bottom-0 left-0 w-48 h-48 md:w-72 md:h-72 bg-blue-500 opacity-30 rounded-full -translate-x-1/2 translate-y-1/4"></div>
            <div className="fixed top-1/2 left-0 w-24 h-24 md:w-40 md:h-40 bg-blue-500 opacity-30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="fixed top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-500 opacity-30 rounded-full translate-x-1/3 -translate-y-1/4"></div>
        </div>
    );
};

export default SignUp;