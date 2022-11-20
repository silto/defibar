import React from 'react';
import styled from 'styled-components';
import { RobotoSlab } from '@/lib/fonts';

const StyledInput = styled.input`
  width: 100%;
  height: 100%;
  padding: 0 16px;
  background: ${({ theme }) => theme.background};
  outline: 1px solid;
  outline-color: ${({ theme }) => theme.textDefault};
  border-radius: 0.25rem;
  border: none;
  /* transition: 0.3s ease; */
  /* font-family: 'Roboto-Slab'; */
  font-weight: 400;
  font-size: 18px;
  line-height: 18px;
  color: ${({ theme }) => theme.textDefault};
  &:focus {
    box-shadow: none;
    outline-color: ${({ theme }) => theme.gold};
    outline-width: 2px;
    & + label {
      color: #0f8e4c;
    }
  }
`;

type SearchInputProps = {
  id?: string;
  placeholder?: string;
  name?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const interceptArrows = (e: React.KeyboardEvent<HTMLDivElement>): void => {
  switch (e.key) {
    case 'ArrowUp':
    case 'ArrowDown':
      e.preventDefault();
      break;
  }
};

const SearchInput = (
  { id, placeholder, value, name, onChange }: SearchInputProps,
  ref: React.ForwardedRef<HTMLInputElement>,
) => {
  return (
    <StyledInput
      id={id}
      type="text"
      placeholder={placeholder}
      onChange={onChange}
      onKeyDown={interceptArrows}
      ref={ref}
      name={name}
      value={value || ''}
      spellCheck="false"
      autoComplete="off"
      tabIndex={1}
      className={RobotoSlab.className}
    />
  );
};

const SearchInputForward = React.forwardRef<HTMLInputElement, SearchInputProps>(SearchInput);

export default SearchInputForward;
