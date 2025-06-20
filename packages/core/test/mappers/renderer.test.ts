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
import * as _ from 'lodash';
import * as Redux from 'redux';
import configureStore from 'redux-mock-store';
import test from 'ava';

import { ErrorObject } from 'ajv';
import { JsonFormsCore, JsonFormsState, i18nJsonSchema } from '../../src/store';
import {
  configReducer,
  coreReducer,
  defaultJsonFormsI18nState,
} from '../../src/reducers';
import {
  CoreActions,
  init,
  setValidationMode,
  update,
  UpdateAction,
  UPDATE_DATA,
  setConfig,
} from '../../src/actions';
import {
  ControlElement,
  JsonSchema,
  JsonSchema7,
  LabelElement,
  RuleEffect,
  UISchemaElement,
} from '../../src/models';
import {
  OwnPropsOfControl,
  computeLabel,
  createDefaultValue,
  mapDispatchToArrayControlProps,
  mapDispatchToControlProps,
  mapDispatchToMultiEnumProps,
  mapStateToAnyOfProps,
  mapStateToArrayLayoutProps,
  mapStateToControlProps,
  mapStateToEnumControlProps,
  mapStateToJsonFormsRendererProps,
  mapStateToLabelProps,
  mapStateToLayoutProps,
  mapStateToMultiEnumControlProps,
  mapStateToOneOfEnumControlProps,
  mapStateToOneOfProps,
} from '../../src/mappers';
import { clearAllIds, convertDateToString, createAjv } from '../../src/util';
import { rankWith } from '../../src';

type Combinator = 'allOf' | 'anyOf' | 'oneOf';

const middlewares: Redux.Middleware[] = [];
const mockStore = configureStore<JsonFormsState>(middlewares);

const mockDispatch = (
  initialCore: JsonFormsCore
): [() => JsonFormsCore, Redux.Dispatch<CoreActions>] => {
  const coreContainer = { core: initialCore };
  const dispatch: Redux.Dispatch<CoreActions> = <T extends CoreActions>(
    action: T
  ): T => {
    coreContainer.core = coreReducer(coreContainer.core, action);
    return action;
  };
  const getCore = () => coreContainer.core;
  return [getCore, dispatch];
};

const hideRule = {
  effect: RuleEffect.HIDE,
  condition: {
    type: 'LEAF',
    scope: '#/properties/firstName',
    expectedValue: 'Homer',
  },
};

const disableRule = {
  effect: RuleEffect.DISABLE,
  condition: {
    type: 'LEAF',
    scope: '#/properties/firstName',
    expectedValue: 'Homer',
  },
};

const enableRule = {
  effect: RuleEffect.ENABLE,
  condition: {
    type: 'LEAF',
    scope: '#/properties/firstName',
    expectedValue: 'Homer',
  },
};

const coreUISchema: ControlElement = {
  type: 'Control',
  scope: '#/properties/firstName',
};

const createState = (uischema: UISchemaElement) => ({
  jsonforms: {
    core: {
      schema: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
        },
      },
      data: {
        firstName: 'Homer',
      },
      uischema,
      errors: [] as ErrorObject[],
    },
  },
});

test('mapStateToControlProps - visible via ownProps ', (t) => {
  const uischema = {
    ...coreUISchema,
    rule: hideRule,
  };
  const ownProps = {
    visible: true,
    uischema,
  };
  const props = mapStateToControlProps(createState(uischema), ownProps);
  t.false(props.visible);
});

test('mapStateToControlProps - hidden via ownProps ', (t) => {
  const uischema = {
    ...coreUISchema,
    rule: hideRule,
  };
  const ownProps = {
    visible: false,
    uischema,
  };
  const props = mapStateToControlProps(createState(uischema), ownProps);
  t.false(props.visible);
});

test('mapStateToControlProps - hidden via state ', (t) => {
  const uischema = {
    ...coreUISchema,
    rule: hideRule,
  };
  const ownProps = {
    uischema,
  };
  const props = mapStateToControlProps(createState(uischema), ownProps);
  t.false(props.visible);
});

test('mapStateToControlProps - visible via state ', (t) => {
  const uischema = {
    ...coreUISchema,
    rule: hideRule,
  };
  const ownProps = {
    uischema,
  };
  const clonedState = _.cloneDeep(createState(uischema));
  clonedState.jsonforms.core.data.firstName = 'Lisa';
  const props = mapStateToControlProps(clonedState, ownProps);
  t.true(props.visible);
});

test('mapStateToControlProps - visible via state with path from ownProps ', (t) => {
  const uischema = {
    ...coreUISchema,
    rule: hideRule,
  };
  const ownProps = {
    uischema,
    path: 'foo',
  };
  const state = {
    jsonforms: {
      core: {
        schema: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        },
        data: {
          foo: { firstName: 'Lisa' },
        },
        uischema,
        errors: [] as ErrorObject[],
      },
    },
  };
  const props = mapStateToControlProps(state, ownProps);
  t.true(props.visible);
});

test('mapStateToControlProps - disabled via global readonly', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.readonly = true;

  const props = mapStateToControlProps(state, ownProps);
  t.false(props.enabled);
});

test('mapStateToControlProps - disabled via global readonly beats enabled via ownProps', (t) => {
  const ownProps = {
    uischema: coreUISchema,
    enabled: true,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.readonly = true;

  const props = mapStateToControlProps(state, ownProps);
  t.false(props.enabled);
});

test('mapStateToControlProps - disabled via global readonly beats enabled via rule', (t) => {
  const uischema = {
    ...coreUISchema,
    rule: enableRule,
  };
  const ownProps = {
    uischema,
  };
  const state: JsonFormsState = createState(uischema);
  state.jsonforms.readonly = true;

  const props = mapStateToControlProps(state, ownProps);
  t.false(props.enabled);
});

test('mapStateToControlProps - enabled via state with path from ownProps ', (t) => {
  const uischema = {
    ...coreUISchema,
    rule: disableRule,
  };
  const ownProps = {
    visible: true,
    uischema,
    path: 'foo',
  };
  const state = {
    jsonforms: {
      core: {
        schema: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        },
        data: {
          foo: { firstName: 'Lisa' },
        },
        uischema,
        errors: [] as ErrorObject[],
      },
    },
  };
  const props = mapStateToControlProps(state, ownProps);
  t.true(props.enabled);
});

test('mapStateToControlProps - enabled via ownProps ', (t) => {
  const uischema = {
    ...coreUISchema,
    rule: disableRule,
  };
  const ownProps = {
    enabled: true,
    uischema,
  };
  const props = mapStateToControlProps(createState(uischema), ownProps);
  t.false(props.enabled);
});

test('mapStateToControlProps - disabled via ownProps ', (t) => {
  const uischema = {
    ...coreUISchema,
    rule: disableRule,
  };
  const ownProps = {
    enabled: false,
    uischema,
  };
  const props = mapStateToControlProps(createState(uischema), ownProps);
  t.false(props.enabled);
});

test('mapStateToControlProps - disabled via state ', (t) => {
  const uischema = {
    ...coreUISchema,
    rule: disableRule,
  };
  const ownProps = {
    uischema,
  };
  const props = mapStateToControlProps(createState(uischema), ownProps);
  t.false(props.enabled);
});

test('mapStateToControlProps - enabled via state ', (t) => {
  const uischema = {
    ...coreUISchema,
    rule: disableRule,
  };
  const ownProps = {
    uischema,
  };
  const clonedState = _.cloneDeep(createState(uischema));
  clonedState.jsonforms.core.data.firstName = 'Lisa';
  const props = mapStateToControlProps(clonedState, ownProps);
  t.true(props.enabled);
});

test('mapStateToControlProps - path', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const props = mapStateToControlProps(createState(coreUISchema), ownProps);
  t.is(props.path, 'firstName');
});

test('mapStateToControlProps - compose path with ownProps.path', (t) => {
  const ownProps = {
    uischema: coreUISchema,
    path: 'yo',
  };
  const props = mapStateToControlProps(createState(coreUISchema), ownProps);
  t.is(props.path, 'yo.firstName');
});

test('mapStateToControlProps - derive label', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const props = mapStateToControlProps(createState(coreUISchema), ownProps);
  t.is(props.label, 'First Name');
});

