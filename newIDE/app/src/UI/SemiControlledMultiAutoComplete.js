// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import TextField from '@material-ui/core/TextField';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import Autocomplete from '@material-ui/lab/Autocomplete';

type Option = {|
  text: string, // The text displayed
  value: string, // The internal value selected
|};

export type DataSource = Array<?Option>;

type Props = {|
  value: Array<?Option>,
  onChange: Option => void,
  dataSource: DataSource,
  inputValue: ?string,
  onInputChange: string => void,

  floatingLabelText?: MessageDescriptor,
  hintText?: MessageDescriptor,
  helperText?: MessageDescriptor,
  fullWidth?: boolean,
  error?: ?string,
  loading: boolean,
|};

export default function SemiControlledAutoComplete(props: Props) {
  return (
    <I18n>
      {({ i18n }) => (
        <Autocomplete
          freeSolo
          multiple
          value={props.value}
          onChange={props.onChange}
          inputValue={props.inputValue}
          onInputChange={props.onInputChange}
          options={props.dataSource}
          getOptionLabel={(option: Option) => option.text}
          getOptionDisabled={(option: Option) =>
            !!props.value.find(
              element => element && element.value === option.value
            )
          }
          loading={props.loading}
          renderInput={params => (
            <TextField
              {...params}
              InputProps={{
                ...params.InputProps,
                placeholder: i18n._(props.hintText),
              }}
              label={i18n._(props.floatingLabelText)}
              helperText={i18n._(props.helperText)}
              variant="filled"
              error={!!props.error}
              disabled={props.loading}
            />
          )}
          fullWidth={props.fullWidth}
        />
      )}
    </I18n>
  );
}
