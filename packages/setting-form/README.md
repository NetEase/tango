# `setting-form`

高性能属性配置表单

## Setter 规范

必须提供以下属性支持受控使用

- `value` 受控的值
- `onChange(value, detail)` 值变化时的回调
  - value 需要为简单数据类型
  - detail 可以

## Setter 选择

- actionSetter 函数设置器
- boolSetter 布尔值设置器
- choiceSetter 单选项设置器（平铺的单选项）
- expressionSetter 表达式设置器
- jsonSetter JSON 设置器
- numberSetter 数字设置器
- pickerSetter 下拉列表设置器
- textSetter 文本设置器