test('mapStateToControlProps - do not show label', (t) => {
  const ownProps = {
    uischema: {
      ...coreUISchema,
      label: {
        show: false,
      },
    },
  };
  const props = mapStateToControlProps(createState(coreUISchema), ownProps);
  t.is(props.label, '');
});

test('mapStateToControlProps - data', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const props = mapStateToControlProps(createState(coreUISchema), ownProps);
  t.is(props.data, 'Homer');
});

test('mapStateToControlProps - errors', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const clonedState = _.cloneDeep(createState(coreUISchema));
  const error: ErrorObject = {
    instancePath: '/firstName',
    message: 'Duff beer',
    keyword: 'whatever',
    schemaPath: '',
    params: undefined,
    parentSchema: { type: 'string' },
  };
  clonedState.jsonforms.core.errors = [error];
  const props = mapStateToControlProps(clonedState, ownProps);
  t.is(props.errors, 'Duff beer');
});

test('mapStateToControlProps - no duplicate error messages', (t) => {
  const schema = {
    type: 'object',
    properties: {
      firstName: {
        anyOf: [
          { type: 'string', minLength: 5 },
          { type: 'string', enum: ['foo', 'bar'] },
        ],
      },
    },
  };
  const initCoreState = coreReducer(undefined, init({}, schema, coreUISchema));
  const updateCoreState = coreReducer(
    initCoreState,
    update('firstName', () => true)
  );
  const props = mapStateToControlProps(
    { jsonforms: { core: updateCoreState } },
    { uischema: coreUISchema }
  );
  t.is(props.errors.split('\n').length, 1);
});

test('mapStateToControlProps - id', (t) => {
  clearAllIds();
  const ownProps = {
    uischema: coreUISchema,
    id: '#/properties/firstName',
  };
  const props = mapStateToControlProps(createState(coreUISchema), ownProps);
  t.is(props.id, '#/properties/firstName');
});

test('mapStateToControlProps - required not checked dynamically if not explicitly specified in config', (t) => {
  const schema = {
    type: 'object',
    properties: {
      notifications: { type: 'boolean' },
      firstName: { type: 'string' },
    },
    required: ['notifications'],
    if: {
      properties: {
        notifications: { const: true },
      },
    },
    then: {
      required: ['firstName'],
    },
  };

  const ownProps: OwnPropsOfControl = {
    uischema: coreUISchema,
    schema,
  };

  const createState = (data: {
    notifications: boolean;
    firstName: string;
  }) => ({
    jsonforms: {
      core: {
        schema,
        uischema: coreUISchema,
        data,
        errors: [] as ErrorObject[],
      },
    },
  });

  const stateTrue = createState({ notifications: true, firstName: 'Bart' });
  const stateFalse = createState({ notifications: false, firstName: 'Bart' });

  const propsTrue = mapStateToControlProps(stateTrue, ownProps);
  const propsFalse = mapStateToControlProps(stateFalse, ownProps);
  t.false(propsTrue.required);
  t.false(propsFalse.required);
});

test('mapStateToControlProps - required with dynamic check based on single condition', (t) => {
  const schema = {
    type: 'object',
    properties: {
      notifications: { type: 'boolean' },
      firstName: { type: 'string' },
    },
    required: ['notifications'],
    if: {
      properties: {
        notifications: { const: true },
      },
    },
    then: {
      required: ['firstName'],
    },
  };

  const ownProps: OwnPropsOfControl = {
    uischema: coreUISchema,
    schema,
  };

  const config = setConfig({
    allowDynamicCheck: true,
  });

  const createState = (data: {
    notifications: boolean;
    firstName: string;
  }) => ({
    jsonforms: {
      core: {
        schema,
        uischema: coreUISchema,
        data,
        errors: [] as ErrorObject[],
      },
      config: configReducer(undefined, config),
    },
  });

  const stateTrue = createState({ notifications: true, firstName: 'Bart' });
  const stateFalse = createState({ notifications: false, firstName: 'Bart' });

  const propsTrue = mapStateToControlProps(stateTrue, ownProps);
  const propsFalse = mapStateToControlProps(stateFalse, ownProps);
  t.true(propsTrue.required);
  t.false(propsFalse.required);
});

test('mapStateToControlProps - required with dynamic check based on condition with missing data', (t) => {
  const schema = {
    type: 'object',
    properties: {
      role: { type: 'string' },
      firstName: { type: 'string' },
    },
    required: ['role'],
    if: {
      properties: {
        role: {
          not: {
            const: 'manager',
          },
        },
      },
    },
    then: {
      required: ['firstName'],
    },
  };

  const ownProps: OwnPropsOfControl = {
    uischema: coreUISchema,
    schema,
  };

  const createState = (data: { role?: string; firstName: string }) => {
    const { role, ...rest } = data;

    const config = setConfig({
      allowDynamicCheck: true,
    });

    return {
      jsonforms: {
        core: {
          schema,
          uischema: coreUISchema,
          data: role ? data : rest,
          errors: [] as ErrorObject[],
        },
        config: configReducer(undefined, config),
      },
    };
  };

  const stateMissing = createState({ firstName: 'Bart' });
  const stateTrue = createState({ role: 'lead', firstName: 'Bart' });
  const stateFalse = createState({ role: 'manager', firstName: 'Bart' });

  const propsMissing = mapStateToControlProps(stateMissing, ownProps);
  const propsTrue = mapStateToControlProps(stateTrue, ownProps);
  const propsFalse = mapStateToControlProps(stateFalse, ownProps);

  t.true(propsMissing.required);
  t.true(propsTrue.required);
  t.false(propsFalse.required);
});

test('mapStateToControlProps - required with dynamic check based on condition with combinators', (t) => {
  const createSchema = (combinator: Combinator) => ({
    type: 'object',
    properties: {
      notifications: { type: 'boolean' },
      email: { type: 'string' },
      firstName: { type: 'string' },
    },
    required: ['notifications'],
    if: {
      [combinator]: [
        {
          properties: {
            notifications: { const: true },
          },
        },
        {
          required: ['email'],
        },
      ],
    },
    then: {
      required: ['firstName'],
    },
  });

  const createState = (data: {
    combinator: Combinator;
    notifications: boolean;
    email?: string;
    firstName: string;
  }) => {
    const { email, ...rest } = data;
    const config = setConfig({
      allowDynamicCheck: true,
    });

    return {
      jsonforms: {
        core: {
          schema: createSchema(data.combinator),
          uischema: coreUISchema,
          data: email ? data : rest,
          errors: [] as ErrorObject[],
        },
        config: configReducer(undefined, config),
      },
    };
  };

  const stateAnyOfTrue = createState({
    combinator: 'anyOf',
    notifications: false,
    email: 'bart@email.com',
    firstName: 'Bart',
  });

  const stateAllOfTrue = createState({
    combinator: 'allOf',
    notifications: true,
    email: 'bart@email.com',
    firstName: 'Bart',
  });

  const stateOneOfTrue = createState({
    combinator: 'oneOf',
    notifications: true,
    firstName: 'Bart',
  });

  const stateAnyOfFalse = createState({
    combinator: 'anyOf',
    notifications: false,
    firstName: 'Bart',
  });

  const stateAllOfFalse = createState({
    combinator: 'allOf',
    notifications: true,
    firstName: 'Bart',
  });

  const stateOneOfFalse = createState({
    combinator: 'oneOf',
    notifications: true,
    email: 'bart@email.com',
    firstName: 'Bart',
  });

  const ownPropsAnyOf: OwnPropsOfControl = {
    uischema: coreUISchema,
    schema: createSchema('anyOf'),
  };

  const ownPropsAllOf: OwnPropsOfControl = {
    uischema: coreUISchema,
    schema: createSchema('allOf'),
  };

  const ownPropsOneOf: OwnPropsOfControl = {
    uischema: coreUISchema,
    schema: createSchema('oneOf'),
  };

  const propsAnyOfTrue = mapStateToControlProps(stateAnyOfTrue, ownPropsAnyOf);
  const propsAllOfTrue = mapStateToControlProps(stateAllOfTrue, ownPropsAllOf);
  const propsOneOfTrue = mapStateToControlProps(stateOneOfTrue, ownPropsOneOf);
  const propsAnyOfFalse = mapStateToControlProps(
    stateAnyOfFalse,
    ownPropsAnyOf
  );
  const propsAllOfFalse = mapStateToControlProps(
    stateAllOfFalse,
    ownPropsAllOf
  );
  const propsOneOfFalse = mapStateToControlProps(
    stateOneOfFalse,
    ownPropsOneOf
  );

  t.true(propsAnyOfTrue.required);
  t.true(propsAllOfTrue.required);
  t.true(propsOneOfTrue.required);
  t.false(propsAnyOfFalse.required);
  t.false(propsAllOfFalse.required);
  t.false(propsOneOfFalse.required);
});

