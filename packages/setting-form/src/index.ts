import { register } from './form-item';
import { ExpressionSetter, TextSetter } from './setter';

// 预注册基础 Setter
register({
  name: 'expressionSetter',
  component: ExpressionSetter,
});

register({
  name: 'textSetter',
  component: TextSetter,
});

export * from './form';
export * from './form-item';
export * from './form-object';
export * from './form-model';
export * from './context';
