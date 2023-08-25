type IdGeneratorOptionsType = { prefix?: string };
/**
 * ID 生成器
 */
export class IdGenerator {
  /**
   * ID 前缀
   */
  private readonly prefix: string;
  /**
   * 记录组件 ID 记录
   */
  private map = new Map<string, string[]>();

  constructor(options?: IdGeneratorOptionsType) {
    this.prefix = options?.prefix ? encodeURIComponent(options.prefix) : undefined;
  }

  /**
   * 更新组件记录
   * @param component
   */
  setItem(component: string, id?: string) {
    if (this.map.has(component)) {
      const record = this.map.get(component);
      if (id && !record.includes(id)) {
        record.push(id);
      }
      this.map.set(component, record);
    } else {
      this.map.set(component, []);
    }
  }

  /**
   * 获取组件 ID
   * @param component
   * @returns
   */
  generateId(component: string) {
    const size = this.map.get(component)?.length + 1 || 1;
    let id = `${component}:${size}`;
    if (this.prefix) {
      id = `${this.prefix}:${id}`;
    }
    this.setItem(component, id);
    return id;
  }
}
