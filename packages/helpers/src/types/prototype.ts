/**
 * 物料描述类型
 */

import { OptionType } from './advanced';

/**
 * @deprecated 请使用 IComponentProp 代替
 */
export type ComponentPropType<T = any> = IComponentProp<T>;

/**
 * @deprecated
 */
export type ComponentDndRulesType = IComponentDndRules;

/**
 * @deprecated
 */
export type ComponentPrototypeType = IComponentPrototype;

/**
 * 组件属性类型
 */
export interface IComponentProp<T = any> {
  /**
   * 属性名
   */
  name: string;
  /**
   * 属性中文名
   */
  title?: string;
  /**
   * 属性提示信息
   */
  tip?: string;
  /**
   * 属性的分组
   * - basic 常用属性
   * - style 样式属性
   * - advanced 高级属性
   * - event 事件属性
   * - data  数据属性
   */
  group?: 'basic' | 'event' | 'style' | 'data' | 'advanced';
  /**
   * 帮助文档链接地址
   * @example https://foo.bar/help
   */
  docs?: string;
  /**
   * 组件默认展示的值
   */
  defaultValue?: any;
  /**
   * 首次拖拽后用来初始化组件的属性值
   * @example "str" 字符串
   * @example 1 数字
   * @example "{() => {}}" 函数
   * @example "{1}" 表达式
   * @example "%random()%" 内置命令
   */
  initValue?: any;
  /**
   * 如果是对象属性，这里声明子属性列表
   */
  props?: IComponentProp[];
  /**
   * 输入提示
   */
  placeholder?: string;
  /**
   * 如果没提供 initValue，是否自动初始化
   */
  autoInitValue?: boolean;
  /**
   * 自动补全的提示值，仅对 ExpressionSetter 有效
   */
  autoCompleteOptions?: string[];
  /**
   * 设置器
   */
  setter?: string;
  /**
   * 传递给设置器的属性
   */
  setterProps?: T;
  /**
   * 动态设置传递给 setter 的属性
   * @deprecated 请使用 getProp 代替
   */
  getSetterProps?: (form: any) => T;
  /**
   * 动态设置属性，覆盖已有的 prop 对象
   */
  getProp?: (form: any) => Partial<Omit<IComponentProp<T>, 'getProp'>>;
  /**
   * 配置项的可选值，setterProps.options 的简写
   */
  options?: OptionType[];
  /**
   * 是否禁用变量绑定
   */
  disableVariableSetter?: boolean;
  /**
   * 动态设置表单项是否展示
   */
  getVisible?: (form: any) => boolean;
  /**
   * 标记属性是否已废弃
   */
  deprecated?: boolean | string;
}

/**
 * 组件拖拽规则类型
 */
export interface IComponentDndRules {
  /**
   * 当前节点是否可以被拖拽
   */
  canDrag?: () => boolean;
  /**
   * 当前节点是否可以拖拽到目标节点中
   */
  canDrop?: (targetName: string) => boolean;
  /**
   * 进来的节点是否可以落进来，仅适用于容器节点
   */
  canMoveIn?: (incomingName: string) => boolean;
  /**
   * 被拖拽的节点是否可以被拖离当前节点，仅适用于容器节点
   */
  canMoveOut?: (outgoingName: string) => boolean;
  /**
   * 子节点的容器选择器，用于快速定位子节点容器，适合组件存在多个可搭建区域时使用
   */
  childrenContainerSelector?: string;
}

/**
 * 组件原型类型
 */
export interface IComponentPrototype {
  /**
   * 组件名
   * @example Button
   */
  name: string;
  /**
   * 组件中文名
   * @example 按钮
   */
  title?: string;
  /**
   * 导出方式
   * @default namedExport
   * @example import { Button } from 'antd';
   * @example import request from 'antd';
   */
  exportType?: 'defaultExport' | 'namedExport';
  /**
   * 组件所属的包
   * @example antd
   * @example './blocks'
   */
  package: string;
  /**
   * 图标名，或图片地址
   *
   * @example icon-tupian，仅支持来自 tango 官方图标库图标名
   * @example https://p5.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/11255815437/3e21/463f/8ccc/74dc164beb4cc311a203671c7ac25129.png
   */
  icon?: string;
  /**
   * 物料的文档地址
   * @example https://music-one.fn.netease.com/docs/button
   */
  docs?: string;
  /**
   * 组件说明文档，帮助信息
   */
  help?: string;
  /**
   * 类型
   * page 页面跟节点
   * container 布局容器
   * placeholder 占位容器
   * element 元件或组件
   * snippet 代码片段
   * block 区块
   */
  type: 'page' | 'container' | 'placeholder' | 'element' | 'snippet' | 'block';
  /**
   * 分类
   * basic 通用
   * layout 布局容器
   * condition 条件容器
   * typography 排版
   * nav 导航
   * form 表单容器
   * input 输入
   * display 展示
   * feedback 反馈
   * other 其他
   * biz 业务扩展
   * @deprecated 已废弃，可以不提供
   */
  category?:
    | 'basic'
    | 'layout'
    | 'condition'
    | 'typography'
    | 'nav'
    | 'form'
    | 'xform'
    | 'xtable'
    | 'input'
    | 'display'
    | 'feedback'
    | 'other'
    | 'biz';
  /**
   * 是否有子元素，决定了组件标签的声明方式
   * @example <Button>hello</Button>
   * @example <Button />
   */
  hasChildren?: boolean;
  /**
   * 拖拽初始化的默认子元素
   */
  initChildren?: string;
  /**
   * 已废弃，请使用 initChildren 替代
   * @deprecated
   */
  defaultChildren?: string;
  /**
   * 关联引入的组件，如果在 initChildren 里声明了，这里需要加上，用户关联导入
   */
  relatedImports?: string[];
  /**
   * 关联引入的依赖
   */
  // relatedDependencies?: RelatedDependencyType[];
  /**
   * 直接子节点的类型
   */
  childrenName?: string | string[];
  /**
   * 兄弟节点的类型
   */
  siblingNames?: string[];
  /**
   * 组件的可配置属性集
   */
  props?: IComponentProp[];
  /**
   * 组件的拖拽规则
   */
  rules?: IComponentDndRules;
  /**
   * 用法
   * @example import { Button } from 'antd';
   */
  usage?: string;
}

/**
 * TangoConfigJson 类型配置
 */
export interface ITangoConfigJson {
  /**
   * 依赖包配置
   */
  packages?: Record<string, any>;
  /**
   * 数据源配置
   */
  dataSource?: Record<string, any>;
  /**
   * 代理配置
   */
  proxy?: Record<string, any>;
  /**
   * 外部资源，例如 js, css 文件等
   */
  externalResources?: Record<string, any>;
  /**
   * 设计器配置
   */
  designerConfig: {
    /**
     * 每次代码生成后是否自动格式化
     */
    autoFormatCode: boolean;
    /**
     * 是否自动生成组件 ID，会自动在组件代码中增加 tid 属性
     */
    autoGenerateComponentId: boolean;
  };
}
