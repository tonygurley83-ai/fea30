import React from "react";

function ButtonGoogleLogin() {

  return (

    <button

      onClick={() => {

        window.location.href =
          "/auth/google";

      }}

      style={{
        width: "100%",
        padding: 12,
        background: "#4285F4",
        color: "white",
        border: "none",
        borderRadius: 4,
        cursor: "pointer"
      }}

    >

      Sign in with Google

    </button>

  );

}

export default ButtonGoogleLogin;
