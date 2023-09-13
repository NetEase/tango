import { createContext, useContext } from 'react';
import { IFormModel } from './form-model';

const FormModelContext = createContext<IFormModel>(null);
FormModelContext.displayName = 'ModelContext';

export const FormModelProvider = FormModelContext.Provider;

export const useFormModel = () => {
  return useContext(FormModelContext);
};

export interface FormVariableContextType {
  /**
   * 是否允许表单项切换到表达式设置器
   */
  disableSwitchExpressionSetter?: boolean;
}

const FormVariableContext = createContext<FormVariableContextType>(null);
FormVariableContext.displayName = 'FormVariableContext';

export const FormVariableProvider = FormVariableContext.Provider;
export const useFormVariable = () => useContext(FormVariableContext);
