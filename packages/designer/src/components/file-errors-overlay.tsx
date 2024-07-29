import React, { useState } from 'react';
import { Box, css } from 'coral-system';
import { observer, useWorkspace } from '@music163/tango-context';
import { CloseOutlined } from '@ant-design/icons';

const errorMessageStyle = css`
  padding: 24px;
  white-space: pre-wrap;
`;

/**
 * 文件错误提示浮层
 */
export const FileErrorsOverlay = observer(() => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const workspace = useWorkspace();

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
          <Box fontSize="20px" mb="l">
            代码解析错误，请回到源码模式检查并修改错误
          </Box>
          {workspace.fileErrors.map((fileError) => (
            <Box key={fileError.filename} borderBottom="solid" borderBottomColor="line2" py="l">
              <Box fontWeight="bold">{fileError.filename}</Box>
              <Box as="code" display="block">
                {fileError.message}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
});
