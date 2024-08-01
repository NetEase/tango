import { warning } from '../helpers';
import { Dict } from '../types';

type ListStoreOptionsType<T extends Dict = Dict> = {
  data: T[];
  keyProp?: string;
  labelProp?: string;
  childrenProp?: string;
};

export class ListStore<T extends Dict = Dict> {
  private nodeMap: Map<string, T>;
  private keyProp: string;
  private childrenProp: string;

  get nodes() {
    return this.nodeMap.values();
  }

  constructor(options: ListStoreOptionsType<T>) {
    this.keyProp = options.keyProp || 'value';
    this.childrenProp = options.childrenProp || 'children';
    this.nodeMap = new Map();
    this.visitNodes(options.data);
  }

  getNode(key: string) {
    if (!key) {
      return;
    }

    return this.nodeMap.get(key);
  }

  private visitNodes(nodes: T[]) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return;
    }

    nodes.forEach((node) => {
      const key = node[this.keyProp];
      this.nodeMap.set(key, node);
      warning(
        this.nodeMap.has(key),
        `duplicate value '${key}' detected! All node values should be unique!`,
      );
      this.nodeMap.set(key, node);
      if (node[this.childrenProp]) {
        this.visitNodes(node[this.childrenProp]);
      }
    });
  }
}
