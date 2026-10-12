import React from "react";

import ButtonGoogleLogin
from "./shared/ButtonGoogleLogin";

function LoginPage() {

  return (

    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#F8FAFC"
      }}
    >

      <div
        style={{
          width: 420,
          padding: 40,
          background: "white",
          borderRadius: 8,
          boxShadow:
            "0 2px 12px rgba(0,0,0,0.15)",
          textAlign: "center"
        }}
      >

        <h1>
          Tectera Labs
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: 24
          }}
        >
          Sign in to access your projects and canvases.
        </p>

        <ButtonGoogleLogin />

      </div>

    </div>

  );

}

export default LoginPage;
