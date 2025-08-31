import { useHistory } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const GoogleOAuth = () => {
  const history = useHistory();

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const res = await axios.post(`${API_BASE_URL}/auth/google`, {
              idToken: credentialResponse.credential,
            });
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
