import React from 'react';
import moment from 'moment';
import { DatePicker, TimePicker } from 'antd';
import { FormItemComponentProps } from '@music163/tango-setting-form';

function toMoment(value: any, format: string) {
  let ret: moment.Moment;

  if (moment.isMoment(value)) {
    ret = value;
  } else if (typeof value === 'string' && format) {
    ret = moment(value, format);
  } else {
    ret = moment();
  }

  if (ret && ret.isValid()) {
    return ret;
  }

  return;
}

const style = {
  width: '100%',
};

export function DateSetter({
  value,
  onChange,
  format = 'YYYY-MM-DD',
  ...rest
}: FormItemComponentProps<string>) {
  return (
    <DatePicker
      {...rest}
      format={format}
      style={style}
      value={value ? toMoment(value, format) : undefined}
      onChange={(val, str) => {
        onChange && onChange(str);
      }}
    />
  );
}

function toMoments(value: string[], format: string): moment.Moment[] {
  if (Array.isArray(value)) {
    return value.map((item) => toMoment(item, format));
  }
  return [];
}

export function DateRangeSetter({
  value,
  onChange,
  format = 'YYYY-MM-DD',
  ...rest
}: FormItemComponentProps<string[]>) {
  return (
    <DatePicker.RangePicker
      {...rest}
      style={style}
      format={format}
      value={toMoments(value, format) as [moment.Moment, moment.Moment]}
      onChange={(val, str) => {
        onChange && onChange(str);
      }}
    />
  );
}

export function TimeSetter({
  value,
  onChange,
  format = 'HH:mm:ss',
  ...rest
}: FormItemComponentProps<string>) {
  return (
    <TimePicker
      {...rest}
      format={format}
      style={style}
      value={toMoment(value, format)}
      onChange={(val, str) => {
        onChange && onChange(str);
      }}
    />
  );
}

export function TimeRangeSetter({
  value,
  onChange,
  format = 'HH:mm:ss',
  ...rest
}: FormItemComponentProps<string[]>) {
  return (
    <TimePicker.RangePicker
      {...rest}
      style={style}
      format={format}
      value={toMoments(value, format) as [moment.Moment, moment.Moment]}
      onChange={(val, str) => {
        onChange && onChange(str);
      }}
    />
  );
}
