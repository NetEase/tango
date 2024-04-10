import React from 'react';
import { Tooltip } from 'antd';
import { Box, css, HTMLCoralProps } from 'coral-system';

export interface SelectActionProps extends HTMLCoralProps<'div'> {
  tooltip?: string;
}

const selectionActionStyle = css`
  &:hover {
    background-color: var(--tango-colors-primary-40);
  }
`;

export function SelectAction({ tooltip, children, ...rest }: SelectActionProps) {
  return (
    <Tooltip title={tooltip}>
      <Box
        className="SelectionAction"
        display="inline-block"
        bg="brand"
        color="white"
        px="s"
        fontSize="subtitle"
        css={selectionActionStyle}
        {...rest}
      >
        {children}
      </Box>
    </Tooltip>
  );
}
