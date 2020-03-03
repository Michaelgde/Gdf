// @flow
import { t } from "@lingui/macro";

import * as React from "react";
import classNames from "classnames";
import TextField from "../../../UI/TextField";
import {
  largeSelectedArea,
  largeSelectableArea,
  selectableArea,
  disabledText
} from "../ClassNames";
import { type EventRendererProps } from "./EventRenderer";

const gd = global.gd;

const styles = {
  container: {
    height: 40,
    display: "flex",
    alignItems: "center",
    padding: 5,
    overflow: "hidden"
  },
  title: {
    fontSize: 18,
    width: "100%"
  }
};

export default class GroupEvent extends React.Component<EventRendererProps, *> {
  state = {
    editing: false,
    prevValue: ""
  };
  _textField: ?TextField = null;

  edit = () => {
    this.setState(
      {
        editing: true
      },
      () => {
        if (this._textField) this._textField.focus();
      }
    );
  };

  endEditing = () => {
    this.setState({
      editing: false
    });
  };

  render() {
    var groupEvent = gd.asGroupEvent(this.props.event);

    const r = groupEvent.getBackgroundColorR(),
      g = groupEvent.getBackgroundColorG(),
      b = groupEvent.getBackgroundColorB();

    const textColor = (r + g + b) / 3 > 200 ? "black" : "white";

    return (
      <div
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected
        })}
        style={{
          ...styles.container,
          backgroundColor: `rgb(${r}, ${g}, ${b})`
        }}
        onClick={()=>{
          this.setState({
            prevValue: groupEvent.getName()
          });
          this.edit();
        }}
      >
        {this.state.editing ? (
          <TextField
            ref={textField => (this._textField = textField)}
            value={groupEvent.getName()}
            hintText={t`<Enter group name>`}
            onBlur={this.endEditing}
            onChange={(e, text) => {
              groupEvent.setName(text);
              this.forceUpdate();
            }}
            style={styles.title}
            inputStyle={{
              color: textColor,
              WebkitTextFillColor: textColor
            }}
            underlineFocusStyle={{
              borderColor: textColor
            }}
            fullWidth
            id="group-title"
            onKeyUp={(e) => {
              if (e.key === "Escape") {
                groupEvent.setName(this.state.prevValue);
                this.endEditing();
              }
            }}
            onKeyPress={(e) => {
              if (e.charCode === 13 && !e.shiftKey) {
                this.endEditing();
              }
            }}
          />
        ) : (
          <span
            className={classNames({
              [selectableArea]: true,
              [disabledText]: this.props.disabled
            })}
            style={{ ...styles.title, color: textColor }}
          >
            {groupEvent.getName() || "<Enter group name>"}
          </span>
        )}
      </div>
    );
  }
}
