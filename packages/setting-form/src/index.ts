import { register } from './form-item';
import { ExpressionSetter } from './setter';

// 预注册基础 Setter
register({
  name: 'expressionSetter',
  component: ExpressionSetter,
});

export * from './form';
export * from './form-item';
export * from './form-object';
export * from './form-model';
export * from './context';
