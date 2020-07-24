// @ts-check
/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * The renderer for a gdjs.Layer using Pixi.js.
 *
 * @class LayerPixiRenderer
 * @memberof gdjs
 * @param {gdjs.Layer} layer The layer
 * @param {gdjs.RuntimeScenePixiRenderer} runtimeSceneRenderer The scene renderer
 */
gdjs.LayerPixiRenderer = function (layer, runtimeSceneRenderer) {
  // @ts-ignore
  this._pixiContainer = new PIXI.Container();
  /** @type Object.<string, gdjsPixiFiltersToolsFilter> */
  this._filters = {};
  this._layer = layer;
  this._renderTexture = null;
  this._lightingSprite = null;
  this._runtimeSceneRenderer = runtimeSceneRenderer;
  this._pixiRenderer = runtimeSceneRenderer.getPIXIRenderer();
  this._oldWidth = null;
  this._oldHeight = null;
  this._isLightingLayer = layer.isLightingLayer();
  this._clearColor = layer.getClearColor();

  runtimeSceneRenderer.getPIXIContainer().addChild(this._pixiContainer);
  this._setupFilters();

  // Add the sprite after filters are applied so that the blend mode could be fixed.
  if (this._isLightingLayer) {
    this._replaceContainerWithSprite();
  }
};

gdjs.LayerRenderer = gdjs.LayerPixiRenderer; //Register the class to let the engine use it.

/**
 * Update the position of the PIXI container. To be called after each change
 * made to position, zoom or rotation of the camera.
 * @private
 */
gdjs.LayerPixiRenderer.prototype.updatePosition = function () {
  var angle = -gdjs.toRad(this._layer.getCameraRotation());
  var zoomFactor = this._layer.getCameraZoom();

  this._pixiContainer.rotation = angle;
  this._pixiContainer.scale.x = zoomFactor;
  this._pixiContainer.scale.y = zoomFactor;

  var cosValue = Math.cos(angle);
  var sinValue = Math.sin(angle);
  var centerX =
    this._layer.getCameraX() * zoomFactor * cosValue -
    this._layer.getCameraY() * zoomFactor * sinValue;
  var centerY =
    this._layer.getCameraX() * zoomFactor * sinValue +
    this._layer.getCameraY() * zoomFactor * cosValue;

  this._pixiContainer.position.x = -centerX;
  this._pixiContainer.position.y = -centerY;
  this._pixiContainer.position.x += this._layer.getWidth() / 2;
  this._pixiContainer.position.y += this._layer.getHeight() / 2;
};

gdjs.LayerPixiRenderer.prototype.updateVisibility = function (visible) {
  this._pixiContainer.visible = !!visible;
};

gdjs.LayerPixiRenderer.prototype.update = function () {
  if (this._renderTexture) {
    this._updateRenderTexture();
  }

  for (var filterName in this._filters) {
    var filter = this._filters[filterName];
    filter.update(filter.pixiFilter, this._layer);
  }
};

gdjs.LayerPixiRenderer.prototype._setupFilters = function () {
  var effectsData = this._layer.getEffectsData();
  if (effectsData.length === 0) {
    return;
  }

  this._pixiContainer.filters = [];
  for (var i = 0; i < effectsData.length; ++i) {
    this.addEffect(effectsData[i]);
  }
};

/**
 * Add a new effect, or replace the one with the same name.
 * @param {EffectData} effectData The data of the effect to add.
 */
gdjs.LayerPixiRenderer.prototype.addEffect = function (effectData) {
  var filterCreator = gdjs.PixiFiltersTools.getFilterCreator(
    effectData.effectType
  );
  if (!filterCreator) {
    console.log(
      'Filter "' +
        effectData.name +
        '" has an unknown effect type: "' +
        effectData.effectType +
        '". Was it registered properly? Is the effect type correct?'
    );
    return;
  }

  /** @type gdjsPixiFiltersToolsFilter */
  var filter = {
    pixiFilter: filterCreator.makePIXIFilter(this._layer, effectData),
    updateDoubleParameter: filterCreator.updateDoubleParameter,
    updateStringParameter: filterCreator.updateStringParameter,
    updateBooleanParameter: filterCreator.updateBooleanParameter,
    update: filterCreator.update,
  };

  this._pixiContainer.filters = (this._pixiContainer.filters || []).concat(
    filter.pixiFilter
  );
  this._filters[effectData.name] = filter;
};

