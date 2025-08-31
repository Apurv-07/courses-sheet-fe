import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../api/apiClient";
import { Link, useHistory } from "react-router-dom";
import GoogleOAuth from "../../components/Auth/GoogleOAuth";

const Login = () => {
  const [error, setError] = useState("");
  const history = useHistory();
  const mutation = useMutation(login, {
    onSuccess: (data) => {
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      history.push("/dashboard");
    },
    onError: (err) => setError(err.response?.data?.message || "Login failed"),
  });

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          mutation.mutate({
            email: e.target.email.value,
            password: e.target.password.value,
          });
        }}
        className="flex flex-col gap-3"
      >
        <input
          name="email"
          type="email"
          className="border px-2 py-1 rounded"
          placeholder="Email"
          required
        />
        <input
          name="password"
          type="password"
          className="border px-2 py-1 rounded"
          placeholder="Password"
          required
        />
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? "Logging in..." : "Login"}
        </button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </form>
      <div className="my-4 flex items-center">
        <div className="flex-grow h-px bg-gray-300" />
        <span className="mx-2 text-gray-500">or</span>
        <div className="flex-grow h-px bg-gray-300" />
      </div>
      <GoogleOAuth />
      <div className="mt-4 text-sm text-center">
        Don't have an account?{" "}
        <Link to="/auth/register" className="text-blue-600 underline">
          Register
        </Link>
      </div>
    </div>
  );
};

export default Login;
