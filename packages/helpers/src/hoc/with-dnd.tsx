import React, { forwardRef } from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';
import { SLOT, getDisplayName, wrapDisplayName, isFunctionComponent } from '../helpers';

interface IWithDndOptions<T> {
  /**
   * 组件名
   */
  name: string;
  /**
   * 是否注入 draggable 属性，默认为 true
   */
  draggable?: boolean;
  /**
   * 是否使用 DndWrapper 包装一层，推进容器类组件关闭此属性，其他类组件均开启
   */
  hasWrapper?: boolean;
  /**
   * DndWrapper 的自定义样式
   */
  wrapperStyle?: React.CSSProperties;
  /**
   * 组件的展示方式，仅在 hasWrapper 开启时有效
   */
  display?: DndBoxProps['display'];
  /**
   * 被包裹的组件是否为函数组件
   * @deprecated
   */
  isFunctionComponent?: boolean;
  /**
   * 覆盖的属性集
   */
  overrideProps?: T;
  /**
   * 自定义容器底部渲染，仅在 hasWrapper 开启时有效
   */
  renderFooter?: (props: T) => React.ReactNode;
}

interface DraggableComponentProps {
  /**
   * 组件 ID
   */
  tid?: string;
}

const renderEmpty = (): React.ReactNode => null;

export function withDnd(options: IWithDndOptions<any>) {
  return function hoc<P>(BaseComponent: React.ComponentType<P>) {
    const isFC = isFunctionComponent(BaseComponent);
    const displayName = options.name || getDisplayName(BaseComponent);
    const draggable = options.draggable ?? true;
    const hasWrapper = options.hasWrapper ?? true;
    const display = options.display || 'block';
    const override = options.overrideProps || {};
    const renderFooter = options.renderFooter || renderEmpty;

    const Component = forwardRef<unknown, P & DraggableComponentProps>((props, refProp) => {
      const dndProps = {
        [SLOT.id]: props.tid, // id 作为唯一标记
        [SLOT.dnd]: props[SLOT.dnd], // dnd 作为追踪标记
        draggable: draggable ? true : undefined,
      };

      const propsCopy = { ...props };
      delete propsCopy[SLOT.dnd];
      delete propsCopy.tid;

      const ref = isFC ? undefined : refProp;

      if (!hasWrapper) {
        return <BaseComponent ref={ref} {...dndProps} {...override} {...propsCopy} />;
      }

      return (
        <DndBox name={displayName} display={display} style={options.wrapperStyle} {...dndProps}>
          <BaseComponent ref={ref} {...override} {...propsCopy} />
          {renderFooter(props)}
        </DndBox>
      );
    });

    hoistNonReactStatic(Component, BaseComponent as any);
    Component.displayName = wrapDisplayName(displayName, 'withDnd');

    return Component;
  };
}

interface DndBoxProps extends React.ComponentPropsWithoutRef<'div'> {
  name?: string;
  display?: 'block' | 'inline-block' | 'inline';
}

function DndBox({ name, display, children, style: styleProp, ...rest }: DndBoxProps) {
  const style = {
    display,
    minHeight: 4,
    ...styleProp,
  };
  return (
    <div className={`${name}-designer tango-dndBox`} style={style} {...rest}>
      {children}
    </div>
  );
}
