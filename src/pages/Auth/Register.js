import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { register } from "../../api/apiClient";

const Register = () => {
  const [error, setError] = useState("");
  const mutation = useMutation(register, {
    onError: (err) =>
      setError(err.response?.data?.message || "Registration failed"),
  });

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          mutation.mutate({
            username: e.target.username.value,
            email: e.target.email.value,
            password: e.target.password.value,
          });
        }}
        className="flex flex-col gap-3"
      >
        <input
          name="username"
          className="border px-2 py-1 rounded"
          placeholder="Username"
          required
        />
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
          {mutation.isLoading ? "Registering..." : "Register"}
        </button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {mutation.isSuccess && (
          <div className="text-green-600 text-sm">
            Registration successful! You can now log in.
          </div>
        )}
      </form>
    </div>
  );
};

export default Register;
