import React from 'react';
import { SingleMonacoEditor } from '@music163/tango-ui';
import { Box } from 'coral-system';
import { FormItemComponentProps } from '../form-item';

/**
 * 废弃掉，直接使用 ExpressionSetter 代替
 * @deprecated
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
