import React, { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { Dropdown, Menu, Tag } from 'antd';
import styled from 'styled-components';

const InputWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 4px 11px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  min-height: 32px;
  &:hover {
    border-color: #40a9ff;
  }
  &:focus-within {
    border-color: #40a9ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  padding: 0;
  font-size: 14px;
  min-width: 50px;
  height: 24px;
  line-height: 24px;
`;

const StyledTag = styled(Tag)`
  margin: 2px 4px 2px 0;
`;

// Tailwind CSS 基础类名列表
const tailwindClasses = [
  // 布局
  'container',
  'flex',
  'grid',
  'block',
  'inline',
  'inline-block',
  'hidden',
  // 弹性布局
  'flex-row',
  'flex-col',
  'flex-wrap',
  'flex-nowrap',
  'justify-start',
  'justify-end',
  'justify-center',
  'justify-between',
  'justify-around',
  'items-start',
  'items-end',
  'items-center',
  'items-baseline',
  'items-stretch',
  // 网格布局
  'grid-cols-1',
  'grid-cols-2',
  'grid-cols-3',
  'grid-cols-4',
  'grid-cols-5',
  'grid-cols-6',
  'grid-cols-12',
  // 间距
  'p-0',
  'p-1',
  'p-2',
  'p-3',
  'p-4',
  'p-5',
  'p-6',
  'p-8',
  'p-10',
  'p-12',
  'p-16',
  'p-20',
  'm-0',
  'm-1',
  'm-2',
  'm-3',
  'm-4',
  'm-5',
  'm-6',
  'm-8',
  'm-10',
  'm-12',
  'm-16',
  'm-20',
  // 尺寸
  'w-full',
  'w-auto',
  'w-1/2',
  'w-1/3',
  'w-2/3',
  'w-1/4',
  'w-3/4',
  'h-full',
  'h-auto',
  'h-screen',
  // 字体
  'text-xs',
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
  'text-5xl',
  'font-thin',
  'font-light',
  'font-normal',
  'font-medium',
  'font-semibold',
  'font-bold',
  'font-extrabold',
  // 文本颜色
  'text-black',
  'text-white',
  'text-gray-100',
  'text-gray-200',
  'text-gray-300',
  'text-gray-400',
  'text-gray-500',
  'text-red-500',
  'text-blue-500',
  'text-green-500',
  'text-yellow-500',
  'text-purple-500',
  'text-pink-500',
  // 背景颜色
  'bg-transparent',
  'bg-black',
  'bg-white',
  'bg-gray-100',
  'bg-gray-200',
  'bg-gray-300',
  'bg-gray-400',
  'bg-gray-500',
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  // 边框
  'border',
  'border-0',
  'border-2',
  'border-4',
  'border-8',
  'border-black',
  'border-white',
  'border-gray-300',
  'border-gray-400',
  'border-gray-500',
  // 圆角
  'rounded-none',
  'rounded-sm',
  'rounded',
  'rounded-lg',
  'rounded-full',
  // 阴影
  'shadow-sm',
  'shadow',
  'shadow-md',
  'shadow-lg',
  'shadow-xl',
  'shadow-2xl',
  'shadow-none',
  // 不透明度
  'opacity-0',
  'opacity-25',
  'opacity-50',
  'opacity-75',
  'opacity-100',
];

interface ClassNameInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export function ClassNameInput({ value, defaultValue, onChange }: ClassNameInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const isControlled = value !== undefined;
  const classNames = (isControlled ? value : internalValue).split(' ').filter(Boolean);

  useEffect(() => {
    if (isControlled) {
      setInternalValue(value);
    }
  }, [isControlled, value]);

  const isValidClassName = (className: string) => {
    return /^[a-zA-Z0-9_-]+(?::[a-zA-Z0-9_-]+)*$/.test(className);
  };

  const updateValue = (newClassNames: string[]) => {
    const newValue = newClassNames.join(' ');
    if (isControlled) {
      onChange?.(newValue);
    } else {
      setInternalValue(newValue);
      onChange?.(newValue);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        addClassName(suggestions[highlightedIndex]);
      } else {
        addClassName(inputValue.trim());
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (event.key === 'Backspace' && inputValue === '' && classNames.length > 0) {
      event.preventDefault();
      const newClassNames = [...classNames];
      newClassNames.pop();
      updateValue(newClassNames);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    setInputValue(input);
    if (input) {
      const matchedSuggestions = tailwindClasses
        .filter(
          (className) =>
            className.toLowerCase().includes(input.toLowerCase()) &&
            !classNames.includes(className),
        )
        .slice(0, 10);
      setSuggestions(matchedSuggestions);
      setHighlightedIndex(-1);
    } else {
      setSuggestions([]);
    }
  };

  const addClassName = (className: string) => {
    if (className && !classNames.includes(className) && isValidClassName(className)) {
      updateValue([...classNames, className]);
      setInputValue('');
      setSuggestions([]);
      setHighlightedIndex(-1);
    }
  };

  const removeClassName = (removedTag: string) => {
    const newClassNames = classNames.filter((tag) => tag !== removedTag);
    updateValue(newClassNames);
  };

  const handleSuggestionClick = (suggestion: string) => {
    addClassName(suggestion);
  };

  const menu = (
    <Menu>
      {suggestions.map((suggestion, index) => (
        <Menu.Item
          key={index}
          onClick={() => handleSuggestionClick(suggestion)}
          className={index === highlightedIndex ? 'ant-dropdown-menu-item-active' : ''}
        >
          {suggestion}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} visible={suggestions.length > 0} placement="bottomLeft">
      <InputWrapper onClick={() => inputRef.current?.focus()}>
        {classNames.map((className) => (
          <StyledTag key={className} closable onClose={() => removeClassName(className)}>
            {className}
          </StyledTag>
        ))}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onKeyDown={handleInputKeyDown}
          onChange={handleInputChange}
          placeholder={classNames.length === 0 ? '输入 class 名称' : ''}
        />
      </InputWrapper>
    </Dropdown>
  );
}
