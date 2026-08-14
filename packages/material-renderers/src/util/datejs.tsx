import dayjs from 'dayjs';
import customParsing from 'dayjs/plugin/customParseFormat';

// required for the custom save formats in the date, time and date-time pickers
dayjs.extend(customParsing);

export const createOnChangeHandler =
  (
    path: string,
    handleChange: (path: string, value: any) => void,
    saveFormat: string
  ) =>
  (value: dayjs.Dayjs) => {
    if (!value) {
      handleChange(path, undefined);
    } else if (value.toString() !== 'Invalid Date') {
      const formatedDate = formatDate(value, saveFormat);
      handleChange(path, formatedDate);
    }
  };

export const createOnBlurHandler =
  (
    path: string,
    handleChange: (path: string, value: any) => void,
    format: string,
    saveFormat: string,
    rerenderChild: (restoreFocus?: boolean) => void,
    onBlur: () => void,
    data?: any
  ) =>
  (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement, Element>) => {
    const date = dayjs(e.target.value, format);
    const formatedDate = formatDate(date, saveFormat);
    // The open picker button sits next to the input and is the browser's next
    // tab stop, so a rerender destroys the element focus is moving to. That
    // aborts the transfer and drops focus to the document body, and the control
    // has to put it back afterwards.
    const losesFocusToRerender = !!(
      e.relatedTarget && e.target.parentElement?.contains(e.relatedTarget)
    );
    // Check if the input value is a date/time format string. Initially, a date format is sent when the user clicks the empty field.
    if (
      /^((?:[DMY]{2,4}(?:[-/:\s.]+[DMY]{2,4}){0,2}|\b[DMY]+\b)\s*)?([HhmsAa]+[-/:\s.]+[HhmsAa]+[-/:\s.]*[HhmsAa]*)?$/i.test(
        e.target.value
      )
    ) {
      handleChange(path, undefined);
      // Only rerender to reset the DatePicker's internal state when there was a
      // value to clear. Remounting an already empty field destroys the element
      // the browser is about to focus, which breaks tabbing out of the field.
      if (data) {
        rerenderChild(losesFocusToRerender);
      }
    } else if (formatedDate.toString() === 'Invalid Date') {
      handleChange(path, undefined);
      rerenderChild(losesFocusToRerender);
    } else {
      handleChange(path, formatedDate);
    }
    onBlur();
  };

export const formatDate = (date: dayjs.Dayjs, saveFormat: string) => {
  let formatedDate = date.format(saveFormat);
  // Workaround to address a bug in Dayjs, neglecting leading 0 (https://github.com/iamkun/dayjs/issues/1849)
  const indexOfYear = saveFormat.indexOf('YYYY');
  if (date.year() < 1000 && indexOfYear !== -1) {
    const stringUpToYear = formatedDate.slice(0, indexOfYear);
    const stringFromYear = formatedDate.slice(indexOfYear);
    if (date.year() >= 100) {
      formatedDate = [stringUpToYear, 0, stringFromYear].join('');
    } else if (date.year() >= 10) {
      formatedDate = [stringUpToYear, 0, 0, stringFromYear].join('');
    } else if (date.year() >= 1) {
      formatedDate = [stringUpToYear, 0, 0, 0, stringFromYear].join('');
    }
  }
  return formatedDate;
};

export const getData = (
  data: any,
  saveFormat: string | undefined
): dayjs.Dayjs | null => {
  if (!data) {
    return null;
  }
  const dayjsData = dayjs(data, saveFormat);
  if (dayjsData.toString() === 'Invalid Date') {
    return null;
  }
  return dayjsData;
};
