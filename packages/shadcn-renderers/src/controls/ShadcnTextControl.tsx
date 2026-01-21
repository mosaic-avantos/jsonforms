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
import React, { useState } from 'react';
import {
  ControlProps,
  isStringControl,
  isDescriptionHidden,
  RankedTester,
  rankWith,
} from '@mosaic-avantos/jsonforms-core';
import { withJsonFormsControlProps } from '@mosaic-avantos/jsonforms-react';
import { Input } from '../components/ui/input';
import { FormItem, FormLabel, FormDescription, FormMessage } from '../components/ui/form';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { merge } from 'lodash';
import { cn } from '../lib/utils';

export const ShadcnTextControl: React.FC<ControlProps> = (props) => {
  const [focused, setFocused] = useState(false);
  const {
    id,
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

  const showDescription = !isDescriptionHidden(
    visible,
    description,
    focused,
    appliedUiSchemaOptions.showUnfocusedDescription
  );

  const showTooltip =
    !showDescription &&
    !isDescriptionHidden(
      visible,
      description,
      true, // Tooltips have their own focus handlers
      true  // Render regardless of showUnfocusedDescription setting
    );

  const firstFormHelperText = showDescription
    ? description
    : !isValid
    ? errors
    : null;
  const secondFormHelperText = showDescription && !isValid ? errors : null;

  return (
    <FormItem
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <FormLabel
                htmlFor={id}
                required={appliedUiSchemaOptions.hideRequiredAsterisk ? false : required}
              >
                {label}
              </FormLabel>
              <Input
                id={id}
                name={path}
                value={data || ''}
                onChange={(e) => handleChange(path, e.target.value)}
                disabled={!enabled}
                placeholder={appliedUiSchemaOptions.placeholder}
                className={cn(!isValid && 'border-destructive')}
              />
            </div>
          </TooltipTrigger>
          {showTooltip && description && (
            <TooltipContent>
              <p>{description}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      {firstFormHelperText && (
        <FormDescription className={cn(!isValid && !showDescription && 'text-destructive')}>
          {firstFormHelperText}
        </FormDescription>
      )}
      {secondFormHelperText && (
        <FormMessage>{secondFormHelperText}</FormMessage>
      )}
    </FormItem>
  );
};

export const shadcnTextControlTester: RankedTester = rankWith(
  1,
  isStringControl
);

export default withJsonFormsControlProps(ShadcnTextControl);
