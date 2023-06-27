// @flow
import { Trans, t } from '@lingui/macro';
import React from 'react';
import FlatButton from '../../../../UI/FlatButton';
import EmptyMessage from '../../../../UI/EmptyMessage';
import { Line, Column } from '../../../../UI/Grid';
import { mapFor } from '../../../../Utils/MapFor';
import PolygonsList from './PolygonsList';
import CollisionMasksPreview from './CollisionMasksPreview';
import ImagePreview, {
  isProjectImageResourceSmooth,
} from '../../../../ResourcesList/ResourcePreview/ImagePreview';
import {
  getCurrentElements,
  allSpritesHaveSameCollisionMasksAs,
  copyAnimationsSpriteCollisionMasks,
} from '../Utils/SpriteObjectHelper';
import SpriteSelector from '../Utils/SpriteSelector';
import Window from '../../../../Utils/Window';
import every from 'lodash/every';
import ResourcesLoader from '../../../../ResourcesLoader';
import useForceUpdate from '../../../../Utils/UseForceUpdate';
import EditorMosaic, {
  type Editor,
  type EditorMosaicNode,
} from '../../../../UI/EditorMosaic';
import { useResponsiveWindowWidth } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import Paper from '../../../../UI/Paper';
import ScrollView from '../../../../UI/ScrollView';
import useAlertDialog from '../../../../UI/Alert/useAlertDialog';
const gd: libGDevelop = global.gd;

const styles = {
  leftContainer: {
    display: 'flex',
    overflow: 'hidden', // Ensure large images are not overflowing the other panel.
    flexDirection: 'column', // Ensure the panel provides a scroll bar if needed.
  },
  rightContainer: {
    display: 'flex',
  },
};

const horizontalMosaicNodes: EditorMosaicNode = {
  direction: 'row',
  first: 'preview',
  second: 'properties',
  splitPercentage: 66.67,
};

const verticalMosaicNodes: EditorMosaicNode = {
  direction: 'column',
  first: 'preview',
  second: 'properties',
  splitPercentage: 50,
};

type Props = {|
  objectConfiguration: gdSpriteObject,
  resourcesLoader: typeof ResourcesLoader,
  project: gdProject,
  onMasksUpdated?: () => void,
  onCreateMatchingSpriteCollisionMask: () => Promise<void>,
|};

