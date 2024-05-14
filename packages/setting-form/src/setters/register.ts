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
    disableVariableSetter: true,
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

export function registerBuiltinSetters() {
  // 预注册基础 Setter
  BASIC_SETTERS.forEach(register);
}
