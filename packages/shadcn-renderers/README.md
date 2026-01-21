# JSONForms - More Forms. Less Code

## shadcn/ui Renderers for JSONForms

This is the JSONForms shadcn/ui renderers package which provides a renderer set for [JSONForms](https://github.com/eclipsesource/jsonforms) based on [shadcn/ui](https://ui.shadcn.com/) components and [Tailwind CSS](https://tailwindcss.com/).

## Installation

Use `npm` or `yarn` to install the package:

```bash
npm install --save @mosaic-avantos/jsonforms-shadcn-renderers
```

or

```bash
yarn add @mosaic-avantos/jsonforms-shadcn-renderers
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install --save @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-tooltip @radix-ui/react-slot lucide-react tailwindcss
```

## Setup

### 1. Configure Tailwind CSS

Add the package to your Tailwind CSS content configuration:

```js
// tailwind.config.js
module.exports = {
  content: [
    // ... your content paths
    './node_modules/@mosaic-avantos/jsonforms-shadcn-renderers/**/*.{js,ts,jsx,tsx}',
  ],
  // ... rest of your config
};
```

### 2. Add CSS Variables

Add the shadcn/ui CSS variables to your global CSS file:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}
```

## Usage

```tsx
import { JsonForms } from '@mosaic-avantos/jsonforms-react';
import { shadcnRenderers, shadcnCells } from '@mosaic-avantos/jsonforms-shadcn-renderers';

const App = () => {
  return (
    <JsonForms
      schema={schema}
      uischema={uischema}
      data={data}
      renderers={shadcnRenderers}
      cells={shadcnCells}
    />
  );
};
```

## Available Renderers

### Controls
- `ShadcnTextControl` - Text input field
- `ShadcnBooleanControl` - Checkbox input

### Layouts
- `ShadcnVerticalLayout` - Vertical flex layout
- `ShadcnHorizontalLayout` - Horizontal flex layout with wrap

### Cells
- `ShadcnTextCell` - Text display cell
- `ShadcnBooleanCell` - Boolean display cell (Yes/No)

### Additional
- `ShadcnLabelRenderer` - Section label renderer

## License

The JSONForms project is licensed under the MIT License. See the [LICENSE file](./LICENSE) for more information.
