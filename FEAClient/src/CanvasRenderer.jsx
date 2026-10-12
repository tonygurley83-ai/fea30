import React, {
  useEffect
} from "react";

import mirror
  from "../../src/MirrorClient";

import {
  renderCanvas
} from "./CanvasRenderEngine";

function CanvasRenderer({
  project,
  canvas
}) {

  useEffect(() => {

    const renderModel =

      renderCanvas(
        project,
        canvas
      );

    mirror.publish({

      type:
        "CANVAS_UPDATED",

      canvas:
        renderModel

    });

  }, [
    project,
    canvas
  ]);

  return null;

}

export default CanvasRenderer;
