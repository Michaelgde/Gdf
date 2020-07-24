/**
 * @typedef {Object} LightObjectDataType
 * @property {Object} content The base parameters of light object.
 * @property {number} content.radius The radius of light object.
 * @property {string} content.color A string representing color in hexadecimal format.
 * @property {string} content.texture A string representing the name of texture used for light object.
 * @property {boolean} content.debugMode true if the light objects shows debug graphics, false otherwise.
 *
 * @typedef {ObjectData & LightObjectDataType} LightObjectData
 */

/**
 * Displays a Light object.
 * @memberof gdjs
 * @class LightRuntimeObject
 * @extends RuntimeObject
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {LightObjectData} lightObjectData
 */
gdjs.LightRuntimeObject = function (runtimeScene, lightObjectData) {
  gdjs.RuntimeObject.call(this, runtimeScene, lightObjectData);

  /** @type {number} */
  this._radius =
    lightObjectData.content.radius > 0 ? lightObjectData.content.radius : 1;

  /** @type {number[]} color in format [r, g, b], where each component is in the range [0, 255] */
  this._color = gdjs.LightRuntimeObject.hexToRGBColor(
    lightObjectData.content.color
  );

  /** @type {boolean} */
  this._debugMode = lightObjectData.content.debugMode;

  /** @type {?PIXI.Texture} */
  this._texture =
    lightObjectData.content.texture === ''
      ? null
      : runtimeScene
          .getGame()
          .getImageManager()
          .getPIXITexture(lightObjectData.content.texture);

  /** @type {?gdjs.LightObstaclesManager} */
  this._obstaclesManager =
    gdjs.LightObstaclesManager !== undefined
      ? gdjs.LightObstaclesManager.getManager(runtimeScene)
      : null;

  if (this._renderer)
    gdjs.LightRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
  else this._renderer = new gdjs.LightRuntimeObjectRenderer(this, runtimeScene);

  // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
  this.onCreated();
};

gdjs.LightRuntimeObject.prototype = Object.create(gdjs.RuntimeObject.prototype);
gdjs.registerObject('Lighting::LightObject', gdjs.LightRuntimeObject);

gdjs.LightRuntimeObject.hexToRGBColor = function (hex) {
  var hexNumber = parseInt(hex.replace('#', ''), 16);
  return [(hexNumber >> 16) & 0xff, (hexNumber >> 8) & 0xff, hexNumber & 0xff];
};

gdjs.LightRuntimeObject.prototype.getRendererObject = function () {
  return this._renderer.getRendererObject();
};

gdjs.LightRuntimeObject.prototype.update = function () {
  this._renderer.ensureUpToDate();
};

/**
 * Get the radius of the light object.
 * @returns {number} radius of the light object.
 */
gdjs.LightRuntimeObject.prototype.getRadius = function () {
  return this._radius;
};

/**
 * Get the height of the light object.
 * @returns {number} height of light object.
 */
gdjs.LightRuntimeObject.prototype.getHeight = function () {
  return 2 * this._radius;
};

/**
 * Get the width of the light object.
 * @returns {number} width of light object.
 */
gdjs.LightRuntimeObject.prototype.getWidth = function () {
  return 2 * this._radius;
};

/**
 * Get the x co-ordinate of the top-left vertex/point of light object.
 * @returns {number} x co-ordinate of the top-left vertex/point.
 */
gdjs.LightRuntimeObject.prototype.getDrawableX = function () {
  return this.x - this._radius;
};

/**
 * Get the y co-ordinate of the top-left vertex/point of light object.
 * @returns {number} y co-ordinate of the top-left vertex/point.
 */
gdjs.LightRuntimeObject.prototype.getDrawableY = function () {
  return this.y - this._radius;
};

/**
 * Get the color of the light object in format [r, g, b], with components in the range of [0-255].
 * @returns {number[]} the color of light object in rgb format.
 */
gdjs.LightRuntimeObject.prototype.getColor = function () {
  return this._color;
};

/**
 * Set the position of x co-ordinate of light object.
 * @param {number} x
 */
gdjs.LightRuntimeObject.prototype.setX = function (x) {
  gdjs.RuntimeObject.prototype.setX.call(this, x);
};

/**
 * Set the position of y co-ordinate of the light object.
 * @param {number} y
 */
gdjs.LightRuntimeObject.prototype.setY = function (y) {
  gdjs.RuntimeObject.prototype.setY.call(this, y);
};

/**
 * Get the light obstacles manager if objects with the behavior exist, null otherwise.
 * @returns {?gdjs.LightObstaclesManager} gdjs.LightObstaclesMager if it exists, otherwise null.
 */
gdjs.LightRuntimeObject.prototype.getObstaclesManager = function () {
  return this._obstaclesManager;
};

/**
 * Returns true if the light shows debug graphics, false otherwise.
 * @returns {boolean} debug mode.
 */
gdjs.LightRuntimeObject.prototype.getDebugMode = function () {
  return this._debugMode;
};

/**
 * Returns PIXI.Texture if it exists, otherwise null.
 * @returns {?PIXI.Texture} name of texture.
 */
gdjs.LightRuntimeObject.prototype.getPIXITexture = function () {
  return this._texture;
};
