import { Dict } from '@music163/tango-helpers';

/**
 * 快捷键
 */
export class Hotkey {
  private readonly hotkeyMap: Dict = {};

  constructor(hotkeys: Record<string, Function>) {
    Object.keys(hotkeys).forEach((hotkey) => {
      const keys = hotkey.split(',');
      keys.forEach((key) => {
        if (key) {
          key = fixKey(key);
          this.hotkeyMap[key] = hotkeys[hotkey];
        }
      });
    });
  }

  run(hotkey: string) {
    const callback = this.hotkeyMap[hotkey];
    callback?.();
  }
}

function fixKey(key: string) {
  if (key === 'esc') {
    return 'escape';
  }
  return key.replaceAll('command', 'meta');
}
