import React from 'react';
import { SingleMonacoEditor } from '@music163/tango-ui';
import { Box } from 'coral-system';
import { FormItemComponentProps } from '@music163/tango-setting-form/src/form-item';

export function ExpressionSetter({ value, onChange }: FormItemComponentProps) {
  return (
    <Box height="120px" border="solid" borderColor="line.normal" borderRadius="s">
      <SingleMonacoEditor
        defaultValue={value}
        onBlur={(newValue) => {
          if (newValue !== value) {
            onChange(`{${newValue}}`);
          }
        }}
        language="javascript"
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
