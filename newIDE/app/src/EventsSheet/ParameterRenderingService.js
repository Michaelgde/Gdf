// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import {
  type ParameterInlineRenderer,
  type ParameterInlineRendererProps,
} from './ParameterFields/ParameterInlineRenderer.flow';
import DefaultField, {
  renderInlineDefaultField,
} from './ParameterFields/DefaultField';
import RelationalOperatorField, {
  renderInlineRelationalOperator,
} from './ParameterFields/RelationalOperatorField';
import OperatorField, {
  renderInlineOperator,
} from './ParameterFields/OperatorField';
import MouseField, { renderInlineMouse } from './ParameterFields/MouseField';
import KeyField, { renderInlineKey } from './ParameterFields/KeyField';
import ObjectField, {
  renderInlineObjectWithThumbnail,
} from './ParameterFields/ObjectField';
import YesNoField, { renderInlineYesNo } from './ParameterFields/YesNoField';
import TrueFalseField, {
  renderInlineTrueFalse,
} from './ParameterFields/TrueFalseField';
import ExpressionField from './ParameterFields/ExpressionField';
import StringField from './ParameterFields/StringField';
import StringWithSelectorField from './ParameterFields/StringWithSelectorField';
import BehaviorField from './ParameterFields/BehaviorField';
import SceneVariableField, {
  renderInlineSceneVariable,
} from './ParameterFields/SceneVariableField';
import GlobalVariableField, {
  renderInlineGlobalVariable,
} from './ParameterFields/GlobalVariableField';
import ObjectVariableField, {
  renderInlineObjectVariable,
} from './ParameterFields/ObjectVariableField';
import LayerField from './ParameterFields/LayerField';
import AudioResourceField from './ParameterFields/AudioResourceField';
import VideoResourceField from './ParameterFields/VideoResourceField';
import JsonResourceField from './ParameterFields/JsonResourceField';
import ColorExpressionField from './ParameterFields/ColorExpressionField';
import ForceMultiplierField, {
  renderInlineForceMultiplier,
} from './ParameterFields/ForceMultiplierField';
import SceneNameField from './ParameterFields/SceneNameField';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
const gd = global.gd;

const components = {
  default: DefaultField,
  mouse: MouseField,
  object: ObjectField,
  relationalOperator: RelationalOperatorField,
  operator: OperatorField,
  yesorno: YesNoField,
  trueorfalse: TrueFalseField,
  expression: ExpressionField,
  string: StringField,
  stringWithSelector: StringWithSelectorField,
  behavior: BehaviorField,
  scenevar: SceneVariableField,
  globalvar: GlobalVariableField,
  objectvar: ObjectVariableField,
  layer: LayerField,
  key: KeyField,
  file: DefaultField, //TODO
  musicfile: AudioResourceField,
  soundfile: AudioResourceField,
  videoResource: VideoResourceField,
  jsonResource: JsonResourceField,
  color: ColorExpressionField,
  police: DefaultField, //TODO
  joyaxis: DefaultField, //TODO
  forceMultiplier: ForceMultiplierField,
  sceneName: SceneNameField,
};
const inlineRenderers: { [string]: ParameterInlineRenderer } = {
  default: renderInlineDefaultField,
  forceMultiplier: renderInlineForceMultiplier,
  globalvar: renderInlineGlobalVariable,
  scenevar: renderInlineSceneVariable,
  objectvar: renderInlineObjectVariable,
  key: renderInlineKey,
  mouse: renderInlineMouse,
  object: renderInlineObjectWithThumbnail,
  yesorno: renderInlineYesNo,
  trueorfalse: renderInlineTrueFalse,
  operator: renderInlineOperator,
  relationalOperator: renderInlineRelationalOperator,
};
const userFriendlyTypeName: { [string]: MessageDescriptor } = {
  mouse: t`Mouse button`,
  object: t`Object`,
  relationalOperator: t`Relational operator`,
  operator: t`Operator`,
  yesorno: t`Yes or No`,
  trueorfalse: t`True or False`,
  expression: t`Number`,
  string: t`String`,
  stringWithSelector: t`String`,
  behavior: t`Behavior`,
  scenevar: t`Scene variable`,
  globalvar: t`Global variable`,
  objectvar: t`Object variable`,
  layer: t`Layer`,
  key: t`Keyboard key`,
  musicfile: t`Audio resource`,
  soundfile: t`Audio resource`,
  videoResource: t`Video resource`,
  jsonResource: t`JSON resource`,
  color: t`Color`,
  forceMultiplier: t`Instant or permanent force`,
  sceneName: t`Scene name`,
};

export default {
  components,
  getParameterComponent: (rawType: string) => {
    const fieldType = gd.ParameterMetadata.isObject(rawType)
      ? 'object'
      : rawType;

    if (components.hasOwnProperty(fieldType)) return components[fieldType];
    else return components.default;
  },
  renderInlineParameter: (props: ParameterInlineRendererProps): React.Node => {
    const rawType = props.parameterMetadata.getType();
    const fieldType = gd.ParameterMetadata.isObject(rawType)
      ? 'object'
      : rawType;

    const inlineRenderer =
      inlineRenderers[fieldType] || inlineRenderers.default;
    return inlineRenderer(props);
  },
  getUserFriendlyTypeName: (rawType: string): ?MessageDescriptor => {
    const fieldType = gd.ParameterMetadata.isObject(rawType)
      ? 'object'
      : rawType;

    return userFriendlyTypeName[fieldType] || null;
  },
};
