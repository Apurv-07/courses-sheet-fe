import React from "react";

const UserInfo = ({ user }) => (
  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded">
    <span className="font-semibold">{user?.username || user?.name}</span>
    <span className="text-xs text-gray-500">({user?.email})</span>
    <span className="text-xs text-blue-500">{user?.role}</span>
  </div>
);

export default UserInfo;
