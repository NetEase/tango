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
  id?: string;
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

export type SetterOnChangeDetailType = {
  relatedImports?: string[];
  isRawCode?: boolean;
};
