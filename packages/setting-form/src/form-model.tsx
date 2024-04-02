import { makeObservable, observable, computed, action, toJS } from 'mobx';
import { observableGetIn, observableSetIn } from './helpers';
import { ISetterOnChangeCallbackDetail } from './types';

export interface IFormModel {
  values: any;
  getValue: (name: string, defaultValue?: any) => any;
  setValue: (name: string, value: any) => void;
  getField: (name: string) => Field;
  getSubModel: (name: string) => SubModel;
  onChange: (name: string, value: any, field?: Field) => void;
}

export interface FormModelOptionsType {
  onChange?: IFormModel['onChange'];
}

export class FormModel implements IFormModel {
  state = {};

  _values: any;
  _fieldMap = new Map<string, Field>();
  _subModelMap: { [key: string]: SubModel } = {};

  onChange;

  get values() {
    return this._values;
  }

  set values(nextValues: any) {
    this._values = nextValues;
  }

  constructor(initValues: any, options: FormModelOptionsType = {}) {
    this._values = initValues ?? {};
    this.onChange = options?.onChange;

    makeObservable(this, {
      _values: observable,
      values: computed,
      state: observable,
      setValue: action,
    });
  }

  getValues() {
    return toJS(this.values);
  }

  getValue(name: string, defaultValue?: any) {
    return observableGetIn(this.values, name, defaultValue);
  }

  setValue(name: string, value: any) {
    observableSetIn(this.values, name, value);
  }

  getField(name: string) {
    let field: Field = this._fieldMap.get(name);
    if (field == null) {
      field = new Field({ parent: this, name });
      this._fieldMap.set(name, field);
    }
    return field;
  }

  getSubModel(name: string) {
    let subModel = this._subModelMap[name];
    if (!subModel) {
      subModel = new SubModel(this, name);
      this._subModelMap[name] = subModel;
    }
    return subModel;
  }
}

class SubModel implements IFormModel {
  parent: IFormModel;
  name: string;

  _fieldMap = new Map<string, Field>();
  _subModelMap: { [key: string]: SubModel } = {};

  get values() {
    return this.parent.getValue(this.name);
  }

  set values(nextValues: any) {
    this.parent.setValue(this.name, nextValues);
  }

  constructor(parent: IFormModel, name: string) {
    this.parent = parent;
    this.name = name;

    makeObservable(this, {
      values: computed,
      setValue: action,
    });
  }

  getValue(name: string, defaultValue?: any) {
    return observableGetIn(this.values, name, defaultValue);
  }

  setValue(name: string, value: any) {
    if (!this.values) {
      this.values = {};
    }
    observableSetIn(this.values, name, value);
  }

  getField(name: string) {
    let field = this._fieldMap.get(name);
    if (!field) {
      field = new Field({
        parent: this,
        name,
      });
      this._fieldMap.set(name, field);
    }
    return field;
  }

  getSubModel(name: string) {
    let subModel = this._subModelMap[name];
    if (!subModel) {
      subModel = new SubModel(this, name);
      this._subModelMap[name] = subModel;
    }
    return subModel;
  }

  getPath(name: string) {
    return [this.name, name].filter((item) => !!item).join('.');
  }

  onChange(name: string, values: any, field: Field) {
    this.parent.onChange?.(this.getPath(name), values, field);
  }
}

interface FieldCreateOptionsType {
  parent: IFormModel;
  name: string;
}

interface FieldConfigType {
  validate?: (value: any, field: Field, trigger: string) => string | Promise<any>;
}

interface FieldStateType {
  error?: any;
  validating?: boolean;
  cancelValidation?: () => void;
  [key: string]: any;
}

type FieldValidateTriggerType = '*' | 'blur' | 'change';

export class Field {
  readonly parent: IFormModel;
  readonly name: string;
  readonly id: string;

  readonly _get: () => any;
  readonly _set: (v: any) => void;

  config: FieldConfigType = null;

  state: FieldStateType = {};

  detail: ISetterOnChangeCallbackDetail = {};

  get value() {
    return this.parent.getValue(this.name);
  }

  set value(value) {
    this.parent.setValue(this.name, value);
  }

  get error() {
    return this.state.error;
  }

  constructor(options: FieldCreateOptionsType) {
    this.parent = options.parent;
    this.name = options.name;

    makeObservable(this, {
      state: observable,
      value: computed,
      error: computed,
      validate: action,
      handleBlur: action,
      handleChange: action,
    });
  }

  validate = async (trigger: FieldValidateTriggerType = '*') => {
    const shouldValidate = ['*', 'blur', 'change'].includes(trigger);
    if (!shouldValidate) {
      return;
    }

    const { validate } = this.config;
    const value = this.value;

    const actualValidate = async () => {
      if (validate) {
        // FIXME: 重构 validate 的逻辑，和 antd Form 保持一致
        return validate(value, this, trigger);
      }
      return null;
    };

    let cancelled = false;
    this.state.cancelValidation?.();
    this.state.validating = true;
    this.state.cancelValidation = action(() => {
      cancelled = true;
      this.state.cancelValidation = null;
      this.state.validating = false;
    });

    return actualValidate().then(
      action((error) => {
        if (cancelled) {
          return;
        }
        this.state.cancelValidation = null;
        this.state.validating = false;
        this.state.error = error;

        if (error) {
          return error;
        }

        // 校验错误，不触发 onChange
        this.parent?.onChange?.(this.name, this.value, this);
      }),
    );
  };

  handleBlur = () => {
    return this.validate('blur');
  };

  handleChange = (nextValue: any, valueDetail: any) => {
    this.detail = valueDetail;
    this.value = nextValue;
    return this.validate('change');
  };

  setConfig(config: FieldConfigType) {
    this.config = config;
  }
}
