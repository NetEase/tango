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

type TangoSchemaTreeNodePropValueBaseType = {
  value: string | number | boolean;
  rawCode: string;
};

type TangoSchemaTreeNodePropValueSlotType = {
  type: 'Slot';
  value: TangoSchemaTreeNodeType;
};

type TangoSchemaTreeNodePropValueType =
  | string
  | number
  | boolean
  | object
  | TangoSchemaTreeNodePropValueBaseType
  | TangoSchemaTreeNodePropValueSlotType;

export type TangoSchemaTreeNodeType = {
  /**
   * 节点唯一标识
   */
  id?: string;
  /**
   * 节点组件名
   */
  component?: string;
  /**
   * 节点属性集合
   */
  props?: Record<string, TangoSchemaTreeNodePropValueType>;
  /**
   * 节点是否渲染
   * TODO: 支持变量表达式
   */
  isRender?: boolean;
  /**
   * 子节点
   */
  children?: TangoSchemaTreeNodeType[];
};

/**
 * 服务函数类型
 */
export type ServiceFunctionType = (...args: any[]) => Promise<any>;

export type TangoRemoteServicesType = {
  /**
   * 图片服务
   */
  ImageService?: {
    listMy: ServiceFunctionType;
    listFav: ServiceFunctionType;
    listPub: ServiceFunctionType;
  };
  /**
   * 数据源服务
   */
  OxService?: {
    listApp: ServiceFunctionType;
    listBranch: ServiceFunctionType;
    listApi: ServiceFunctionType;
    listApiByPage: ServiceFunctionType;
  };
  /**
   * 依赖面板服务
   */
  DependencyService?: {
    listBizDependencies: ServiceFunctionType;
    listBaseDependencies: ServiceFunctionType;
    listPackageVersions: ServiceFunctionType;
  };
  RiddleService?: {
    listBlock: ServiceFunctionType;
    postBlock: ServiceFunctionType;
    updateBlock: ServiceFunctionType;
  };
  /**
   * AIGC 服务
   */
  GptService?: {
    codeCompletion?: ServiceFunctionType;
    textCompletion?: ServiceFunctionType;
    textEmbedding?: ServiceFunctionType;
  };
};

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

/**
 * 智能向导生成类型
 */
export enum WizardType {
  NEW = 'new',
  REPLACE = 'replace',
  PREVIEW = 'preview',
}

/**
 * 智能向导OX模型定义
 */
export interface IOXModel {
  key: string; // 唯一标识 (字段名加哈希值)
  name: string; // 字段名
  description: string; // 字段描述
  basicDataModelName: 'List' | 'Integer' | 'int' | 'String' | 'long' | 'boolean' | 'ENUM'; // 字段类型
  dataModelFieldDTOList: IOXModel[];
  type: 'ARRAY' | 'BASIC' | 'CLASS' | 'GENERIC' | 'ENUM' | 'MAP';
  extra: IOXModel;
  extras: IOXModel[];
  linkedDataModelName: String;
  linkedModelDTO: {
    type: 'ARRAY' | 'BASIC' | 'CLASS' | 'GENERIC' | 'ENUM' | 'MAP';
    fieldDTOList: IOXModel[];
  };
  paramType: 'RequestParam' | 'JsonRequestParam'; // 请求传参类型
}

/**
 * 通用智能向导
 */
type ChildType = Array<Record<string, any>>;

export type IDataProviderFormProps = {
  loadData: string;
  payload: Record<string, any>;
  model: string;
  formatter: (res: any) => any;
};

export interface CommonGuideFormValueType {
  fatherComponentName: string;
  fatherProps: Record<string, any>;
  childComponentName: string;
  children: ChildType;
  dataProviderProps: IDataProviderFormProps;
  childPropsConfig: {
    // 字段名对应属性名
    fieldName: string;
    // 字段注释对应属性名
    fieldDescriptionName: string;
    // 字段值类型对应属性类型 (暂时用不到)
    fieldType?: string;
  };
}
/**
 * end
 */
