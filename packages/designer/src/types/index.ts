/**
 * 选择模式
 * point 点选
 * area 区域选择
 */
export type SelectModeType = 'point' | 'area';

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
   * 子结点
   */
  children?: IVariableTreeNode[];
}
