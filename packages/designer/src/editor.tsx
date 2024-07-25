import React, { useRef, useEffect, useCallback } from 'react';
import { Box, css } from 'coral-system';
import { MultiEditor, MultiEditorProps } from '@music163/tango-ui';
import { observer, useDesigner, useEditorState, useWorkspace } from '@music163/tango-context';
import { LiveEditorSandbox } from './sandbox';

const ideConfig = {
  // disableFileOps: {
  //   add: true,
  //   delete: true,
  // },
  // disableFolderOps: {
  //   add: true,
  //   delete: true,
  //   rename: true,
  // },
  disablePrettier: true,
  disableEslint: true,
  saveWhenBlur: true,
  // disableSetting: true,
};

export interface CodeEditorProps extends Partial<MultiEditorProps> {
  /**
   * 是否自动清除未使用的导入
   * @deprecated 已废弃，不再支持
   */
  autoRemoveUnusedImports?: boolean;
}

export const CodeEditor = observer(({ autoRemoveUnusedImports, ...rest }: CodeEditorProps) => {
  const editorRef = useRef(null);
  const workspace = useWorkspace();
  const designer = useDesigner();
  const editorState = useEditorState();
  const files = editorState.getFiles();

  const activeFile = editorState.activeFile;

  let loc: any; // 记录视图代码的选中位置
  const selectNode = workspace.selectSource.firstNode;
  if (selectNode && activeFile === workspace.activeViewFile) {
    loc = selectNode.loc;
  }

  useEffect(() => {
    editorRef.current?.refresh(files, activeFile, loc);
  }, [files, activeFile, loc]);

  const fileSave = useCallback(
    (path: string, value: string) => {
      editorState.updateFile({ filename: path, code: value });
    },
    [editorState],
  );

  const handleFileChange = useCallback(
    (type: string, info: any) => {
      switch (type) {
        case 'addFile':
          editorState.addFile({ filename: info.path, code: info.value });
          break;
        case 'deleteFile':
          editorState.deleteFile({ filename: info.path });
          break;
        case 'deleteFolder':
          editorState.deleteFolder({ filename: info.path });
          break;
        case 'renameFile':
          editorState.renameFile({ filename: info.path, newFilename: info.newpath });
          break;
        case 'renameFolder':
          editorState.renameFolder({ filename: info.path, newFilename: info.newpath });
          break;
        case 'addFolder':
        default:
          break;
      }
    },
    [editorState],
  );

  const handlePathChange = useCallback(
    (path: string) => {
      editorState.setActiveFile(path);
    },
    [editorState],
  );

  const borderStyle =
    designer.activeView === 'dual'
      ? {
          borderLeft: 'solid 1px var(--tango-colors-line2)',
        }
      : {};

  return (
    <Box display="flex" flexDirection="row" height="100%" bg="white" {...borderStyle}>
      <MultiEditor
        ref={editorRef}
        options={{
          fontSize: 14,
          automaticLayout: true,
        }}
        ideConfig={ideConfig}
        onFileSave={fileSave}
        onPathChange={handlePathChange}
        onFileChange={handleFileChange}
        defaultPath={activeFile}
        defaultTheme="GithubLightDefault"
        defaultFiles={files}
        {...rest}
      />
    </Box>
  );
});

const liveEditorWrapperStyle = css`
  .LiveCodeEditorLeft,
  .LiveCodeEditorRight {
    overflow: hidden;
    transition: flex 100ms ease-in-out 0s;
  }
`;

export const LiveCodeEditor = observer(() => {
  const designer = useDesigner();
  return (
    <Box display="flex" className="LiveCodeEditor" height="100%" css={liveEditorWrapperStyle}>
      <Box
        flex={designer.activeView === 'dual' ? '55 1 0px' : '100 1 0px'}
        className="LiveCodeEditorLeft"
      >
        <CodeEditor />
      </Box>
      <Box
        flex={designer.activeView === 'dual' ? '45 1 0px' : '0 1 0px'}
        borderLeft="solid"
        borderLeftColor="line2"
        className="LiveCodeEditorRight"
      >
        <LiveEditorSandbox />
      </Box>
    </Box>
  );
});