test('mapStateToControlProps - required with dynamic check based on multiple conditions', (t) => {
  const schema: JsonSchema = {
    type: 'object',
    properties: {
      notifications: { type: 'boolean' },
      role: { type: 'string' },
      firstName: { type: 'string' },
    },
    required: ['notifications'],
    allOf: [
      {
        if: {
          properties: {
            notifications: { const: true },
          },
        },
        then: {
          required: ['firstName'],
        },
      },
      {
        if: {
          properties: {
            role: { const: 'manager' },
          },
        },
        then: {
          required: ['firstName'],
        },
      },
    ],
  };

  const ownProps: OwnPropsOfControl = {
    uischema: coreUISchema,
    schema,
  };

  const createState = (data: {
    notifications?: boolean;
    role: string;
    firstName: string;
  }) => {
    const config = setConfig({
      allowDynamicCheck: true,
    });

    return {
      jsonforms: {
        core: {
          schema,
          uischema: coreUISchema,
          data,
          errors: [] as ErrorObject[],
        },
        config: configReducer(undefined, config),
      },
    };
  };

  const stateFirstMatches = createState({
    notifications: true,
    role: 'employee',
    firstName: 'Bart',
  });

  const stateSecondMatches = createState({
    notifications: false,
    role: 'manager',
    firstName: 'Bart',
  });

  const propsFirstMatches = mapStateToControlProps(stateFirstMatches, ownProps);
  const propsSecondMatcher = mapStateToControlProps(
    stateSecondMatches,
    ownProps
  );
  t.true(propsFirstMatches.required);
  t.true(propsSecondMatcher.required);
});

test('mapStateToControlProps - required with dynamic check based on nested conditions', (t) => {
  const schema: JsonSchema = {
    type: 'object',
    properties: {
      notifications: { type: 'boolean' },
      role: { type: 'string' },
      firstName: { type: 'string' },
    },
    required: ['notifications'],
    if: {
      properties: {
        notifications: { const: true },
      },
    },
    then: {
      if: {
        properties: {
          role: {
            pattern: '[a-zA-Z]+',
          },
        },
      },
      then: {
        required: ['firstName'],
      },
    },
  };

  const ownProps: OwnPropsOfControl = {
    uischema: coreUISchema,
    schema,
  };

  const createState = (data: {
    notifications?: boolean;
    role: string;
    firstName: string;
  }) => {
    const { notifications, ...rest } = data;

    const config = setConfig({
      allowDynamicCheck: true,
    });

    return {
      jsonforms: {
        core: {
          schema,
          uischema: coreUISchema,
          data: notifications !== undefined ? data : rest,
          errors: [] as ErrorObject[],
        },
        config: configReducer(undefined, config),
      },
    };
  };

  const stateAllTrue = createState({
    notifications: true,
    role: 'manager',
    firstName: 'Bart',
  });
  const stateInnerFalse = createState({
    notifications: true,
    role: '398',
    firstName: 'Bart',
  });
  const stateOuterFalse = createState({
    role: 'manager',
    firstName: 'Bart',
  });

  const propsAllTrue = mapStateToControlProps(stateAllTrue, ownProps);
  const propsInnerFalse = mapStateToControlProps(stateInnerFalse, ownProps);
  const propsOuterFalse = mapStateToControlProps(stateOuterFalse, ownProps);

  t.true(propsAllTrue.required);
  t.false(propsInnerFalse.required);
  t.false(propsOuterFalse.required);
});

test('mapStateToControlProps - required with dynamic check based on multiple conditions in nested "allOf"-s', (t) => {
  const schema: JsonSchema = {
    type: 'object',
    properties: {
      notifications: { type: 'boolean' },
      role: { type: 'string' },
      qualifies: { type: 'boolean' },
      firstName: { type: 'string' },
    },
    required: ['notifications'],
    allOf: [
      {
        allOf: [
          {
            if: {
              properties: {
                notifications: { const: true },
              },
            },
            then: {
              required: ['firstName'],
            },
          },
          {
            if: {
              properties: {
                role: { enum: ['manager', 'lead'] },
              },
            },
            then: {
              required: ['firstName'],
            },
          },
        ],
      },
      {
        if: {
          properties: {
            qualified: { const: true },
          },
        },
        then: {
          required: ['firstName'],
        },
      },
    ],
  };

  const ownProps: OwnPropsOfControl = {
    uischema: coreUISchema,
    schema,
  };

  const createState = (data: {
    notifications: boolean;
    qualified: boolean;
    role: string;
    firstName: string;
  }) => {
    const config = setConfig({
      allowDynamicCheck: true,
    });

    return {
      jsonforms: {
        core: {
          schema,
          uischema: coreUISchema,
          data,
          errors: [] as ErrorObject[],
        },
        config: configReducer(undefined, config),
      },
    };
  };

  const stateFirstMatches = createState({
    notifications: true,
    qualified: false,
    role: 'employee',
    firstName: 'Bart',
  });

  const stateSecondMatches = createState({
    notifications: false,
    qualified: false,
    role: 'manager',
    firstName: 'Bart',
  });

  const stateThirdMatches = createState({
    notifications: false,
    qualified: true,
    role: 'employee',
    firstName: 'Bart',
  });

  const propsFirstMatches = mapStateToControlProps(stateFirstMatches, ownProps);
  const propsSecondMatcher = mapStateToControlProps(
    stateSecondMatches,
    ownProps
  );
  const propsThirdMatcher = mapStateToControlProps(stateThirdMatches, ownProps);

  t.true(propsFirstMatches.required);
  t.true(propsSecondMatcher.required);
  t.true(propsThirdMatcher.required);
});

test('mapStateToControlProps - required with dynamic check based on condition for nested object', (t) => {
  const schema: JsonSchema = {
    type: 'object',
    properties: {
      role: {
        type: 'object',
        properties: {
          position: { type: 'string' },
          experience: { type: 'number' },
        },
      },
      firstName: { type: 'string' },
    },
    required: ['notifications'],
    if: {
      properties: {
        role: {
          properties: {
            position: { enum: ['manager', 'lead'] },
          },
        },
      },
    },
    then: {
      required: ['firstName'],
    },
  };

  const ownProps: OwnPropsOfControl = {
    uischema: coreUISchema,
    schema,
  };

  const createState = (data: {
    role: {
      position: string;
      experience: number;
    };
    firstName: string;
  }) => {
    const config = setConfig({
      allowDynamicCheck: true,
    });

    return {
      jsonforms: {
        core: {
          schema,
          uischema: coreUISchema,
          data,
          errors: [] as ErrorObject[],
        },
        config: configReducer(undefined, config),
      },
    };
  };

  const stateTrue = createState({
    role: {
      position: 'lead',
      experience: 5,
    },
    firstName: 'Bart',
  });

  const stateFalse = createState({
    role: {
      position: 'employee',
      experience: 1,
    },
    firstName: 'Bart',
  });

  const propsTrue = mapStateToControlProps(stateTrue, ownProps);
  const propsFalse = mapStateToControlProps(stateFalse, ownProps);

  t.true(propsTrue.required);
  t.false(propsFalse.required);
});

