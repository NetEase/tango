import React, { useRef, useEffect, useCallback } from 'react';
import { Box } from 'coral-system';
import { MultiEditor, MultiEditorProps } from '@music163/tango-ui';
import { observer, useDesigner, useWorkspace } from '@music163/tango-context';
import { isValidCode } from '@music163/tango-core';
import { Modal } from 'antd';

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
   */
  autoRemoveUnusedImports?: boolean;
}

export const CodeEditor = observer(
  ({ autoRemoveUnusedImports = true, ...rest }: CodeEditorProps) => {
    const editorRef = useRef(null);
    const workspace = useWorkspace();
    const designer = useDesigner();
    const files = workspace.listFiles();
    const activeFile = workspace.activeFile;

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
        if (!isJsFile(path)) {
          // 非 js 文件直接保存
          workspace.updateFile(path, value, autoRemoveUnusedImports);
          return;
        }

        // js 文件需要先检查语法，只有语法正确才会保存
        if (isValidCode(value)) {
          workspace.updateFile(path, value, autoRemoveUnusedImports);
        } else {
          Modal.confirm({
            title: '检测到代码中存在语法错误，暂时无法将代码同步给设计器，是否回退到安全代码？',
            onOk: () => {
              editorRef.current?.refresh(files, activeFile);
            },
            onCancel: () => {},
          });
        }
      },
      [workspace, autoRemoveUnusedImports, activeFile, files],
    );

    const handleFileChange = useCallback(
      (type: string, info: any) => {
        switch (type) {
          case 'addFile':
            workspace.addFile(info.path, info.value);
            break;
          case 'deleteFile':
          case 'deleteFolder':
            workspace.removeFile(info.path);
            break;
          case 'renameFile':
            workspace.renameFile(info.path, info.newpath);
            workspace.setActiveFile(info.newpath);
            break;
          case 'renameFolder':
            workspace.renameFolder(info.path, info.newpath);
            break;
          case 'addFolder':
          default:
            break;
        }
      },
      [workspace],
    );

    const handlePathChange = useCallback(
      (path: string) => {
        workspace.setActiveFile(path);
      },
      [workspace],
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
  },
);

function isJsFile(path: string) {
  return /.jsx?$/.test(path);
}
