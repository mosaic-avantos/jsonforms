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
  LayoutProps,
  RankedTester,
  rankWith,
  uiTypeIs,
} from '@mosaic-avantos/jsonforms-core';
import {
  withJsonFormsLayoutProps,
  JsonFormsDispatch as JsonFormsDispatchOriginal,
} from '@mosaic-avantos/jsonforms-react';
import { View } from 'reshaped';

export const ReshapedVerticalLayout = ({
  uischema,
  schema,
  path,
  enabled,
  visible,
  renderers,
  cells,
}: LayoutProps) => {
  if (!visible) {
    return null;
  }

  const JsonFormsDispatch = JsonFormsDispatchOriginal as any;
  
  return (
    <View gap={3} direction="column">
      {(uischema as any).elements.map((element: any, index: number) => (
        <JsonFormsDispatch
          key={`${path}-${index}`}
          uischema={element}
          schema={schema}
          path={path}
          enabled={enabled}
          renderers={renderers}
          cells={cells}
        />
      ))}
    </View>
  );
};

export const reshapedVerticalLayoutTester: RankedTester = rankWith(
  1,
  uiTypeIs('VerticalLayout')
);

export default withJsonFormsLayoutProps(ReshapedVerticalLayout);