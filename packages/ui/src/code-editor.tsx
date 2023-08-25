import React from 'react';
import { SingleEditor, SingleEditorIProps } from 'react-monaco-editor-lite';
import { Box } from 'coral-system';

export interface SingleMonacoEditorProps extends SingleEditorIProps {
  language?: string;
  hasBorder?: boolean;
}

export function SingleMonacoEditor(props: SingleMonacoEditorProps) {
  const {
    language,
    options: optionsProp = {},
    height = '100%',
    width = '100%',
    hasBorder = false,
    ...rest
  } = props;
  const options = {
    language,
    ...optionsProp,
  };

  const boxProps = hasBorder
    ? {
        border: 'solid',
        borderColor: 'line.normal',
        borderRadius: 's',
      }
    : {};

  return (
    <Box width={width} height={height} {...boxProps}>
      <SingleEditor options={options} {...rest} />
    </Box>
  );
}

export { MultiEditor } from 'react-monaco-editor-lite';
export type { MultiEditorIProps as MultiEditorProps } from 'react-monaco-editor-lite';
