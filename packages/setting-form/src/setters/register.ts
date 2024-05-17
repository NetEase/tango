import { CodeSetter } from './code-setter';
import { BoolSetter } from './bool-setter';
import { IdSetter } from './id-setter';
import { TextAreaSetter, TextSetter } from './text-setter';
import { NumberSetter, SliderSetter } from './number-setter';
import { IFormItemCreateOptions, register } from '../form-item';

const BASIC_SETTERS: IFormItemCreateOptions[] = [
  {
    name: 'codeSetter',
    alias: ['expSetter', 'expressionSetter'],
    component: CodeSetter,
    type: 'code',
  },
  {
    name: 'textSetter',
    component: TextSetter,
  },
  {
    name: 'textAreaSetter',
    component: TextAreaSetter,
  },
  {
    name: 'boolSetter',
    component: BoolSetter,
  },
  {
    name: 'numberSetter',
    component: NumberSetter,
  },
  {
    name: 'sliderSetter',
    component: SliderSetter,
  },
  {
    name: 'idSetter',
    component: IdSetter,
  },
];

let registered = false;

/**
 * 注册内置的基础类型 Setter
 */
export function registerBuiltinSetters() {
  if (registered) {
    // 防止重复注册
    return;
  }

  // 预注册基础 Setter
  BASIC_SETTERS.forEach(register);
  registered = true;
}