test('mapStateToControlProps - required with dynamic check based on parent condition', (t) => {
  const schema: JsonSchema = {
    type: 'object',
    properties: {
      notifications: { type: 'boolean' },
      role: {
        type: 'object',
        properties: {
          position: { type: 'string' },
          firstName: { type: 'string' },
        },
      },
    },
    required: ['notifications'],
    if: {
      properties: {
        notifications: { const: true },
      },
    },
    then: {
      properties: {
        role: {
          required: ['firstName'],
        },
      },
    },
  };

  const ownProps: OwnPropsOfControl = {
    uischema: {
      type: 'Control',
      scope: '#/properties/role/properties/firstName',
    },
    schema,
  };

  const createState = (data: {
    notifications: boolean;
    role: {
      position: string;
      firstName: string;
    };
  }) => {
    const config = setConfig({
      allowDynamicCheck: true,
    });

    return {
      jsonforms: {
        core: {
          schema,
          uischema: coreUISchema,
          data,
          errors: [] as ErrorObject[],
        },
        config: configReducer(undefined, config),
      },
    };
  };

  const stateTrue = createState({
    notifications: true,
    role: {
      position: 'lead',
      firstName: 'Bart',
    },
  });

  const stateFalse = createState({
    notifications: false,
    role: {
      position: 'lead',
      firstName: 'Bart',
    },
  });

  const propsTrue = mapStateToControlProps(stateTrue, ownProps);
  const propsFalse = mapStateToControlProps(stateFalse, ownProps);

  t.true(propsTrue.required);
  t.false(propsFalse.required);
});

test('mapStateToControlProps - hide errors in hide validation mode', (t) => {
  const schema = {
    type: 'object',
    properties: {
      animal: {
        type: 'string',
      },
    },
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/animal',
  };
  const initCoreState = coreReducer(
    undefined,
    init({ animal: 100 }, schema, uischema)
  );
  t.is(initCoreState.errors.length, 1);

  const ownProps = {
    uischema,
  };
  const props = mapStateToControlProps(
    { jsonforms: { core: initCoreState } },
    ownProps
  );
  t.not(props.errors.length, 0);

  const hideErrorsState = coreReducer(
    initCoreState,
    setValidationMode('ValidateAndHide')
  );
  t.is(hideErrorsState.errors.length, 1);

  const hideErrorsProps = mapStateToControlProps(
    { jsonforms: { core: hideErrorsState } },
    ownProps
  );
  t.is(hideErrorsProps.errors, '');
});

test('mapDispatchToControlProps', (t) => {
  const store = mockStore(createState(coreUISchema));
  const props = mapDispatchToControlProps(store.dispatch);
  props.handleChange('foo', 42);
  const updateAction = _.head<any>(store.getActions()) as UpdateAction;
  t.is(updateAction.type, UPDATE_DATA);
  t.is(updateAction.path, 'foo');
  t.is(updateAction.updater(), 42);
});

test('createDefaultValue', (t) => {
  t.is(
    createDefaultValue(
      {
        type: 'string',
        format: 'date',
      },
      {
        type: 'string',
        format: 'date',
      }
    ),
    convertDateToString(new Date(), 'date')
  );
  t.regex(
    createDefaultValue(
      {
        type: 'string',
        format: 'date-time',
      },
      {
        type: 'string',
        format: 'date-time',
      }
    ),
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
  );
  t.regex(
    createDefaultValue(
      {
        type: 'string',
        format: 'time',
      },
      {
        type: 'string',
        format: 'time',
      }
    ),
    /^\d{2}:\d{2}:\d{2}$/
  );
  t.is(createDefaultValue({ type: 'string' }, { type: 'string' }), '');
  t.is(createDefaultValue({ type: 'number' }, { type: 'number' }), 0);
  t.falsy(createDefaultValue({ type: 'boolean' }, { type: 'boolean' }));
  t.is(createDefaultValue({ type: 'integer' }, { type: 'integer' }), 0);
  t.deepEqual(createDefaultValue({ type: 'array' }, { type: 'array' }), []);
  t.is(createDefaultValue({ type: 'null' }, { type: 'null' }), null);
  t.deepEqual(createDefaultValue({ type: 'object' }, { type: 'object' }), {});
  t.deepEqual(
    createDefaultValue({ type: 'something' }, { type: 'something' }),
    {}
  );

  // defaults:
  t.deepEqual(
    createDefaultValue(
      {
        type: 'string',
        default: '2023-10-10',
      },
      {
        type: 'string',
        default: '2023-10-10',
      }
    ),
    '2023-10-10'
  );
  t.is(
    createDefaultValue(
      { type: 'string', default: 'excellent' },
      { type: 'string', default: 'excellent' }
    ),
    'excellent'
  );
  t.is(
    createDefaultValue(
      { type: 'number', default: 10 },
      { type: 'number', default: 10 }
    ),
    10
  );
  t.is(
    createDefaultValue(
      { type: 'boolean', default: true },
      { type: 'boolean', default: true }
    ),
    true
  );
  t.is(
    createDefaultValue(
      { type: 'integer', default: 11 },
      { type: 'integer', default: 11 }
    ),
    11
  );
  t.deepEqual(
    createDefaultValue(
      { type: 'array', default: ['a', 'b', 'c'] },
      { type: 'array', default: ['a', 'b', 'c'] }
    ),
    ['a', 'b', 'c']
  );
  t.deepEqual(
    createDefaultValue(
      { type: 'object', default: { foo: 'bar' } },
      { type: 'object', default: { foo: 'bar' } }
    ),
    {
      foo: 'bar',
    }
  );
  const objectSchema = {
    type: 'object',
    properties: {
      string1: { type: 'string', default: 'excellent' },
      string2: { type: 'string' },
      number: { type: 'number', default: 10 },
      int: { type: 'integer', default: 11 },
      bool: { type: 'boolean', default: true },
      array: { type: 'array', default: ['a', 'b', 'c'] },
    },
  };
  t.deepEqual(createDefaultValue(objectSchema, objectSchema), {
    string1: 'excellent',
    number: 10,
    int: 11,
    bool: true,
    array: ['a', 'b', 'c'],
  });

  const rootSchemaWithRefs = {
    definitions: {
      stringDef: { type: 'string', default: 'excellent' },
      numberDef: { type: 'number', default: 10 },
      intDef: { type: 'integer', default: 11 },
      boolDef: { type: 'boolean', default: true },
      arrayDef: { type: 'array', default: ['a', 'b', 'c'] },
    },
    type: 'object',
    properties: {
      string1: { $ref: '#/definitions/stringDef' },
      string2: { type: 'string' },
      number: { $ref: '#/definitions/numberDef' },
      int: { $ref: '#/definitions/intDef' },
      bool: { $ref: '#/definitions/boolDef' },
      array: { $ref: '#/definitions/arrayDef' },
    },
  };
  const schemaWithRefs = {
    type: 'object',
    properties: {
      string1: { $ref: '#/definitions/stringDef' },
      string2: { type: 'string' },
      number: { $ref: '#/definitions/numberDef' },
      int: { $ref: '#/definitions/intDef' },
      bool: { $ref: '#/definitions/boolDef' },
      array: { $ref: '#/definitions/arrayDef' },
    },
  };
  t.deepEqual(createDefaultValue(schemaWithRefs, rootSchemaWithRefs), {
    string1: 'excellent',
    number: 10,
    int: 11,
    bool: true,
    array: ['a', 'b', 'c'],
  });
});

test(`mapStateToJsonFormsRendererProps should use registered UI schema given ownProps schema`, (t) => {
  const store = mockStore(createState(coreUISchema));
  const schema = {
    type: 'object',
    properties: {
      bar: {
        type: 'number',
      },
    },
  };

  const props = mapStateToJsonFormsRendererProps(store.getState(), { schema });
  t.deepEqual(props.uischema, coreUISchema);
});

test(`mapStateToJsonFormsRendererProps should use registered UI schema given no ownProps`, (t) => {
  const store = mockStore(createState(coreUISchema));
  const props = mapStateToJsonFormsRendererProps(store.getState(), {});
  t.deepEqual(props.uischema, coreUISchema);
});

test(`mapStateToJsonFormsRendererProps should use UI schema if given via ownProps`, (t) => {
  const store = mockStore(createState(coreUISchema));
  const schema = {
    type: 'object',
    properties: {
      foo: {
        type: 'string',
      },
      bar: {
        type: 'number',
      },
    },
  };
  const uischema = {
    type: 'Control',
    scope: '#/properties/foo',
  };

  const props = mapStateToJsonFormsRendererProps(store.getState(), {
    schema,
    uischema,
  });
  t.deepEqual(props.uischema, uischema);
});

