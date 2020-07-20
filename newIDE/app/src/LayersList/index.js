// @flow
import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import newNameGenerator from '../Utils/NewNameGenerator';
import { mapReverseFor } from '../Utils/MapFor';
import LayerRow from './LayerRow';
import BackgroundColorRow from './BackgroundColorRow';
import { Column, Line, Spacer } from '../UI/Grid';
import Add from '@material-ui/icons/Add';
import RaisedButton from '../UI/RaisedButton';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import ScrollView from '../UI/ScrollView';
import { FullSizeMeasurer } from '../UI/FullSizeMeasurer';
import Background from '../UI/Background';

const SortableLayerRow = SortableElement(LayerRow);

type LayersListBodyState = {|
  nameErrors: { [string]: boolean },
|};

class LayersListBody extends Component<*, LayersListBodyState> {
  state = {
    nameErrors: {},
  };

  _onLayerModified = () => {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.forceUpdate();
  };

  render() {
    const {
      layersContainer,
      onEditEffects,
      onEditLighting,
      width,
    } = this.props;

    const layersCount = layersContainer.getLayersCount();
    const containerLayersList = mapReverseFor(0, layersCount, i => {
      const layer = layersContainer.getLayerAt(i);
      const layerName = layer.getName();
      const isLightingLayer = layer.isLightingLayer();

      return (
        <SortableLayerRow
          index={layersCount - 1 - i}
          key={'layer-' + layerName}
          layer={layer}
          layerName={layerName}
          isLightingLayer={isLightingLayer}
          nameError={this.state.nameErrors[layerName]}
          effectsCount={layer.getEffectsCount()}
          onEditEffects={() => onEditEffects(layer)}
          onEditLighting={() => onEditLighting(layer)}
          onBlur={event => {
            const newName = event.target.value;
            if (layerName === newName) return;

            let success = true;
            if (layersContainer.hasLayerNamed(newName)) {
              success = false;
            } else {
              this.props.onRenameLayer(layerName, newName, doRename => {
                if (doRename)
                  layersContainer.getLayer(layerName).setName(newName);
              });
            }

            this.setState({
              nameErrors: {
                ...this.state.nameErrors,
                [layerName]: !success,
              },
            });
          }}
          onRemove={() => {
            this.props.onRemoveLayer(layerName, doRemove => {
              if (!doRemove) return;

              layersContainer.removeLayer(layerName);
              this._onLayerModified();
            });
          }}
          isVisible={layer.getVisibility()}
          onChangeVisibility={visible => {
            layer.setVisibility(visible);
            this._onLayerModified();
          }}
          width={width}
        />
      );
    });

    return (
      <Column noMargin expand>
        {containerLayersList}
        <BackgroundColorRow
          layout={layersContainer}
          onBackgroundColorChanged={() => this._onLayerModified()}
        />
      </Column>
    );
  }
}

const SortableLayersListBody = SortableContainer(LayersListBody);

type Props = {|
  project: gdProject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  layersContainer: gdLayout,
  onEditLayerEffects: (layer: ?gdLayer) => void,
  onEditLightingLayer: (layer: ?gdLayer) => void,
  onRemoveLayer: (layerName: string, cb: (done: boolean) => void) => void,
  onRenameLayer: (
    oldName: string,
    newName: string,
    cb: (done: boolean) => void
  ) => void,
  unsavedChanges?: ?UnsavedChanges,
|};

type State = {|
  effectsEditedLayer: ?gdLayer,
|};

const hasLightingLayer = (layout: gdLayout) => {
  const layersCount = layout.getLayersCount();
  let isLightingLayerPresent = false;
  mapReverseFor(0, layersCount, i => {
    const layer = layout.getLayerAt(i);
    if (layer.isLightingLayer()) isLightingLayerPresent = true;
  });
  return isLightingLayerPresent;
};

export default class LayersList extends Component<Props, State> {
  _addLayer = () => {
    const { layersContainer } = this.props;
    const name = newNameGenerator('Layer', name =>
      layersContainer.hasLayerNamed(name)
    );
    layersContainer.insertNewLayer(name, layersContainer.getLayersCount());
    this.onLayerModified();
  };

  _addLightingLayer = () => {
    const { layersContainer } = this.props;
    const name = newNameGenerator('Lighting', name =>
      layersContainer.hasLayerNamed(name)
    );
    layersContainer.insertNewLayer(name, layersContainer.getLayersCount());
    const layer = layersContainer.getLayer(name);
    layer.setLightingLayer(true);
    layer.setFollowBaseLayerCamera(true);
    layer.setAmbientLightColor(128, 128, 128);
    this.onLayerModified();
  };

  onLayerModified = () => {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.forceUpdate();
  };

  render() {
    // Force the list to be mounted again if layersContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = this.props.layersContainer.ptr;
    const isLightingLayerPresent = hasLightingLayer(this.props.layersContainer);

    return (
      <Background>
        <ScrollView autoHideScrollbar>
          <FullSizeMeasurer>
            {({ width }) => (
              // TODO: The list is costly to render when there are many layers, consider
              // using SortableVirtualizedItemList.
              <SortableLayersListBody
                key={listKey}
                layersContainer={this.props.layersContainer}
                onEditEffects={this.props.onEditLayerEffects}
                onEditLighting={this.props.onEditLightingLayer}
                onRemoveLayer={this.props.onRemoveLayer}
                onRenameLayer={this.props.onRenameLayer}
                onSortEnd={({ oldIndex, newIndex }) => {
                  const layersCount = this.props.layersContainer.getLayersCount();
                  this.props.layersContainer.moveLayer(
                    layersCount - 1 - oldIndex,
                    layersCount - 1 - newIndex
                  );
                  this.onLayerModified();
                }}
                helperClass="sortable-helper"
                useDragHandle
                unsavedChanges={this.props.unsavedChanges}
                width={width}
              />
            )}
          </FullSizeMeasurer>
          <Column>
            <Line justifyContent="flex-end" expand>
              <RaisedButton
                label={<Trans>Add lighting layer</Trans>}
                primary
                disabled={isLightingLayerPresent}
                onClick={this._addLightingLayer}
                icon={<Add />}
              />
              <Spacer />
              <RaisedButton
                label={<Trans>Add a layer</Trans>}
                primary
                onClick={this._addLayer}
                icon={<Add />}
              />
            </Line>
          </Column>
        </ScrollView>
      </Background>
    );
  }
}
