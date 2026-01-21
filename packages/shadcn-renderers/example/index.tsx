import React from 'react';
import ReactDOM from 'react-dom';
import { JsonForms } from '@mosaic-avantos/jsonforms-react';
import './globals.css';
import { shadcnRenderers, shadcnCells } from '../src';

// Schema showcasing text field variations
const schema = {
  type: 'object',
  properties: {
    textWithLabel: {
      type: 'string',
      title: 'Text Label',
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
      description: 'This field has a helpful description that appears on focus',
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
  },
  required: ['textRequired'],
};

// UI Schema to control rendering
const uischema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/textWithLabel',
    },
    {
      type: 'Control',
      scope: '#/properties/textWithPlaceholder',
      options: {
        placeholder: 'Enter some text here...',
      },
    },
    {
      type: 'Control',
      scope: '#/properties/textRequired',
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
  ],
};

const initialData = {
  textWithLabel: '',
  textWithPlaceholder: '',
  textRequired: '',
  textWithDescription: '',
  textWithValidation: 'invalid-email',
  textWithMinLength: 'ab',
  textWithMaxLength: 'This text is too long',
  textWithPattern: '123456789',
};

const App = () => {
  const [data, setData] = React.useState(initialData);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              JSONForms with shadcn Renderers
            </h1>
            <p className="text-muted-foreground">
              Text control example
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <JsonForms
              schema={schema}
              uischema={uischema}
              data={data}
              renderers={shadcnRenderers}
              cells={shadcnCells}
              onChange={({ data, errors }) => {
                console.log('Data:', data);
                console.log('Errors:', errors);
                setData(data);
              }}
            />
          </div>

          <hr className="border-border" />

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Form Data:</h2>
            <pre className="bg-muted rounded-lg p-4 overflow-auto text-sm">
              <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

console.log('Example loaded');
const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.render(<App />, rootElement);
}