test('mapDispatchToArrayControlProps should adding items to array', (t) => {
  const data: any = ['foo'];
  const schema: JsonSchema = {
    type: 'array',
    items: {
      type: 'string',
    },
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#',
  };
  const initCore: JsonFormsCore = {
    uischema,
    schema,
    data,
    errors: [] as ErrorObject[],
  };
  const [getCore, dispatch] = mockDispatch(initCore);
  dispatch(init(data, schema, uischema));
  const props = mapDispatchToArrayControlProps(dispatch);
  props.addItem('', createDefaultValue(schema, schema))();
  t.is(getCore().data.length, 2);
});

test('mapDispatchToArrayControlProps should remove items from array', (t) => {
  const data = ['foo', 'bar', 'quux'];
  const schema: JsonSchema = {
    type: 'array',
    items: {
      type: 'string',
    },
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#',
  };
  const initCore: JsonFormsCore = {
    uischema,
    schema,
    data,
    errors: [] as ErrorObject[],
  };
  const [getCore, dispatch] = mockDispatch(initCore);
  dispatch(init(data, schema, uischema));
  const props = mapDispatchToArrayControlProps(dispatch);
  props.removeItems('', [0, 1])();
  t.is(getCore().data.length, 1);
  t.is(getCore().data[0], 'quux');
});

test('mapDispatchToArrayControlProps should remove items from array with more than 10 items', (t) => {
  const data = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
  const schema: JsonSchema = {
    type: 'array',
    items: {
      type: 'string',
    },
  };
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#',
  };
  const initCore: JsonFormsCore = {
    uischema,
    schema,
    data,
    errors: [] as ErrorObject[],
  };
  const [getCore, dispatch] = mockDispatch(initCore);
  dispatch(init(data, schema, uischema));
  const props = mapDispatchToArrayControlProps(dispatch);
  props.removeItems('', [11, 2])();
  t.is(getCore().data.length, 10);
});

test('mapStateToLayoutProps - visible via state with path from ownProps ', (t) => {
  const uischema = {
    type: 'VerticalLayout',
    elements: [coreUISchema],
    rule: hideRule,
  };
  const ownProps = {
    uischema,
    path: 'foo',
  };
  const state = {
    jsonforms: {
      core: {
        schema: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        },
        data: {
          foo: { firstName: 'Lisa' },
        },
        uischema,
        errors: [] as ErrorObject[],
      },
    },
  };
  const props = mapStateToLayoutProps(state, ownProps);
  t.true(props.visible);
});

test('mapStateToArrayLayoutProps - should include minItems in array layout props', (t) => {
  const schema: JsonSchema = {
    type: 'array',
    minItems: 42,
    items: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          default: 'foo',
        },
      },
    },
  };

  const uischema: ControlElement = {
    type: 'Control',
    scope: '#',
  };

  const state = {
    jsonforms: {
      core: {
        schema,
        data: {},
        uischema,
        errors: [] as ErrorObject[],
      },
    },
  };

  const ownProps = {
    uischema,
  };

  const props = mapStateToArrayLayoutProps(state, ownProps);
  t.is(props.minItems, 42);
});

test('mapStateToLayoutProps should return renderers prop via ownProps', (t) => {
  const uischema = {
    type: 'VerticalLayout',
    elements: [] as UISchemaElement[],
  };
  const state = {
    jsonforms: {
      core: {
        schema: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        },
        data: {
          foo: { firstName: 'Homer' },
        },
        uischema,
        errors: [] as ErrorObject[],
      },
    },
  };
  const props = mapStateToLayoutProps(state, {
    uischema,
    path: 'foo',
    renderers: [
      {
        tester: rankWith(1, () => true),
        renderer: undefined,
      },
    ],
  });
  t.is(props.renderers.length, 1);
});

test('mapStateToLayoutProps - disabled via global readonly', (t) => {
  const uischema = {
    type: 'VerticalLayout',
    elements: [coreUISchema],
  };
  const ownProps = {
    uischema,
  };
  const state: JsonFormsState = createState(uischema);
  state.jsonforms.readonly = true;

  const props = mapStateToLayoutProps(state, ownProps);
  t.false(props.enabled);
});

test('mapStateToLayoutProps - disabled via global readonly beats enabled via ownProps', (t) => {
  const uischema = {
    type: 'VerticalLayout',
    elements: [coreUISchema],
  };
  const ownProps = {
    uischema,
    enabled: true,
  };
  const state: JsonFormsState = createState(uischema);
  state.jsonforms.readonly = true;

  const props = mapStateToLayoutProps(state, ownProps);
  t.false(props.enabled);
});

test('mapStateToLayoutProps - disabled via global readonly beats enabled via rule', (t) => {
  const uischema = {
    type: 'VerticalLayout',
    elements: [coreUISchema],
    rule: enableRule,
  };
  const ownProps = {
    uischema,
  };
  const state: JsonFormsState = createState(uischema);
  state.jsonforms.readonly = true;

  const props = mapStateToLayoutProps(state, ownProps);
  t.false(props.enabled);
});

test('mapStateToLayoutProps - hidden via state with path from ownProps ', (t) => {
  const uischema = {
    type: 'VerticalLayout',
    elements: [coreUISchema],
    rule: hideRule,
  };
  const ownProps = {
    uischema,
    path: 'foo',
  };
  const state = {
    jsonforms: {
      core: {
        schema: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        },
        data: {
          foo: { firstName: 'Homer' },
        },
        uischema,
        errors: [] as ErrorObject[],
      },
    },
  };
  const props = mapStateToLayoutProps(state, ownProps);
  t.false(props.visible);
});

test("mapStateToOneOfProps - indexOfFittingSchema should not select schema if enum doesn't match", (t) => {
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/method',
  };

  const ownProps = {
    uischema,
  };

  const state = {
    jsonforms: {
      core: {
        ajv: createAjv(),
        schema: {
          type: 'object',
          properties: {
            method: {
              oneOf: [
                {
                  title: 'Injection',
                  type: 'object',
                  properties: {
                    method: {
                      title: 'Method',
                      type: 'string',
                      enum: ['Injection'],
                      default: 'Injection',
                    },
                  },
                  required: ['method'],
                },
                {
                  title: 'Infusion',
                  type: 'object',
                  properties: {
                    method: {
                      title: 'Method',
                      type: 'string',
                      enum: ['Infusion'],
                      default: 'Infusion',
                    },
                  },
                  required: ['method'],
                },
              ],
            },
          },
        },
        data: {
          method: {
            method: 'Infusion',
          },
        },
        uischema,
      },
    },
  };

  const oneOfProps = mapStateToOneOfProps(state, ownProps);
  t.is(oneOfProps.indexOfFittingSchema, 1);
});

test('mapStateToMultiEnumControlProps - oneOf items', (t) => {
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/colors',
  };
  const state = {
    jsonforms: {
      core: {
        schema: {
          type: 'object',
          properties: {
            colors: {
              type: 'array',
              items: {
                oneOf: [
                  {
                    const: 'red',
                  },
                  {
                    const: 'pink',
                    title: 'almost red',
                  },
                ],
              },
              uniqueItems: true,
            },
          },
        },
        data: {},
        uischema,
        errors: [] as ErrorObject[],
      },
    },
  };
  const ownProps = {
    uischema,
    path: 'colors',
  };
  const props = mapStateToMultiEnumControlProps(state, ownProps);
  t.deepEqual(props.options, [
    { label: 'red', value: 'red' },
    { label: 'almost red', value: 'pink' },
  ]);
});

test('mapStateToMultiEnumControlProps - enum items', (t) => {
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/colors',
  };
  const state = {
    jsonforms: {
      core: {
        schema: {
          type: 'object',
          properties: {
            colors: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['red', 'green', 'pink'],
              },
              uniqueItems: true,
            },
          },
        },
        data: {},
        uischema,
        errors: [] as ErrorObject[],
      },
    },
  };
  const ownProps = {
    uischema,
    path: 'colors',
  };
  const props = mapStateToMultiEnumControlProps(state, ownProps);
  t.deepEqual(props.options, [
    { label: 'red', value: 'red' },
    { label: 'green', value: 'green' },
    { label: 'pink', value: 'pink' },
  ]);
});

