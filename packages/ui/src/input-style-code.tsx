import React from 'react';
import { Box } from 'coral-system';
import CodeMirror from '@uiw/react-codemirror';
import { javascript, javascriptLanguage, esLint } from '@codemirror/lang-javascript';
import { CompletionContext } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import { linter, lintGutter } from '@codemirror/lint';
import * as eslint from 'eslint-linter-browserify';
import { jsxCSSproperties, jsxCSSvalues } from './lang/css-object';
import type { Completion } from '@codemirror/autocomplete';
import { InputCodeProps, useInputCode } from './input-code';

const eslintConfig = {
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  env: {
    browser: true,
  },
  rules: {},
};

function completeProperties(from: number, cssOptions: Completion[] | readonly Completion[]) {
  return {
    from,
    options: cssOptions,
    validFor: /^[\w$]*$/,
  };
}

/**
 *
 * @param scope 预测 CSS 的补全上下文
 * @param customOptions 自定义补全选项列表
 * @returns
 */
function buildAutoComplete() {
  /**
   * @see context https://codemirror.net/docs/ref/#autocomplete.CompletionContext
   */
  return function (context: CompletionContext) {
    const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
    if (nodeBefore.name === 'VariableName') {
      // match css property name
      return completeProperties(nodeBefore.from, jsxCSSproperties());
    }
    // match css property value
    else if (nodeBefore.name === 'String') {
      return completeProperties(nodeBefore.from + 1, jsxCSSvalues);
    }
    return null;
  };
}

export type InputStyleCodeProps = Omit<
  InputCodeProps,
  'autoCompleteContext' | 'autoCompleteOptions'
>;

export function InputStyleCode({
  shape = 'solid',
  suffix,
  status,
  showLineNumbers,
  showFoldGutter,
  enableESLint = false,
  ...rest
}: InputStyleCodeProps) {
  const extensions = [
    javascript({ jsx: true }),
    javascriptLanguage.data.of({
      autocomplete: buildAutoComplete(),
    }),
  ];
  if (enableESLint) {
    extensions.push(lintGutter(), linter(esLint(new eslint.Linter(), eslintConfig)));
  }
  const { rootStyle, codeSetup } = useInputCode({
    shape,
    status,
    showLineNumbers,
    showFoldGutter,
  });

  return (
    <Box className="InputCode" display="flex" alignItems="center" overflow="hidden" {...rootStyle}>
      <Box flex="1" overflow="auto">
        <CodeMirror
          extensions={extensions}
          basicSetup={codeSetup}
          placeholder={'//输入 css 代码'}
          {...rest}
        />
      </Box>
      {suffix}
    </Box>
  );
}
