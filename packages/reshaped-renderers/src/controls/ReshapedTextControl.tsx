/*
  The MIT License

  Copyright (c) 2017-2024 EclipseSource Munich
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
import React from 'react';
import {
  ControlProps,
  isStringControl,
  RankedTester,
  rankWith,
} from '@mosaic-avantos/jsonforms-core';
import { withJsonFormsControlProps } from '@mosaic-avantos/jsonforms-react';
import { TextField, FormControl, View, Tooltip, Icon } from 'reshaped';
import { HelpCircle } from 'lucide-react';
import { merge } from 'lodash';

export const ReshapedTextControl = (props: ControlProps) => {
  const {
    data,
    label,
    path,
    errors,
    enabled,
    visible,
    required,
    description,
    handleChange,
    config,
  } = props;

  if (!visible) {
    return null;
  }

  const appliedUiSchemaOptions = merge(
    {},
    config,
    props.uischema.options
  );

  const isValid = !errors || errors.length === 0;
  const errorMessage = !isValid && errors ? errors : undefined;
  const tooltip = appliedUiSchemaOptions.tooltip;

  return (
    <FormControl required={required} hasError={!isValid}>
      <FormControl.Label>
        <View direction="row" gap={2} align="center" as="span">
          <span>{label}</span>
          {tooltip && (
            <Tooltip text={tooltip} position="top">
              {(attributes) => (
                <View
                  as="span"
                  attributes={{
                    ...attributes,
                    style: { cursor: 'help', display: 'inline-flex' }
                  }}
                >
                  <Icon svg={HelpCircle} size={4} color="neutral-faded" />
                </View>
              )}
            </Tooltip>
          )}
        </View>
      </FormControl.Label>
      <TextField
        name={path}
        value={data || ''}
        onChange={(args) => handleChange(path, args.value)}
        disabled={!enabled}
        placeholder={appliedUiSchemaOptions.placeholder}
      />
      {description && (
        <FormControl.Helper>{description}</FormControl.Helper>
      )}
      {errorMessage && (
        <FormControl.Error>{errorMessage}</FormControl.Error>
      )}
    </FormControl>
  );
};

export const reshapedTextControlTester: RankedTester = rankWith(
  1,
  isStringControl
);

export default withJsonFormsControlProps(ReshapedTextControl);