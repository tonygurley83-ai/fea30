import React,
{
  useState
}
from "react";

function FEASolver({
  projectId
}) {

  const [status,
    setStatus] =
      useState("idle");

  async function
  runSolver() {

    setStatus(
      "running"
    );

    const response =
      await fetch(

        `/api/projects/${projectId}/solve`,

        {
          method: "POST"
        }

      );

    const result =
      await response.json();

    setStatus(
      result.status
    );

  }

  return (

    <div>

      <div>
        Solver:
        {" "}
        {status}
      </div>

      <button
        onClick={
          runSolver
        }
      >
        Run Solver
      </button>

    </div>

  );

}

export default FEASolver;
