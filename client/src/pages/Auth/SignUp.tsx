import { useState } from "react";
import { Button } from "@/components/ui/button";
import logo from "../../assets/logo.png";
import { UserPen } from 'lucide-react';
import { UserRound } from 'lucide-react';

const SignUp = () => {
    const [role, setRole] = useState("traveller");

    return (

        <div className="d-flex align-items-center justify-content-center min-h-screen overflow-hidden position-relative h-[100vh]">
            <div className="container w-[600px] mx-auto overflow-auto max-h-screen h-full">
                <div className="logoTitle flex mt-5 items-center justify-center ">
                    <img src={logo} />
                    <h2 className="logoText" >TRIPCONNECT</h2>
                </div>

                <div className="welcomeText text-center flex-col items-center flex ">
                    <h3>Welcome to Heaven</h3>
                    <span>Let's explore this exciting platform together !</span>
                </div>

                <div className="googleAccount">
                    <Button className=" mt-5 flex items-center justify-center w-full">
                        <span>Using Google account</span>
                    </Button>
                </div>

                <div className="flex items-center my-4 justify-center">
                    <div className=" w-60 border-t border-gray-300"></div>
                    <span className="mx-4 text-gray-500">OR</span>
                    <div className="w-60 border-t border-gray-300"></div>
                </div>
                <div className="formGrid">

                    <div className="formGroup">
                        <label>Email</label>
                        <input type="email" placeholder="Enter your email" />
                    </div>

                    <div className="formGroup">
                        <label>Role</label>
                        <div className="roleSelection">
                            <div
                                className={`roleButton ${role === "tourguide" ? "active" : ""}`}
                                onClick={() => setRole("tourguide")}
                            >
                                <UserPen />
                                Tour Guide
                            </div>
                            <div
                                className={`roleButton ${role === "traveller" ? "active" : ""}`}
                                onClick={() => setRole("traveller")}
                            >
                                <UserRound />
                                Traveller
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-gray-700">Full Name</label>
                        <input type="text" className="border p-2 rounded" placeholder="Enter your full name" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-gray-700">Password</label>
                        <input type="password" className="border p-2 rounded" placeholder="Enter password" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-gray-700">Phone Number</label>
                        <input type="text" className="border p-2 rounded" placeholder="+84 123 456 789" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-gray-700">Confirm Password</label>
                        <input type="password" className="border p-2 rounded" placeholder="Confirm password" />
                    </div>
                </div>
                <button onClick={
                    () => {
                        console.log("Sign Up");
                    }
                } className="signupButton mt-5">Create New Account</button>
                {/* Sign In Link */}
                <p className="signinText mb-5">
                    Already have an account? <a href="#">Sign In</a>
                </p>

            </div>


            {/* Hình tròn lớn ở góc dưới bên trái */}
            <div className="absolute bottom-[-10px] left-[-100px] w-72 h-72 bg-blue-500 opacity-30 rounded-full "></div>

            {/* Hình tròn nhỏ hơn bên trái */}
            <div className="absolute top-[300px] left-[-60px] w-40 h-40 bg-blue-500 opacity-30 rounded-full "></div>

            {/* Hình tròn lớn bên phải */}
            <div className="absolute top-[-50px] right-[-150px] w-96 h-96 bg-blue-500 opacity-30 rounded-full "></div>

        </div>



    );
};

export default SignUp;
