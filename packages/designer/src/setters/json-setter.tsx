import React from 'react';
import { Box } from 'coral-system';
import { SingleMonacoEditor } from '@music163/tango-ui';
import { FormItemComponentProps } from '@music163/tango-setting-form';
import { wrapCode } from '@music163/tango-helpers';

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
            onChange(wrapCode(newValue));
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
