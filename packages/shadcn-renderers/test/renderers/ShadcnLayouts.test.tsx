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
import Enzyme, { mount } from 'enzyme';
import { shadcnRenderers } from '../../src';
import {
  Layout,
  NOT_APPLICABLE,
  RuleEffect,
  UISchemaElement,
} from '@mosaic-avantos/jsonforms-core';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { JsonForms } from '@mosaic-avantos/jsonforms-react';
import {
  shadcnVerticalLayoutTester,
  shadcnHorizontalLayoutTester,
} from '../../src/layouts';

Enzyme.configure({ adapter: new Adapter() });

const schema = {
  type: 'object',
  properties: {
    toggleTopLayout: {
      type: 'boolean',
    },
    topString: {
      type: 'string',
    },
    toggleMiddleLayout: {
      type: 'boolean',
    },
    middleString: {
      type: 'string',
    },
  },
};

const baseUischema = () => ({
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/topString',
    },
    {
      type: 'HorizontalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/middleString',
        },
      ],
    },
  ],
});

const rule = (effect: RuleEffect, propertyName: string) => ({
  effect: effect,
  condition: {
    scope: '#/properties/' + propertyName,
    schema: { const: true },
  },
});

describe('Layout Testers', () => {
  describe('Vertical Layout Tester', () => {
    it('should fail for undefined', () => {
      expect(shadcnVerticalLayoutTester(undefined as any, undefined as any, undefined as any)).toBe(
        NOT_APPLICABLE
      );
    });

    it('should fail for null', () => {
      expect(shadcnVerticalLayoutTester(null as any, undefined as any, undefined as any)).toBe(
        NOT_APPLICABLE
      );
    });

    it('should fail for wrong type', () => {
      expect(
        shadcnVerticalLayoutTester({ type: 'Foo' } as any, undefined as any, undefined as any)
      ).toBe(NOT_APPLICABLE);
    });

    it('should succeed for VerticalLayout', () => {
      expect(
        shadcnVerticalLayoutTester(
          { type: 'VerticalLayout' } as any,
          undefined as any,
          undefined as any
        )
      ).toBe(1);
    });
  });

  describe('Horizontal Layout Tester', () => {
    it('should fail for undefined', () => {
      expect(shadcnHorizontalLayoutTester(undefined as any, undefined as any, undefined as any)).toBe(
        NOT_APPLICABLE
      );
    });

    it('should fail for null', () => {
      expect(shadcnHorizontalLayoutTester(null as any, undefined as any, undefined as any)).toBe(
        NOT_APPLICABLE
      );
    });

    it('should fail for wrong type', () => {
      expect(
        shadcnHorizontalLayoutTester({ type: 'Foo' } as any, undefined as any, undefined as any)
      ).toBe(NOT_APPLICABLE);
    });

    it('should succeed for HorizontalLayout', () => {
      expect(
        shadcnHorizontalLayoutTester(
          { type: 'HorizontalLayout' } as any,
          undefined as any,
          undefined as any
        )
      ).toBe(1);
    });
  });
});

describe('Layout Tests', () => {
  let wrapper: Enzyme.ReactWrapper;

  const createWrapper = (data: any, uischema: UISchemaElement) => {
    wrapper = mount(
      <JsonForms
        data={data}
        schema={schema}
        uischema={uischema}
        renderers={shadcnRenderers}
      />
    );
  };

  afterEach(() => {
    wrapper.unmount();
  });

  const controlIsShown = (control: string) => {
    switch (control) {
      case 'top':
        return wrapper.find('input').at(0).exists();
      case 'middle':
        return wrapper.find('input').at(1).exists();
      default:
        fail('Should not happen, something is massively broken');
    }
  };

  const controlIsEnabled = (control: string) => {
    let foundControl;
    switch (control) {
      case 'top':
        foundControl = wrapper.find('input').at(0);
        break;
      case 'middle':
        foundControl = wrapper.find('input').at(1);
        break;
      default:
        fail('Should not happen, something is massively broken');
    }
    if (!foundControl.exists()) {
      fail('Control was expected to be rendered but could not be found');
    }
    return (
      foundControl.props().disabled === undefined ||
      !foundControl.props().disabled
    );
  };

  describe('Sanity Checks', () => {
    it('should render all inputs without rules', () => {
      const data = {
        toggleTopLayout: true,
        toggleMiddleLayout: true,
      };
      createWrapper(data, baseUischema());
      expect(controlIsShown('top')).toBe(true);
      expect(controlIsShown('middle')).toBe(true);
    });

    it('should render inputs in vertical layout', () => {
      const data = {};
      const uischema = {
        type: 'VerticalLayout',
        elements: [
          { type: 'Control', scope: '#/properties/topString' },
          { type: 'Control', scope: '#/properties/middleString' },
        ],
      };
      createWrapper(data, uischema);
      expect(wrapper.find('input').length).toBe(2);
    });

    it('should render inputs in horizontal layout', () => {
      const data = {};
      const uischema = {
        type: 'HorizontalLayout',
        elements: [
          { type: 'Control', scope: '#/properties/topString' },
          { type: 'Control', scope: '#/properties/middleString' },
        ],
      };
      createWrapper(data, uischema);
      expect(wrapper.find('input').length).toBe(2);
    });
  });

  describe('SHOW Rule', () => {
    it('hiding top layout should hide everything', () => {
      const data = {
        toggleTopLayout: false,
      };
      const uischema = {
        ...baseUischema(),
        rule: rule(RuleEffect.SHOW, 'toggleTopLayout'),
      };
      createWrapper(data, uischema as Layout);
      expect(wrapper.find('input').length).toBe(0);
    });

    it('showing top layout should show everything', () => {
      const data = {
        toggleTopLayout: true,
      };
      const uischema = {
        ...baseUischema(),
        rule: rule(RuleEffect.SHOW, 'toggleTopLayout'),
      };
      createWrapper(data, uischema as Layout);
      expect(controlIsShown('top')).toBe(true);
      expect(controlIsShown('middle')).toBe(true);
    });
  });

  describe('ENABLE Rule', () => {
    it('disabling top layout should disable everything', () => {
      const data = {
        toggleTopLayout: false,
      };
      const uischema = {
        ...baseUischema(),
        rule: rule(RuleEffect.ENABLE, 'toggleTopLayout'),
      };
      createWrapper(data, uischema as Layout);
      expect(controlIsEnabled('top')).toBe(false);
      expect(controlIsEnabled('middle')).toBe(false);
    });

    it('enabling top layout should enable everything', () => {
      const data = {
        toggleTopLayout: true,
      };
      const uischema = {
        ...baseUischema(),
        rule: rule(RuleEffect.ENABLE, 'toggleTopLayout'),
      };
      createWrapper(data, uischema as Layout);
      expect(controlIsEnabled('top')).toBe(true);
      expect(controlIsEnabled('middle')).toBe(true);
    });
  });

  describe('Nested Layouts', () => {
    it('should render nested horizontal layout inside vertical layout', () => {
      const data = {};
      createWrapper(data, baseUischema());
      expect(wrapper.find('input').length).toBe(2);
    });
  });
});
