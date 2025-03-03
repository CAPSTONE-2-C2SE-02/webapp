import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthFormProps {
    type: "login" | "signup";
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(type === "login" ? "Logging in..." : "Signing up...");
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
            <h2 className="text-2xl font-semibold text-center">
                {type === "login" ? "Login" : "Sign Up"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" className="w-full">
                    {type === "login" ? "Login" : "Sign Up"}
                </Button>
            </form>
        </div>
    );
};

export default AuthForm;