const CollisionMasksEditor = ({
  objectConfiguration,
  resourcesLoader,
  project,
  onMasksUpdated,
  onCreateMatchingSpriteCollisionMask,
}: Props) => {
  const [animationIndex, setAnimationIndex] = React.useState(0);
  const [directionIndex, setDirectionIndex] = React.useState(0);
  const [spriteIndex, setSpriteIndex] = React.useState(0);
  const [
    highlightedVerticePtr,
    setHighlightedVerticePtr,
  ] = React.useState<?number>(null);
  const [selectedVerticePtr, setSelectedVerticePtr] = React.useState<?number>(
    null
  );

  const [spriteWidth, setSpriteWidth] = React.useState(0);
  const [spriteHeight, setSpriteHeight] = React.useState(0);
  const forceUpdate = useForceUpdate();

  const { showConfirmation } = useAlertDialog();

  const spriteConfiguration = gd.asSpriteConfiguration(objectConfiguration);
  const { animation, sprite } = getCurrentElements(
    spriteConfiguration,
    animationIndex,
    directionIndex,
    spriteIndex
  );

  // Note: sprite should always be defined so this value will be correctly initialised.
  const [
    sameCollisionMasksForAnimations,
    setSameCollisionMasksForAnimations,
  ] = React.useState(
    sprite
      ? every(
          mapFor(0, spriteConfiguration.getAnimationsCount(), i => {
            const otherAnimation = spriteConfiguration.getAnimation(i);
            return allSpritesHaveSameCollisionMasksAs(sprite, otherAnimation);
          })
        )
      : false
  );

  // Note: sprite & animation should always be defined so this value will be correctly initialised.
  const [
    sameCollisionMasksForSprites,
    setSameCollisionMasksForSprites,
  ] = React.useState(
    sprite && animation
      ? allSpritesHaveSameCollisionMasksAs(sprite, animation)
      : false
  );

  const updateCollisionMasks = React.useCallback(
    (sameCollisionMasksForAnimations, sameCollisionMasksForSprites) => {
      if (animation && sprite) {
        if (sameCollisionMasksForAnimations) {
          mapFor(0, spriteConfiguration.getAnimationsCount(), i => {
            const otherAnimation = spriteConfiguration.getAnimation(i);
            copyAnimationsSpriteCollisionMasks(sprite, otherAnimation);
          });
        } else if (sameCollisionMasksForSprites) {
          copyAnimationsSpriteCollisionMasks(sprite, animation);
        }
      }

      forceUpdate(); // Refresh the preview and the list
      if (onMasksUpdated) onMasksUpdated();
    },
    [animation, sprite, spriteConfiguration, forceUpdate, onMasksUpdated]
  );

  const chooseAnimation = index => {
    setAnimationIndex(index);
    setDirectionIndex(0);
    setSpriteIndex(0);
  };

  const chooseDirection = index => {
    setDirectionIndex(index);
    setSpriteIndex(0);
  };

  const chooseSprite = index => {
    setSpriteIndex(index);
  };

  // When an animation or sprite is changed, recompute if all collision masks are the same
  // to enable the toggle.
  // Note: we do not recompute if all animations have the same collision masks, as we consider
  // that if the user has enabled/disabled this, they want to keep it that way.
  React.useEffect(
    () => {
      if (!animation || !sprite) return;

      setSameCollisionMasksForSprites(
        allSpritesHaveSameCollisionMasksAs(sprite, animation)
      );
    },
    [animation, sprite]
  );

  const onSetFullImageCollisionMask = React.useCallback(
    async (fullImage: boolean = true) => {
      if (!sprite) return;
      if (fullImage) {
        const result = await showConfirmation({
          title: 'Use full image collision mask?',
          message: t`
            You will lose all custom collision masks. Do you want to continue?`,
          confirmButtonLabel: 'Use full image',
          dismissButtonLabel: 'Cancel',
        });
        if (!result) return;
        // Revert to non-automatic collision mask.
        spriteConfiguration.setAdaptCollisionMaskAutomatically(false);
      }
      console.log('setting to full image collision mask', fullImage);
      sprite.setFullImageCollisionMask(fullImage);
      updateCollisionMasks(
        sameCollisionMasksForAnimations,
        sameCollisionMasksForSprites
      );
    },
    [
      sprite,
      updateCollisionMasks,
      sameCollisionMasksForAnimations,
      sameCollisionMasksForSprites,
      spriteConfiguration,
      showConfirmation,
    ]
  );

  const setSameCollisionMasksForAllAnimations = React.useCallback(
    (enable: boolean) => {
      if (enable) {
        const answer = Window.showConfirmDialog(
          "Having the same collision masks for all animations will erase and reset all the other animations collision masks. This can't be undone. Are you sure you want to share these collision masks amongst all the animations of the object?"
        );
        if (!answer) return;
      }

      const newSameCollisionMasksForAnimationsValue = enable;
      const newSameCollisionMasksForSpritesValue =
        enable || sameCollisionMasksForSprites;

      setSameCollisionMasksForAnimations(
        newSameCollisionMasksForAnimationsValue
      );
      setSameCollisionMasksForSprites(newSameCollisionMasksForSpritesValue);
      updateCollisionMasks(
        newSameCollisionMasksForAnimationsValue,
        newSameCollisionMasksForSpritesValue
      );
    },
    [sameCollisionMasksForSprites, updateCollisionMasks]
  );

  const setSameCollisionMasksForAllSprites = React.useCallback(
    (enable: boolean) => {
      if (enable) {
        const answer = Window.showConfirmDialog(
          "Having the same collision masks for all animations will erase and reset all the other animations collision masks. This can't be undone. Are you sure you want to share these collision masks amongst all the animations of the object?"
        );
        if (!answer) return;
      }

      const newSameCollisionMasksForAnimationsValue =
        enable && sameCollisionMasksForAnimations;
      const newSameCollisionMasksForSpritesValue = enable;

      setSameCollisionMasksForAnimations(
        newSameCollisionMasksForAnimationsValue
      );
      setSameCollisionMasksForSprites(newSameCollisionMasksForSpritesValue);
      updateCollisionMasks(
        newSameCollisionMasksForAnimationsValue,
        newSameCollisionMasksForSpritesValue
      );
    },
    [sameCollisionMasksForAnimations, updateCollisionMasks]
  );

  const setCurrentSpriteSize = (spriteWidth: number, spriteHeight: number) => {
    setSpriteWidth(spriteWidth);
    setSpriteHeight(spriteHeight);
  };

  const onSetAutomaticallyAdaptCollisionMasks = React.useCallback(
    async value => {
      // If enabling automatic while custom was selected, then ask for confirmation.
      if (value && sprite && !sprite.isFullImageCollisionMask()) {
        const result = await showConfirmation({
          title: 'Adapt collision mask?',
          message: t`
            You will lose all custom collision masks. Do you want to continue?`,
          confirmButtonLabel: 'Adapt automatically',
          dismissButtonLabel: 'Cancel',
        });
        if (!result) return;
      }

      spriteConfiguration.setAdaptCollisionMaskAutomatically(value);

      // Recompute collision mask when enabling automatic, and enable same masks for all animations & sprites.
      if (value) {
        onCreateMatchingSpriteCollisionMask();
        setSameCollisionMasksForAnimations(true);
        setSameCollisionMasksForSprites(true);
      }
      forceUpdate();
    },
    [
      spriteConfiguration,
      forceUpdate,
      onCreateMatchingSpriteCollisionMask,
      showConfirmation,
      sprite,
    ]
  );

  const onPolygonsUpdated = React.useCallback(
    () => {
      // Revert to non-automatic collision mask.
      spriteConfiguration.setAdaptCollisionMaskAutomatically(false);
      updateCollisionMasks(
        sameCollisionMasksForAnimations,
        sameCollisionMasksForSprites
      );
    },
    [
      spriteConfiguration,
      updateCollisionMasks,
      sameCollisionMasksForAnimations,
      sameCollisionMasksForSprites,
    ]
  );

  console.log(sprite.isFullImageCollisionMask());

  // Keep panes vertical for small screens, side-by-side for large screens
  const screenSize = useResponsiveWindowWidth();
  const editorNodes =
    screenSize === 'small' ? verticalMosaicNodes : horizontalMosaicNodes;

  if (!objectConfiguration.getAnimationsCount()) return null;
  const resourceName = sprite ? sprite.getImageName() : '';

  const editors: { [string]: Editor } = {
    preview: {
      type: 'primary',
      noTitleBar: true,
      renderEditor: () => (
        <Paper background="medium" style={styles.leftContainer} square>
          <Column expand noMargin useFullHeight>
            <ImagePreview
              resourceName={resourceName}
              imageResourceSource={resourcesLoader.getResourceFullUrl(
                project,
                resourceName,
                {}
              )}
              isImageResourceSmooth={isProjectImageResourceSmooth(
                project,
                resourceName
              )}
              onSize={setCurrentSpriteSize}
              renderOverlay={overlayProps =>
                sprite && (
                  <CollisionMasksPreview
                    {...overlayProps}
                    isDefaultBoundingBox={sprite.isFullImageCollisionMask()}
                    polygons={sprite.getCustomCollisionMask()}
                    onPolygonsUpdated={onPolygonsUpdated}
                    highlightedVerticePtr={highlightedVerticePtr}
                    selectedVerticePtr={selectedVerticePtr}
                    onClickVertice={setSelectedVerticePtr}
                  />
                )
              }
            />
          </Column>
        </Paper>
      ),
    },
    properties: {
      type: 'secondary',
      noTitleBar: true,
      renderEditor: () => (
        <Paper background="medium" style={styles.rightContainer} square>
          <Column expand noMargin>
            <Line>
              <Column expand>
                <SpriteSelector
                  spriteConfiguration={spriteConfiguration}
                  animationIndex={animationIndex}
                  directionIndex={directionIndex}
                  spriteIndex={spriteIndex}
                  chooseAnimation={chooseAnimation}
                  chooseDirection={chooseDirection}
                  chooseSprite={chooseSprite}
                  sameForAllAnimations={sameCollisionMasksForAnimations}
                  sameForAllSprites={sameCollisionMasksForSprites}
                  automaticallyAdapt={spriteConfiguration.adaptCollisionMaskAutomatically()}
                  setAutomaticallyAdapt={onSetAutomaticallyAdaptCollisionMasks}
                  setSameForAllAnimations={
                    setSameCollisionMasksForAllAnimations
                  }
                  setSameForAllSprites={setSameCollisionMasksForAllSprites}
                  setSameForAllAnimationsLabel={
                    <Trans>Share same collision masks for all animations</Trans>
                  }
                  setSameForAllSpritesLabel={
                    <Trans>
                      Share same collision masks for all sprites of this
                      animation
                    </Trans>
                  }
                  setAutomaticallyAdaptLabel={
                    <Trans>
                      Automatically adapt collision mask based on first
                      animation frames
                    </Trans>
                  }
                />
              </Column>
            </Line>
            <ScrollView>
              {!!sprite && !sprite.isFullImageCollisionMask() && (
                <React.Fragment>
                  <PolygonsList
                    polygons={sprite.getCustomCollisionMask()}
                    onPolygonsUpdated={onPolygonsUpdated}
                    setFullImageCollisionMask={() =>
                      onSetFullImageCollisionMask(true)
                    }
                    onHoverVertice={setHighlightedVerticePtr}
                    onClickVertice={setSelectedVerticePtr}
                    selectedVerticePtr={selectedVerticePtr}
                    spriteWidth={spriteWidth}
                    spriteHeight={spriteHeight}
                  />
                </React.Fragment>
              )}
              {!!sprite && sprite.isFullImageCollisionMask() && (
                <React.Fragment>
                  <EmptyMessage>
                    <Trans>
                      This sprite uses the default collision mask, a rectangle
                      that is as large as the sprite.
                    </Trans>
                  </EmptyMessage>
                  <Line justifyContent="center">
                    <FlatButton
                      label={<Trans>Use a custom collision mask</Trans>}
                      primary={false}
                      onClick={() => onSetFullImageCollisionMask(false)}
                    />
                  </Line>
                </React.Fragment>
              )}
              {!sprite && (
                <EmptyMessage>
                  <Trans>
                    Choose an animation and frame to edit the collision masks
                  </Trans>
                </EmptyMessage>
              )}
            </ScrollView>
          </Column>
        </Paper>
      ),
    },
  };

  return (
    <div style={{ flex: 1 }}>
      <EditorMosaic editors={editors} initialNodes={editorNodes} />
    </div>
  );
};

export default CollisionMasksEditor;