test('mapStateToMultiEnumControlProps - enum with ref', (t) => {
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/colors',
  };
  const state = {
    jsonforms: {
      core: {
        schema: {
          definitions: {
            colors: {
              type: 'string',
              enum: ['red', 'green', 'pink'],
            },
          },
          type: 'object',
          properties: {
            colors: {
              type: 'array',
              items: {
                $ref: '#/definitions/colors',
              },
              uniqueItems: true,
            },
          },
        },
        data: {},
        uischema,
        errors: [] as ErrorObject[],
      },
    },
  };
  const ownProps = {
    uischema,
    path: 'colors',
  };
  const props = mapStateToMultiEnumControlProps(state, ownProps);
  t.deepEqual(props.options, [
    { label: 'red', value: 'red' },
    { label: 'green', value: 'green' },
    { label: 'pink', value: 'pink' },
  ]);
});

test('mapDispatchToMultiEnumProps - enum schema - addItem', (t) => {
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/colors',
  };
  const schema = {
    type: 'object',
    properties: {
      colors: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['red', 'green', 'pink'],
        },
        uniqueItems: true,
      },
    },
  };
  const data = { colors: ['green'] };
  const initCore: JsonFormsCore = {
    uischema,
    schema,
    data,
    errors: [] as ErrorObject[],
  };
  const [getCore, dispatch] = mockDispatch(initCore);
  dispatch(init(data, schema, uischema, createAjv({ useDefaults: true })));
  const props = mapDispatchToMultiEnumProps(dispatch);
  props.addItem('colors', 'pink');

  t.is(getCore().data.colors.length, 2);
  t.deepEqual(getCore().data.colors[0], 'green');
  t.deepEqual(getCore().data.colors[1], 'pink');
});

test('mapDispatchToMultiEnumProps - enum schema - removeItem', (t) => {
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/colors',
  };
  const schema = {
    type: 'object',
    properties: {
      colors: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['red', 'green', 'pink'],
        },
        uniqueItems: true,
      },
    },
  };
  const data = { colors: ['green', 'red'] };
  const initCore: JsonFormsCore = {
    uischema,
    schema,
    data,
    errors: [] as ErrorObject[],
  };
  const [getCore, dispatch] = mockDispatch(initCore);
  dispatch(init(data, schema, uischema, createAjv({ useDefaults: true })));
  const props = mapDispatchToMultiEnumProps(dispatch);
  props.removeItem('colors', 'red');

  t.is(getCore().data.colors.length, 1);
  t.deepEqual(getCore().data.colors[0], 'green');
});

test('mapDispatchToMultiEnumProps - oneOf schema - addItem', (t) => {
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/colors',
  };
  const schema = {
    type: 'object',
    properties: {
      colors: {
        type: 'array',
        items: {
          oneOf: [
            {
              const: 'red',
            },
            {
              const: 'pink',
              title: 'almost red',
            },
          ],
        },
        uniqueItems: true,
      },
    },
  };
  const data = {};
  const initCore: JsonFormsCore = {
    uischema,
    schema,
    data,
    errors: [] as ErrorObject[],
  };
  const [getCore, dispatch] = mockDispatch(initCore);
  dispatch(init(data, schema, uischema, createAjv({ useDefaults: true })));
  const props = mapDispatchToMultiEnumProps(dispatch);
  props.addItem('colors', 'pink');

  t.is(getCore().data.colors.length, 1);
  t.deepEqual(getCore().data.colors[0], 'pink');
});

test('mapDispatchToMultiEnumProps - oneOf schema - removeItem', (t) => {
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/colors',
  };
  const schema = {
    type: 'object',
    properties: {
      colors: {
        type: 'array',
        items: {
          oneOf: [
            {
              const: 'red',
            },
            {
              const: 'pink',
              title: 'almost red',
            },
          ],
        },
        uniqueItems: true,
      },
    },
  };
  const data = { colors: ['pink'] };
  const initCore: JsonFormsCore = {
    uischema,
    schema,
    data,
    errors: [] as ErrorObject[],
  };
  const [getCore, dispatch] = mockDispatch(initCore);
  dispatch(init(data, schema, uischema, createAjv({ useDefaults: true })));
  const props = mapDispatchToMultiEnumProps(dispatch);
  props.removeItem('colors', 'pink');

  t.is(getCore().data.colors.length, 0);
});

test('should assign defaults to enum', (t) => {
  const schema: JsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
      },
      color: {
        type: 'string',
        enum: ['red', 'green', 'blue'],
        default: 'green',
      },
    },
  };

  const uischema: UISchemaElement = undefined;

  const data = {
    name: 'foo',
  };

  const initState: JsonFormsState = {
    jsonforms: {
      core: {
        uischema,
        schema,
        data,
        errors: [] as ErrorObject[],
      },
    },
  };
  const newCore = coreReducer(
    initState.jsonforms.core,
    init(data, schema, uischema, createAjv({ useDefaults: true }))
  );
  t.is(newCore.data.color, 'green');
});

test('should assign defaults to empty item within nested object of an array', (t) => {
  const schema: JsonSchema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          default: 'foo',
        },
      },
    },
  };

  const uischema: ControlElement = {
    type: 'Control',
    scope: '#',
  };

  const data = [{}];

  const initState: JsonFormsState = {
    jsonforms: {
      core: {
        uischema,
        schema,
        data,
        errors: [] as ErrorObject[],
      },
    },
  };

  const newCore = coreReducer(
    initState.jsonforms.core,
    init(data, schema, uischema, createAjv({ useDefaults: true }))
  );
  t.is(newCore.data.length, 1);
  t.deepEqual(newCore.data[0], { message: 'foo' });
});

test('should assign defaults to newly added item within nested object of an array', (t) => {
  const schema: JsonSchema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          default: 'foo',
        },
      },
    },
  };

  const uischema: ControlElement = {
    type: 'Control',
    scope: '#',
  };

  const data = [{}];

  const initCore: JsonFormsCore = {
    uischema,
    schema,
    data,
    errors: [] as ErrorObject[],
  };
  const [getCore, dispatch] = mockDispatch(initCore);
  dispatch(init(data, schema, uischema, createAjv({ useDefaults: true })));
  const props = mapDispatchToArrayControlProps(dispatch);
  props.addItem('', createDefaultValue(schema, schema))();

  t.is(getCore().data.length, 2);
  t.deepEqual(getCore().data[0], { message: 'foo' });
});

test('computeLabel - should not edit label if not required and hideRequiredAsterisk is false', (t) => {
  const computedLabel = computeLabel('Test Label', false, false);
  t.is(computedLabel, 'Test Label');
});

test('computeLabel - should not edit label if not required and hideRequiredAsterisk is true', (t) => {
  const computedLabel = computeLabel('Test Label', false, true);
  t.is(computedLabel, 'Test Label');
});

test('computeLabel - should not edit label if required but hideRequiredAsterisk is true', (t) => {
  const computedLabel = computeLabel('Test Label', true, true);
  t.is(computedLabel, 'Test Label');
});

test('computeLabel - should add asterisk if required but hideRequiredAsterisk is false', (t) => {
  const computedLabel = computeLabel('Test Label', true, false);
  t.is(computedLabel, 'Test Label *');
});

test('mapStateToAnyOfProps - const constraint in anyOf schema should return correct indexOfFittingSchema', (t) => {
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#',
  };
  const schema: JsonSchema7 = {
    anyOf: [
      {
        type: 'object',
        properties: {
          type: {
            const: 'type1',
          },
        },
      },
      {
        type: 'object',
        properties: {
          type: {
            const: 'type2',
          },
        },
      },
      {
        type: 'object',
        properties: {
          type: {
            const: 'type3',
          },
        },
      },
    ],
  };
  const ownProps: OwnPropsOfControl = {
    visible: true,
    uischema,
    path: 'foo',
  };
  const state = {
    jsonforms: {
      core: {
        ajv: createAjv(),
        schema,
        data: {
          foo: { type: 'type3' },
        },
        uischema,
        errors: [] as ErrorObject[],
      },
    },
  };
  const props = mapStateToAnyOfProps(state, ownProps);
  t.is(props.indexOfFittingSchema, 2);
});

