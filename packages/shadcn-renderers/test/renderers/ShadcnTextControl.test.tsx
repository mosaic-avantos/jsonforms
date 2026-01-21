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
import Enzyme, { mount, ReactWrapper } from 'enzyme';
import {
  ShadcnTextControl,
  shadcnTextControlTester,
} from '../../src/controls/ShadcnTextControl';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import {
  ControlElement,
  ControlProps,
  NOT_APPLICABLE,
} from '@mosaic-avantos/jsonforms-core';

Enzyme.configure({ adapter: new Adapter() });

const schema = {
  type: 'object',
  properties: {
    foo: {
      type: 'string',
    },
  },
};
const uischema: ControlElement = {
  type: 'Control',
  scope: '#/properties/foo',
};

const createShadcnTextControl = (props: ControlProps) => {
  return <ShadcnTextControl {...props} />;
};

const defaultControlProps = (): ControlProps => {
  return {
    handleChange: () => {},
    enabled: true,
    visible: true,
    path: 'foo',
    rootSchema: schema,
    schema: schema.properties.foo,
    uischema: uischema,
    label: 'Foo',
    id: 'foo-id',
    errors: '',
    data: '',
  };
};

describe('Shadcn text control tester', () => {
  it('should fail', () => {
    expect(shadcnTextControlTester(undefined as any, undefined as any, undefined as any)).toBe(
      NOT_APPLICABLE
    );
    expect(shadcnTextControlTester(null as any, undefined as any, undefined as any)).toBe(
      NOT_APPLICABLE
    );
    expect(shadcnTextControlTester({ type: 'Foo' } as any, undefined as any, undefined as any)).toBe(
      NOT_APPLICABLE
    );
    expect(
      shadcnTextControlTester({ type: 'Control' } as any, undefined as any, undefined as any)
    ).toBe(NOT_APPLICABLE);
  });

  it('should fail with wrong schema type', () => {
    const control: ControlElement = {
      type: 'Control',
      scope: '#/properties/foo',
    };
    expect(
      shadcnTextControlTester(
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

  it('should succeed with matching prop type', () => {
    const control: ControlElement = {
      type: 'Control',
      scope: '#/properties/foo',
    };
    expect(
      shadcnTextControlTester(
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

describe('Shadcn text control', () => {
  let wrapper: ReactWrapper;

  afterEach(() => {
    wrapper.unmount();
  });

  it('should render', () => {
    const props = defaultControlProps();
    wrapper = mount(createShadcnTextControl(props));
    expect(wrapper.find('input').length).toBe(1);
  });

  it('should render with correct value', () => {
    const props = {
      ...defaultControlProps(),
      data: 'test value',
    };
    wrapper = mount(createShadcnTextControl(props));
    expect(wrapper.find('input').props().value).toBe('test value');
  });

  it('should render with empty value when data is undefined', () => {
    const props = {
      ...defaultControlProps(),
      data: undefined,
    };
    wrapper = mount(createShadcnTextControl(props));
    expect(wrapper.find('input').props().value).toBe('');
  });

  it('should render label', () => {
    const props = defaultControlProps();
    wrapper = mount(createShadcnTextControl(props));
    expect(wrapper.text()).toContain('Foo');
  });

  it('should be disabled when enabled is false', () => {
    const props = {
      ...defaultControlProps(),
      enabled: false,
    };
    wrapper = mount(createShadcnTextControl(props));
    expect(wrapper.find('input').props().disabled).toBe(true);
  });

  it('should be enabled by default', () => {
    const props = defaultControlProps();
    wrapper = mount(createShadcnTextControl(props));
    expect(wrapper.find('input').props().disabled).toBeFalsy();
  });

  it('should not render when visible is false', () => {
    const props = {
      ...defaultControlProps(),
      visible: false,
    };
    wrapper = mount(createShadcnTextControl(props));
    expect(wrapper.find('input').length).toBe(0);
  });

  it('should call handleChange on input change', () => {
    const handleChange = jest.fn();
    const props = {
      ...defaultControlProps(),
      handleChange,
    };
    wrapper = mount(createShadcnTextControl(props));
    wrapper.find('input').simulate('change', { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledWith('foo', 'new value');
  });

  it('should render placeholder when provided', () => {
    const props = {
      ...defaultControlProps(),
      uischema: {
        ...uischema,
        options: {
          placeholder: 'Enter text here',
        },
      },
    };
    wrapper = mount(createShadcnTextControl(props));
    expect(wrapper.find('input').props().placeholder).toBe('Enter text here');
  });

  it('should show required asterisk when required', () => {
    const props = {
      ...defaultControlProps(),
      required: true,
    };
    wrapper = mount(createShadcnTextControl(props));
    expect(wrapper.text()).toContain('*');
  });

  it('should hide required asterisk when hideRequiredAsterisk option is true', () => {
    const props = {
      ...defaultControlProps(),
      required: true,
      uischema: {
        ...uischema,
        options: {
          hideRequiredAsterisk: true,
        },
      },
    };
    wrapper = mount(createShadcnTextControl(props));
    expect(wrapper.find('label').text()).not.toContain('*');
  });

  it('should apply error styling when there are errors', () => {
    const props = {
      ...defaultControlProps(),
      errors: 'This field is required',
    };
    wrapper = mount(createShadcnTextControl(props));
    expect(wrapper.find('input').hasClass('border-destructive')).toBe(true);
  });
});
