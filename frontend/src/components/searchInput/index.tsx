import styled from 'styled-components';

const StyledInput = styled.input`
  height: 40px;
  background: #fff;
  border-color: #64666b;
  border-radius: 0.25rem;
  transition: 0.3s ease;
  font-family: Open Sans;
  font-weight: 400;
  font-size: 16px;
  line-height: 16px;
  &:focus {
    box-shadow: none;
    border-color: #0f8e4c;
    border-width: 2px;
    outline: none;
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
  return <StyledInput id={id} placeholder={placeholder} onChange={onChange} />;
};

export default SearchInput;
