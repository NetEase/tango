import { TextAreaSetter, TextSetter } from './text-setter';
import { ChoiceSetter } from './choice-setter';
import { NumberSetter, SliderSetter } from './number-setter';
import { BoolSetter } from './bool-setter';
import { IFormItemCreateOptions } from '../form-item';
import { ExpressionSetter } from './exp-setter';

export const INTERNAL_SETTERS: IFormItemCreateOptions[] = [
  {
    name: 'boolSetter',
    component: BoolSetter,
  },
  {
    name: 'choiceSetter',
    component: ChoiceSetter,
  },
  {
    name: 'expSetter',
    alias: ['expressionSetter'],
    component: ExpressionSetter,
  },
  {
    name: 'numberSetter',
    component: NumberSetter,
  },
  {
    name: 'textSetter',
    component: TextSetter,
  },
  { name: 'textAreaSetter', component: TextAreaSetter },
  {
    name: 'sliderSetter',
    component: SliderSetter,
  },
];

export * from './bool-setter';
export * from './choice-setter';
export * from './number-setter';
export * from './text-setter';
