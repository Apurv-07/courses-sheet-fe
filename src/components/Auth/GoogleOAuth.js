import React from "react";
// import { GoogleLogin } from "react-google-login";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

const GoogleOAuth = () => {
  const history = useHistory();

  //   const responseGoogle = async (response) => {
  //     console.log(response);
  //     const { tokenId } = response;
  //     try {
  //       const res = await axios.post("/api/auth/google", { idToken: tokenId });
  //       localStorage.setItem("token", res.data.token);
  //       history.push("/dashboard");
  //     } catch (error) {
  //       console.error("Google login error:", error);
  //     }
  //   };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const res = await axios.post(
              "http://localhost:5000/api/auth/google",
              {
                idToken: credentialResponse.credential,
              }
            );
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            history.push("/dashboard");
          } catch (err) {
            console.error(
              "Google login error:",
              err.response?.data || err.message
            );
          }
        }}
        onError={() => {
          console.log("Login Failed");
        }}
      />
    </div>
  );
};

export default GoogleOAuth;
