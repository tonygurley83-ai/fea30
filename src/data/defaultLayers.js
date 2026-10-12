// data/defaultMaterials.js

import Material from "../types/Material";

export const defaultMaterials = [
  new Material({
    id: "steel",
    name: "Steel",
    density: 7850,
    displayColor: "#8A8A8A",
    roughness: 0.35,
    metalness: 1.0,
  }),

  new Material({
    id: "aluminum",
    name: "Aluminum",
    density: 2700,
    displayColor: "#C0C0C0",
    roughness: 0.4,
    metalness: 0.9,
  }),

  new Material({
    id: "concrete",
    name: "Concrete",
    density: 2400,
    displayColor: "#AAAAAA",
    roughness: 0.9,
    metalness: 0.0,
  }),

  new Material({
    id: "glass",
    name: "Glass",
    density: 2500,
    displayColor: "#AADDFF",
    roughness: 0.05,
    metalness: 0.0,
    transparent: true,
    opacity: 0.3,
  }),

  new Material({
    id: "wood",
    name: "Wood",
    density: 700,
    displayColor: "#A0522D",
    roughness: 0.8,
    metalness: 0.0,
  }),
];
