import React,
{
  useEffect
}
from "react";

function LoginSuccess() {

  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    const token =
      params.get(
        "token"
      );

    if (token) {

      localStorage.setItem(
        "jwt",
        token
      );

      console.log(
        "[AUTH] JWT Stored"
      );

      window.location.href =
        "/";

    }
    else {

      console.error(
        "[AUTH] No token found"
      );

      window.location.href =
        "/";

    }

  }, []);

  return (

    <div>

      Completing Login...

    </div>

  );

}

export default LoginSuccess;

