// types/Material.js

export default class Material {
  constructor({
    id,
    name,

    density = 0,

    displayColor = "#FFFFFF",

    roughness = 0.5,
    metalness = 0.0,

    transparent = false,
    opacity = 1.0,
  }) {
    this.id = id;
    this.name = name;

    this.density = density;

    this.displayColor = displayColor;

    this.roughness = roughness;
    this.metalness = metalness;

    this.transparent = transparent;
    this.opacity = opacity;
  }

  clone() {
    return new Material({
      id: this.id,
      name: this.name,
      density: this.density,
      displayColor: this.displayColor,
      roughness: this.roughness,
      metalness: this.metalness,
      transparent: this.transparent,
      opacity: this.opacity,
    });
  }
}
