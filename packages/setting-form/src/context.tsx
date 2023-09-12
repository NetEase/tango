import { createContext, useContext } from 'react';
import { IFormModel } from './form-model';

const FormModelContext = createContext<IFormModel>(null);
FormModelContext.displayName = 'ModelContext';

export const FormModelProvider = FormModelContext.Provider;

export const useFormModel = () => {
  return useContext(FormModelContext);
};

// TODO: 删掉不需要的
export interface FormVariableContextType {
  /**
   * 是否允许表单项切换到表达式设置器
   */
  disableSwitchExpressionSetter?: boolean;
  // /**
  //  * 探测输入上下文的对象
  //  */
  // evaluateContext?: object;
  // /**
  //  * 表单动作发生时的回调
  //  */
  // onAction?: (fn: string, args: unknown[]) => void;
  // /**
  //  * 状态变量列表
  //  */
  // modelVariables?: any[];
  // /**
  //  * 动作变量列表
  //  */
  // actionVariables?: any[];
  // /**
  //  * 表达式变量列表（含状态变量和动作变量）
  //  */
  // expressionVariables?: any[];
  // /**
  //  * 路由选项
  //  */
  // routeOptions?: any[];
  // /**
  //  * 可选弹窗列表
  //  */
  // modalOptions?: any[];
  // /**
  //  * 关联的表单域列表
  //  */
  // formFieldsOptions?: any[];
  // /**
  //  * 远程服务
  //  */
  // remoteServices?: TangoRemoteServicesType;
}

const FormVariableContext = createContext<FormVariableContextType>(null);
FormVariableContext.displayName = 'FormVariableContext';

export const FormVariableProvider = FormVariableContext.Provider;
export const useFormVariable = () => useContext(FormVariableContext);
