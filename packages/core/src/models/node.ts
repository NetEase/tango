import { JSXElement, SourceLocation } from '@babel/types';
import { Dict } from '@music163/tango-helpers';
import { cloneJSXElement, getJSXElementAttributes } from '../helpers';
import { ITangoViewNodeData } from '../types';
import { TangoViewModule } from './view-module';
import { IViewNode } from './interfaces';

type TangoNodeConstructorPropsType = ITangoViewNodeData & {
  file: TangoViewModule;
};

/**
 * 视图节点类
 */
export class TangoNode implements IViewNode {
  /**
   * 节点 ID
   */
  readonly id: string;

  /**
   * 节点对应的组件名
   */
  readonly component: string;

  readonly rawNode: JSXElement;

  /**
   * 节点所属的文件对象
   */
  file: TangoViewModule;

  props: Record<string, any>;

  get loc(): SourceLocation {
    return this.rawNode?.loc;
  }

  constructor(props: TangoNodeConstructorPropsType) {
    this.file = props.file;
    this.id = props.id;
    this.component = props.component;
    this.rawNode = props.rawNode;
    this.props = getJSXElementAttributes(cloneJSXElement(props.rawNode));
  }

  /**
   * 返回克隆后的 ast 节点
   * @param overrideProps 额外设置给克隆节点的属性
   * @returns
   */
  cloneRawNode(overrideProps?: Dict) {
    return cloneJSXElement(this.rawNode, overrideProps);
  }

  /**
   * 清空节点的指向，交给 GC 去回收
   */
  destroy() {
    this.file = null;
  }
}
