/*
  The MIT License

  Copyright (c) 2017-2019 EclipseSource Munich
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
import { ControlElement, HorizontalLayout, JsonSchema } from '@mosaic-avantos/jsonforms-core';
import { JsonFormsStateProvider } from '@mosaic-avantos/jsonforms-react';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount, ReactWrapper } from 'enzyme';
import HorizontalLayoutRenderer from '../../src/layouts/HorizontalLayout';
import DateTimeCell, { dateTimeCellTester } from '../../src/cells/DateTimeCell';
import { initCore, TestEmitter } from '../util';

Enzyme.configure({ adapter: new Adapter() });

const control: ControlElement = {
  type: 'Control',
  scope: '#/properties/foo',
};

const fixture = {
  data: { foo: '1980-04-04T13:37:00.000Z' },
  schema: {
    type: 'string',
    format: 'date-time',
  },
  uischema: control,
  styles: [
    {
      name: 'control',
      classNames: ['control'],
    },
    {
      name: 'control.validation',
      classNames: ['validation'],
    },
  ],
};

describe('Date time cell tester', () => {
  test('tester', () => {
    expect(dateTimeCellTester(undefined, undefined, undefined)).toBe(-1);
    expect(dateTimeCellTester(null, undefined, undefined)).toBe(-1);
    expect(dateTimeCellTester({ type: 'Foo' }, undefined, undefined)).toBe(-1);
    expect(dateTimeCellTester({ type: 'Control' }, undefined, undefined)).toBe(
      -1
    );
  });

  test('tester with wrong prop type', () => {
    expect(
      dateTimeCellTester(
        fixture.uischema,
        {
          type: 'object',
          properties: {
            foo: { type: 'string' },
          },
        },
        undefined
      )
    ).toBe(-1);
  });

  test('tester with wrong prop type, but sibling has correct one', () => {
    expect(
      dateTimeCellTester(
        fixture.uischema,
        {
          type: 'object',
          properties: {
            foo: { type: 'string' },
            bar: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        undefined
      )
    ).toBe(-1);
  });

  test('tester with correct prop type', () => {
    expect(
      dateTimeCellTester(
        fixture.uischema,
        {
          type: 'object',
          properties: {
            foo: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        undefined
      )
    ).toBe(2);
  });
});

describe('date time cell', () => {
  let wrapper: ReactWrapper;

  afterEach(() => wrapper.unmount());

  test.skip('autofocus on first element', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        firstDate: { type: 'string', format: 'date-time' },
        secondDate: { type: 'string', format: 'date-time' },
      },
    };
    const firstControlElement: ControlElement = {
      type: 'Control',
      scope: '#/properties/firstDate',
      options: {
        focus: true,
      },
    };
    const secondControlElement: ControlElement = {
      type: 'Control',
      scope: '#/properties/secondDate',
      options: {
        focus: true,
      },
    };
    const uischema: HorizontalLayout = {
      type: 'HorizontalLayout',
      elements: [firstControlElement, secondControlElement],
    };
    const data = {
      firstDate: '1980-04-04T13:37:00.000Z',
      secondDate: '1980-04-04T13:37:00.000Z',
    };
    const core = initCore(schema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider initState={{ core }}>
        <HorizontalLayoutRenderer schema={schema} uischema={uischema} />
      </JsonFormsStateProvider>
    );
    const inputs = wrapper.find('input');
    expect(document.activeElement).not.toBe(inputs.at(0));
    expect(document.activeElement).toBe(inputs.at(1));
  });

  test('autofocus active', () => {
    const uischema: ControlElement = {
      type: 'Control',
      scope: '#/properties/foo',
      options: {
        focus: true,
      },
    };
    const core = initCore(fixture.schema, uischema, fixture.data);

    wrapper = mount(
      <JsonFormsStateProvider initState={{ core }}>
        <DateTimeCell schema={fixture.schema} uischema={uischema} path='foo' />
      </JsonFormsStateProvider>,
      // Attach to body to get focus to work with JSDom
      { attachTo: document.body }
    );
    const input = wrapper.find('input').getDOMNode();
    expect(document.activeElement).toBe(input);
  });

  test('autofocus inactive', () => {
    const uischema: ControlElement = {
      type: 'Control',
      scope: '#/properties/foo',
      options: {
        focus: false,
      },
    };
    const core = initCore(fixture.schema, uischema, fixture.data);

    wrapper = mount(
      <JsonFormsStateProvider initState={{ core }}>
        <DateTimeCell schema={fixture.schema} uischema={uischema} path='foo' />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input').getDOMNode() as HTMLInputElement;
    expect(input.autofocus).toBe(false);
  });

  test('autofocus inactive by default', () => {
    const uischema: ControlElement = {
      type: 'Control',
      scope: '#/properties/foo',
    };
    const core = initCore(fixture.schema, uischema, fixture.data);

    wrapper = mount(
      <JsonFormsStateProvider initState={{ core }}>
        <DateTimeCell schema={fixture.schema} uischema={uischema} path='foo' />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input').getDOMNode() as HTMLInputElement;
    expect(input.autofocus).toBe(false);
  });

  test('render', () => {
    const core = initCore(fixture.schema, fixture.uischema, fixture.data);
    wrapper = mount(
      <JsonFormsStateProvider initState={{ core }}>
        <DateTimeCell
          schema={fixture.schema}
          uischema={fixture.uischema}
          path='foo'
        />
      </JsonFormsStateProvider>
    );

    const input = wrapper.find('input');
    expect(input.props().type).toBe('datetime-local');
    expect(input.props().value).toBe('1980-04-04T13:37');
  });

  test('has classes set', () => {
    const core = initCore(fixture.schema, fixture.uischema, fixture.data);
    wrapper = mount(
      <JsonFormsStateProvider initState={{ core }}>
        <DateTimeCell
          schema={fixture.schema}
          uischema={fixture.uischema}
          path='foo'
        />
      </JsonFormsStateProvider>
    );

    const input = wrapper.find('input');
    expect(input.hasClass('input')).toBe(true);
    expect(input.hasClass('validate')).toBe(true);
    expect(input.hasClass('valid')).toBe(true);
  });

  test('update via event', () => {
    const onChangeData: any = {
      data: undefined,
    };
    const core = initCore(fixture.schema, fixture.uischema, fixture.data);
    wrapper = mount(
      <JsonFormsStateProvider initState={{ core }}>
        <TestEmitter
          onChange={({ data }) => {
            onChangeData.data = data;
          }}
        />
        <DateTimeCell
          schema={fixture.schema}
          uischema={fixture.uischema}
          path='foo'
        />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input');
    input.simulate('change', { target: { value: '1961-04-12T20:15' } });
    expect(onChangeData.data.foo).toBe('1961-04-12T20:15:00.000Z');
  });

  test('update via action', () => {
    const core = initCore(fixture.schema, fixture.uischema, fixture.data);
    wrapper = mount(
      <JsonFormsStateProvider initState={{ core }}>
        <DateTimeCell
          schema={fixture.schema}
          uischema={fixture.uischema}
          path='foo'
        />
      </JsonFormsStateProvider>
    );
    core.data = { ...core.data, foo: '1961-04-12T20:15:00.000Z' };
    wrapper.setProps({ initState: { core } });
    wrapper.update();
    const input = wrapper.find('input');
    expect(input.props().value).toBe('1961-04-12T20:15');
  });

  test('update with null value', () => {
    const core = initCore(fixture.schema, fixture.uischema, fixture.data);
    wrapper = mount(
      <JsonFormsStateProvider initState={{ core }}>
        <DateTimeCell
          schema={fixture.schema}
          uischema={fixture.uischema}
          path='foo'
        />
      </JsonFormsStateProvider>
    );
    core.data = { ...core.data, foo: null };
    wrapper.setProps({ initState: { core } });
    wrapper.update();
    const input = wrapper.find('input');
    expect(input.props().value).toBe('');
  });

  test('update with undefined value', () => {
    const core = initCore(fixture.schema, fixture.uischema, fixture.data);
    wrapper = mount(
      <JsonFormsStateProvider initState={{ core }}>
        <DateTimeCell
          schema={fixture.schema}
          uischema={fixture.uischema}
          path='foo'
        />
      </JsonFormsStateProvider>
    );
    core.data = { ...core.data, foo: undefined };
    wrapper.setProps({ initState: { core } });
    wrapper.update();
    const input = wrapper.find('input');
    expect(input.props().value).toBe('');
  });

  test('update with wrong ref', () => {
    const core = initCore(fixture.schema, fixture.uischema, fixture.data);
    wrapper = mount(
      <JsonFormsStateProvider initState={{ core }}>
        <DateTimeCell
          schema={fixture.schema}
          uischema={fixture.uischema}
          path='foo'
        />
      </JsonFormsStateProvider>
    );
    core.data = { ...core.data, bar: 'Bar' };
    wrapper.setProps({ initState: { core } });
    wrapper.update();
    const input = wrapper.find('input');
    expect(input.props().value).toBe('1980-04-04T13:37');
  });

  test('update with null ref', () => {
    const core = initCore(fixture.schema, fixture.uischema, fixture.data);
    wrapper = mount(
      <JsonFormsStateProvider initState={{ core }}>
        <DateTimeCell
          schema={fixture.schema}
          uischema={fixture.uischema}
          path='foo'
        />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input');
    core.data = { ...core.data, null: '1961-04-12T20:15:00.000Z' };
    wrapper.setProps({ initState: { core } });
    wrapper.update();
    expect(input.props().value).toBe('1980-04-04T13:37');
  });

  test('update with undefined ref', () => {
    const core = initCore(fixture.schema, fixture.uischema, fixture.data);
    wrapper = mount(
      <JsonFormsStateProvider initState={{ core }}>
        <DateTimeCell
          schema={fixture.schema}
          uischema={fixture.uischema}
          path='foo'
        />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input');
    core.data = { ...core.data, undefined: '1961-04-12T20:15:00.000Z' };
    wrapper.setProps({ initState: { core } });
    wrapper.update();
    expect(input.props().value).toBe('1980-04-04T13:37');
  });

  test('disable', () => {
    const core = initCore(fixture.schema, fixture.uischema, fixture.data);
    wrapper = mount(
      <JsonFormsStateProvider initState={{ core }}>
        <DateTimeCell
          schema={fixture.schema}
          uischema={fixture.uischema}
          path='foo'
          enabled={false}
        />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input');
    expect(input.props().disabled).toBe(true);
  });

  test('enabled by default', () => {
    const core = initCore(fixture.schema, fixture.uischema, fixture.data);
    wrapper = mount(
      <JsonFormsStateProvider initState={{ core }}>
        <DateTimeCell
          schema={fixture.schema}
          uischema={fixture.uischema}
          path='foo'
        />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input');
    expect(input.props().disabled).toBe(false);
  });
});
