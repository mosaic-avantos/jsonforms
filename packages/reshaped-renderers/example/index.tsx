// Must be imported first to polyfill React 18 features
import '../src/polyfills/react-18-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { JsonForms } from '@mosaic-avantos/jsonforms-react';
import { Reshaped, View, Text, Divider } from 'reshaped';
import 'reshaped/themes/reshaped/theme.css';
import { reshapedRenderers, reshapedCells } from '../src';

// Comprehensive schema showcasing all variations
const schema = {
  type: 'object',
  properties: {
    // Text fields variations
    textWithLabel: {
      type: 'string',
      title: 'TText label',
    },
    textWithoutLabel: {
      type: 'string',
    },
    textWithPlaceholder: {
      type: 'string',
      title: 'Text with Placeholder',
    },
    textRequired: {
      type: 'string',
      title: 'Required Text Field',
    },
    textWithDescription: {
      type: 'string',
      title: 'Text with Description',
      description: 'This field has a helpful description',
    },
    textWithValidation: {
      type: 'string',
      title: 'Email Field (with validation)',
      format: 'email',
    },
    textWithMinLength: {
      type: 'string',
      title: 'Text with Min Length (3)',
      minLength: 3,
    },
    textWithMaxLength: {
      type: 'string',
      title: 'Text with Max Length (10)',
      maxLength: 10,
    },
    textWithPattern: {
      type: 'string',
      title: 'Phone Number (pattern validation)',
      pattern: '^\\d{3}-\\d{3}-\\d{4}$',
      description: 'Format: 123-456-7890',
    },
    
    // Boolean fields variations
    booleanWithLabel: {
      type: 'boolean',
      title: 'Checkbox with Label',
    },
    booleanWithDescription: {
      type: 'boolean',
      title: 'Accept Terms',
      description: 'You must accept the terms and conditions',
    },
    booleanRequired: {
      type: 'boolean',
      title: 'Required Checkbox',
      description: 'This must be checked',
    },
    booleanDefault: {
      type: 'boolean',
      title: 'Checkbox with Default Value',
      default: true,
    },
  },
  required: ['textRequired', 'booleanRequired'],
};

// UI Schema to control rendering
const uischema = {
  type: 'VerticalLayout',
  elements: [
    // Text field variations
    {
      type: 'Control',
      scope: '#/properties/textWithLabel',
      options: {
        tooltip: 'This is a basic text field with a label',
      },
    },
    {
      type: 'Control',
      scope: '#/properties/textWithoutLabel',
    },
    {
      type: 'Control',
      scope: '#/properties/textWithPlaceholder',
      options: {
        placeholder: 'Enter some text here...',
        tooltip: 'This field has placeholder text',
      },
    },
    {
      type: 'Control',
      scope: '#/properties/textRequired',
      options: {
        tooltip: 'This field is required and must be filled out',
      },
    },
    {
      type: 'Control',
      scope: '#/properties/textWithDescription',
    },
    {
      type: 'Control',
      scope: '#/properties/textWithValidation',
      options: {
        placeholder: 'user@example.com',
        tooltip: 'Enter a valid email address (e.g., user@example.com)',
      },
    },
    {
      type: 'Control',
      scope: '#/properties/textWithMinLength',
    },
    {
      type: 'Control',
      scope: '#/properties/textWithMaxLength',
    },
    {
      type: 'Control',
      scope: '#/properties/textWithPattern',
      options: {
        placeholder: '123-456-7890',
      },
    },
    
    // Boolean field variations
    {
      type: 'Control',
      scope: '#/properties/booleanWithLabel',
      options: {
        tooltip: 'Check this box to enable the feature',
      },
    },
    {
      type: 'Control',
      scope: '#/properties/booleanWithDescription',
    },
    {
      type: 'Control',
      scope: '#/properties/booleanRequired',
      options: {
        tooltip: 'You must check this box to proceed',
      },
    },
    {
      type: 'Control',
      scope: '#/properties/booleanDefault',
    },
  ],
};

const initialData = {
  textWithLabel: '',
  textWithoutLabel: '',
  textWithPlaceholder: '',
  textRequired: '',
  textWithDescription: '',
  textWithValidation: 'invalid-email',
  textWithMinLength: 'ab',
  textWithMaxLength: 'This text is too long',
  textWithPattern: '123456789',
  booleanWithLabel: false,
  booleanWithDescription: false,
  booleanRequired: false,
  booleanDefault: true,
};

const App = () => {
  const [data, setData] = React.useState(initialData);

  return (
    <Reshaped defaultTheme="reshaped" defaultColorMode="light">
      <View padding={6} maxWidth="800px">
        <View gap={6}>
          <View>
            <Text variant="title-3" weight="bold">
              JSONForms with Reshaped Renderers
            </Text>
            <Text variant="body-2" color="neutral">
              Comprehensive example showing all form field variations
            </Text>
          </View>

          <View padding={4} borderRadius="medium">
            <JsonForms
              schema={schema}
              uischema={uischema}
              data={data}
              renderers={reshapedRenderers}
              cells={reshapedCells}
              onChange={({ data, errors }) => {
                console.log('Data:', data);
                console.log('Errors:', errors);
                setData(data);
              }}
            />
          </View>

          <Divider />

          <View gap={3}>
            <Text variant="title-5" weight="medium">
              Form Data:
            </Text>
            <View
              backgroundColor="neutral-faded"
              padding={3}
              borderRadius="medium"
              as="pre"
              attributes={{ style: { overflow: 'auto' } }}
            >
              <Text as="code">
                {JSON.stringify(data, null, 2)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Reshaped>
  );
};

console.log('Example loaded');
const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.render(<App />, rootElement);
}