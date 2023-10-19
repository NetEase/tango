import React, { useMemo } from 'react';
import CodeMirror, { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { javascript, javascriptLanguage, esLint } from '@codemirror/lang-javascript';
import { CompletionContext } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import { linter, lintGutter } from '@codemirror/lint';
import { getValue } from '@music163/tango-helpers';
import { Box, HTMLCoralProps } from 'coral-system';
import * as eslint from 'eslint-linter-browserify';

const completePropertyAfter = ['PropertyName', '.', '?.'];
const dontCompleteIn = [
  'TemplateString',
  'LineComment',
  'BlockComment',
  'VariableDefinition',
  'PropertyDefinition',
];

const eslintConfig = {
  // eslint configuration
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  env: {
    browser: true,
  },
  rules: {},
};

function completeProperties(from: number, object: Object) {
  const options = [];
  for (const name in object) {
    if (Object.prototype.hasOwnProperty.call(object, name)) {
      options.push({
        label: name,
        type: typeof object[name] === 'function' ? 'function' : 'variable',
      });
    }
  }
  return {
    from,
    options,
    validFor: /^[\w$]*$/,
  };
}

/**
 *
 * @param scope 预测的补全上下文
 * @param customOptions 自定义补全选项列表
 * @returns
 */
function buildAutoComplete(scope: any = window, customOptions: Array<{ label: string }> = []) {
  /**
   * @see context https://codemirror.net/docs/ref/#autocomplete.CompletionContext
   */
  return function completeFromGlobalScope(context: CompletionContext) {
    const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);

    if (
      completePropertyAfter.includes(nodeBefore.name) &&
      nodeBefore.parent?.name == 'MemberExpression'
    ) {
      const object = nodeBefore.parent.getChild('Expression');
      if (object?.name == 'VariableName') {
        const from = /\./.test(nodeBefore.name) ? nodeBefore.to : nodeBefore.from;
        const variableName = context.state.sliceDoc(object.from, object.to);
        if (typeof scope[variableName] === 'object') {
          return completeProperties(from, scope[variableName]);
        }
      } else if (object?.name === 'MemberExpression') {
        const from = nodeBefore.to;
        const variableName = context.state.sliceDoc(object.from, object.to);
        let result;
        if (variableName.startsWith('this.props')) {
          result = getValue(
            scope,
            variableName.replace('this.props', '__UNSAFE_TANGO_CURRENT_PAGE_RENDER_RUNTIME__'),
          );
        } else {
          result = getValue(scope, variableName);
        }
        if (typeof result === 'object') {
          return completeProperties(from, result);
        }
      }
    } else if (nodeBefore.name == 'VariableName') {
      return completeProperties(nodeBefore.from, scope);
    } else if (context.explicit && !dontCompleteIn.includes(nodeBefore.name)) {
      return completeProperties(context.pos, scope);
    } else if (!context.explicit && nodeBefore.name == '{') {
      return {
        from: context.pos,
        options: customOptions,
      };
    }

    return null;
  };
}

export interface InputCodeProps extends ReactCodeMirrorProps {
  /**
   * 外观
   * - solid 带边框，完整模式
   * - inset 嵌入式场景，轻量模式
   */
  shape?: 'solid' | 'inset';
  /**
   * 是否展示行号
   */
  showLineNumbers?: boolean;
  /**
   * 是否展示代码折叠箭头
   */
  showFoldGutter?: boolean;
  /**
   * 后缀元素
   */
  suffix?: React.ReactNode;
  /**
   * 状态
   */
  status?: string;
  /**
   * 补全上下文对象
   */
  autoCompleteContext?: any;
  /**
   * 自定义补全的选项列表
   */
  autoCompleteOptions?: string[];
}

export function InputCode({
  shape = 'solid',
  suffix,
  status,
  autoCompleteContext,
  autoCompleteOptions,
  showLineNumbers,
  showFoldGutter,
  ...rest
}: InputCodeProps) {
  const globalJavaScriptCompletions = useMemo(() => {
    // 格式化补全的选项值，原始格式参考 https://codemirror.net/docs/ref/#autocomplete.Completion
    const options = autoCompleteOptions ? autoCompleteOptions.map((str) => ({ label: str })) : [];
    return javascriptLanguage.data.of({
      autocomplete: buildAutoComplete(autoCompleteContext, options),
    });
  }, [autoCompleteContext, autoCompleteOptions]);
  const { rootStyle, codeSetup } = useInputCode({ shape, status, showLineNumbers, showFoldGutter });

  return (
    <Box className="InputCode" display="flex" alignItems="center" overflow="hidden" {...rootStyle}>
      <Box flex="1" overflow="auto">
        <CodeMirror
          extensions={[
            javascript({ jsx: true }),
            globalJavaScriptCompletions,
            lintGutter(),
            // @ts-ignore
            linter(esLint(new eslint.Linter(), eslintConfig)),
          ]}
          basicSetup={codeSetup}
          {...rest}
        />
      </Box>
      {suffix}
    </Box>
  );
}

function useInputCode({
  shape,
  status,
  showLineNumbers,
  showFoldGutter,
}: Pick<InputCodeProps, 'shape' | 'status' | 'showLineNumbers' | 'showFoldGutter'>) {
  let rootStyle: HTMLCoralProps<'div'>;
  let lineNumbers;
  let foldGutter;

  if (shape === 'solid') {
    rootStyle = {
      border: 'solid',
      borderColor: status === 'error' ? 'error.60' : 'line.normal',
      borderRadius: 's',
    };
    lineNumbers = false;
    foldGutter = false;
  }
  return {
    rootStyle,
    codeSetup: {
      lineNumbers: showLineNumbers ?? lineNumbers,
      foldGutter: showFoldGutter ?? foldGutter,
    },
  };
}
