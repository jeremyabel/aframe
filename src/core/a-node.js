/* global MutationObserver */
var registerElement = require('./a-register-element').registerElement;
var isNode = require('./a-register-element').isNode;
var utils = require('../utils/');

var bind = utils.bind;
var warn = utils.debug('core:a-node:warn');

/**
 * Base class for A-Frame that manages loading of objects.
 *
 * Nodes emit a `loaded` event when they and their children have initialized.
 */
exports.node = registerElement('a-node', {
  prototype: Object.create(window.HTMLElement.prototype, {
    createdCallback: {
      value: function () {
        this.hasLoaded = false;
        this.isNode = true;
      },
      writable: window.debug
    },

    attachedCallback: {
      value: function () {
        this.sceneEl = this.closestScene();

        this.hasLoaded = false;
        this.emit('nodeready', {}, false);
      },
      writable: window.debug
    },

   /**
    * Returns the first scene by traversing up the tree starting from and
    * including receiver element.
    */
    closestScene: {
      value: function closest () {
        var element = this;
        while (element) {
          if (element.isScene) { break; }
          element = element.parentElement;
        }
        return element;
      }
    },

    /**
     * Returns first element matching a selector by traversing up the tree starting
     * from and including receiver element.
     *
     * @param {string} selector - Selector of element to find.
     */
    closest: {
      value: function closest (selector) {
        var matches = this.matches || this.mozMatchesSelector ||
          this.msMatchesSelector || this.oMatchesSelector || this.webkitMatchesSelector;
        var element = this;
        while (element) {
          if (matches.call(element, selector)) { break; }
          element = element.parentElement;
        }
        return element;
      }
    },

    detachedCallback: {
      value: function () {
        this.hasLoaded = false;
      }
    },

    /**
     * Wait for children to load, if any.
     * Then emit `loaded` event and set `hasLoaded`.
     */
    load: {
      value: function (cb, childFilter) {
        var children;
        var childrenLoaded;
        var self = this;

        if (this.hasLoaded) { return; }

        // Default to waiting for all nodes.
        childFilter = childFilter || isNode;
        // Wait for children to load (if any), then load.
        children = this.getChildren();
        childrenLoaded = children.filter(childFilter).map(function (child) {
          return new Promise(function waitForLoaded (resolve) {
            if (child.hasLoaded) { return resolve(); }
            child.addEventListener('loaded', resolve);
          });
        });

        Promise.all(childrenLoaded).then(function emitLoaded () {
          self.hasLoaded = true;
          if (cb) { cb(); }
          self.emit('loaded', {}, false);
        });
      },
      writable: true
    },

    getChildren: {
      value: function () {
        return Array.prototype.slice.call(this.children, 0);
      }
    },

    setAttribute: {
      value: function (attr, newValue) {
        window.HTMLElement.prototype.setAttribute.call(this, attr, newValue);
      }
    },

    /**
     * Emits a DOM event.
     *
     * @param {String} name
     *   Name of event (use a space-delimited string for multiple events).
     * @param {Object=} [detail={}]
     *   Custom data to pass as `detail` to the event.
     * @param {Boolean=} [bubbles=true]
     *   Whether the event should bubble.
     * @param {Object=} [extraData]
     *   Extra data to pass to the event, if any.
     */
    emit: {
      value: function (name, detail, bubbles, extraData) {
        var self = this;
        detail = detail || {};
        if (bubbles === undefined) { bubbles = true; }
        var data = { bubbles: !!bubbles, detail: detail };
        if (extraData) { utils.extend(data, extraData); }
        return name.split(' ').map(function (eventName) {
          return utils.fireEvent(self, eventName, data);
        });
      },
      writable: window.debug
    },

    /**
     * Returns a closure that emits a DOM event.
     *
     * @param {String} name
     *   Name of event (use a space-delimited string for multiple events).
     * @param {Object} detail
     *   Custom data (optional) to pass as `detail` if the event is to
     *   be a `CustomEvent`.
     * @param {Boolean} bubbles
     *   Whether the event should be bubble.
     */
    emitter: {
      value: function (name, detail, bubbles) {
        var self = this;
        return function () {
          self.emit(name, detail, bubbles);
        };
      }
    }
  })
});
