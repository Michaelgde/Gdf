/**
 * TODO
 * Le clique sur la video ne fait rien via les events
 * Le support du draggable behavior  n'est pas là
 * Comment passer les propriétés de l'instance a mon objet video sur la scene ?
 * 
 * Volume | Condition, si le volume de l'object est = à 100, The volume of MONOBJECTVIDEO is = 100
 * Volume | Action, mettre le volume de l'object à 100, Do = 100 to the volume of MONOBJECTVIDEO
 * getVolume | Expression, getVolume sur un objet video, MONOBJECTVIDEO.Video::Volume()
 * 
 * Play | Condition si la video de l'object MONOBJECTVIDEO est en lecture
 * Play | Fait | Action, Lancer la video de l'object , Play the video of MONOBJECTVIDEO
 * isPlayed | Expression, isPlayed sur un objet, MONOBJECTVIDEO.Video::IsPlayed()
 * 
 * Pause | Condition, si la video de l'object MONOBJECTVIDEO est en pause
 * Pause | Fait | Action, Lancer la video de l'object , Pause the video of MONOBJECTVIDEO
 * isPaused | Expression, isPaused sur un objet, MONOBJECTVIDEO.Video::IsPaused()
 * 
 * isLoaded | Condition, si la video de l'object MONOBJECTVIDEO est bien charger, The video of my MONOBJECTVIDEO is loaded
 * isLoaded | Expression, isLoaded sur un object video, MONOBJECTVIDEO.Video::IsLoaded()
 * 
 * Loop | Condition, si le volume de l'object est = à 100, The volume of MONOBJECTVIDEO is = 100
 * Loop | Action, mettre le volume de l'object à 100, Do = 100 to the volume of MONOBJECTVIDEO
 * isLooped | Expression, isLooped sur un objet video, MONOBJECTVIDEO.Video::IsLooped()
 * 
 * Mute | Condition, si le volume de l'object est = à 100, The volume of MONOBJECTVIDEO is = 100
 * Mute | Action, mettre le volume de l'object en Mute ou à 0, Mute the volume of MONOBJECTVIDEO
 * isMuted | Expression, isMuted sur un objet video, MONOBJECTVIDEO.Video::IsMuted()
 * 
 * getDuration | Expression, getDuration sur un objet video retourne le temps en MS depuis le lancement de la vidéo, MONOBJECTVIDEO.Video::GetDuration()
 * 
 * isFinish  | Expression, isMuted sur un objet video, MONOBJECTVIDEO.Video::IsMuted()
 * gettime | Expression, isMuted sur un objet video, MONOBJECTVIDEO.Video::IsMuted()
 */

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
module.exports = {
  createExtension: function(t, gd) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      "Video",
      "Video",
      "Display a video in your scene",
      "Aurélien vivet",
      "Open source (MIT License)"
    )
    .setExtensionHelpPath("/all-features/video");


    /**
     * 
     * Utile ?
     * 
     */

    /*  
    extension
      .addCondition(
        "MyNewCondition",
        t("video condition example"),
        t(
          "This is an example of a condition displayed in the events sheet. Will return true if the number is less than 10 and the length of the text is less than 5."
        ),
        t("Call the example condition with _PARAM0_ and _PARAM1_"),
        t("Dummy Extension"),
        "res/conditions/camera24.png",
        "res/conditions/camera.png"
      )
      .addParameter("expression", t("Number 1"), "", false)
      .addParameter("string", t("Text 1"), "", false)
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/Video/videotools.js"
     )
     .setFunctionName("gdjs.evtTools.video.myConditionFunction"); */

    // Declare an object.
    // Create a new gd.ObjectJsImplementation object and implement the methods
    // that are called to get and set the properties of the object, as well
    // as the properties of the initial instances of this object
    // Everything that is stored inside the object is in "content" and is automatically
    // saved/loaded to JSON.
    var videoObject = new gd.ObjectJsImplementation();
    videoObject.updateProperty = function(
      objectContent,
      propertyName,
      newValue
    ) {
      if (propertyName === "My first property") {
        objectContent.property1 = newValue;
        return true;
      }
      if (propertyName === "Video Looped or no") {
        objectContent.property2 = newValue === "1";
        return true;
      }
      if (propertyName === "Volume") {
        objectContent.property3 = newValue;
        return true;
      }

      return false;
    };
    videoObject.getProperties = function(objectContent) {
      var objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties.set(
        "My first property",
        new gd.PropertyDescriptor(objectContent.property1)
      );
      objectProperties.set(
        "Video Looped or no",
        new gd.PropertyDescriptor(
          objectContent.property2 ? "true" : "false"
        ).setType("boolean")
      );
      objectProperties.set(
        "Volume",
        new gd.PropertyDescriptor(
            objectContent.property3.toString()
        ).setType("number")
      );

      return objectProperties;
    };
    videoObject.setRawJSONContent(
      JSON.stringify({
        property1: "Hello world",
        property2: false,
        property3: 100
      })
    );

    videoObject.updateInitialInstanceProperty = function(
      objectContent,
      instance,
      propertyName,
      newValue,
      project,
      layout
    ) {
      if (propertyName === "My instance property") {
        instance.setRawStringProperty("instanceprop1", newValue);
        return true;
      }
      if (propertyName === "My other instance property") {
        instance.setRawFloatProperty("instanceprop2", parseFloat(newValue));
        return true;
      }

      return false;
    };
    videoObject.getInitialInstanceProperties = function(
      content,
      instance,
      project,
      layout
    ) {
      var instanceProperties = new gd.MapStringPropertyDescriptor();

      instanceProperties.set(
        "My instance property",
        new gd.PropertyDescriptor(
          instance.getRawStringProperty("instanceprop1")
        )
      );
      instanceProperties.set(
        "My other instance property",
        new gd.PropertyDescriptor(
          instance.getRawFloatProperty("instanceprop2").toString()
        ).setType("number")
      );

      return instanceProperties;
    };

    const object = extension
      .addObject(
        "VideoObject",
        t("Video object for testing"),
        t("This video object does nothing"),
        "JsPlatform/Extensions/videoicon32.png",
        videoObject
      )
      .setIncludeFile("Extensions/Video/videoruntimeobject.js")
      .addIncludeFile("Extensions/Video/videoruntimeobject-pixi-renderer.js");

    object
      .addAction(
        "Play",
        t("Play an video"),
        t("Play an video"),
        t("Play the video on my object : _PARAM0_"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", "Choose an object video", "", false)
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/Video/videotools.js")
      .setFunctionName("play");

    object
      .addAction(
        "Pause",
        t("Pause an video"),
        t("Pause an video"),
        t("Pause the video on my object : _PARAM0_"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", "Choose an object video", "", false)
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/Video/videotools.js")
      .setFunctionName("pause");

    object
      .addAction(
        "Loop",
        t("Loop an video"),
        t("Loop an video"),
        t("Loop the video on my object : _PARAM0_ is on _PARAM1_"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", "Choose an object video", "", false)
      .addParameter("yesorno", t("Loop or not"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("loop");

      /*
      t("Le titre peut etre ?")

      .addParameter("object", t("Object"), "VideoObject", false) // This parameter is mandatory for any object action/condition
      .addParameter("expression", t("Number 1"), "", false)
      .addParameter("string", t("Text 1"), "", false)
      
      */
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
  runExtensionSanityTests: function(gd, extension) { return []; },
  /**
   * Register editors for objects.
   * 
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */

  registerEditorConfigurations: function(objectsEditorService) {
    objectsEditorService.registerEditorConfiguration(
      "Video::VideoObject",
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor()
    );
  },
  /**
   * Register renderers for instance of objects on the scene editor.
   * 
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerInstanceRenderers: function(objectsRenderingService) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const PIXI = objectsRenderingService.PIXI;

    /**
     * Renderer for instances of VideoObject inside the IDE.
     *
     * @extends RenderedInstance
     * @class RenderedVideoObjectInstance
     * @constructor
     */
    function RenderedVideoObjectInstance(
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

    
       //TODO
       /*
        si la video n'est pas chargé mettre un placeholder fichier non trouver / ou erreur
       */
       
       
      // create a video texture from a path
      var textureVideo = new PIXI.Texture.fromVideo('C:/Users/RTX-Bouh/Desktop/test_video_GD.mp4');
      
      //TODO fonctionne pas
      /*
      * Souhaite un check de textureVideo si elle est chargé on continue sinon on charge un placeholder error
      * Verif avec un isloaded ?
      */
      if(!textureVideo){
        var textureVideo = new PIXI.Texture.fromImage('C:/Users/RTX-Bouh/Desktop/video.svg');
      }
      
      //Setup the PIXI object:
      this._pixiObject = new PIXI.Sprite(textureVideo);
      this._pixiObject.anchor.x = 0.5;
      this._pixiObject.anchor.y = 0.5;
      this._pixiContainer.addChild(this._pixiObject);
      this.update();
    }
    RenderedVideoObjectInstance.prototype = Object.create(
      RenderedInstance.prototype
    );

    /**
     * Return the path to the thumbnail of the specified object.
     */
    RenderedVideoObjectInstance.getThumbnail = function(
      project,
      resourcesLoader,
      object
    ) {
      return "JsPlatform/Extensions/videoicon24.png";
    };

    /**
     * This is called to update the PIXI object on the scene editor
     */
    RenderedVideoObjectInstance.prototype.update = function() {
       
       //Stop video in IDE
       if(!this._pixiObject._texture.baseTexture.source.paused){
         //TODO
         //Add promise HERE for avoid error in IDE
        
        
        var promise = this._pixiObject._texture.baseTexture.source.pause();

        if (promise !== undefined) {
          promise.then(_ => {
            // Autoplay started!
            console.log("action pause > play !");
            //this._pixiObject._texture.baseTexture.source.pause();
          }).catch(error => {
            // Autoplay was prevented.
            console.log("action pause > pause !");
            //this._pixiObject._texture.baseTexture.source.play();
            // Show a "Play" button so that user can start playback.
          });
        }


       }
        
      // Read a property from the object
      const property1Value = this._associatedObject
        .getProperties(this.project)
        .get("My first property")
        .getValue();
      this._pixiObject.text = property1Value;

      // Read position and angle from the instance
      this._pixiObject.position.x =
        this._instance.getX() + this._pixiObject.width / 2;
      this._pixiObject.position.y =
        this._instance.getY() + this._pixiObject.height / 2;
      this._pixiObject.rotation = RenderedInstance.toRad(
        this._instance.getAngle()
      );
      
      if(this._instance.hasCustomSize()){
        this._pixiObject.width = this._instance.getCustomWidth();
        this._pixiObject.height = this._instance.getCustomHeight();
      }
    };

    /**
     * Return the width of the instance, when it's not resized.
     */
    RenderedVideoObjectInstance.prototype.getDefaultWidth = function() {
      return this._pixiObject.width;
    };

    /**
     * Return the height of the instance, when it's not resized.
     */
    RenderedVideoObjectInstance.prototype.getDefaultHeight = function() {
      return this._pixiObject.height;
    };

    /**
     * This is called when instance is removed on the scene editor.
     */
    RenderedVideoObjectInstance.prototype.instanceRemovedFromScene = function() {
      RenderedInstance.prototype.instanceRemovedFromScene.call(this);
      this._pixiObject._texture.baseTexture.source.pause();
    };

    objectsRenderingService.registerInstanceRenderer(
      "Video::VideoObject",
      RenderedVideoObjectInstance
    );
  }
};
