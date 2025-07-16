import React from 'react';
import styled from 'styled-components';
import { Search } from 'lucide-react';
import { theme } from '../../styles/theme';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.md} 48px;
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.fontSizes.base};
  background: ${theme.colors.background};
  transition: all 0.2s ease;
  
  &:focus {
    border-color: ${theme.colors.primary[400]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
    outline: none;
  }
  
  &::placeholder {
    color: ${theme.colors.text.disabled};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: 16px; /* Prevent zoom on iOS */
    padding: ${theme.spacing.sm} ${theme.spacing.sm} ${theme.spacing.sm} 40px;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.text.secondary};
  pointer-events: none;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    left: ${theme.spacing.sm};
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search..." 
}) => {
  return (
    <SearchContainer>
      <SearchIcon>
        <Search />
      </SearchIcon>
      <SearchInput
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </SearchContainer>
  );
};

export default SearchBar; 