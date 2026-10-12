// types/Layer.js

export default class Layer {
  constructor({
    id,
    name,
    color = "#FFFFFF",
    visible = true,
    locked = false,
    opacity = 1.0,
    snapEnabled = true,
  }) {
    this.id = id;
    this.name = name;

    this.color = color;

    this.visible = visible;
    this.locked = locked;

    this.opacity = opacity;

    this.snapEnabled = snapEnabled;
  }

  clone() {
    return new Layer({
      id: this.id,
      name: this.name,
      color: this.color,
      visible: this.visible,
      locked: this.locked,
      opacity: this.opacity,
      snapEnabled: this.snapEnabled,
    });
  }

  toggleVisibility() {
    this.visible = !this.visible;
  }

  toggleLock() {
    this.locked = !this.locked;
  }
}
