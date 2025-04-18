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
import { registerExamples } from '../register';

export const schema = {
  type: 'object',
  properties: {
    schemaBased: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          format: 'date',
          description: 'schema-based date picker',
        },
        time: {
          type: 'string',
          format: 'time',
          description: 'schema-based time picker',
        },
        datetime: {
          type: 'string',
          format: 'date-time',
          description: 'schema-based datetime picker',
        },
      },
    },
    uiSchemaBased: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'does not allow to select days',
        },
        time: {
          type: 'string',
          description: '24 hour format',
        },
        datetime: {
          type: 'string',
          description: 'uischema-based datetime picker',
        },
      },
    },
  },
};
export const uischema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'HorizontalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/schemaBased/properties/date',
          options: {
            maxValue: '2025-03-26',
            minValue: '2025-03-19',
          },
        },
        {
          type: 'Control',
          scope: '#/properties/schemaBased/properties/time',
          options: {
            maxValue: '18:50',
            minValue: '10:10',
          },
        },
        {
          type: 'Control',
          scope: '#/properties/schemaBased/properties/datetime',
          options: {
            maxValue: '2025-03-26 10:30',
            minValue: '2025-03-19 18:30',
          },
        },
      ],
    },
    {
      type: 'HorizontalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/schemaBased/properties/date',
          options: {
            maxValue: 'Today',
          },
        },
        {
          type: 'Control',
          scope: '#/properties/schemaBased/properties/time',
          options: {
            maxValue: '18:50',
            minValue: '10:10',
          },
        },
        {
          type: 'Control',
          scope: '#/properties/schemaBased/properties/datetime',
          options: {
            minValue: 'Today',
          },
        },
      ],
    },
    {
      type: 'HorizontalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/uiSchemaBased/properties/date',
          label: 'Year Month Picker',
          options: {
            format: 'date',
            clearLabel: 'Clear it!',
            cancelLabel: 'Abort',
            okLabel: 'Do it',
            views: ['year', 'month'],
            dateFormat: 'YYYY.MM',
            dateSaveFormat: 'YYYY-MM',
            maxValue: '2025-03-31',
            minValue: '2025-03-19',
          },
        },
        {
          type: 'Control',
          scope: '#/properties/uiSchemaBased/properties/time',
          options: {
            format: 'time',
            ampm: true,
            options: {
              maxValue: '18:50',
              minValue: '10:10',
            },
          },
        },
        {
          type: 'Control',
          scope: '#/properties/uiSchemaBased/properties/datetime',
          options: {
            format: 'date-time',
            dateTimeFormat: 'DD-MM-YY hh:mm:a',
            dateTimeSaveFormat: 'YYYY/MM/DD h:mm a',
            ampm: true,
            options: {
              maxValue: '2025-03-26 22:15',
              minValue: '2025-03-19 10:10',
            },
          },
        },
      ],
    },
  ],
};

export const data = {
  schemaBased: {
    date: new Date().toISOString().substr(0, 10),
    time: '13:37:00',
    datetime: new Date().toISOString(),
  },
  uiSchemaBased: {
    date: '2024-01',
    time: '13:37:00',
    datetime: '1999/12/11 10:05 am',
  },
};
registerExamples([
  {
    name: 'dates',
    label: 'Dates',
    data,
    schema,
    uischema,
  },
]);
