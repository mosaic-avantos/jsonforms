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
import React from 'react';
import {
  ControlElement,
  defaultDateTimeFormat,
  NOT_APPLICABLE,
} from '@mosaic-avantos/jsonforms-core';
import MaterialDateTimeControl, {
  materialDateTimeControlTester,
} from '../../src/controls/MaterialDateTimeControl';
import dayjs from 'dayjs';
import { materialRenderers } from '../../src';

import Enzyme, { mount, ReactWrapper } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { JsonFormsStateProvider } from '@mosaic-avantos/jsonforms-react';
import { initCore, TestEmitter } from './util';

Enzyme.configure({ adapter: new Adapter() });

const data = { foo: dayjs('1980-04-04 13:37').format(defaultDateTimeFormat) };
const schema = {
  type: 'object',
  properties: {
    foo: {
      type: 'string',
      format: 'date-time',
    },
  },
};
const uischema: ControlElement = {
  type: 'Control',
  scope: '#/properties/foo',
};

describe('Material date time control tester', () => {
  it('should fail', () => {
    expect(materialDateTimeControlTester(undefined, undefined, undefined)).toBe(
      NOT_APPLICABLE
    );
    expect(materialDateTimeControlTester(null, undefined, undefined)).toBe(
      NOT_APPLICABLE
    );
    expect(
      materialDateTimeControlTester({ type: 'Foo' }, undefined, undefined)
    ).toBe(NOT_APPLICABLE);
    expect(
      materialDateTimeControlTester({ type: 'Control' }, undefined, undefined)
    ).toBe(NOT_APPLICABLE);
    expect(
      materialDateTimeControlTester(
        uischema,
        {
          type: 'object',
          properties: {
            foo: { type: 'string' },
          },
        },
        undefined
      )
    ).toBe(NOT_APPLICABLE);
    expect(
      materialDateTimeControlTester(
        uischema,
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
    ).toBe(NOT_APPLICABLE);
  });

  it('should succeed', () => {
    expect(
      materialDateTimeControlTester(
        uischema,
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
    expect(
      materialDateTimeControlTester(
        { ...uischema, options: { format: 'date-time' } },
        {
          type: 'object',
          properties: {
            foo: {
              type: 'string',
            },
          },
        },
        undefined
      )
    ).toBe(2);
  });
});

describe('Material date time control', () => {
  let wrapper: ReactWrapper;

  afterEach(() => {
    wrapper.unmount();
  });

  it('should autofocus via option', () => {
    const control: ControlElement = {
      type: 'Control',
      scope: '#/properties/foo',
      options: {
        focus: true,
      },
    };
    const core = initCore(schema, control, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl schema={schema} uischema={control} />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input').first();
    expect(input.props().autoFocus).toBeTruthy();
  });

  it('should not autofocus via option', () => {
    const control: ControlElement = {
      type: 'Control',
      scope: '#/properties/foo',
      options: {
        focus: false,
      },
    };
    const core = initCore(schema, control, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl schema={schema} uischema={uischema} />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input').first();
    expect(input.props().autoFocus).toBeFalsy();
  });

  it('should not autofocus by default', () => {
    const control: ControlElement = {
      type: 'Control',
      scope: '#/properties/foo',
    };
    const core = initCore(schema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl schema={schema} uischema={control} />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input').first();
    expect(input.props().autoFocus).toBeFalsy();
  });

  it('should render', () => {
    const core = initCore(schema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl schema={schema} uischema={uischema} />
      </JsonFormsStateProvider>
    );

    const input = wrapper.find('input').first();
    expect(input.props().type).toBe('text');
    expect(input.props().value).toBe('1980-04-04 13:37');
  });

  it('should update via event', () => {
    const core = initCore(schema, uischema, data);
    const onChangeData: any = {
      data: undefined,
    };
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <TestEmitter
          onChange={({ data }) => {
            onChangeData.data = data;
          }}
        />
        <MaterialDateTimeControl schema={schema} uischema={uischema} />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input').first();
    (input.getDOMNode() as HTMLInputElement).value = '1961-12-12 20:15';
    input.simulate('blur', input);
    expect(onChangeData.data.foo).toBe(
      dayjs('1961-12-12 20:15').format(defaultDateTimeFormat)
    );
  });

  it('should update via action', () => {
    const core = initCore(schema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl schema={schema} uischema={uischema} />
      </JsonFormsStateProvider>
    );
    core.data = {
      ...core.data,
      foo: dayjs('1961-12-04 20:15').format(defaultDateTimeFormat),
    };
    wrapper.setProps({ initState: { renderers: materialRenderers, core } });
    wrapper.update();
    const input = wrapper.find('input').first();
    expect(input.props().value).toBe('1961-12-04 20:15');
  });

  it('should update with null value', () => {
    const core = initCore(schema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl schema={schema} uischema={uischema} />
      </JsonFormsStateProvider>
    );
    core.data = { ...core.data, foo: null };
    wrapper.setProps({ initState: { renderers: materialRenderers, core } });
    wrapper.update();
    const input = wrapper.find('input').first();
    expect(input.props().value).toBe('');
  });

  it('should not update with undefined value', () => {
    const core = initCore(schema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl schema={schema} uischema={uischema} />
      </JsonFormsStateProvider>
    );
    core.data = { ...core.data, foo: undefined };
    wrapper.setProps({ initState: { renderers: materialRenderers, core } });
    wrapper.update();
    const input = wrapper.find('input').first();
    expect(input.props().value).toBe('');
  });

  it('should not update with wrong ref', () => {
    const core = initCore(schema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl schema={schema} uischema={uischema} />
      </JsonFormsStateProvider>
    );
    core.data = { ...core.data, bar: 'Bar' };
    wrapper.setProps({ initState: { renderers: materialRenderers, core } });
    wrapper.update();
    const input = wrapper.find('input').first();
    expect(input.props().value).toBe('1980-04-04 13:37');
  });

  it('should not update with null ref', () => {
    const core = initCore(schema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl schema={schema} uischema={uischema} />
      </JsonFormsStateProvider>
    );
    core.data = { ...core.data, null: '12.04.1961 20:15' };
    wrapper.setProps({ initState: { renderers: materialRenderers, core } });
    wrapper.update();
    const input = wrapper.find('input').first();
    expect(input.props().value).toBe('1980-04-04 13:37');
  });

  it('should not update with undefined ref', () => {
    const core = initCore(schema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl schema={schema} uischema={uischema} />
      </JsonFormsStateProvider>
    );
    core.data = { ...core.data, undefined: '12.04.1961 20:15' };
    wrapper.setProps({ initState: { renderers: materialRenderers, core } });
    wrapper.update();
    const input = wrapper.find('input').first();
    expect(input.props().value).toBe('1980-04-04 13:37');
  });

  it('can be disabled', () => {
    const core = initCore(schema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl
          schema={schema}
          uischema={uischema}
          enabled={false}
        />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input').first();
    expect(input.props().disabled).toBeTruthy();
  });

  it('should be enabled by default', () => {
    const core = initCore(schema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl schema={schema} uischema={uischema} />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input').first();
    expect(input.props().disabled).toBeFalsy();
  });

  it('should render input id', () => {
    const core = initCore(schema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl
          schema={schema}
          uischema={uischema}
          id='#/properties/foo'
        />
      </JsonFormsStateProvider>
    );
    const input = wrapper.find('input').first();
    // there is only input id at the dayjs
    expect(input.props().id).toBe('#/properties/foo-input');
  });

  it('should be hideable', () => {
    const core = initCore(schema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl
          schema={schema}
          uischema={uischema}
          visible={false}
        />
      </JsonFormsStateProvider>
    );
    const inputs = wrapper.find('input');
    expect(inputs.length).toBe(0);
  });

  it('should support format customizations', () => {
    const core = initCore(schema, uischema, {
      foo: dayjs('1980-04-23 13:37').format('YYYY/MM/DD h:mm a'),
    });
    const onChangeData: any = {
      data: undefined,
    };
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <TestEmitter
          onChange={({ data }) => {
            onChangeData.data = data;
          }}
        />
        <MaterialDateTimeControl
          schema={schema}
          uischema={{
            ...uischema,
            options: {
              dateTimeFormat: 'DD-MM-YY hh:mm:a',
              dateTimeSaveFormat: 'YYYY/MM/DD h:mm a',
              ampm: true,
            },
          }}
        />
      </JsonFormsStateProvider>
    );

    const input = wrapper.find('input').first();
    expect(input.props().value).toBe('23-04-80 01:37:pm');

    (input.getDOMNode() as HTMLInputElement).value = '10-12-05 11:22:am';
    input.simulate('blur', input);
    expect(onChangeData.data.foo).toBe('2005/12/10 11:22 am');
  });

  it('should not remount the picker when blurring an empty field', () => {
    const core = initCore(schema, uischema, {});
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl schema={schema} uischema={uischema} />
      </JsonFormsStateProvider>
    );

    const inputBefore = wrapper.find('input').first().getDOMNode();
    wrapper.find('input').first().simulate('blur');
    wrapper.update();

    // A remount replaces the input and destroys the sibling open-picker button,
    // which is the element the browser focuses next when tabbing out.
    expect(wrapper.find('input').first().getDOMNode()).toBe(inputBefore);
  });

  it('should remount the picker when clearing a filled field', () => {
    const core = initCore(schema, uischema, data);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl schema={schema} uischema={uischema} />
      </JsonFormsStateProvider>
    );

    const input = wrapper.find('input').first();
    const inputBefore = input.getDOMNode();
    (inputBefore as HTMLInputElement).value = '';
    input.simulate('blur');
    wrapper.update();

    // The reset is still required here to clear the picker's internal state.
    expect(wrapper.find('input').first().getDOMNode()).not.toBe(inputBefore);
  });

  it('should restore focus when clearing an invalid field remounts the picker', () => {
    const core = initCore(schema, uischema, data);
    const container = document.createElement('div');
    document.body.appendChild(container);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl schema={schema} uischema={uischema} />
      </JsonFormsStateProvider>,
      { attachTo: container }
    );

    const input = wrapper.find('input').first();
    const inputNode = input.getDOMNode() as HTMLInputElement;
    const buttonBefore = inputNode.parentElement?.querySelector('button');
    expect(buttonBefore).toBeTruthy();

    // Invalid input still has to reset the picker, which destroys the button the
    // browser is moving focus to when tabbing out of the field.
    inputNode.value = 'not-a-date';
    input.simulate('blur', { relatedTarget: buttonBefore });
    wrapper.update();

    const buttonAfter = (
      wrapper.find('input').first().getDOMNode() as HTMLInputElement
    ).parentElement?.querySelector('button');
    expect(buttonAfter).toBeTruthy();
    expect(buttonAfter).not.toBe(buttonBefore);
    expect(document.activeElement).toBe(buttonAfter);
  });

  it('should restore focus when a partially typed date remounts the picker', () => {
    const core = initCore(schema, uischema, {});
    const container = document.createElement('div');
    document.body.appendChild(container);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl schema={schema} uischema={uischema} />
      </JsonFormsStateProvider>,
      { attachTo: container }
    );

    const input = wrapper.find('input').first();
    const inputNode = input.getDOMNode() as HTMLInputElement;
    const buttonBefore = inputNode.parentElement?.querySelector('button');

    // Only the year section was filled in. That does not parse, so the picker
    // is reset even though the field started out empty.
    inputNode.value = '1980-MM-DD HH:mm';
    input.simulate('blur', { relatedTarget: buttonBefore });
    wrapper.update();

    const buttonAfter = (
      wrapper.find('input').first().getDOMNode() as HTMLInputElement
    ).parentElement?.querySelector('button');
    expect(buttonAfter).toBeTruthy();
    expect(buttonAfter).not.toBe(buttonBefore);
    expect(document.activeElement).toBe(buttonAfter);
  });

  it('should not restore focus when an invalid field is blurred past the control', () => {
    const core = initCore(schema, uischema, data);
    const container = document.createElement('div');
    document.body.appendChild(container);
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl schema={schema} uischema={uischema} />
      </JsonFormsStateProvider>,
      { attachTo: container }
    );

    const input = wrapper.find('input').first();
    const inputNode = input.getDOMNode() as HTMLInputElement;
    const buttonBefore = inputNode.parentElement?.querySelector('button');

    // Focus went somewhere outside the control, so the remount is not what takes
    // it away and the control must leave it where the browser put it.
    outside.focus();
    inputNode.value = 'not-a-date';
    input.simulate('blur');
    wrapper.update();

    const buttonAfter = (
      wrapper.find('input').first().getDOMNode() as HTMLInputElement
    ).parentElement?.querySelector('button');
    expect(buttonAfter).toBeTruthy();
    expect(buttonAfter).not.toBe(buttonBefore);
    expect(document.activeElement).toBe(outside);

    document.body.removeChild(outside);
  });

  it('should not disturb focus when blurring a field with a valid value', () => {
    const core = initCore(schema, uischema, data);
    const container = document.createElement('div');
    document.body.appendChild(container);
    wrapper = mount(
      <JsonFormsStateProvider
        initState={{ renderers: materialRenderers, core }}
      >
        <MaterialDateTimeControl schema={schema} uischema={uischema} />
      </JsonFormsStateProvider>,
      { attachTo: container }
    );

    const input = wrapper.find('input').first();
    const inputNode = input.getDOMNode() as HTMLInputElement;
    const buttonBefore = inputNode.parentElement?.querySelector('button');

    // Emulate the browser having moved focus on to the open picker button.
    buttonBefore?.focus();
    input.simulate('blur', { relatedTarget: buttonBefore });
    wrapper.update();

    // A valid value never resets the picker, so the tab target survives.
    expect(wrapper.find('input').first().getDOMNode()).toBe(inputNode);
    expect(
      (
        wrapper.find('input').first().getDOMNode() as HTMLInputElement
      ).parentElement?.querySelector('button')
    ).toBe(buttonBefore);
    expect(document.activeElement).toBe(buttonBefore);
  });
});

it('should render with a placeholder', () => {
  const control: ControlElement = {
    type: 'Control',
    scope: '#/properties/foo',
    options: {
      placeholder: 'Select a date and time',
    },
  };
  const core = initCore(schema, control, data);
  const wrapper = mount(
    <JsonFormsStateProvider initState={{ renderers: materialRenderers, core }}>
      <MaterialDateTimeControl schema={schema} uischema={control} />
    </JsonFormsStateProvider>
  );

  // Log the rendered component tree for debugging
  console.log(wrapper.debug());

  // Find the input element
  const inputElement = wrapper.find('input').first();

  // Check the placeholder attribute
  expect(inputElement.props().placeholder).toBe('Select a date and time');
});
