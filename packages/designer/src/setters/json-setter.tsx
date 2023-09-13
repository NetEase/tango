import React from 'react';
import { Box } from 'coral-system';
import { SingleMonacoEditor } from '@music163/tango-ui';
import { FormItemComponentProps } from '@music163/tango-setting-form';

/**
 * JSON Setter
 */
export function JSONSetter({ value, onChange }: FormItemComponentProps) {
  return (
    <Box height="120px" border="solid" borderColor="line.normal" borderRadius="s">
      <SingleMonacoEditor
        defaultValue={value}
        onBlur={(newValue) => {
          if (newValue !== value) {
            onChange(`{${newValue}}`);
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
