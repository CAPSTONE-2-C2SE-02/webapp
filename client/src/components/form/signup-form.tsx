import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CalendarIcon, UserPen, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { signUpschema, SignUpValue } from "@/lib/validations";
import { useRegisterTourGuideMutation, useRegisterTravelerMutation } from "@/services/root-api";
import { toast } from "sonner";
import { PasswordInput } from "../ui/password-input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { format, isAfter } from "date-fns";
import GoogleLoginButton from "../user/google-login-button";

const SignupForm = () => {
    const [role, setRole] = useState<"traveller" | "tourguide">("traveller");
    const [registerTraveler] = useRegisterTravelerMutation();
    const [registerTourGuide] = useRegisterTourGuideMutation();
    const navigate = useNavigate();

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

    async function onSubmit(values: SignUpValue) {
        try {
            let response;
            if (role === "traveller") {
                response = await registerTraveler(values).unwrap();
            } else if (role === "tourguide") {
                response = await registerTourGuide(values).unwrap();
            }
            if (!response?.success) {
                toast.error(response?.error);
                return;
            }
            toast.success(response?.message);
            navigate("/login?registered=true");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Register failed:", error);
            toast.error(error.data.error);
        }
    }

    return (
        <>
            <div className="text-center flex flex-col items-center mt-12 md:mt-16">
                <h3 className="text-xl md:text-2xl font-bold">Welcome to Heaven</h3>
                <span className="text-sm md:text-base mt-1">Let's explore this exciting platform together!</span>
            </div>

            <div className="mt-5">
                <GoogleLoginButton />
            </div>

            <div className="flex items-center my-4 justify-center">
                <div className="w-1/3 border-t border-gray-300"></div>
                <span className="mx-4 text-gray-500 text-xs">OR</span>
                <div className="w-1/3 border-t border-gray-300"></div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 grid-rows-4 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
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
                            <FormItem className="col-span-2 col-start-1">
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
                        name="role"
                        render={({ field }) => (
                            <FormItem className="col-span-2 row-span-2 col-start-3 row-start-1">
                                <FormLabel className="text-gray-600">Role</FormLabel>
                                <FormControl>
                                    <div className="flex gap-2">
                                        <div
                                            className={`flex-1 p-4 border-2 rounded flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${role === "tourguide" ? "border-[hsl(174,100%,33%)] text-[hsl(174,100%,33%)]" : "border-gray-300 text-gray-400"
                                                }`}
                                            onClick={() => {
                                                setRole("tourguide");
                                                field.onChange("tourguide");
                                            }}
                                        >
                                            <UserPen size={18} strokeWidth={3} />
                                            <span className="text-sm font-medium">Tour Guide</span>
                                        </div>
                                        <div
                                            className={`flex-1 p-4 border-2 rounded flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${role === "traveller" ? "border-[hsl(174,100%,33%)] text-[hsl(174,100%,33%)]" : "border-gray-300 text-gray-400"
                                                }`}
                                            onClick={() => {
                                                setRole("traveller");
                                                field.onChange("traveller");
                                            }}
                                        >
                                            <UserRound size={18} strokeWidth={3} />
                                            <span className="text-sm font-medium">Traveller</span>
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
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
                        name="password"
                        render={({ field }) => (
                            <FormItem className="col-span-2 col-start-3 row-start-3">
                                <FormLabel className="text-gray-600">Password</FormLabel>
                                <FormControl>
                                    <PasswordInput placeholder="Enter password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                            <FormItem className="col-span-2 row-start-4">
                                <FormLabel className="text-gray-600">Birthday</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !field.value && "text-muted-foreground",
                                        )}
                                        >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? format(field.value, "PPP") : "Pick a date"}
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            captionLayout="dropdown-buttons"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => isAfter(date, new Date())}
                                            initialFocus
                                            fromYear={1900}
                                            toYear={2050}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem className="col-span-2 col-start-3 row-start-4">
                                <FormLabel className="text-gray-600">Confirm Password</FormLabel>
                                <FormControl>
                                    <PasswordInput placeholder="Confirm password" {...field} />
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
                <p className="text-center mt-4 text-gray-500 text-sm">
                    Already have an account? <Link to="/login" className="text-[hsl(174,100%,33%)] font-medium">Login</Link>
                </p>
            </Form>
        </>
    )
}

export default SignupForm