/**
 * Remove the effect with the specified name
 * @param {string} effectName The name of the effect.
 */
gdjs.LayerPixiRenderer.prototype.removeEffect = function (effectName) {
  var filter = this._filters[effectName];
  if (!filter) return;

  this._pixiContainer.filters = (this._pixiContainer.filters || []).filter(
    function (pixiFilter) {
      return pixiFilter !== filter.pixiFilter;
    }
  );
  delete this._filters[effectName];
};

/**
 * Add a child to the pixi container associated to the layer.
 * All objects which are on this layer must be children of this container.
 *
 * @param child The child (PIXI object) to be added.
 * @param zOrder The z order of the associated object.
 */
gdjs.LayerPixiRenderer.prototype.addRendererObject = function (child, zOrder) {
  child.zOrder = zOrder; //Extend the pixi object with a z order.

  for (var i = 0, len = this._pixiContainer.children.length; i < len; ++i) {
    if (this._pixiContainer.children[i].zOrder >= zOrder) {
      //TODO : Dichotomic search
      this._pixiContainer.addChildAt(child, i);
      return;
    }
  }
  this._pixiContainer.addChild(child);
};

/**
 * Change the z order of a child associated to an object.
 *
 * @param child The child (PIXI object) to be modified.
 * @param newZOrder The z order of the associated object.
 */
gdjs.LayerPixiRenderer.prototype.changeRendererObjectZOrder = function (
  child,
  newZOrder
) {
  this._pixiContainer.removeChild(child);
  this.addRendererObject(child, newZOrder);
};

/**
 * Remove a child from the internal pixi container.
 * Should be called when an object is deleted or removed from the layer.
 *
 * @param child The child (PIXI object) to be removed.
 */
gdjs.LayerPixiRenderer.prototype.removeRendererObject = function (child) {
  this._pixiContainer.removeChild(child);
};

/**
 * Update the parameter of an effect (with a number).
 * @param {string} name The effect name
 * @param {string} parameterName The parameter name
 * @param {number} value The new value for the parameter
 */
gdjs.LayerPixiRenderer.prototype.setEffectDoubleParameter = function (
  name,
  parameterName,
  value
) {
  var filter = this._filters[name];
  if (!filter) return;

  filter.updateDoubleParameter(filter.pixiFilter, parameterName, value);
};

/**
 * Update the parameter of an effect (with a string).
 * @param {string} name The effect name
 * @param {string} parameterName The parameter name
 * @param {string} value The new value for the parameter
 */
gdjs.LayerPixiRenderer.prototype.setEffectStringParameter = function (
  name,
  parameterName,
  value
) {
  var filter = this._filters[name];
  if (!filter) return;

  filter.updateStringParameter(filter.pixiFilter, parameterName, value);
};

/**
 * Enable or disable the parameter of an effect (boolean).
 * @param {string} name The effect name
 * @param {string} parameterName The parameter name
 * @param {boolean} value The new value for the parameter
 */
gdjs.LayerPixiRenderer.prototype.setEffectBooleanParameter = function (
  name,
  parameterName,
  value
) {
  var filter = this._filters[name];
  if (!filter) return;

  filter.updateBooleanParameter(filter.pixiFilter, parameterName, value);
};

/**
 * Check if an effect exists.
 * @param {string} name The effect name
 * @returns {boolean} True if the effect exists, false otherwise
 */
gdjs.LayerPixiRenderer.prototype.hasEffect = function (name) {
  return !!this._filters[name];
};

/**
 * Enable an effect.
 * @param {string} name The effect name
 * @param {boolean} value Set to true to enable, false to disable
 */
gdjs.LayerPixiRenderer.prototype.enableEffect = function (name, value) {
  var filter = this._filters[name];
  if (!filter) return;

  gdjs.PixiFiltersTools.enableEffect(filter, value);
};

