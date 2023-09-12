import { ActionListSetter } from './action-list-setter';
import { EnumSetter } from './enum-setter';
import { TextAreaSetter, TextSetter } from './text-setter';
import { PickerSetter } from './picker-setter';
import { ChoiceSetter } from './choice-setter';
import { FormItemCreateOptionsType } from '../form-item';
import { ListSetter } from './list-setter';
import { ColumnSetter } from './column-setter';
import { NumberSetter, SliderSetter } from './number-setter';
import { ExpressionSetter, expressionValueValidate, jsonValueValidate } from './expression-setter';
import { OptionSetter } from './option-setter';
import { DateSetter, DateRangeSetter, TimeSetter, TimeRangeSetter } from './date-setter';
import { JsxSetter } from './jsx-setter';
import { EventSetter } from './event-setter';
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
import { CssSetter } from './css-setter';
import { ModelSetter } from './model-setter';
import { RenderSetter, TableCellSetter, TableExpandableSetter } from './render-props-setter';
import { RouterSetter } from './router-setter';
import { BoolSetter } from './bool-setter';

export const INTERNAL_SETTERS: FormItemCreateOptionsType[] = [
  {
    name: 'actionListSetter',
    component: ActionListSetter,
  },
  {
    name: 'jsxSetter',
    component: JsxSetter,
  },
  {
    name: 'modelSetter',
    component: ModelSetter,
    disableVariableSetter: true,
    validate(value: string) {
      if (value.split('.').length < 2) {
        return '请输入合法的模型变量路径，如：modelName.variableName';
      }
    },
  },
  {
    name: 'eventSetter',
    alias: 'actionSetter',
    component: EventSetter,
    disableVariableSetter: true,
  },
  {
    name: 'boolSetter',
    component: BoolSetter,
  },
  {
    name: 'expressionSetter',
    alias: 'expSetter',
    component: ExpressionSetter,
    disableVariableSetter: true,
    validate: expressionValueValidate,
  },
  {
    name: 'jsonSetter',
    component: ExpressionSetter,
    disableVariableSetter: true,
    validate: jsonValueValidate,
  },
  {
    name: 'dateSetter',
    component: DateSetter,
  },
  {
    name: 'enumSetter',
    component: EnumSetter,
  },
  {
    name: 'dateRangeSetter',
    component: DateRangeSetter,
  },
  {
    name: 'timeSetter',
    component: TimeSetter,
  },
  {
    name: 'timeRangeSetter',
    component: TimeRangeSetter,
  },
  {
    name: 'textSetter',
    component: TextSetter,
  },
  { name: 'textAreaSetter', component: TextAreaSetter },
  {
    name: 'numberSetter',
    component: NumberSetter,
  },
  {
    name: 'sliderSetter',
    component: SliderSetter,
  },
  {
    name: 'pickerSetter',
    alias: 'selectSetter',
    component: PickerSetter,
  },
  {
    name: 'choiceSetter',
    component: ChoiceSetter,
  },
  {
    name: 'optionSetter',
    component: OptionSetter,
  },
  // {
  //   name: 'jsonSetter',
  //   alias: 'styleSetter',
  //   component: JSONSetter,
  // },
  {
    name: 'listSetter',
    component: ListSetter as any,
  },
  // {
  //   name: 'stateSetter',
  //   component: StateSetter,
  //   disableVariableSetter: true,
  // },
  {
    name: 'cssSetter',
    component: CssSetter,
    type: 'subForm',
    defaultCollapsed: false,
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
  {
    name: 'columnSetter',
    component: ColumnSetter,
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
];
