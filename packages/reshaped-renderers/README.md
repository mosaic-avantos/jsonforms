# JSONForms - More Forms. Less Code

## Reshaped Renderers for JSONForms

This is the JSONForms Reshaped renderers package which provides a renderer set for [JSONForms](https://github.com/eclipsesource/jsonforms) based on [Reshaped](https://reshaped.so).

## Installation

Use `npm` or `yarn` to install the package:

```bash
npm install --save @mosaic-avantos/jsonforms-reshaped-renderers
```

or

```bash
yarn add @mosaic-avantos/jsonforms-reshaped-renderers
```

## Usage

```tsx
import { JsonForms } from '@mosaic-avantos/jsonforms-react';
import { reshapedRenderers } from '@mosaic-avantos/jsonforms-reshaped-renderers';

const App = () => {
  return (
    <JsonForms
      schema={schema}
      uischema={uischema}
      data={data}
      renderers={reshapedRenderers}
    />
  );
};
```

## License

The JSONForms project is licensed under the MIT License. See the [LICENSE file](./LICENSE) for more information.