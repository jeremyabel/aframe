var bind = require('../../utils/bind').bind;
var registerComponent = require('../../core/component').registerComponent;

module.exports.Component = registerComponent('canvas', {
  init: function () {
    var canvasEl;
    var sceneEl = this.el;

    canvasEl = document.createElement('canvas');
    canvasEl.classList.add('a-canvas');
    // Mark canvas as provided/injected by A-Frame.
    canvasEl.dataset.aframeCanvas = true;
    sceneEl.appendChild(canvasEl);

    // document.addEventListener('fullscreenchange', onFullScreenChange);
    // document.addEventListener('mozfullscreenchange', onFullScreenChange);
    // document.addEventListener('webkitfullscreenchange', onFullScreenChange);

    // Prevent overscroll on mobile.
    canvasEl.addEventListener('touchmove', function (event) {
      event.preventDefault();
    });

    // Set canvas on scene.
    sceneEl.canvas = canvasEl;
    sceneEl.emit('render-target-loaded', {target: canvasEl});

    // For unknown reasons a syncrhonous resize does not work on desktop when
    // entering/exiting fullscreen.
    setTimeout(bind(sceneEl.resize, sceneEl), 0);
  }
});
