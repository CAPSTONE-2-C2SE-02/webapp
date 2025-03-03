import React from "react";
import AuthForm from "../../components/ui/Auth/AuthForm";
const Login = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <AuthForm type="login" />
        </div>
    );
};

export default Login;