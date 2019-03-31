// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import { Column, Line, Spacer } from '../UI/Grid';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { mapVector } from '../Utils/MapFor';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import EmptyMessage from '../UI/EmptyMessage';
import IconMenu from '../UI/Menu/IconMenu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import {
  enumerateObjectTypes,
  type EnumeratedObjectMetadata,
} from '../ObjectsList/EnumerateObjects';
import HelpButton from '../UI/HelpButton';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import MiniToolbar, { MiniToolbarText } from '../UI/MiniToolbar';
import { showWarningBox } from '../UI/Messages/MessageBox';
import {
  type EnumeratedBehaviorMetadata,
  enumerateBehaviorsMetadata,
} from '../BehaviorsEditor/EnumerateBehaviorsMetadata';

const gd = global.gd;

type Props = {|
  project: gdProject,
  eventsFunction: gdEventsFunction,
  onParametersUpdated: () => void,
  helpPagePath?: string,
  onConfigurationUpdated?: () => void,
  freezeParameters?: boolean,
  noScroll?: boolean,
  freezeEventsFunctionType?: boolean,
|};

type State = {|
  objectMetadata: Array<EnumeratedObjectMetadata>,
  behaviorMetadata: Array<EnumeratedBehaviorMetadata>,
|};

const styles = {
  scrollView: {
    overflowY: 'scroll',
  },
  parametersContainer: {
    flex: 1,
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
};

const validateParameterName = (i18n: I18nType, newName: string) => {
  if (!gd.Project.validateObjectName(newName)) {
    showWarningBox(
      i18n._(
        t`This name contains forbidden characters: please only use alphanumeric characters (0-9, a-z) and underscores in your parameter name.`
      )
    );
    return false;
  }

  return true;
};

const getSentenceErrorText = (
  i18n: I18nType,
  eventsFunction: gdEventsFunction
) => {
  const sentence = eventsFunction.getSentence();
  if (!sentence)
    return i18n._(
      t`Enter the sentence that will be displayed in the events sheet`
    );

  const missingParameters = mapVector(
    eventsFunction.getParameters(),
    (_, index) => {
      const expectedString = `_PARAM${index + 1}_`;
      if (sentence.indexOf(expectedString) === -1) return expectedString;

      return null;
    }
  ).filter(Boolean);

  if (missingParameters.length) {
    return (
      i18n._(t`The sentence is missing this/these parameter(s):`) +
      missingParameters.join(', ')
    );
  }

  return undefined;
};

export default class EventsFunctionConfigurationEditor extends React.Component<
  Props,
  State
> {
  state = { objectMetadata: [], behaviorMetadata: [] };

  componentDidMount() {
    this.setState({
      objectMetadata: enumerateObjectTypes(this.props.project),
      behaviorMetadata: enumerateBehaviorsMetadata(
        this.props.project.getCurrentPlatform(),
        this.props.project
      ),
    });
  }

  _addParameter = () => {
    const { eventsFunction } = this.props;
    const parameters = eventsFunction.getParameters();

    const newParameter = new gd.ParameterMetadata();
    newParameter.setType('objectList');
    parameters.push_back(newParameter);
    newParameter.delete();
    this.forceUpdate();
    this.props.onParametersUpdated();
  };

  _removeParameter = (index: number) => {
    const { eventsFunction } = this.props;
    const parameters = eventsFunction.getParameters();

    gd.removeFromVectorParameterMetadata(parameters, index);
    this.forceUpdate();
    this.props.onParametersUpdated();
  };

  render() {
    const { objectMetadata, behaviorMetadata } = this.state;
    const {
      eventsFunction,
      freezeEventsFunctionType,
      onConfigurationUpdated,
      freezeParameters,
      helpPagePath,
      noScroll,
    } = this.props;

    const parameters = eventsFunction.getParameters();
    const type = eventsFunction.getFunctionType();

    return (
      <I18n>
        {({ i18n }) => (
          <Column noMargin>
            <div style={noScroll ? undefined : styles.scrollView}>
              <Column>
                <Line alignItems="center">
                  <img src="res/function32.png" alt="" style={styles.icon} />
                  <SelectField
                    value={type}
                    disabled={!!freezeEventsFunctionType}
                    onChange={(e, i, value) => {
                      eventsFunction.setFunctionType(value);
                      if (onConfigurationUpdated) onConfigurationUpdated();
                      this.forceUpdate();
                    }}
                  >
                    <MenuItem
                      value={gd.EventsFunction.Action}
                      primaryText={<Trans>Action</Trans>}
                    />
                    <MenuItem
                      value={gd.EventsFunction.Condition}
                      primaryText={<Trans>Condition</Trans>}
                    />
                    <MenuItem
                      value={gd.EventsFunction.Expression}
                      primaryText={<Trans>Expression</Trans>}
                    />
                    <MenuItem
                      value={gd.EventsFunction.StringExpression}
                      primaryText={<Trans>String Expression</Trans>}
                    />
                  </SelectField>
                  <SemiControlledTextField
                    commitOnBlur
                    hintText={<Trans>Full name displayed in editor</Trans>}
                    value={eventsFunction.getFullName()}
                    onChange={text => {
                      eventsFunction.setFullName(text);
                      if (onConfigurationUpdated) onConfigurationUpdated();
                      this.forceUpdate();
                    }}
                  />
                </Line>
                <Line noMargin>
                  <SemiControlledTextField
                    commitOnBlur
                    hintText={<Trans>Description, displayed in editor</Trans>}
                    fullWidth
                    multiLine
                    value={eventsFunction.getDescription()}
                    onChange={text => {
                      eventsFunction.setDescription(text);
                      if (onConfigurationUpdated) onConfigurationUpdated();
                      this.forceUpdate();
                    }}
                  />
                </Line>
                <Line>
                  {type === gd.EventsFunction.Action ||
                  type === gd.EventsFunction.Condition ? (
                    <SemiControlledTextField
                      commitOnBlur
                      hintText={
                        <Trans>
                          Sentence in Events Sheet (write _PARAMx_ for
                          parameters, e.g: _PARAM1_)
                        </Trans>
                      }
                      fullWidth
                      value={eventsFunction.getSentence()}
                      onChange={text => {
                        eventsFunction.setSentence(text);
                        if (onConfigurationUpdated) onConfigurationUpdated();
                        this.forceUpdate();
                      }}
                      errorText={getSentenceErrorText(i18n, eventsFunction)}
                    />
                  ) : null}
                </Line>
              </Column>
              <Line noMargin>
                <div style={styles.parametersContainer}>
                  {mapVector(
                    parameters,
                    (parameter: gdParameterMetadata, i: number) => (
                      <React.Fragment key={i}>
                        <MiniToolbar>
                          <MiniToolbarText>
                            <Trans>Parameter #{i + 1}:</Trans>
                          </MiniToolbarText>
                          <Column expand noMargin>
                            <SemiControlledTextField
                              commitOnBlur
                              hintText={<Trans>Enter the parameter name</Trans>}
                              value={parameter.getName()}
                              onChange={text => {
                                if (!validateParameterName(i18n, text)) return;

                                parameter.setName(text);
                                this.forceUpdate();
                                this.props.onParametersUpdated();
                              }}
                              disabled={!!freezeParameters}
                            />
                          </Column>
                          <IconMenu
                            iconButtonElement={
                              <IconButton>
                                <MoreVertIcon />
                              </IconButton>
                            }
                            buildMenuTemplate={() => [
                              {
                                label: i18n._(t`Delete`),
                                enabled: !freezeParameters,
                                click: () => this._removeParameter(i),
                              },
                            ]}
                          />
                        </MiniToolbar>
                        <Line expand noMargin>
                          <Column expand>
                            <SelectField
                              floatingLabelText={<Trans>Type</Trans>}
                              value={parameter.getType()}
                              onChange={(e, i, value) => {
                                parameter.setType(value);
                                this.forceUpdate();
                                this.props.onParametersUpdated();
                              }}
                              disabled={!!freezeParameters}
                              fullWidth
                            >
                              <MenuItem
                                value="objectList"
                                primaryText={<Trans>Objects</Trans>}
                              />
                              <MenuItem
                                value="behavior"
                                primaryText={
                                  <Trans>
                                    Behavior (for the previous object)
                                  </Trans>
                                }
                              />
                              <MenuItem
                                value="expression"
                                primaryText={<Trans>Number</Trans>}
                              />
                              <MenuItem
                                value="string"
                                primaryText={<Trans>String (text)</Trans>}
                              />
                              <MenuItem
                                value="key"
                                primaryText={<Trans>Keyboard Key (text)</Trans>}
                              />
                              <MenuItem
                                value="mouse"
                                primaryText={<Trans>Mouse button (text)</Trans>}
                              />
                            </SelectField>
                          </Column>
                          {parameter.getType() === 'objectList' && (
                            <Column expand>
                              <SelectField
                                floatingLabelText={<Trans>Object type</Trans>}
                                floatingLabelFixed
                                value={parameter.getExtraInfo()}
                                onChange={(e, i, value) => {
                                  parameter.setExtraInfo(value);
                                  this.forceUpdate();
                                  this.props.onParametersUpdated();
                                }}
                                disabled={!!freezeParameters}
                                fullWidth
                              >
                                <MenuItem
                                  value=""
                                  primaryText={<Trans>Any object</Trans>}
                                />
                                {objectMetadata.map(
                                  (metadata: EnumeratedObjectMetadata) => {
                                    if (metadata.name === '') {
                                      // Base object is an "abstract" object
                                      return null;
                                    }

                                    return (
                                      <MenuItem
                                        key={metadata.name}
                                        value={metadata.name}
                                        primaryText={metadata.fullName}
                                      />
                                    );
                                  }
                                )}
                              </SelectField>
                            </Column>
                          )}
                          {parameter.getType() === 'behavior' && (
                            <Column expand>
                              <SelectField
                                floatingLabelText={<Trans>Behavior type</Trans>}
                                floatingLabelFixed
                                value={parameter.getExtraInfo()}
                                onChange={(e, i, value) => {
                                  parameter.setExtraInfo(value);
                                  this.forceUpdate();
                                  this.props.onParametersUpdated();
                                }}
                                disabled={!!freezeParameters}
                                fullWidth
                              >
                                {behaviorMetadata.map(
                                  (metadata: EnumeratedBehaviorMetadata) => (
                                    <MenuItem
                                      key={metadata.type}
                                      value={metadata.type}
                                      primaryText={metadata.fullName}
                                    />
                                  )
                                )}
                              </SelectField>
                            </Column>
                          )}
                        </Line>
                        <Line expand noMargin>
                          <Column expand>
                            <SemiControlledTextField
                              commitOnBlur
                              floatingLabelText={<Trans>Description</Trans>}
                              floatingLabelFixed
                              value={parameter.getDescription()}
                              onChange={text => {
                                parameter.setDescription(text);
                                this.forceUpdate();
                              }}
                              fullWidth
                            />
                          </Column>
                        </Line>
                      </React.Fragment>
                    )
                  )}
                  {parameters.size() === 0 ? (
                    <EmptyMessage>
                      <Trans>No parameters for this function.</Trans>
                    </EmptyMessage>
                  ) : null}
                  <Line justifyContent="space-between">
                    {helpPagePath ? (
                      <Column>
                        <HelpButton helpPagePath={helpPagePath} />
                      </Column>
                    ) : (
                      <Spacer />
                    )}
                    {!freezeParameters && (
                      <Column>
                        <FlatButton
                          label={<Trans>Add a parameter</Trans>}
                          onClick={this._addParameter}
                        />
                      </Column>
                    )}
                  </Line>
                </div>
              </Line>
            </div>
          </Column>
        )}
      </I18n>
    );
  }
}
