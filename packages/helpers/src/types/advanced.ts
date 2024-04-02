/**
 * 高级扩展类型
 */

/**
 * 鼠标的位置点
 */
export type MousePoint = {
  x: number;
  y: number;
};

export type OptionType = {
  /**
   * 值
   */
  value: any;
  /**
   * 显示的文本
   */
  label?: string;
  /**
   * 图标
   */
  icon?: string;
  /**
   * 提示
   */
  tip?: string;
  /**
   * 关联的导入
   */
  relatedImports?: string[];
};

/**
 * 变量树节点类型
 */
export interface IVariableTreeNode {
  /**
   * 唯一标识符
   */
  key: string;
  /**
   * 标题
   */
  title?: string;
  /**
   * 辅助提示信息
   */
  help?: string;
  /**
   * 是否可选中
   */
  selectable?: boolean;
  /**
   * 展示删除按钮
   */
  showRemoveButton?: boolean;
  /**
   * 展示添加按钮
   */
  showAddButton?: boolean;
  /**
   * 展示查看按钮
   */
  showViewButton?: boolean;
  /**
   * 结点类型，用来展示图标
   */
  type?: 'function' | 'property';
  /**
   * 定义的原始值
   */
  raw?: any;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 子结点
   */
  children?: IVariableTreeNode[];
}

/**
 * 服务函数类型
 */
export type ServiceFunctionType = (...args: any[]) => Promise<any>;

export type RelatedDependencyType = { name: string; version: string };

/**
 * 节点的外框数据类型
 */
export type ElementBoundingType = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * 选中项数据类型
 */
export interface ISelectedItemData {
  /**
   * 节点的 data-dnd 值
   */
  id?: string;
  /**
   * 节点的 codeId
   */
  codeId?: string;
  /**
   * 组件名
   */
  name?: string;
  /**
   * 所属文件路径
   */
  filename?: string;
  /**
   * @deprecated 使用 filename 取代
   */
  module?: string;
  /**
   * 元素的CSS Display 值
   */
  display?: string;
  bounding?: ElementBoundingType;
  element?: HTMLElement;
  parents?: ISelectedItemData[];
}
