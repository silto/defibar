import styled from 'styled-components';

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
  font-family: 'Roboto-Slab';
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

const SearchInput = ({
  id,
  placeholder,
  onChange,
}: {
  id?: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return <StyledInput id={id} placeholder={placeholder} onChange={onChange} spellCheck="false" />;
};

export default SearchInput;