/**
 * Check if an effect is enabled.
 * @param {string} name The effect name
 * @return {boolean} true if the filter is enabled
 */
gdjs.LayerPixiRenderer.prototype.isEffectEnabled = function (name) {
  var filter = this._filters[name];
  if (!filter) return false;

  return gdjs.PixiFiltersTools.isEffectEnabled(filter);
};

/**
 * Updates the render texture, if it exists.
 * Also, render texture is cleared with a specified clear color.
 * @private not to be called outside the update method in most cases.
 */
gdjs.LayerPixiRenderer.prototype._updateRenderTexture = function () {
  if (!this._pixiRenderer) return;

  if (!this._renderTexture) {
    this._oldWidth = this._pixiRenderer.screen.width;
    this._oldHeight = this._pixiRenderer.screen.height;

    var width = this._oldWidth;
    var height = this._oldHeight;
    var resolution = this._pixiRenderer.resolution;
    // @ts-ignore PIXI isn't typed for now.
    this._renderTexture = PIXI.RenderTexture.create({
      width,
      height,
      resolution,
    });
    // @ts-ignore PIXI isn't typed for now.
    this._renderTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
  }

  if (
    this._oldWidth !== this._pixiRenderer.screen.width ||
    this._oldHeight !== this._pixiRenderer.screen.height
  ) {
    this._renderTexture.resize(
      this._pixiRenderer.screen.width,
      this._pixiRenderer.screen.height
    );
    if (this._pixiContainer.filters) {
      this._pixiContainer.filterArea = this._pixiRenderer.screen;
    }
    this._oldWidth = this._pixiRenderer.screen.width;
    this._oldHeight = this._pixiRenderer.screen.height;
  }

  var oldRenderTexture = this._pixiRenderer.renderTexture.current;
  var oldSourceFrame = this._pixiRenderer.renderTexture.sourceFrame;

  this._pixiRenderer.renderTexture.bind(this._renderTexture);
  //TODO: Pass data for clear color.
  this._pixiRenderer.renderTexture.clear(this._clearColor);

  this._pixiRenderer.render(this._pixiContainer, this._renderTexture, false);
  this._pixiRenderer.renderTexture.bind(
    oldRenderTexture,
    oldSourceFrame,
    undefined
  );
};

/**
 * Creates the render texture of pixi container and returns it.
 */
gdjs.LayerPixiRenderer.prototype.getRenderTexture = function () {
  if (!this._renderTexture) this._updateRenderTexture();
  return this._renderTexture;
};

/**
 * Creates a sprite with the render texture of pixi container,
 * and replaces the container with sprite in runtimeScene's pixi container.
 * @private used only in lighting for now as the sprite could have MULTIPLY blend mode.
 */
gdjs.LayerPixiRenderer.prototype._replaceContainerWithSprite = function () {
  if (!this._pixiRenderer) return;
  // @ts-ignore PIXI isn't typed for now.
  this._lightingSprite = new PIXI.Sprite(this.getRenderTexture());
  // @ts-ignore PIXI isn't typed for now.
  this._lightingSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
  // fix for blend mode when applying filter
  if (this._pixiContainer.filters) {
    // @ts-ignore PIXI isn't typed for now.
    this._pixiContainer.filterArea = new PIXI.Rectangle(
      0,
      0,
      this._pixiRenderer.screen.width,
      this._pixiRenderer.screen.height
    );
    for (var i = 0; i < this._pixiContainer.filters.length; i++) {
      // @ts-ignore PIXI isn't typed for now.
      this._pixiContainer.filters[i].blendMode = PIXI.BLEND_MODES.ADD;
    }
  }
  var sceneContainer = this._runtimeSceneRenderer.getPIXIContainer();
  var index = sceneContainer.getChildIndex(this._pixiContainer);
  sceneContainer.addChildAt(this._lightingSprite, index);
  sceneContainer.removeChild(this._pixiContainer);
};

gdjs.LayerPixiRenderer.prototype.getPIXIContainer = function () {
  return this._pixiContainer;
};
