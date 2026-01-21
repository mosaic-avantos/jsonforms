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
import {
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
} from '@mosaic-avantos/jsonforms-core';

// Export all sub-modules
export * from './controls';
export * from './layouts';
export * from './cells';
export * from './additional';
export * from './util';

// Import renderers and testers from sub-modules
import ShadcnTextControlWrapped from './controls/ShadcnTextControl';
import { shadcnTextControlTester } from './controls';

import ShadcnVerticalLayoutWrapped from './layouts/ShadcnVerticalLayout';
import ShadcnHorizontalLayoutWrapped from './layouts/ShadcnHorizontalLayout';
import { shadcnVerticalLayoutTester, shadcnHorizontalLayoutTester } from './layouts';

import ShadcnTextCellWrapped from './cells/ShadcnTextCell';
import { shadcnTextCellTester } from './cells';

import ShadcnLabelRendererWrapped from './additional/ShadcnLabelRenderer';
import { shadcnLabelRendererTester } from './additional';

export const shadcnRenderers: JsonFormsRendererRegistryEntry[] = [
  // controls
  { tester: shadcnTextControlTester, renderer: ShadcnTextControlWrapped },

  // layouts
  { tester: shadcnVerticalLayoutTester, renderer: ShadcnVerticalLayoutWrapped },
  { tester: shadcnHorizontalLayoutTester, renderer: ShadcnHorizontalLayoutWrapped },

  // additional
  { tester: shadcnLabelRendererTester, renderer: ShadcnLabelRendererWrapped },
];

export const shadcnCells: JsonFormsCellRendererRegistryEntry[] = [
  { tester: shadcnTextCellTester, cell: ShadcnTextCellWrapped },
];
