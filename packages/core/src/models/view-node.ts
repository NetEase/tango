import { JSXElement } from '@babel/types';
import { Dict } from '@music163/tango-helpers';
import { cloneJSXElement, getJSXElementAttributes } from '../helpers';
import { JsViewFile } from './js-view-file';
import { AbstractViewNode, IViewNodeInitConfig } from './abstract-view-node';

/**
 * 视图节点类
 */
export class JsxViewNode extends AbstractViewNode<JSXElement, JsViewFile> {
  get loc() {
    return this.rawNode?.loc;
  }

  constructor(props: IViewNodeInitConfig<JSXElement, JsViewFile>) {
    super(props);
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
}
