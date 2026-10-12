class MirrorClient {

  constructor() {
    this.listeners = {};
  }

  subscribe(type, callback) {

    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }

    this.listeners[type].push(callback);

    return () => {

      this.listeners[type] =
        this.listeners[type].filter(
          item => item !== callback
        );

    };
  }

  publish(message) {

    const handlers =
      this.listeners[message.type] || [];

    handlers.forEach(handler =>
      handler(message)
    );

  }
}

export default new MirrorClient();
