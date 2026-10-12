// types/SceneObject.js

export default class SceneObject {
  constructor({
    id,
    type,

    layerId = "default",
    materialId = "steel",

    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
  }) {
    this.id = id;
    this.type = type;

    this.layerId = layerId;
    this.materialId = materialId;

    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
  }
}
