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
  isBooleanControl,
  RankedTester,
  rankWith,
} from '@mosaic-avantos/jsonforms-core';
import { withJsonFormsControlProps } from '@mosaic-avantos/jsonforms-react';
import { Checkbox, FormControl, View, Tooltip, Icon } from 'reshaped';
import { HelpCircle } from 'lucide-react';
import { merge } from 'lodash';

export const ReshapedBooleanControl = (props: ControlProps) => {
  const {
    data,
    label,
    path,
    errors,
    enabled,
    visible,
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
    <FormControl>
      {description && (
        <FormControl.Helper>{description}</FormControl.Helper>
      )}
      <View direction="row" gap={2} align="center">
        <Checkbox
          name={path}
          checked={data || false}
          onChange={(args) => handleChange(path, args.checked)}
          disabled={!enabled}
        >
          {label}
        </Checkbox>
        {tooltip && (
          <Tooltip text={tooltip} position="top">
            {(attributes) => (
              <View
                attributes={{
                  ...attributes,
                  style: { cursor: 'help', display: 'inline-flex', alignItems: 'center' }
                }}
              >
                <Icon svg={HelpCircle} size={4} color="neutral-faded" />
              </View>
            )}
          </Tooltip>
        )}
      </View>
      {errorMessage && (
        <FormControl.Error>{errorMessage}</FormControl.Error>
      )}
    </FormControl>
  );
};

export const reshapedBooleanControlTester: RankedTester = rankWith(
  1,
  isBooleanControl
);

export default withJsonFormsControlProps(ReshapedBooleanControl);