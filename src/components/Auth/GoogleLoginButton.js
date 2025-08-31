import React from "react";
import { GoogleLogin as OAuthGoogleLogin } from "@react-oauth/google";

const GoogleLoginButton = ({ onSuccess, onFailure }) => (
  <OAuthGoogleLogin
    onSuccess={(res) => {
      // adapt payload shape expected by callers
      if (onSuccess) onSuccess({ tokenId: res?.credential || res });
    }}
    onError={() => {
      if (onFailure) onFailure();
    }}
  />
);

export default GoogleLoginButton;
