import { Dict, parseDndId, uuid } from '@music163/tango-helpers';

// { id: 1, component, props: { id: 1 }, children: [ { id: 2, component } ] }
export function deepCloneNode(obj: any, component?: string): any {
  function deepCloneObject() {
    const target: Dict = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        target[key] = deepCloneNode(obj[key], component);
      }
    }
    return target;
  }

  function deepCloneElementNode() {
    const target: any = deepCloneObject();
    let name = component || target.component;
    if (target.id) {
      const dnd = parseDndId(target.id);
      name = dnd.component || name;
    }
    target.id = uuid(`${name}:`);
    return target;
  }

  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepCloneNode(item, component));
  }

  if (!obj.component) {
    return deepCloneObject();
  }

  return deepCloneElementNode();
}
