import { Dict } from '@music163/tango-helpers';
import { AbstractFile } from './abstract-file';

export interface IViewNodeInitConfig<RawNodeType = unknown, ViewFileType = AbstractFile> {
  id: string;
  component: string;
  rawNode: RawNodeType;
  file: ViewFileType;
}

export abstract class AbstractViewNode<RawNodeType = unknown, ViewFileType = AbstractFile> {
  /**
   * 节点 ID
   */
  readonly id: string;

  /**
   * 节点对应的组件名
   */
  readonly component: string;

  readonly rawNode: RawNodeType;

  /**
   * 节点所属的文件对象
   */
  file: ViewFileType;

  /**
   * 节点所属的文件对象
   */
  props: Record<string, any>;

  /**
   * 节点的位置信息
   */
  abstract get loc(): unknown;

  constructor(props: IViewNodeInitConfig<RawNodeType, ViewFileType>) {
    this.id = props.id;
    this.component = props.component;
    this.rawNode = props.rawNode;
    this.file = null;
  }

  /**
   * 销毁当前节点，清空文件和节点的关联关系
   */
  destroy() {
    this.file = undefined;
  }

  /**
   * 返回克隆后的 ast 节点
   * @param overrideProps 额外设置给克隆节点的属性
   * @returns 返回克隆的原始节点
   */
  abstract cloneRawNode(overrideProps?: Dict): RawNodeType;
}
