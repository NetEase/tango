import { register, IFormItemCreateOptions } from '@music163/tango-setting-form';
import { ActionListSetter } from './action-list-setter';
import { ColumnSetter } from './column-setter';
import { CssSetter } from './css-setter';
import { DateRangeSetter, DateSetter, TimeRangeSetter } from './date-setter';
import { EnumSetter } from './enum-setter';
import { EventSetter } from './event-setter';
import { ExpressionSetter } from './expression-setter';
import { JSONSetter } from './json-setter';
import { JsxSetter } from './jsx-setter';
import { ListSetter } from './list-setter';
import { ModelSetter } from './model-setter';
import { OptionSetter } from './option-setter';
import { PickerSetter } from './picker-setter';
import { RenderSetter, TableCellSetter, TableExpandableSetter } from './render-setter';
import { RouterSetter } from './router-setter';
import {
  SpacingSetter,
  ColorSetter,
  BgSetter,
  BorderSetter,
  FlexGapSetter,
  DisplaySetter,
  FlexJustifyContentSetter,
  FlexAlignItemsSetter,
  FlexDirectionSetter,
} from './style-setter';
import { BoolSetter } from './bool-setter';
import { ChoiceSetter } from './choice-setter';
import { NumberSetter, SliderSetter } from './number-setter';
import { TextAreaSetter, TextSetter } from './text-setter';

const setters: IFormItemCreateOptions[] = [
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
  {
    name: 'actionListSetter',
    component: ActionListSetter,
  },
  {
    name: 'columnSetter',
    component: ColumnSetter,
  },
  {
    name: 'cssSetter',
    component: CssSetter,
  },
  {
    name: 'dateSetter',
    component: DateSetter,
  },
  {
    name: 'dateRangeSetter',
    component: DateRangeSetter,
  },
  {
    name: 'timeSetter',
    component: DateRangeSetter,
  },
  {
    name: 'timeRangeSetter',
    component: TimeRangeSetter,
  },
  {
    name: 'enumSetter',
    component: EnumSetter,
  },
  {
    name: 'eventSetter',
    alias: ['actionSetter', 'functionSetter', 'callbackSetter'],
    component: EventSetter,
  },
  {
    name: 'expressionSetter',
    alias: ['expSetter'],
    component: ExpressionSetter,
  },
  {
    name: 'jsonSetter',
    component: JSONSetter,
  },
  {
    name: 'jsxSetter',
    component: JsxSetter,
  },
  {
    name: 'listSetter',
    component: ListSetter as any,
  },
  {
    name: 'modelSetter',
    component: ModelSetter,
  },
  {
    name: 'optionSetter',
    component: OptionSetter,
  },
  {
    name: 'pickerSetter',
    component: PickerSetter,
  },
  {
    name: 'renderPropsSetter',
    component: RenderSetter,
  },
  {
    name: 'tableCellSetter',
    component: TableCellSetter,
  },
  {
    name: 'tableExpandableSetter',
    component: TableExpandableSetter,
  },
  {
    name: 'routerSetter',
    component: RouterSetter,
  },
  {
    name: 'displaySetter',
    component: DisplaySetter,
  },
  { name: 'flexDirectionSetter', component: FlexDirectionSetter },
  {
    name: 'flexGapSetter',
    component: FlexGapSetter,
  },
  {
    name: 'flexJustifyContentSetter',
    component: FlexJustifyContentSetter,
  },
  {
    name: 'flexAlignItemsSetter',
    component: FlexAlignItemsSetter,
  },
  {
    name: 'spacingSetter',
    component: SpacingSetter,
  },
  {
    name: 'colorSetter',
    component: ColorSetter,
  },
  { name: 'bgSetter', component: BgSetter },
  { name: 'borderSetter', component: BorderSetter },
];

export function registerBuiltinSetters() {
  setters.forEach(register);
}
