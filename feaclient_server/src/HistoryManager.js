class HistoryManager {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
  }

  save(state) {
    this.undoStack.push(
      JSON.parse(JSON.stringify(state))
    );

    this.redoStack = [];
  }

  undo(currentState) {
    if (!this.undoStack.length) {
      return currentState;
    }

    this.redoStack.push(
      JSON.parse(JSON.stringify(currentState))
    );

    return this.undoStack.pop();
  }

  redo(currentState) {
    if (!this.redoStack.length) {
      return currentState;
    }

    this.undoStack.push(
      JSON.parse(JSON.stringify(currentState))
    );

    return this.redoStack.pop();
  }
}

export default new HistoryManager();
