import React from 'react';

export { default as hoistNonReactStatics } from 'hoist-non-react-statics';

export interface CreateContextOptions {
  /**
   * If `true`, React will throw if context is `null` or `undefined`
   * In some cases, you might want to support nested context, so you can set it to `false`
   */
  strict?: boolean;
  /**
   * Error message to throw if the context is `undefined`
   */
  errorMessage?: string;
  /**
   * The display name of the context
   */
  name?: string;
}

type CreateContextReturn<T> = [React.Provider<T>, () => T, React.Context<T>];

/**
 * 创建一个命名的 Context 附赠 Provider, Hook
 * @param options
 */
export function createContext<ContextType>(options: CreateContextOptions = {}) {
  const {
    strict = true,
    errorMessage = 'useContext: `context` is undefined. Seems you forgot to wrap component within the Provider',
    name,
  } = options;

  const Context = React.createContext<ContextType>(undefined);

  Context.displayName = name;

  function useContext() {
    const context = React.useContext(Context);

    if (!context && strict) {
      throw new Error(errorMessage);
    }

    return context;
  }

  return [Context.Provider, useContext, Context] as CreateContextReturn<ContextType>;
}

/**
 * 获取组件的 displayName
 * @param Component
 * @returns
 */
export const getDisplayName = (Component: any) => {
  if (typeof Component === 'string') {
    return Component;
  }

  if (!Component) {
    return undefined;
  }

  return Component.displayName || Component.name || 'Component';
};

/**
 * 包裹 DisplayName
 * @param Component
 * @param hocName
 * @returns
 */
export const wrapDisplayName = (Component: any, hocName: string) =>
  `${hocName}(${getDisplayName(Component)})`;

/**
 * 判断组件是否是函数组件
 * @returns 类组件和 forwardRef 返回 false，函数组件返回 true
 */
export const isFunctionComponent = (Comp: any) => {
  // class component
  if (Comp.prototype && Comp.prototype.isReactComponent) {
    return false;
  }

  // forwardRef component
  if (typeof Comp === 'object' && Comp.render) {
    return false;
  }

  // function component
  return typeof Comp === 'function';
};
