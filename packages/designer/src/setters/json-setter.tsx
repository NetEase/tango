import React, { useState } from 'react';
import { Box } from 'coral-system';
import { SingleMonacoEditor } from '@music163/tango-ui';
import { FormItemComponentProps } from '@music163/tango-setting-form';

/**
 * JSON Setter
 */
export function JSONSetter({ value: valueProp, onChange }: FormItemComponentProps) {
  const [value, setValue] = useState(valueProp || '');
  return (
    <Box height="120px" border="solid" borderColor="line.normal" borderRadius="s">
      <SingleMonacoEditor
        defaultValue={value}
        onChange={(newValue) => {
          setValue(newValue);
        }}
        onBlur={(newValue) => {
          if (newValue !== value) {
            onChange(newValue);
          }
        }}
        language="json"
        options={{
          lineNumbers: 'off',
          minimap: {
            enabled: false,
          },
        }}
      />
    </Box>
  );
}
