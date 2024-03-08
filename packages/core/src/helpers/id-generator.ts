import { camelCase } from '@music163/tango-helpers';

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
      const value = id ? [id] : [];
      this.map.set(component, value);
    }
  }

  /**
   * 获取组件 ID
   * @param component 组件名, 如 Button, DatePicker
   * @param codeId 用户自定义的 ID
   * @returns
   */
  generateId(component: string, codeId?: string) {
    // FIXME: 使用 size 这里可能存在冲突的风险
    const size = this.map.get(component)?.length + 1 || 1;
    const id = codeId || `${camelCase(component)}${size}`;
    this.setItem(component, id);

    let fullId = `${component}:${id}`;
    if (this.prefix) {
      fullId = `${this.prefix}:${fullId}`;
    }

    return { id, fullId };
  }
}
