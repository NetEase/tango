import { Dict } from '@music163/tango-helpers';
import {
  InsertChildPositionType,
  IImportSpecifierSourceData,
  IImportSpecifierData,
} from '../types';
import { IdGenerator } from '../helpers';
import { AbstractViewNode } from './abstract-view-node';

export interface IViewFile {
  /**
   * 文件名
   */
  filename: string;

  /**
   * ID 生成器
   */
  idGenerator: IdGenerator;

  /**
   * 通过导入组件名查找组件来自的包
   */
  importMap?: Dict<IImportSpecifierSourceData>;

  /**
   * 判断节点是否存在
   * @param codeId 节点 ID
   * @returns 存在返回 true，否则返回 false
   */
  hasNodeByCodeId?: (codeId: string) => boolean;

  listImportSources?: () => string[];
  listModals?: () => Array<{ label: string; value: string }>;
  listForms?: () => Record<string, string[]>;

  update: (code?: string, isFormatCode?: boolean, refreshWorkspace?: boolean) => void;

  /**
   * 添加新的导入符号
   * @param source 导入来源
   * @param newSpecifiers 新导入符号列表
   * @returns this
   */
  addImportSpecifiers: (source: string, newSpecifiers: IImportSpecifierData[]) => IViewFile;

  getNode: (targetNodeId: string) => AbstractViewNode;

  removeNode: (targetNodeId: string) => this;

  insertChild: (targetNodeId: string, newNode: any, position?: InsertChildPositionType) => this;

  insertAfter: (targetNodeId: string, newNode: any) => this;

  insertBefore: (targetNodeId: string, newNode: any) => this;

  replaceNode: (targetNodeId: string, newNode: any) => this;

  replaceViewChildren: (rawNodes: any[]) => this;

  updateNodeAttribute: (
    nodeId: string,
    attrName: string,
    attrValue?: any,
    relatedImports?: string[],
  ) => this;

  updateNodeAttributes: (
    nodeId: string,
    config: Record<string, any>,
    relatedImports?: string[],
  ) => this;

  get nodes(): Map<string, AbstractViewNode>;
  get nodesTree(): object[];
  get tree(): any;
  /**
   * 文件中的代码
   */
  get code(): string;
}
