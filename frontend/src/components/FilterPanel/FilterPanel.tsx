import React from 'react';
import styled from 'styled-components';
import { X, Calendar, MapPin, Stethoscope, Tag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { XRayAPI } from '../../services/api';
import { SearchFilters } from '../../types';
import { theme } from '../../styles/theme';

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  visible: boolean;
  onClose: () => void;
}

const Panel = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 80px; /* Below header */
  right: 0;
  width: 320px;
  height: calc(100vh - 80px);
  background: ${theme.colors.background};
  transform: translateX(${props => props.$visible ? '0' : '100%'});
  transition: transform 0.3s ease;
  z-index: ${theme.zIndex.modal};
  overflow-y: auto;
  border-left: 1px solid ${theme.colors.border};
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  
  @media (max-width: ${theme.breakpoints.lg}) {
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100vh;
    transform: translateY(${props => props.$visible ? '0' : '100%'});
    padding-top: 80px;
    border-left: none;
    box-shadow: none;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  
  @media (min-width: ${theme.breakpoints.lg}) {
    border-bottom: none;
  }
`;

const PanelTitle = styled.h3`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.text.primary};
`;

const CloseButton = styled.button`
  color: ${theme.colors.text.secondary};
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.base};
  
  &:hover {
    background: ${theme.colors.gray[100]};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    display: none;
  }
`;

const PanelContent = styled.div`
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.text.primary};
  
  svg {
    width: 16px;
    height: 16px;
    color: ${theme.colors.primary[500]};
  }
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.background};
  font-size: ${theme.fontSizes.sm};
  
  &:focus {
    border-color: ${theme.colors.primary[400]};
    outline: none;
    box-shadow: 0 0 0 2px ${theme.colors.primary[100]};
  }
`;

const FilterInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.background};
  font-size: ${theme.fontSizes.sm};
  
  &:focus {
    border-color: ${theme.colors.primary[400]};
    outline: none;
    box-shadow: 0 0 0 2px ${theme.colors.primary[100]};
  }
`;

const DateRange = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const DateInput = styled(FilterInput)`
  width: 100%;
  font-size: ${theme.fontSizes.xs};
`;

const DateLabel = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`;

const ClearButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.gray[100]};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.sm};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.gray[200]};
  }
`;

const Backdrop = styled.div<{ $visible: boolean }>`
  display: none;
  
  @media (max-width: ${theme.breakpoints.lg}) {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: ${props => props.$visible ? 1 : 0};
    visibility: ${props => props.$visible ? 'visible' : 'hidden'};
    transition: opacity 0.3s ease, visibility 0.3s ease;
    z-index: ${theme.zIndex.modal - 1};
  }
`;

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  onChange, 
  visible, 
  onClose 
}) => {
  // Fetch dropdown data
  const { data: dropdownData } = useQuery({
    queryKey: ['dropdown-data'],
    queryFn: XRayAPI.getDropdownData,
  });

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onChange({
      search: '',
      body_part: '',
      diagnosis: '',
      institution: '',
      date_from: '',
      date_to: '',
      tags: '',
    });
  };

  return (
    <>
      <Backdrop $visible={visible} onClick={onClose} />
      <Panel $visible={visible}>
        <PanelHeader>
          <PanelTitle>Filters</PanelTitle>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </PanelHeader>
        
        <PanelContent>
          <FilterGroup>
            <FilterLabel>
              <Stethoscope />
              Body Part
            </FilterLabel>
            <FilterSelect
              value={filters.body_part || ''}
              onChange={(e) => handleFilterChange('body_part', e.target.value)}
            >
              <option value="">All Body Parts</option>
              {dropdownData?.body_parts?.map((bodyPart) => (
                <option key={bodyPart} value={bodyPart}>
                  {bodyPart}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>
              <Stethoscope />
              Diagnosis
            </FilterLabel>
            <FilterSelect
              value={filters.diagnosis || ''}
              onChange={(e) => handleFilterChange('diagnosis', e.target.value)}
            >
              <option value="">All Diagnoses</option>
              {dropdownData?.diagnoses?.map((diagnosis) => (
                <option key={diagnosis} value={diagnosis}>
                  {diagnosis}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>
              <MapPin />
              Institution
            </FilterLabel>
            <FilterSelect
              value={filters.institution || ''}
              onChange={(e) => handleFilterChange('institution', e.target.value)}
            >
              <option value="">All Institutions</option>
              {dropdownData?.institutions?.map((institution) => (
                <option key={institution} value={institution}>
                  {institution}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>
              <Calendar />
              Scan Date Range
            </FilterLabel>
            <DateRange>
              <DateLabel>From:</DateLabel>
              <DateInput
                type="date"
                placeholder="From"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
              <DateLabel>To:</DateLabel>
              <DateInput
                type="date"
                placeholder="To"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </DateRange>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>
              <Tag />
              Tags
            </FilterLabel>
            <FilterInput
              type="text"
              placeholder="Enter tags (comma-separated)"
              value={filters.tags || ''}
              onChange={(e) => handleFilterChange('tags', e.target.value)}
            />
          </FilterGroup>

          <ClearButton onClick={clearAllFilters}>
            Clear All Filters
          </ClearButton>
        </PanelContent>
      </Panel>
      <Backdrop $visible={visible} onClick={onClose} />
    </>
  );
};

export default FilterPanel; 