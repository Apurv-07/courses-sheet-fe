import React, { useState } from "react";

export const LoginContext = React.createContext({
  user: null,
  setUser: () => {},
});

export const LoginProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleSetUser = (newUser) => {
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <LoginContext.Provider value={{ user, setUser: handleSetUser }}>
      {children}
    </LoginContext.Provider>
  );
};