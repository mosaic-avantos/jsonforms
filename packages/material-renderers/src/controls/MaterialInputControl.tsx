/*
  The MIT License

  Copyright (c) 2017-2021 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import React, { useCallback, useRef } from 'react';
import {
  showAsRequired,
  ControlProps,
  isDescriptionHidden,
} from '@mosaic-avantos/jsonforms-core';

import { InputLabel, FormControl, FormHelperText } from '@mui/material';
import merge from 'lodash/merge';
import { useFocus, useInputVariant } from '../util';

export interface WithInput {
  input: any;
}

export const MaterialInputControl = (props: ControlProps & WithInput) => {
  const [focused, onFocus, onBlur] = useFocus();
  const controlRef = useRef<HTMLDivElement>(null);

  // Focus can move between the control's own elements, e.g. on to the clear
  // button in the input adornment. Treating that as a blur hides the adornment
  // while the browser is still moving focus into it, which aborts the transfer
  // and drops focus to the document body. Let focus settle first, then check
  // where it actually landed. relatedTarget is not usable here because React 16
  // maps onBlur to the native blur event, which does not carry it.
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      const node = controlRef.current;
      if (node && !node.contains(document.activeElement)) {
        onBlur();
      }
    }, 0);
  }, [onBlur]);
  const {
    id,
    description,
    errors,
    label,
    uischema,
    visible,
    required,
    config,
    input,
  } = props;
  const variant = useInputVariant();
  const isValid = errors.length === 0;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);

  const showDescription = !isDescriptionHidden(
    visible,
    description,
    focused,
    appliedUiSchemaOptions.showUnfocusedDescription
  );

  const firstFormHelperText = showDescription
    ? description
    : !isValid
    ? errors
    : null;
  const secondFormHelperText = showDescription && !isValid ? errors : null;
  const InnerComponent = input;

  if (!visible) {
    return null;
  }

  return (
    <FormControl
      ref={controlRef}
      fullWidth={!appliedUiSchemaOptions.trim}
      onFocus={onFocus}
      onBlur={handleBlur}
      variant={variant}
      id={id}
    >
      <InputLabel
        htmlFor={id + '-input'}
        sx={{
          backgroundColor: 'background.paper',
          px: 0.5,
          // Ensure the label is above the outline
          '&.MuiInputLabel-shrink': {
            zIndex: 1,
          },
        }}
        error={!isValid}
        required={showAsRequired(
          required,
          appliedUiSchemaOptions.hideRequiredAsterisk
        )}
      >
        {label}
      </InputLabel>
      <InnerComponent
        {...props}
        id={id + '-input'}
        isValid={isValid}
        visible={visible}
        // Forwarded, not just used locally for description gating:
        // avantos-forms text and number inputs gate their clear-button
        // adornment on this. Dropping the forwarding makes that adornment
        // hover-only and breaks tabbing from the input on to the clear button.
        focused={focused}
      />
      <FormHelperText error={!isValid && !showDescription}>
        {firstFormHelperText}
      </FormHelperText>
      <FormHelperText error={!isValid}>{secondFormHelperText}</FormHelperText>
    </FormControl>
  );
};
