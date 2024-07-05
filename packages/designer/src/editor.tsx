import React, { useRef, useEffect, useCallback } from 'react';
import { Box } from 'coral-system';
import { MultiEditor, MultiEditorProps } from '@music163/tango-ui';
import { observer, useDesigner, useWorkspace } from '@music163/tango-context';
import { isValidCode } from '@music163/tango-core';

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
   * 是否自动清除未使用的导入，IDE 组件内默认关闭
   */
  autoRemoveUnusedImports?: boolean;
}

export const CodeEditor = observer(
  ({ autoRemoveUnusedImports = false, ...rest }: CodeEditorProps) => {
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

    // 仅在视图切换至 WEBIDE 可见时，触发一次同步
    useEffect(() => {
      if (designer.activeView !== 'design') {
        editorRef.current?.refresh(files, activeFile, loc);
      }
    }, [files, activeFile, loc, designer.activeView]);

    /**
     * 触发时机
     * 1. IDE 快捷键保存
     * 2. IDE onBlur
     */
    const fileSave = useCallback(
      (path: string, value: string) => {
        if (!isJsFile(path)) {
          // 非 js 文件直接保存
          workspace.updateFile(path, value, autoRemoveUnusedImports);
          return;
        }

        // IDE 内置语法检查，js 文件语法错误时，不更新工作区文件
        // FIXME: 可以考虑语法检查放入 IDE 中，有语法错误时不触发 onFileSave 回调
        if (isValidCode(value)) {
          workspace.updateFile(path, value, autoRemoveUnusedImports);
        }
      },
      [workspace, autoRemoveUnusedImports],
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
