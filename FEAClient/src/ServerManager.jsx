useEffect(() => {
  const unsubscribeProject = mirror.subscribe(
    "PROJECT_RENDERED",
    message => {
      console.log(message);
      setProject(message.project);
    }
  );

  const unsubscribeCanvas = mirror.subscribe(
    "CANVAS_RENDERED",
    message => {
      setCanvas(message.canvas);
    }
  );

  const detuneScene = mirror.subscribe(
    "SCENE_RENDERED",
    message => {
      setScene(message.canvas.scene);
    }
  );

  return () => {
    unsubscribeProject();
    unsubscribeCanvas();
    detuneScene();
  };
}, []);
