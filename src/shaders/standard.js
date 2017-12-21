var registerShader = require('../core/shader').registerShader;
var THREE = require('../lib/three');
var utils = require('../utils/');

/**
 * Standard (physically-based) shader using THREE.MeshStandardMaterial.
 */
module.exports.Shader = registerShader('standard', {
  schema: {
    color: {type: 'color'},

    fog: {default: true},
    height: {default: 256},
    metalness: {default: 0.0, min: 0.0, max: 1.0},

    offset: {type: 'vec2', default: {x: 0, y: 0}},
    repeat: {type: 'vec2', default: {x: 1, y: 1}},
    roughness: {default: 0.5, min: 0.0, max: 1.0},
    src: {type: 'map'},
    width: {default: 512},
    wireframe: {default: false},
    wireframeLinewidth: {default: 2}
  },

  /**
   * Initializes the shader.
   * Adds a reference from the scene to this entity as the camera.
   */
  init: function (data) {
    this.material = new THREE.MeshBasicMaterial(getMaterialData(data));
  },

  update: function (data) {
    this.updateMaterial(data);
  },

  /**
   * Updating existing material.
   *
   * @param {object} data - Material component data.
   * @returns {object} Material.
   */
  updateMaterial: function (data) {
    var material = this.material;
    data = getMaterialData(data);
    Object.keys(data).forEach(function (key) {
      material[key] = data[key];
    });
  }
});

/**
 * Builds and normalize material data, normalizing stuff along the way.
 *
 * @param {object} data - Material data.
 * @returns {object} data - Processed material data.
 */
function getMaterialData (data) {
  var newData = {
    color: new THREE.Color(data.color),
    fog: data.fog,
    // metalness: data.metalness,
    // roughness: data.roughness,
    wireframe: data.wireframe,
    wireframeLinewidth: data.wireframeLinewidth
  };

  return newData;
}
