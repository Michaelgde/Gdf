// @flow

import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import ButtonBase from '@material-ui/core/ButtonBase';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { darken, lighten, useTheme } from '@material-ui/core/styles';

import { type AnswerData, type QuestionData } from './Questionnaire';
import { Column, Line, Spacer } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import TextField from '../../../../UI/TextField';
import Paper from '../../../../UI/Paper';
import InlineCheckbox from '../../../../UI/InlineCheckbox';
import RaisedButton from '../../../../UI/RaisedButton';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { ColumnStackLayout } from '../../../../UI/Layout';

const getColumnsFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 1;
    case 'medium':
      return 2;
    case 'large':
      return 3;
    case 'xlarge':
    default:
      return 4;
  }
};

const styles = {
  answerButton: {
    border: 'solid',
    borderWidth: 1,
    borderRadius: 8,
    width: '100%',
    height: '100%',
    display: 'flex',
  },
  answerButtonBackground: { width: '100%', height: '100%' },
  answerCoverImage: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    width: '100%',
  },
  answerCheckboxAnchor: { position: 'relative' },
  answerCheckboxContainer: {
    position: 'absolute',
    left: 5,
    top: 'calc(50% - 9px)',
  },
  answerTextContainer: { marginLeft: 25, marginRight: 25 },
  freeAnswerContent: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
  },
  freeAnswerInputOutline: {
    border: 'solid',
    borderWidth: 1,
    borderRadius: 4,
    flex: 1,
    padding: 8,
  },
};

type FreeAnswerProps = {|
  answerData: AnswerData,
  onSelect: string => void,
  selected: boolean,
  i18n: I18nType,
  showCheckbox: boolean,
  onClickSend?: string => void,
  value: string,
  onChange: string => void,
|};

const FreeAnswer = ({
  answerData,
  i18n,
  onSelect,
  selected,
  showCheckbox,
  onClickSend,
  value,
  onChange,
}: FreeAnswerProps) => {
  const { text, imageSource, code } = answerData;
  const [errorText, setErrorText] = React.useState<React.Node>(null);
  const muiTheme = useTheme();
  const borderColor = (muiTheme.palette.type === 'dark' ? darken : lighten)(
    muiTheme.palette.text.primary,
    selected ? 0 : 0.7
  );

  const clickSend = onClickSend
    ? () => {
        setErrorText(null);
        const cleanedInputValue = value.trim();
        if (!cleanedInputValue) {
          setErrorText(<Trans>Please explain your use of GDevelop.</Trans>);
          return;
        }
        onClickSend(cleanedInputValue);
      }
    : null;

  return (
    <ButtonBase
      style={{
        ...styles.answerButton,
        borderColor,
      }}
      onClick={e => {
        if (e.nativeEvent && e.nativeEvent.x === 0 && e.nativeEvent.y === 0) {
          // Material UI buttons are clicked when focused and space key is pressed.
          // Here, it's an issue since the input is inside the button and each key press
          // in the input is interpreted as a click.
          // Even if it's a key press, a click event is simulated, and it's hard to
          // discriminate true pointer events and click via space key press.
          // It is supposed that if the coordinated of the event are at 0;0, it's
          // because it comes from a key press.
          return;
        }
        onSelect(code);
      }}
      disableRipple={selected}
    >
      <Paper
        square={false}
        background="medium"
        style={styles.answerButtonBackground}
      >
        <div style={styles.freeAnswerContent}>
          {selected ? (
            <>
              <Line justifyContent="center">
                <Text size="sub-title">{i18n._(text)}</Text>
              </Line>
              <Line justifyContent="center" useFullHeight expand noMargin>
                <ColumnStackLayout expand>
                  <div
                    style={{
                      ...styles.freeAnswerInputOutline,
                      borderColor: muiTheme.palette.text.disabled,
                    }}
                  >
                    <TextField
                      multiline
                      fullWidth
                      errorText={errorText}
                      rows={5}
                      rowsMax={5}
                      style={{ fontSize: 14 }}
                      underlineShow={false}
                      margin="none"
                      translatableHintText={t`Tell us more!...`}
                      type="text"
                      value={value}
                      onChange={(_, newValue) => onChange(newValue)}
                      autoFocus="desktop"
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                  {clickSend && (
                    <RaisedButton
                      primary
                      label={i18n._(t`Send`)}
                      fullWidth
                      onClick={clickSend}
                    />
                  )}
                </ColumnStackLayout>
              </Line>
              <Spacer />
            </>
          ) : (
            <>
              <img
                src={imageSource}
                style={styles.answerCoverImage}
                alt={`Other`}
              />
              <Line justifyContent={showCheckbox ? 'flex-start' : 'center'}>
                {showCheckbox ? (
                  <div style={styles.answerCheckboxAnchor}>
                    <div style={styles.answerCheckboxContainer}>
                      <InlineCheckbox checked={selected} paddingSize="small" />
                    </div>
                  </div>
                ) : null}
                <Column justifyContent="center" alignItems="center" expand>
                  <div style={styles.answerTextContainer}>
                    <Text noMargin>{i18n._(text)}</Text>
                  </div>
                </Column>
              </Line>
            </>
          )}
        </div>
      </Paper>
    </ButtonBase>
  );
};