test('mapStateToControlProps - i18n - mapStateToControlProps should not crash without i18n', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.i18n = undefined;

  const props = mapStateToControlProps(state, ownProps);
  t.is(props.label, 'First Name');
});

test('mapStateToControlProps - i18n - default translation has no effect', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.i18n = defaultJsonFormsI18nState;

  const props = mapStateToControlProps(state, ownProps);
  t.is(props.label, 'First Name');
  t.is(props.description, undefined);
});

test('mapStateToControlProps - i18n - translation via path key', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  state.jsonforms.i18n.translate = (
    key: string,
    defaultMessage: string | undefined
  ) => {
    switch (key) {
      case 'firstName.label':
        return 'my translation';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToControlProps(state, ownProps);
  t.is(props.label, 'my translation');
  t.is(props.description, undefined);
});

test('mapStateToControlProps - i18n - translation via default message', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  state.jsonforms.i18n.translate = (
    _key: string,
    defaultMessage: string | undefined
  ) => {
    switch (defaultMessage) {
      case 'First Name':
        return 'my translation';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToControlProps(state, ownProps);
  t.is(props.label, 'my translation');
  t.is(props.description, undefined);
});

test('mapStateToControlProps - i18n - translation via JSON Schema i18n key', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  (state.jsonforms.core.schema.properties.firstName as i18nJsonSchema).i18n =
    'my-key';
  state.jsonforms.i18n.translate = (
    key: string,
    defaultMessage: string | undefined
  ) => {
    switch (key) {
      case 'my-key.label':
        return 'my label';
      case 'my-key.description':
        return 'my description';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToControlProps(state, ownProps);
  t.is(props.label, 'my label');
  t.is(props.description, 'my description');
});

test('mapStateToControlProps - i18n - translation via UI Schema i18n key', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  ownProps.uischema = { ...ownProps.uischema, i18n: 'my-key' };
  state.jsonforms.i18n.translate = (
    key: string,
    defaultMessage: string | undefined
  ) => {
    switch (key) {
      case 'my-key.label':
        return 'my label';
      case 'my-key.description':
        return 'my description';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToControlProps(state, ownProps);
  t.is(props.label, 'my label');
  t.is(props.description, 'my description');
});

test('mapStateToControlProps - i18n errors - should not crash without i18n', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.core.schema.properties.firstName.pattern = '[0-9]+';
  state.jsonforms.core = coreReducer(
    state.jsonforms.core,
    init(
      state.jsonforms.core.data,
      state.jsonforms.core.schema,
      state.jsonforms.core.uischema,
      createAjv()
    )
  );
  state.jsonforms.i18n = undefined;

  const props = mapStateToControlProps(state, ownProps);
  t.is(props.errors, 'must match pattern "[0-9]+"');
});

test('mapStateToControlProps - i18n errors - default translation has no effect', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.core.schema.properties.firstName.pattern = '[0-9]+';
  state.jsonforms.core = coreReducer(
    state.jsonforms.core,
    init(
      state.jsonforms.core.data,
      state.jsonforms.core.schema,
      state.jsonforms.core.uischema,
      createAjv()
    )
  );
  state.jsonforms.i18n = defaultJsonFormsI18nState;

  const props = mapStateToControlProps(state, ownProps);
  t.is(props.errors, 'must match pattern "[0-9]+"');
});

test('mapStateToControlProps - i18n errors - translate via error message key', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.core.schema.properties.firstName.pattern = '[0-9]+';
  state.jsonforms.core = coreReducer(
    state.jsonforms.core,
    init(
      state.jsonforms.core.data,
      state.jsonforms.core.schema,
      state.jsonforms.core.uischema,
      createAjv()
    )
  );
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  state.jsonforms.i18n.translate = (
    key: string,
    defaultMessage: string | undefined
  ) => {
    switch (key) {
      case 'must match pattern "[0-9]+"':
        return 'my error message';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToControlProps(state, ownProps);
  t.is(props.errors, 'my error message');
});

test('mapStateToControlProps - i18n errors - translate via i18 specialized error keyword key', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.core.schema.properties.firstName.pattern = '[0-9]+';
  (state.jsonforms.core.schema.properties.firstName as i18nJsonSchema).i18n =
    'my-key';
  state.jsonforms.core = coreReducer(
    state.jsonforms.core,
    init(
      state.jsonforms.core.data,
      state.jsonforms.core.schema,
      state.jsonforms.core.uischema,
      createAjv()
    )
  );
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  state.jsonforms.i18n.translate = (
    key: string,
    defaultMessage: string | undefined
  ) => {
    switch (key) {
      case 'my-key.error.pattern':
        return 'my error message';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToControlProps(state, ownProps);
  t.is(props.errors, 'my error message');
});

test('mapStateToControlProps - i18n errors - translate via i18 general error keyword key', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.core.schema.properties.firstName.pattern = '[0-9]+';
  (state.jsonforms.core.schema.properties.firstName as i18nJsonSchema).i18n =
    'my-key';
  state.jsonforms.core = coreReducer(
    state.jsonforms.core,
    init(
      state.jsonforms.core.data,
      state.jsonforms.core.schema,
      state.jsonforms.core.uischema,
      createAjv()
    )
  );
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  state.jsonforms.i18n.translate = (
    key: string,
    defaultMessage: string | undefined
  ) => {
    switch (key) {
      case 'error.pattern':
        return 'my error message';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToControlProps(state, ownProps);
  t.is(props.errors, 'my error message');
});

test('mapStateToControlProps - i18n errors - specialized keyword wins over generic keyword', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.core.schema.properties.firstName.pattern = '[0-9]+';
  (state.jsonforms.core.schema.properties.firstName as i18nJsonSchema).i18n =
    'my-key';
  state.jsonforms.core = coreReducer(
    state.jsonforms.core,
    init(
      state.jsonforms.core.data,
      state.jsonforms.core.schema,
      state.jsonforms.core.uischema,
      createAjv()
    )
  );
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  state.jsonforms.i18n.translate = (
    key: string,
    defaultMessage: string | undefined
  ) => {
    switch (key) {
      case 'my-key.error.pattern':
        return 'my key error message';
      case 'error.pattern':
        return 'my error message';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToControlProps(state, ownProps);
  t.is(props.errors, 'my key error message');
});

test('mapStateToControlProps - i18n errors - multiple errors customization', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.core.schema.properties.firstName.pattern = '[0-9]+';
  state.jsonforms.core.schema.properties.firstName.maxLength = 2;
  (state.jsonforms.core.schema.properties.firstName as i18nJsonSchema).i18n =
    'my-key';
  state.jsonforms.core = coreReducer(
    state.jsonforms.core,
    init(
      state.jsonforms.core.data,
      state.jsonforms.core.schema,
      state.jsonforms.core.uischema,
      createAjv()
    )
  );
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  state.jsonforms.i18n.translate = (
    key: string,
    defaultMessage: string | undefined
  ) => {
    switch (key) {
      case 'error.maxLength':
        return 'max length message';
      case 'my-key.error.pattern':
        return 'my key error message';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToControlProps(state, ownProps);
  t.is(props.errors, 'max length message\nmy key error message');
});

test('mapStateToControlProps - i18n errors - custom keyword wins over all other errors', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.core.schema.properties.firstName.pattern = '[0-9]+';
  state.jsonforms.core.schema.properties.firstName.maxLength = 2;
  (state.jsonforms.core.schema.properties.firstName as i18nJsonSchema).i18n =
    'my-key';
  state.jsonforms.core = coreReducer(
    state.jsonforms.core,
    init(
      state.jsonforms.core.data,
      state.jsonforms.core.schema,
      state.jsonforms.core.uischema,
      createAjv()
    )
  );
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  state.jsonforms.i18n.translate = (
    key: string,
    defaultMessage: string | undefined
  ) => {
    switch (key) {
      case 'my-key.error.custom':
        return 'this is my error custom error message';
      case 'my-key.error.pattern':
        return 'my key error message';
      case 'error.pattern':
        return 'my error message';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToControlProps(state, ownProps);
  t.is(props.errors, 'this is my error custom error message');
});

test('mapStateToControlProps - required is calculated correctly from encoded JSON Pointer', (t) => {
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/~1firstName',
  };
  const schema = {
    type: 'object',
    properties: {
      '/firstName': { type: 'string' },
    },
    required: ['/firstName'],
  };
  const ownProps = {
    visible: true,
    uischema,
    path: 'foo',
    schema,
  };
  const state = {
    jsonforms: {
      core: {
        schema,
        data: {},
        uischema,
        errors: [] as ErrorObject[],
      },
    },
  };
  const props = mapStateToControlProps(state, ownProps);
  t.true(props.required === true);
});

test('mapStateToEnumControlProps - i18n - should not crash without i18n', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.core.schema.properties.firstName.enum = ['a', 'b'];
  state.jsonforms.i18n = undefined;

  const props = mapStateToEnumControlProps(state, ownProps);
  t.is(props.options[0].label, 'a');
});

test('mapStateToEnumControlProps - i18n - default translation has no effect', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.core.schema.properties.firstName.enum = ['a', 'b'];
  state.jsonforms.i18n = defaultJsonFormsI18nState;

  const props = mapStateToEnumControlProps(state, ownProps);
  t.is(props.options[0].label, 'a');
});

test('mapStateToEnumControlProps - i18n - path label translation', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.core.schema.properties.firstName.enum = ['a', 'b'];
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  state.jsonforms.i18n.translate = (
    key: string,
    defaultMessage: string | undefined
  ) => {
    switch (key) {
      case 'firstName.a':
        return 'my message';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToEnumControlProps(state, ownProps);
  t.is(props.options[0].label, 'my message');
});

test('mapStateToEnumControlProps - i18n - defaultMessage translation', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.core.schema.properties.firstName.enum = ['a', 'b'];
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  state.jsonforms.i18n.translate = (
    _key: string,
    defaultMessage: string | undefined
  ) => {
    switch (defaultMessage) {
      case 'a':
        return 'my message';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToEnumControlProps(state, ownProps);
  t.is(props.options[0].label, 'my message');
});

test('mapStateToEnumControlProps - i18n - i18n key translation', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.core.schema.properties.firstName.enum = ['a', 'b'];
  (state.jsonforms.core.schema.properties.firstName as i18nJsonSchema).i18n =
    'my-key';
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  state.jsonforms.i18n.translate = (
    key: string,
    defaultMessage: string | undefined
  ) => {
    switch (key) {
      case 'my-key.a':
        return 'my message';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToEnumControlProps(state, ownProps);
  t.is(props.options[0].label, 'my message');
});

test('mapStateToOneOfEnumControlProps - i18n - should not crash without i18n', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.core.schema.properties.firstName.oneOf = [
    { const: 'a', title: 'foo' },
    { const: 'b', title: 'bar' },
  ];
  state.jsonforms.i18n = undefined;

  const props = mapStateToOneOfEnumControlProps(state, ownProps);
  t.is(props.options[0].label, 'foo');
});

test('mapStateToOneOfEnumControlProps- i18n - default translation has no effect', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.core.schema.properties.firstName.oneOf = [
    { const: 'a', title: 'foo' },
    { const: 'b', title: 'bar' },
  ];
  state.jsonforms.i18n = defaultJsonFormsI18nState;

  const props = mapStateToOneOfEnumControlProps(state, ownProps);
  t.is(props.options[0].label, 'foo');
});

test('mapStateToOneOfEnumControlProps - i18n - path label translation', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.core.schema.properties.firstName.oneOf = [
    { const: 'a', title: 'foo' },
    { const: 'b', title: 'bar' },
  ];
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  state.jsonforms.i18n.translate = (
    key: string,
    defaultMessage: string | undefined
  ) => {
    switch (key) {
      case 'firstName.foo':
        return 'my message';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToOneOfEnumControlProps(state, ownProps);
  t.is(props.options[0].label, 'my message');
});

test('mapStateToOneOfEnumControlProps - i18n - default message translation', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  state.jsonforms.core.schema.properties.firstName.oneOf = [
    { const: 'a', title: 'foo' },
    { const: 'b', title: 'bar' },
  ];
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  state.jsonforms.i18n.translate = (
    _key: string,
    defaultMessage: string | undefined
  ) => {
    switch (defaultMessage) {
      case 'foo':
        return 'my message';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToOneOfEnumControlProps(state, ownProps);
  t.is(props.options[0].label, 'my message');
});

test('mapStateToOneOfEnumControlProps - i18n - i18n key translation', (t) => {
  const ownProps = {
    uischema: coreUISchema,
  };
  const state: JsonFormsState = createState(coreUISchema);
  (state.jsonforms.core.schema.properties.firstName.oneOf as any) = [
    { const: 'a', title: 'foo', i18n: 'my-foo' },
    { const: 'b', title: 'bar', i18n: 'my-bar' },
  ];
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  state.jsonforms.i18n.translate = (
    key: string,
    defaultMessage: string | undefined
  ) => {
    switch (key) {
      case 'my-foo':
        return 'my message';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToOneOfEnumControlProps(state, ownProps);
  t.is(props.options[0].label, 'my message');
});

test('mapStateToLabelProps - i18n - should not crash without i18n', (t) => {
  const labelUISchema: LabelElement = {
    type: 'Label',
    text: 'foo',
    i18n: 'bar',
  };
  const ownProps = {
    uischema: labelUISchema,
  };
  const state: JsonFormsState = createState(labelUISchema);
  state.jsonforms.i18n = undefined;

  const props = mapStateToLabelProps(state, ownProps);
  t.is(props.text, 'foo');
});

test('mapStateToLabelProps - i18n - default translation has no effect', (t) => {
  const labelUISchema: LabelElement = {
    type: 'Label',
    text: 'foo',
    i18n: 'bar',
  };
  const ownProps = {
    uischema: labelUISchema,
  };
  const state: JsonFormsState = createState(labelUISchema);
  state.jsonforms.i18n = defaultJsonFormsI18nState;

  const props = mapStateToLabelProps(state, ownProps);
  t.is(props.text, 'foo');
});

test('mapStateToLabelProps - i18n - default key translation', (t) => {
  const labelUISchema: LabelElement = {
    type: 'Label',
    text: 'foo',
  };
  const ownProps = {
    uischema: labelUISchema,
  };
  const state: JsonFormsState = createState(labelUISchema);
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  state.jsonforms.i18n.translate = (
    key: string,
    defaultMessage: string | undefined
  ) => {
    switch (key) {
      case 'foo':
        return 'my message';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToLabelProps(state, ownProps);
  t.is(props.text, 'my message');
});

test('mapStateToLabelProps - i18n - default message translation', (t) => {
  const labelUISchema: LabelElement = {
    type: 'Label',
    text: 'foo',
    i18n: 'bar',
  };
  const ownProps = {
    uischema: labelUISchema,
  };
  const state: JsonFormsState = createState(labelUISchema);
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  state.jsonforms.i18n.translate = (
    _key: string,
    defaultMessage: string | undefined
  ) => {
    switch (defaultMessage) {
      case 'foo':
        return 'my message';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToLabelProps(state, ownProps);
  t.is(props.text, 'my message');
});

test('mapStateToLabelProps - i18n - i18n key translation', (t) => {
  const labelUISchema: LabelElement = {
    type: 'Label',
    text: 'foo',
    i18n: 'bar',
  };
  const ownProps = {
    uischema: labelUISchema,
  };
  const state: JsonFormsState = createState(labelUISchema);
  state.jsonforms.i18n = defaultJsonFormsI18nState;
  state.jsonforms.i18n.translate = (
    key: string,
    defaultMessage: string | undefined
  ): string | undefined => {
    switch (key) {
      case 'bar.text':
        return 'my message';
      default:
        return defaultMessage;
    }
  };

  const props = mapStateToLabelProps(state, ownProps);
  t.is(props.text, 'my message');
});
