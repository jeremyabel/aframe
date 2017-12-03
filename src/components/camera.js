var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

/**
 * Camera component.
 * Pairs along with camera system to handle tracking the active camera.
 */
module.exports.Component = registerComponent('camera', {
  schema: {
    active: {default: true},
    far: {default: 10000},
    fov: {default: 80, min: 0},
    near: {default: 0.005, min: 0},
    userHeight: {default: 0, min: 0},
    zoom: {default: 1, min: 0}
  },

  /**
   * Initialize three.js camera and add it to the entity.
   * Add reference from scene to this entity as the camera.
   */
  init: function () {
    var camera;
    var el = this.el;
    var sceneEl = el.sceneEl;

    // Create camera.
    camera = this.camera = new THREE.PerspectiveCamera();
    el.setObject3D('camera', camera);
  },

  /**
   * Update three.js camera.
   */
  update: function (oldData) {
    var el = this.el;
    var data = this.data;
    var camera = this.camera;
    var system = this.system;

    // Update height offset.
    this.addHeightOffset(oldData.userHeight);

    // Update properties.
    camera.aspect = data.aspect || (window.innerWidth / window.innerHeight);
    camera.far = data.far;
    camera.fov = data.fov;
    camera.near = data.near;
    camera.zoom = data.zoom;
    camera.updateProjectionMatrix();

    // Active property did not change.
    if (oldData && oldData.active === data.active) { return; }

    // If `active` property changes, or first update, handle active camera with system.
    if (data.active && system.activeCameraEl !== el) {
      // Camera enabled. Set camera to this camera.
      system.setActiveCamera(el);
    } else if (!data.active && system.activeCameraEl === el) {
      // Camera disabled. Set camera to another camera.
      system.disableActiveCamera();
    }
  },

  /**
   * Remove camera on remove (callback).
   */
  remove: function () {
    var sceneEl = this.el.sceneEl;
    this.el.removeObject3D('camera');
  },

  /**
   * Offsets the position of the camera to set a human scale perspective
   * This offset is not necessary when using a headset because the SDK
   * will return the real user's head height and position.
   */
  addHeightOffset: function (oldOffset) {
    var el = this.el;
    var currentPosition;
    var userHeightOffset = this.data.userHeight;

    oldOffset = oldOffset || 0;
    currentPosition = el.getAttribute('position') || {x: 0, y: 0, z: 0};
    el.setAttribute('position', {
      x: currentPosition.x,
      y: currentPosition.y - oldOffset + userHeightOffset,
      z: currentPosition.z
    });
  }
});
