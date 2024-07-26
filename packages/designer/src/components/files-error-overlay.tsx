import React, { useEffect, useState } from 'react';
import { Box, css } from 'coral-system';
import { observer, useWorkspace } from '@music163/tango-context';
import { CloseOutlined } from '@ant-design/icons';

const errorMessageStyle = css`
  padding: 12px;
  white-space: pre-wrap;
`;

/**
 * 文件错误提示浮层
 */
export const FilesErrorOverlay = observer(() => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [errors, setErrors] = useState<string[]>([]);
  const workspace = useWorkspace();

  useEffect(() => {
    setErrors(workspace.fileErrors);
  }, [workspace.fileErrors]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (workspace.fileErrors.length === 0) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <Box
      className="WorkspaceErrorOverlay"
      position="absolute"
      top="0"
      left="0"
      right="0"
      height="100%"
      bg="rgba(244, 244, 244, 0.9)"
      color="red"
      zIndex={1999}
    >
      <Box position="relative" p="4">
        <CloseOutlined
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: '#000',
          }}
          onClick={handleClose}
        />
        <Box css={errorMessageStyle}>
          {errors.map((error, index) => (
            <Box key={index}>{error}</Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
});
