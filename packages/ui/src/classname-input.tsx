import React, { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import styled from 'styled-components';

const InputWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 4px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  min-height: 40px;
  position: relative;
`;

const ClassBadge = styled.span`
  background-color: #ff4d4f;
  color: white;
  padding: 2px 8px;
  margin: 2px;
  border-radius: 16px;
  font-size: 14px;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  padding: 4px;
  font-size: 16px;
  min-width: 50px;
`;

const SuggestionList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #d9d9d9;
  border-top: none;
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1;
`;

const SuggestionItem = styled.li<{ isHighlighted: boolean }>`
  padding: 8px;
  cursor: pointer;
  background-color: ${(props) => (props.isHighlighted ? '#e6f7ff' : 'transparent')};
  &:hover {
    background-color: #f0f0f0;
  }
`;

// 这里只是一个简化的 Tailwind CSS 类名列表,实际使用时应该包含更多类名
const tailwindClasses = [
  'text-red-500',
  'bg-blue-300',
  'p-4',
  'm-2',
  'flex',
  'items-center',
  'justify-between',
  'rounded-lg',
  'shadow-md',
  'hover:bg-gray-100',
  'focus:outline-none',
  'transition',
];

export function ClassNameInput() {
  const [classNames, setClassNames] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValidClassName = (className: string) => {
    return /^[a-zA-Z0-9_-]+(?::[a-zA-Z0-9_-]+)*$/.test(className);
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
      setClassNames(newClassNames);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    setInputValue(input);
    if (input) {
      const matchedSuggestions = tailwindClasses.filter(
        (className) => className.startsWith(input) && !classNames.includes(className),
      );
      setSuggestions(matchedSuggestions);
      setHighlightedIndex(-1);
    } else {
      setSuggestions([]);
    }
  };

  const addClassName = (className: string) => {
    if (className && !classNames.includes(className) && isValidClassName(className)) {
      setClassNames([...classNames, className]);
      setInputValue('');
      setSuggestions([]);
      setHighlightedIndex(-1);
    }
  };

  const removeClassName = (index: number) => {
    setClassNames(classNames.filter((_, i) => i !== index));
  };

  const handleSuggestionClick = (suggestion: string) => {
    addClassName(suggestion);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <InputWrapper onClick={() => inputRef.current?.focus()}>
      {classNames.map((className, index) => (
        <ClassBadge key={index} onClick={() => removeClassName(index)}>
          {className} ×
        </ClassBadge>
      ))}
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onKeyDown={handleInputKeyDown}
        onChange={handleInputChange}
        placeholder={classNames.length === 0 ? '输入 class 名称' : ''}
      />
      {suggestions.length > 0 && (
        <SuggestionList>
          {suggestions.map((suggestion, index) => (
            <SuggestionItem
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              isHighlighted={index === highlightedIndex}
            >
              {suggestion}
            </SuggestionItem>
          ))}
        </SuggestionList>
      )}
    </InputWrapper>
  );
}
