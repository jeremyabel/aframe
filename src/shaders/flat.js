var registerShader = require('../core/shader').registerShader;
var THREE = require('../lib/three');

/**
 * Flat shader using THREE.MeshBasicMaterial.
 */
module.exports.Shader = registerShader('flat', {
  schema: {
    color: {type: 'color'},
    fog: {default: true},
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
  return {
    fog: data.fog,
    color: new THREE.Color(data.color),
    wireframe: data.wireframe,
    wireframeLinewidth: data.wireframeLinewidth
  };
}