type AnswerProps = {|
  answerData: AnswerData,
  onSelect: string => void,
  selected: boolean,
  i18n: I18nType,
  showCheckbox: boolean,
|};

const Answer = ({
  answerData,
  i18n,
  onSelect,
  selected,
  showCheckbox,
}: AnswerProps) => {
  const { imageSource, text, code } = answerData;
  const muiTheme = useTheme();
  const borderColor = (muiTheme.palette.type === 'dark' ? darken : lighten)(
    muiTheme.palette.text.primary,
    selected ? 0 : 0.7
  );
  return (
    <ButtonBase
      style={{
        ...styles.answerButton,
        borderColor,
      }}
      onClick={() => onSelect(code)}
    >
      <Paper
        square={false}
        background="medium"
        style={styles.answerButtonBackground}
      >
        <img
          src={imageSource}
          style={styles.answerCoverImage}
          alt={`Illustration for option ${i18n._(text)}`}
        />
        <Line justifyContent={showCheckbox ? 'flex-start' : 'center'}>
          {showCheckbox ? (
            <div style={styles.answerCheckboxAnchor}>
              <div style={styles.answerCheckboxContainer}>
                <InlineCheckbox checked={selected} paddingSize="small" />
              </div>
            </div>
          ) : null}
          <Column justifyContent="center" alignItems="center" expand>
            <div style={styles.answerTextContainer}>
              <Text noMargin>{i18n._(text)}</Text>
            </div>
          </Column>
        </Line>
      </Paper>
    </ButtonBase>
  );
};

type Props = {|
  questionData: QuestionData,
  onSelectAnswer: string => void,
  selectedAnswers: string[],
  showNextButton?: boolean,
  onClickNext: () => void,
  showQuestionText: boolean,
  onClickSend?: string => void,
  otherValue?: string,
  onChangeOtherValue?: string => void,
|};

const PersonalizationQuestion = ({
  questionData,
  onSelectAnswer,
  selectedAnswers,
  showNextButton,
  onClickNext,
  showQuestionText,
  onClickSend,
  otherValue,
  onChangeOtherValue,
}: Props) => {
  const { text, answers, multi, showOther } = questionData;
  const windowWidth = useResponsiveWindowWidth();

  const answersToDisplay: AnswerData[] = [
    ...answers,
    showOther
      ? {
          code: 'otherWithInput',
          text: t`Other`,
          imageSource: 'res/questionnaire/other.svg',
        }
      : null,
  ].filter(Boolean);

  return (
    <I18n>
      {({ i18n }) => (
        <Column>
          {showQuestionText ? (
            <>
              <Text size="block-title">{i18n._(text)}</Text>
              {multi ? (
                <Text>{i18n._(t`You can select more than one.`)}</Text>
              ) : null}
            </>
          ) : null}
          <GridList
            cols={getColumnsFromWidth(windowWidth)}
            spacing={15}
            cellHeight="auto"
          >
            {answersToDisplay.map(answerData => (
              <GridListTile>
                {answerData.code === 'otherWithInput' &&
                otherValue !== undefined &&
                onChangeOtherValue ? (
                  <FreeAnswer
                    answerData={answerData}
                    i18n={i18n}
                    key={answerData.code}
                    onSelect={onSelectAnswer}
                    selected={selectedAnswers.includes(answerData.code)}
                    showCheckbox={!!multi}
                    onClickSend={onClickSend}
                    value={otherValue}
                    onChange={onChangeOtherValue}
                  />
                ) : (
                  <Answer
                    answerData={answerData}
                    i18n={i18n}
                    key={answerData.code}
                    onSelect={onSelectAnswer}
                    selected={selectedAnswers.includes(answerData.code)}
                    showCheckbox={!!multi}
                  />
                )}
              </GridListTile>
            ))}
          </GridList>
          {showNextButton && (
            <Line justifyContent="flex-end">
              <RaisedButton
                primary
                label={i18n._(t`Next`)}
                onClick={onClickNext}
                disabled={selectedAnswers.length === 0}
              />
            </Line>
          )}
        </Column>
      )}
    </I18n>
  );
};

export default PersonalizationQuestion;
