import React, { useRef, useEffect, useCallback } from 'react';
import { Box } from 'coral-system';
import { MultiEditor, MultiEditorProps } from '@music163/tango-ui';
import { observer, useDesigner, useEditorState, useWorkspace } from '@music163/tango-context';

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
