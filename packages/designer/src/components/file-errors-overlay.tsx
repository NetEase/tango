import React, { useState } from 'react';
import { Box, css, Text } from 'coral-system';
import { observer, useDesigner, useWorkspace } from '@music163/tango-context';
import { CloseOutlined } from '@ant-design/icons';

const errorMessageStyle = css`
  padding: 35px;
  position: relative;
  white-space: pre-wrap;
  color: #f45755;
  font-weight: bold;
  height: 100%;
  background-color: #171717;
  border-radius: 8px;
  .top-bar {
    border-radius: 8px 8px 0 0;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 10px;
    background-color: #f45755;
  }
  .WorkspaceErrorOverlayItem {
    font-size: 18px;
    padding-top: 20px;
    padding-bottom: 20px;
    .WorkspaceErrorOverlayItemFilename {
      color: #48cacb;
      text-decoration: underline;
      letter-spacing: 1px;
      &:hover {
        color: #51b1ff;
      }
    }
  }
`;

/**
 * 文件错误提示浮层
 */
export const FileErrorsOverlay = observer(() => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const workspace = useWorkspace();
  const designer = useDesigner();

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleOpenErrorFile = (fileName: string) => {
    workspace.setActiveFile(fileName);
    designer.setActiveView('code');
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
      bg="rgb(84, 84, 84)"
      padding="30px"
      color="red"
      overflow="auto"
      zIndex={1999}
    >
      <Box position="relative" p="4" boxShadow="0 0 10px rgba(0, 0, 0, 0.5)">
        <CloseOutlined
          style={{
            position: 'absolute',
            top: 24,
            right: 12,
            color: '#fff',
            zIndex: 2,
          }}
          onClick={handleClose}
        />
        <Box css={errorMessageStyle}>
          <Box className="top-bar" />
          <Box fontSize="18px" mb="l">
            <Text letterSpacing=".5px" color="#c29ef5">
              [plugin: @babel/parser]
            </Text>
            <Text marginLeft={'8px'} color="#f45755">
              SyntaxError in {workspace.fileErrors.length} files，Click file to modify the error
              code
            </Text>
          </Box>
          <Box>
            {workspace.fileErrors.map((fileError, index) => (
              <Box
                className="WorkspaceErrorOverlayItem"
                key={fileError.filename}
                borderBottom={index === workspace.fileErrors.length - 1 ? 'none' : 'dashed'}
                borderBottomColor="line2"
                py="l"
              >
                <Box
                  className="WorkspaceErrorOverlayItemFilename"
                  fontWeight="bold"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleOpenErrorFile(fileError.filename)}
                >
                  {fileError.filename}
                </Box>
                <Box
                  as="code"
                  display="block"
                  color="#daa15e"
                  fontSize="16px"
                  fontWeight={'normal'}
                >
                  {fileError.message}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
});
