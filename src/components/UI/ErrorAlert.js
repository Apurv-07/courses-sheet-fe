import React from "react";

const ErrorAlert = ({ message }) => (
  <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2">
    {message}
  </div>
);

export default ErrorAlert;
