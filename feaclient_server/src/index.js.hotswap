import eruda from "eruda";

eruda.init();
eruda.show();

import React from "react";
import ReactDOM from "react-dom";

import MasterManager from "./MasterManager";
import LoginSuccess from "./LoginSuccess";

console.log(
  "PATH:",
  window.location.pathname
);

const path =
  window.location.pathname;

if (
  path === "/login-success"
) {

  console.log(
    "Rendering LoginSuccess"
  );

  ReactDOM.render(
    <LoginSuccess />,
    document.getElementById("root")
  );

}
else {

  console.log(
    "Rendering MasterManager"
  );

  ReactDOM.render(
    <MasterManager />,
    document.getElementById("root")
  );

}
