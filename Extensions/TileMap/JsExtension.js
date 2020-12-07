// @flow
/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change
 * to this extension file or to any other *.js file that you reference inside.
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */

/*::
// Import types to allow Flow to do static type checking on this file.
// Extensions declaration are typed using Flow (like the editor), but the files
// for the game engine are checked with TypeScript annotations.
import { type ObjectsRenderingService, type ObjectsEditorService } from '../JsExtensionTypes.flow.js'
*/

module.exports = {
  createExtension: function (
    _ /*: (string) => string */,
    gd /*: libGDevelop */
  ) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'TileMap',
        _('Tile Map'),
        _(
          'Displays a tiled-based map, made with Tiled Map Editor (mapeditor.org).'
        ),
        'Todor Imreorov',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/objects/tile_map');

    var objectTileMap = new gd.ObjectJsImplementation();
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    objectTileMap.updateProperty = function (
      objectContent,
      propertyName,
      newValue
    ) {
      if (propertyName in objectContent) {
        if (typeof objectContent[propertyName] === 'boolean')
          objectContent[propertyName] = newValue === '1';
        else objectContent[propertyName] = newValue;
        return true;
      }

      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    objectTileMap.getProperties = function (objectContent) {
      var objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties.set(
        'tilemapJsonFile',
        new gd.PropertyDescriptor(objectContent.tilemapJsonFile)
          .setType('resource')
          .addExtraInfo('json')
          .setLabel(_('Tilemap JSON file'))
          .setDescription(_('This is the JSON file that was saved or exported from Tiled.'))
      );
      objectProperties.set(
        'tilesetJsonFile',
        new gd.PropertyDescriptor(objectContent.tilesetJsonFile)
          .setType('resource')
          .addExtraInfo('json')
          .setLabel(_('Tileset JSON file (optional)'))
          .setDescription(_('Optional, don\'t specify it if you\'ve not saved the tileset in a different file.'))
      );
      objectProperties.set(
        'tilemapAtlasImage',
        new gd.PropertyDescriptor(objectContent.tilemapAtlasImage)
          .setType('resource')
          .addExtraInfo('image')
          .setLabel(_('Atlas image'))
      );
      objectProperties.set(
        'displayMode',
        new gd.PropertyDescriptor(objectContent.displayMode)
          .setType('choice')
          .addExtraInfo('visible')
          .addExtraInfo('all')
          .addExtraInfo('index')
          .setLabel(_('Display mode'))
      );
      objectProperties.set(
        'layerIndex',
        new gd.PropertyDescriptor(objectContent.layerIndex.toString())
          .setType('number')
          .setLabel(_('Layer index to display'))
          .setDescription(_('If "index" is selected as the display mode, this is the index of the layer to display.'))
      );
      objectProperties.set(
        'animationSpeedScale',
        new gd.PropertyDescriptor(objectContent.animationSpeedScale.toString())
          .setType('number')
          .setLabel(_('Animation speed scale'))
      );
      objectProperties.set(
        'animationFps',
        new gd.PropertyDescriptor(objectContent.animationFps.toString())
          .setType('number')
          .setLabel(_('Animation FPS'))
      );

      return objectProperties;
    };
    objectTileMap.setRawJSONContent(
      JSON.stringify({
        tilemapJsonFile: '',
        tilesetJsonFile: '',
        tilemapAtlasImage: '',
        displayMode: 'visible',
        layerIndex: 0,
        animationSpeedScale: 1,
        animationFps: 4,
      })
    );

    // $FlowExpectedError - ignore Flow warning as we're creating an object
    objectTileMap.updateInitialInstanceProperty = function (
      objectContent,
      instance,
      propertyName,
      newValue,
      project,
      layout
    ) {
      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    objectTileMap.getInitialInstanceProperties = function (
      content,
      instance,
      project,
      layout
    ) {
      var instanceProperties = new gd.MapStringPropertyDescriptor();
      return instanceProperties;
    };

    const object = extension
      .addObject(
        'TileMap',
        _('Tile Map'),
        _(
          'Displays a tiled-based map, made with Tiled Map Editor (mapeditor.org).'
        ),
        'JsPlatform/Extensions/tile_map32.png',
        objectTileMap
      )
      .setIncludeFile('Extensions/TileMap/tilemapruntimeobject.js')
      .addIncludeFile(
        'Extensions/TileMap/tilemapruntimeobject-pixi-renderer.js'
      )
      .addIncludeFile(
        'Extensions/TileMap/pixi-tilemap/dist/pixi-tilemap.umd.js'
      )
      .addIncludeFile('Extensions/TileMap/pako/dist/pako.min.js')
      .addIncludeFile('Extensions/TileMap/pixi-tilemap-helper.js');

    object
      .addCondition(
        'TilemapJsonFile',
        _('Tilemap json file'),
        _('Compare the value of the tilemap json file.'),
        _('Json file of _PARAM0_ is _PARAM1_'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .addParameter('jsonResource', _('Tilemap json file'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('isTilemapJsonFile');

    object
      .addAction(
        'SetTilemapJsonFile',
        _('Tilemap json file'),
        _('Set the json file with the tilemap data (mapeditor.org supported)'),
        _('Set the tilemap json file of _PARAM0_ to _PARAM1_'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .addParameter('jsonResource', _('Tilemap json file'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setTilemapJsonFile')
      .setGetter('getTilemapJsonFile');

    object
      .addCondition(
        'TilesetJsonFile',
        _('Tileset json file'),
        _('Compare the value of the tileset json file.'),
        _('The tileset json file of _PARAM0_ is _PARAM1_'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .addParameter('jsonResource', _('Tileset json file'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('isTilesetJsonFile');

    object
      .addAction(
        'SetTilesetJsonFile',
        _('Tileset json file'),
        _(
          'Set the json file with the tileset data (sometimes that is embeded in the tilemap, so not needed)'
        ),
        _('Set the tileset json file of _PARAM0_ to _PARAM1_'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .addParameter('jsonResource', _('Tileset json file'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setTilesetJsonFile')
      .setGetter('getTilesetJsonFile');

    object
      .addCondition(
        'DisplayMode',
        _('Display mode'),
        _('Compare the value of the display mode.'),
        _('The display mode of _PARAM0_ is _PARAM1_'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .addParameter(
        'stringWithSelector',
        _('Display mode'),
        '["visible", "all", "index"]',
        false
      )
      .getCodeExtraInformation()
      .setFunctionName('isDisplayMode');

    object
      .addAction(
        'SetDisplayMode',
        _('Display mode'),
        _('Set the Display mode'),
        _('Set display mode of _PARAM0_ to _PARAM1_'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .addParameter(
        'stringWithSelector',
        _('Display mode'),
        '["visible", "all", "index"]',
        false
      )
      .getCodeExtraInformation()
      .setFunctionName('setDisplayMode')
      .setGetter('getDisplayMode');

    object
      .addCondition(
        'LayerIndex',
        _('Layer index'),
        _('Compare the value of the layer index.'),
        _('The layer index'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .useStandardRelationalOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('getLayerIndex');

    object
      .addAction(
        'SetLayerIndex',
        _('Layer index'),
        _('Set the layer index of the tilemap.'),
        _('the layer index'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .useStandardOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('setLayerIndex')
      .setGetter('getLayerIndex');

    object
      .addExpression(
        'LayerIndex',
        _('Get the Layer index'),
        _('Get the Layer index'),
        '',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .getCodeExtraInformation()
      .setFunctionName('getLayerIndex');

    object
      .addCondition(
        'animationSpeedScale',
        _('Animation speed'),
        _('Compare the value of the animation speed.'),
        _('The animation speed'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .useStandardRelationalOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('getAnimationSpeedScale');

    object
      .addAction(
        'SetAnimationSpeedScale',
        _('Animation speed'),
        _('Set the animation speed scale of the tilemap (1 by default).'),
        _('the animation speed'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .useStandardOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('setAnimationSpeedScale')
      .setGetter('getAnimationSpeedScale');

    object
      .addExpression(
        'animationSpeedScale',
        _('Get the Animation speed'),
        _('Get the Animation speed'),
        '',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .getCodeExtraInformation()
      .setFunctionName('getAnimationSpeedScale');

    object
      .addCondition(
        'AnimationFps',
        _('Animation fps'),
        _('Compare the value of the animation fps.'),
        _('The animation fps'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .useStandardRelationalOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('getAnimationFps');

    object
      .addAction(
        'SetAnimationFps',
        _('Animation fps'),
        _('Set the animation fps of the tilemap (4 by default).'),
        _('the animation fps'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .useStandardOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('setAnimationFps')
      .setGetter('getAnimationFps');

    object
      .addExpression(
        'AnimationFps',
        _('Get the Animation fps'),
        _('Get the Animation fps'),
        '',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .getCodeExtraInformation()
      .setFunctionName('getAnimationFps');

    return extension;
  },

  /**
   * You can optionally add sanity tests that will check the basic working
   * of your extension behaviors/objects by instanciating behaviors/objects
   * and setting the property to a given value.
   *
   * If you don't have any tests, you can simply return an empty array like this:
   * `runExtensionSanityTests: function(gd, extension) { return []; }`
   *
   * But it is recommended to create tests for the behaviors/objects properties you created
   * to avoid mistakes.
   */
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
  /**
   * Register editors for objects.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerEditorConfigurations: function (
    objectsEditorService /*: ObjectsEditorService */
  ) {
    objectsEditorService.registerEditorConfiguration(
      'TileMap::TileMap',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/objects/tile_map_object',
      })
    );
  },
  /**
   * Register renderers for instance of objects on the scene editor.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerInstanceRenderers: function (
    objectsRenderingService /*: ObjectsRenderingService */
  ) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const PIXI = objectsRenderingService.PIXI;

    const Tilemap = objectsRenderingService.requireModule(
      __dirname,
      'pixi-tilemap/dist/pixi-tilemap.umd'
    );
    const PixiTilemapHelper = objectsRenderingService.requireModule(
      __dirname,
      'pixi-tilemap-helper'
    );
    // required for decoding tiled zlib compressed layer data
    const pako = objectsRenderingService.requireModule(
      __dirname,
      'pako/dist/pako.min'
    );

    /**
     * Renderer for instances of TileMap inside the IDE.
     *
     * @extends RenderedTileMapInstance
     * @class RenderedTileMapInstance
     * @constructor
     */
    function RenderedTileMapInstance(
      project,
      layout,
      instance,
      associatedObject,
      pixiContainer,
      pixiResourcesLoader
    ) {
      RenderedInstance.call(
        this,
        project,
        layout,
        instance,
        associatedObject,
        pixiContainer,
        pixiResourcesLoader
      );

      this._pixiObject = new Tilemap.CompositeRectTileLayer(0);
      this._tileSet = null;
      this._pixiContainer.addChild(this._pixiObject);
      this.update();
      this.updateTileMap();
    }
    RenderedTileMapInstance.prototype = Object.create(
      RenderedInstance.prototype
    );

    /**
     * Return the path to the thumbnail of the specified object.
     */
    RenderedTileMapInstance.getThumbnail = function (
      project,
      resourcesLoader,
      object
    ) {
      return 'JsPlatform/Extensions/tile_map32.png';
    };

    /**
     * This is used to reload the tilemap
     */
    RenderedTileMapInstance.prototype._loadTileMapWithTileset = function (
      tileMapJsonData,
      tilesetJsonData
    ) {
      // Get the tileset resource to use
      const tilemapAtlasImage = this._associatedObject
        .getProperties(this.project)
        .get('tilemapAtlasImage')
        .getValue();
      const tilemapJsonFile = this._associatedObject
        .getProperties(this.project)
        .get('tilemapJsonFile')
        .getValue();
      const layerIndex = parseInt(
        this._associatedObject
          .getProperties(this.project)
          .get('layerIndex')
          .getValue(),
        10
      );
      const displayMode = this._associatedObject
        .getProperties(this.project)
        .get('displayMode')
        .getValue();
      const tilesetJsonFile = this._associatedObject
        .getProperties(this.project)
        .get('tilesetJsonFile')
        .getValue();

      PixiTilemapHelper.getPIXITileSet(
        (textureName) =>
          this._pixiResourcesLoader.getPIXITexture(this._project, textureName),
        tilesetJsonData
          ? { ...tileMapJsonData, tilesets: [tilesetJsonData] }
          : tileMapJsonData,
        tilemapAtlasImage,
        tilemapJsonFile,
        tilesetJsonFile,
        (tileset) => {
          if (tileset && this._pixiObject) {
            PixiTilemapHelper.updatePIXITileMap(
              this._pixiObject,
              tileset,
              displayMode,
              layerIndex,
              pako
            );
          }
        }
      );
    };

    RenderedTileMapInstance.prototype.updateTileMap = async function () {
      // Get the tileset resource to use
      const tilemapJsonFile = this._associatedObject
        .getProperties(this.project)
        .get('tilemapJsonFile')
        .getValue();
      const tilesetJsonFile = this._associatedObject
        .getProperties(this.project)
        .get('tilesetJsonFile')
        .getValue();

      try {
        const tileMapJsonData = await this._pixiResourcesLoader.getResourceJsonData(
          this._project,
          tilemapJsonFile
        );

        const tilesetJsonData = tilesetJsonFile
          ? await this._pixiResourcesLoader.getResourceJsonData(
              this._project,
              tilesetJsonFile
            )
          : null;

        this._loadTileMapWithTileset(tileMapJsonData, tilesetJsonData);
      } catch (err) {
        console.error('Unable to load a Tilemap JSON data: ', err);
      }
    };
    /**
     * This is called to update the PIXI object on the scene editor
     */
    RenderedTileMapInstance.prototype.update = function () {
      if (this._instance.hasCustomSize()) {
        this._pixiObject.width = this._instance.getCustomWidth();
        this._pixiObject.height = this._instance.getCustomHeight();
      } else {
        this._pixiObject.scale.x = 1;
        this._pixiObject.scale.y = 1;
      }

      // Place the center of rotation in the center of the object. Because pivot position in Pixi
      // is in the **local coordinates of the object**, we need to find back the original width
      // and height of the object before scaling (then divide by 2 to find the center)
      const originalWidth = this._pixiObject.width / this._pixiObject.scale.x;
      const originalHeight = this._pixiObject.height / this._pixiObject.scale.y;
      this._pixiObject.pivot.x = originalWidth / 2;
      this._pixiObject.pivot.y = originalHeight / 2;

      // Modifying the pivot position also has an impact on the transform. The instance (X,Y) position
      // of this object refers to the top-left point, but now in Pixi, as we changed the pivot, the Pixi
      // object (X,Y) position refers to the center. So we add an offset to convert from top-left to center.
      this._pixiObject.x = this._instance.getX() + this._pixiObject.width / 2;
      this._pixiObject.y = this._instance.getY() + this._pixiObject.height / 2;

      // Rotation works as intended because we put the pivot in the center
      this._pixiObject.rotation = RenderedInstance.toRad(
        this._instance.getAngle()
      );
    };

    /**
     * Return the width of the instance, when it's not resized.
     */
    RenderedTileMapInstance.prototype.getDefaultWidth = function () {
      return this._pixiObject.width / this._pixiObject.scale.x;
    };

    /**
     * Return the height of the instance, when it's not resized.
     */
    RenderedTileMapInstance.prototype.getDefaultHeight = function () {
      return this._pixiObject.height / this._pixiObject.scale.y;
    };

    objectsRenderingService.registerInstanceRenderer(
      'TileMap::TileMap',
      RenderedTileMapInstance
    );
  },
};
