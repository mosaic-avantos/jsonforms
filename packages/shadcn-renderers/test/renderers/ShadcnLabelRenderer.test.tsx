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
import * as React from 'react';
import { LabelElement, NOT_APPLICABLE } from '@mosaic-avantos/jsonforms-core';
import {
  ShadcnLabelRenderer,
  shadcnLabelRendererTester,
} from '../../src/additional/ShadcnLabelRenderer';
import { shadcnRenderers } from '../../src';
import Enzyme, { mount, ReactWrapper } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import {
  JsonForms,
  JsonFormsStateProvider,
} from '@mosaic-avantos/jsonforms-react';
import { initCore } from './util';

Enzyme.configure({ adapter: new Adapter() });

const data = {};
const schema = {
  type: 'object',
  properties: {},
};
const uischema: LabelElement = {
  type: 'Label',
  text: 'Foo',
};

describe('Shadcn Label Renderer tester', () => {
  it('should fail for undefined', () => {
    expect(shadcnLabelRendererTester(undefined as any, undefined as any, undefined as any)).toBe(
      NOT_APPLICABLE
    );
  });

  it('should fail for null', () => {
    expect(shadcnLabelRendererTester(null as any, undefined as any, undefined as any)).toBe(
      NOT_APPLICABLE
    );
  });

  it('should fail for wrong type', () => {
    expect(
      shadcnLabelRendererTester({ type: 'Foo' } as any, undefined as any, undefined as any)
    ).toBe(NOT_APPLICABLE);
  });

  it('should succeed for Label type', () => {
    expect(
      shadcnLabelRendererTester({ type: 'Label' } as any, undefined as any, undefined as any)
    ).toBe(1);
  });
});

describe('Shadcn Label Renderer', () => {
  let wrapper: ReactWrapper;

  afterEach(() => wrapper.unmount());

  it('should render', () => {
    wrapper = mount(
      <JsonForms
        data={undefined}
        schema={schema}
        uischema={uischema}
        renderers={shadcnRenderers}
      />
    );
    expect(wrapper.find(ShadcnLabelRenderer).length).toBeTruthy();
    expect(wrapper.text()).toContain('Foo');
  });

  it('should render with correct text', () => {
    const customUischema: LabelElement = {
      type: 'Label',
      text: 'Custom Label Text',
    };
    wrapper = mount(
      <JsonForms
        data={undefined}
        schema={schema}
        uischema={customUischema}
        renderers={shadcnRenderers}
      />
    );
    expect(wrapper.text()).toContain('Custom Label Text');
  });

  it('can be hidden', () => {
    const core = initCore(schema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: shadcnRenderers, core }}
      >
        <ShadcnLabelRenderer
          text='Foo'
          visible={false}
          uischema={uischema}
          schema={schema}
          enabled={true}
          path=''
        />
      </JsonFormsStateProvider>
    );
    expect(wrapper.text()).not.toContain('Foo');
  });

  it('should be shown by default', () => {
    wrapper = mount(
      <JsonForms
        data={undefined}
        schema={schema}
        uischema={uischema}
        renderers={shadcnRenderers}
      />
    );
    expect(wrapper.find(ShadcnLabelRenderer).length).toBeTruthy();
    expect(wrapper.text()).toContain('Foo');
  });

  it('should render in a vertical layout', () => {
    const layoutUischema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Label',
          text: 'Section Header',
        },
        {
          type: 'Control',
          scope: '#/properties/name',
        },
      ],
    };
    const layoutSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };
    wrapper = mount(
      <JsonForms
        data={{}}
        schema={layoutSchema}
        uischema={layoutUischema}
        renderers={shadcnRenderers}
      />
    );
    expect(wrapper.text()).toContain('Section Header');
  });
});
