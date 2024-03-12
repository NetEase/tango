import React from 'react';
import { Text } from 'coral-system';
import { observer } from 'mobx-react-lite';
import { useFormModel } from './context';

interface FormValueProps {
  name: string;
}

export const FormValue = observer(({ name }: FormValueProps) => {
  const model = useFormModel();
  const value = model.getValue(name);
  return <Text>{value}</Text>;
});
