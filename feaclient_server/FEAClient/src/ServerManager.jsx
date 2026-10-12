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

  return () => {
    unsubscribeProject();
    unsubscribeCanvas();
  };
}, []);
