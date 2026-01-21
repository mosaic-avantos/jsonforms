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
import {
  ControlElement,
  JsonSchema,
  NOT_APPLICABLE,
} from '@mosaic-avantos/jsonforms-core';
import TextCell, {
  shadcnTextCellTester,
} from '../../src/cells/ShadcnTextCell';
import { shadcnRenderers } from '../../src';

import Enzyme, { mount, ReactWrapper } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { JsonFormsStateProvider } from '@mosaic-avantos/jsonforms-react';
import { initCore, TestEmitter } from './util';

Enzyme.configure({ adapter: new Adapter() });

const data = { name: 'Foo' };
const minLengthSchema = {
  type: 'string',
  minLength: 3,
};
const schema = { type: 'string' };

const uischema: ControlElement = {
  type: 'Control',
  scope: '#/properties/name',
};

describe('Shadcn text cell tester', () => {
  it('should fail', () => {
    expect(shadcnTextCellTester(undefined as any, undefined as any, undefined as any)).toBe(
      NOT_APPLICABLE
    );
    expect(shadcnTextCellTester(null as any, undefined as any, undefined as any)).toBe(
      NOT_APPLICABLE
    );
    expect(shadcnTextCellTester({ type: 'Foo' } as any, undefined as any, undefined as any)).toBe(
      NOT_APPLICABLE
    );
    expect(
      shadcnTextCellTester({ type: 'Control' } as any, undefined as any, undefined as any)
    ).toBe(NOT_APPLICABLE);
  });

  it('should fail with wrong schema type', () => {
    const control: ControlElement = {
      type: 'Control',
      scope: '#/properties/foo',
    };
    expect(
      shadcnTextCellTester(
        control,
        {
          type: 'object',
          properties: {
            foo: {
              type: 'number',
            },
          },
        },
        undefined as any
      )
    ).toBe(NOT_APPLICABLE);
  });

  it('should fail if only sibling has correct type', () => {
    const control: ControlElement = {
      type: 'Control',
      scope: '#/properties/foo',
    };
    expect(
      shadcnTextCellTester(
        control,
        {
          type: 'object',
          properties: {
            foo: {
              type: 'number',
            },
            bar: {
              type: 'string',
            },
          },
        },
        undefined as any
      )
    ).toBe(NOT_APPLICABLE);
  });

  it('should succeed with matching prop type', () => {
    const control: ControlElement = {
      type: 'Control',
      scope: '#/properties/foo',
    };
    expect(
      shadcnTextCellTester(
        control,
        {
          type: 'object',
          properties: {
            foo: {
              type: 'string',
            },
          },
        },
        undefined as any
      )
    ).toBe(1);
  });
});

describe('Shadcn text cell', () => {
  let wrapper: ReactWrapper;

  afterEach(() => wrapper.unmount());

  it('should autofocus via option', () => {
    const control: ControlElement = {
      type: 'Control',
      scope: '#/properties/name',
      options: { focus: true },
    };
    const core = initCore(minLengthSchema, control, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: shadcnRenderers, core }}
      >
        <TextCell schema={minLengthSchema} uischema={control} path='name' />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input').first();
    expect(input.props().autoFocus).toBeTruthy();
  });

  it('should not autofocus via option', () => {
    const control: ControlElement = {
      type: 'Control',
      scope: '#/properties/name',
      options: { focus: false },
    };
    const core = initCore(schema, control, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: shadcnRenderers, core }}
      >
        <TextCell schema={minLengthSchema} uischema={control} path={'name'} />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input').first();
    expect(input.props().autoFocus).toBeFalsy();
  });

  it('should not autofocus by default', () => {
    const control: ControlElement = {
      type: 'Control',
      scope: '#/properties/name',
    };
    const core = initCore(minLengthSchema, control, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: shadcnRenderers, core }}
      >
        <TextCell schema={minLengthSchema} uischema={control} path='name' />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input').first();
    expect(document.activeElement).not.toBe(input);
  });

  it('should render', () => {
    const jsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };
    const core = initCore(minLengthSchema, uischema, { name: 'Foo' });
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: shadcnRenderers, core }}
      >
        <TextCell schema={jsonSchema} uischema={uischema} path={'name'} />
      </JsonFormsStateProvider>
    );

    const input = wrapper.find('input').first();
    expect(input.props().value).toBe('Foo');
  });

  it('should update via input event', (done) => {
    const core = initCore(minLengthSchema, uischema, data);
    const onChangeData: any = {
      data: undefined,
    };
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: shadcnRenderers, core }}
      >
        <TestEmitter
          onChange={({ data }) => {
            onChangeData.data = data;
          }}
        />
        <TextCell schema={minLengthSchema} uischema={uischema} path='name' />
      </JsonFormsStateProvider>
    );

    const input = wrapper.find('input').first();
    input.simulate('change', { target: { value: 'Bar' } });
    setTimeout(() => {
      expect(onChangeData.data.name).toBe('Bar');
      done();
    }, 1000);
  });

  it('should update via action', (done) => {
    const core = initCore(minLengthSchema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: shadcnRenderers, core }}
      >
        <TextCell schema={minLengthSchema} uischema={uischema} path='name' />
      </JsonFormsStateProvider>
    );
    core.data = { ...core.data, name: 'Bar' };
    wrapper.setProps({ initState: { renderers: shadcnRenderers, core } });
    wrapper.update();
    setTimeout(() => {
      const input = wrapper.find('input').first();
      expect(input.props().value).toBe('Bar');
      done();
    }, 1000);
  });

  it('should update with undefined value', (done) => {
    const core = initCore(minLengthSchema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: shadcnRenderers, core }}
      >
        <TextCell schema={minLengthSchema} uischema={uischema} path='name' />
      </JsonFormsStateProvider>
    );
    core.data = { ...core.data, name: undefined };
    wrapper.setProps({ initState: { renderers: shadcnRenderers, core } });
    wrapper.update();
    setTimeout(() => {
      const input = wrapper.find('input').first();
      expect(input.props().value).toBe('');
      done();
    }, 1000);
  });

  it('should update with null value', (done) => {
    const core = initCore(minLengthSchema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: shadcnRenderers, core }}
      >
        <TextCell schema={minLengthSchema} uischema={uischema} path='name' />
      </JsonFormsStateProvider>
    );
    core.data = { ...core.data, name: null };
    wrapper.setProps({ initState: { renderers: shadcnRenderers, core } });
    wrapper.update();
    setTimeout(() => {
      const input = wrapper.find('input').first();
      expect(input.props().value).toBe('');
      done();
    }, 1000);
  });

  it('can be disabled', () => {
    const core = initCore(minLengthSchema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: shadcnRenderers, core }}
      >
        <TextCell
          schema={minLengthSchema}
          uischema={uischema}
          path='name'
          enabled={false}
        />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input').first();
    expect(input.props().disabled).toBeTruthy();
  });

  it('should be enabled by default', () => {
    const core = initCore(minLengthSchema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: shadcnRenderers, core }}
      >
        <TextCell schema={minLengthSchema} uischema={uischema} path='name' />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input').first();
    expect(input.props().disabled).toBeFalsy();
  });

  it('should render with a placeholder', () => {
    const control: ControlElement = {
      type: 'Control',
      scope: '#/properties/name',
      options: {
        placeholder: 'Enter your name',
      },
    };
    const core = initCore(schema, control, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: shadcnRenderers, core }}
      >
        <TextCell schema={schema} uischema={control} path='name' />
      </JsonFormsStateProvider>
    );

    const input = wrapper.find('input').first();
    expect(input.props().placeholder).toBe('Enter your name');
  });
});
