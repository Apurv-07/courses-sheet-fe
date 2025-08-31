import React from "react";
import { useHistory } from "react-router-dom";
import { googleLogin } from "../api/apiClient";
import GoogleLoginButton from "../components/Auth/GoogleLoginButton";

const Login = () => {
  const history = useHistory();

  const handleGoogleSuccess = async (response) => {
    try {
      const { tokenId } = response;
      const res = await googleLogin(tokenId);
      localStorage.setItem("token", res.data.token);
      history.push("/dashboard");
    } catch (err) {
      alert("Google login failed");
    }
  };

  const handleGoogleFailure = () => {
    alert("Google login failed");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onFailure={handleGoogleFailure}
        />
      </div>
    </div>
  );
};

export default Login;
