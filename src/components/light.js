var diff = require('../utils').diff;
var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

/**
 * Light component.
 */
exports.Component = registerComponent('light', {
  schema: {
    color: {type: 'color'},
    intensity: {default: 1.0, min: 0, if: {type: ['ambient', 'directional', 'hemisphere', 'point', 'spot']}},
    type: {default: 'directional', oneOf: ['ambient', 'directional', 'hemisphere', 'point', 'spot']},
    target: {type: 'selector', if: {type: ['spot', 'directional']}},
  },

  /**
   * Notifies scene a light has been added to remove default lighting.
   */
  init: function () {
    var el = this.el;
    this.light = null;
    this.defaultTarget = null;
    this.system.registerLight(el);
  },

  /**
   * (Re)create or update light.
   */
  update: function (oldData) {
    var data = this.data;
    var diffData = diff(data, oldData);
    var light = this.light;

    // Existing light.
    if (light && !('type' in diffData)) {
      // Light type has not changed. Update light.
      Object.keys(diffData).forEach(function (key) {
        var value = data[key];

        switch (key) {
          case 'color': {
            light.color.set(value);
            break;
          }

          default: {
            light[key] = value;
          }
        }
      });
      return;
    }

    // No light yet or light type has changed. Create and add light.
    this.setLight(this.data);
  },

  setLight: function (data) {
    var el = this.el;
    var newLight = this.getLight(data);
    if (newLight) {
      if (this.light) {
        el.removeObject3D('light');
      }

      this.light = newLight;
      this.light.el = el;
      el.setObject3D('light', this.light);

      // HACK solution for issue #1624
      if (data.type === 'spot' || data.type === 'directional' || data.type === 'hemisphere') {
        el.getObject3D('light').translateY(-1);
      }
    }
  },

  /**
   * Creates a new three.js light object given data object defining the light.
   *
   * @param {object} data
   */
  getLight: function (data) {
    var color = new THREE.Color(data.color).getHex();
    var intensity = data.intensity;
    var type = data.type;
    var target = data.target;
    var light = null;

    switch (type.toLowerCase()) {
      case 'ambient': {
        return new THREE.AmbientLight(color, intensity);
      }

      case 'directional': {
        light = new THREE.DirectionalLight(color, intensity);
        this.defaultTarget = light.target;
        return light;
      }
    }
  },

  onSetTarget: function (targetEl, light) {
    light.target = targetEl.object3D;
  },

  /**
   * Remove light on remove (callback).
   */
  remove: function () {
    this.el.removeObject3D('light');
  }
});
