namespace gdjs {
  const userFriendlyToHtmlInputTypes = {
    text: 'text',
    email: 'email',
    password: 'password',
    number: 'number',
    'telephone number': 'tel',
    url: 'url',
    search: 'search',
  };

  class TextInputRuntimeObjectPixiRenderer {
    private _object: gdjs.TextInputRuntimeObject;
    private _input: HTMLInputElement;
    private _runtimeScene: gdjs.RuntimeScene;
    private _runtimeGame: gdjs.RuntimeGame;

    constructor(runtimeObject: gdjs.TextInputRuntimeObject) {
      this._object = runtimeObject;
      this._runtimeScene = runtimeObject.getRuntimeScene();
      this._runtimeGame = this._runtimeScene.getGame();

      this._input = document.createElement('input');
      this._input.style.border = '1px solid black';
      this._input.style.borderRadius = '0px';
      this._input.style.background = 'white';
      this._input.style.position = 'absolute';

      this._input.addEventListener('input', () => {
        this._object.onRendererInputValueChanged(this._input.value);
      });
      this._input.addEventListener('touchstart', () => {
        // Focus directly when touching the input on touchscreens.
        this._input.focus();
      });

      this.updateValue();
      this.updateFont();
      this.updatePlaceholder();
      this.updateOpacity();
      this.updateInputType();

      this._runtimeGame
        .getRenderer()
        .getDomElementContainer()!
        .appendChild(this._input);
    }

    onDestroy() {
      const parentElement = this._input.parentElement;
      if (parentElement) parentElement.removeChild(this._input);
    }

    updatePreRender() {
      const layer = this._runtimeScene.getLayer(this._object.getLayer());
      const runtimeGame = this._runtimeScene.getGame();
      const runtimeGameRenderer = runtimeGame.getRenderer();
      const topLeftCanvasCoordinates = layer.convertInverseCoords(
        this._object.x,
        this._object.y,
        0
      );
      const bottomRightCanvasCoordinates = layer.convertInverseCoords(
        this._object.x + this._object.getWidth(),
        this._object.y + this._object.getHeight(),
        0
      );

      // Hide the input entirely if not visible at all
      const isOutsideCanvas =
        bottomRightCanvasCoordinates[0] < 0 ||
        bottomRightCanvasCoordinates[1] < 0 ||
        topLeftCanvasCoordinates[0] > runtimeGame.getGameResolutionWidth() ||
        topLeftCanvasCoordinates[1] > runtimeGame.getGameResolutionHeight();
      if (isOutsideCanvas) {
        this._input.style.display = 'none';
        return;
      }
      this._input.style.display = 'initial';

      // Position the input on the container on top of the canvas
      const topLeftPageCoordinates =
        runtimeGameRenderer.convertCanvasToDomElementContainerCoords(
          topLeftCanvasCoordinates
        );
      const bottomRightPageCoordinates =
        runtimeGameRenderer.convertCanvasToDomElementContainerCoords(
          bottomRightCanvasCoordinates
        );

      const widthInContainer =
        bottomRightPageCoordinates[0] - topLeftPageCoordinates[0];
      const heightInContainer =
        bottomRightPageCoordinates[1] - topLeftPageCoordinates[1];

      this._input.style.left = topLeftPageCoordinates[0] + 'px';
      this._input.style.top = topLeftPageCoordinates[1] + 'px';
      this._input.style.width = widthInContainer + 'px';
      this._input.style.height = heightInContainer + 'px';

      // Automatically adjust the font size to follow the game scale.
      this._input.style.fontSize =
        this._object.getFontSize() *
          runtimeGameRenderer.getCanvasToDomElementContainerHeightScale() +
        'px';
    }

    updateValue() {
      this._input.value = this._object.getValue();
    }

    updatePlaceholder() {
      this._input.placeholder = this._object.getPlaceholder();
    }

    updateFont() {
      this._input.style.fontFamily = this._runtimeScene
        .getGame()
        .getFontManager()
        .getFontFamily(this._object.getFontResourceName());
    }

    updateOpacity() {
      this._input.style.opacity = '' + this._object.getOpacity() / 255;
    }

    updateInputType() {
      const newType =
        userFriendlyToHtmlInputTypes[this._object.getInputType()] || 'text';
      this._input.setAttribute('type', newType);
    }
  }

  export const TextInputRuntimeObjectRenderer =
    TextInputRuntimeObjectPixiRenderer;
  export type TextInputRuntimeObjectRenderer =
    TextInputRuntimeObjectPixiRenderer;
}
