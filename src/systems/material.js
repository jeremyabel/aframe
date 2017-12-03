var registerSystem = require('../core/system').registerSystem;
var utils = require('../utils/');

/**
 * System for material component.
 * Handle material registration, updates (for fog), and texture caching.
 *
 * @member {object} materials - Registered materials.
 * @member {object} textureCounts - Number of times each texture is used. Tracked
 *         separately from textureCache, because the cache (1) is populated in
 *         multiple places, and (2) may be cleared at any time.
 * @member {object} textureCache - Texture cache for:
 *   - Images: textureCache has mapping of src -> repeat -> cached three.js texture.
 *   - Videos: textureCache has mapping of videoElement -> cached three.js texture.
 */
exports.System = registerSystem('material', {
  init: function () {
    this.materials = {};
  },

  /**
   * Create a hash of the material properties for texture cache key.
   */
  hash: function (data) {
    if (data.src.tagName) {
      // Since `data.src` can be an element, parse out the string if necessary for the hash.
      data = utils.extendDeep({}, data);
      data.src = data.src.getAttribute('src');
    }
    return JSON.stringify(data);
  },

  /**
   * Keep track of material in case an update trigger is needed (e.g., fog).
   *
   * @param {object} material
   */
  registerMaterial: function (material) {
    this.materials[material.uuid] = material;
  },

  /**
   * Stop tracking material, and dispose of any textures not being used by
   * another material component.
   *
   * @param {object} material
   */
  unregisterMaterial: function (material) {
    delete this.materials[material.uuid];
  },

  /**
   * Trigger update to all registered materials.
   */
  updateMaterials: function (material) {
    var materials = this.materials;
    Object.keys(materials).forEach(function (uuid) {
      materials[uuid].needsUpdate = true;
    });
  }
});
