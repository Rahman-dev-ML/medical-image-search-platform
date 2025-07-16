import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Search, Filter, X, Calendar, MapPin, Stethoscope, FileText, Zap, Clock } from 'lucide-react';
import { XRayAPI } from '../services/api';
import { SearchFilters, XRayRecord } from '../types';
import { theme } from '../styles/theme';
import XRayGrid from '../components/XRayGrid/XRayGrid';
import SearchBar from '../components/SearchBar/SearchBar';
import FilterPanel from '../components/FilterPanel/FilterPanel';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  max-width: 100%;
  padding-right: 0;
  transition: padding-right 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.fontSizes['2xl']};
    flex-direction: column;
    text-align: center;
    gap: ${theme.spacing.sm};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.fontSizes.xl};
  }
`;

const ElasticsearchBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.base};
  font-size: ${theme.fontSizes.xs};
  font-weight: ${theme.fontWeights.medium};
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const SearchSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  width: 100%;
`;

const SearchContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 100%;
`;

const ResultsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

const ResultsCount = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.sm};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const PerformanceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.xs};
  background: ${theme.colors.background};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.base};
  border: 1px solid ${theme.colors.border};
`;

const FilterToggle = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${props => props.$active ? theme.colors.primary[600] : theme.colors.background};
  color: ${props => props.$active ? 'white' : theme.colors.text.primary};
  border: 1px solid ${props => props.$active ? theme.colors.primary[600] : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.$active ? theme.colors.primary[700] : theme.colors.primary[50]};
    border-color: ${theme.colors.primary[600]};
    color: ${props => props.$active ? 'white' : theme.colors.primary[600]};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    font-size: ${theme.fontSizes.sm};
    width: 100%;
    justify-content: center;
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

const FilterTag = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  background: ${theme.colors.primary[50]};
  color: ${theme.colors.primary[700]};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.base};
  font-size: ${theme.fontSizes.xs};
  border: 1px solid ${theme.colors.primary[200]};
`;

const FilterRemove = styled.button`
  color: ${theme.colors.primary[500]};
  padding: 2px;
  border-radius: ${theme.borderRadius.sm};
  
  &:hover {
    background: ${theme.colors.primary[100]};
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing['2xl']};
  color: ${theme.colors.text.secondary};
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing['2xl']};
  color: ${theme.colors.critical[600]};
  text-align: center;
`;

const SearchExample = styled.div`
  background: ${theme.colors.primary[50]};
  border: 1px solid ${theme.colors.primary[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const ExampleTitle = styled.h4`
  color: ${theme.colors.primary[700]};
  margin-bottom: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.sm};
`;

const ExampleQueries = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
`;

const ExampleQuery = styled.button`
  background: ${theme.colors.primary[100]};
  color: ${theme.colors.primary[700]};
  border: 1px solid ${theme.colors.primary[300]};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSizes.xs};
  cursor: pointer;
  
  &:hover {
    background: ${theme.colors.primary[200]};
  }
`;

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [useElasticsearch, setUseElasticsearch] = useState(true);
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>({
    search: searchParams.get('search') || '',
    body_part: searchParams.get('body_part') || '',
    diagnosis: searchParams.get('diagnosis') || '',
    institution: searchParams.get('institution') || '',
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || '',
    tags: searchParams.get('tags') || '',
  });

  // Use Elasticsearch when there's a search query, otherwise use regular API
  const { data: elasticsearchData, isLoading: esLoading, error: esError } = useQuery({
    queryKey: ['elasticsearch', filters.search],
    queryFn: () => XRayAPI.elasticsearchSearch(filters),
    enabled: !!filters.search && useElasticsearch,
  });

  // Fallback to regular API
  const { data: regularData, isLoading: regularLoading, error: regularError, refetch } = useQuery({
    queryKey: ['xrays', filters],
    queryFn: () => XRayAPI.getXRays(filters),
    enabled: !filters.search || !useElasticsearch,
  });

  const isLoading = useElasticsearch && filters.search ? esLoading : regularLoading;
  const error = useElasticsearch && filters.search ? esError : regularError;
  const data = useElasticsearch && filters.search ? elasticsearchData : regularData;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleRemoveFilter = (filterKey: keyof SearchFilters) => {
    setFilters(prev => ({ ...prev, [filterKey]: '' }));
  };

  const handleExampleQuery = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  };

  const getActiveFilters = () => {
    const active: Array<{ key: keyof SearchFilters; label: string; value: string }> = [];
    
    if (filters.search) active.push({ key: 'search', label: 'Search', value: filters.search });
    if (filters.body_part) active.push({ key: 'body_part', label: 'Body Part', value: filters.body_part });
    if (filters.diagnosis) active.push({ key: 'diagnosis', label: 'Diagnosis', value: filters.diagnosis });
    if (filters.institution) active.push({ key: 'institution', label: 'Institution', value: filters.institution });
    if (filters.date_from) active.push({ key: 'date_from', label: 'From Date', value: filters.date_from });
    if (filters.date_to) active.push({ key: 'date_to', label: 'To Date', value: filters.date_to });
    if (filters.tags) active.push({ key: 'tags', label: 'Tags', value: filters.tags });
    
    return active;
  };

  if (error) {
    return (
      <ErrorContainer>
        <div>
          <h3>Unable to load X-ray data</h3>
          <p>Please make sure the backend server is running at http://127.0.0.1:8000</p>
          <button onClick={() => refetch()}>Try Again</button>
        </div>
      </ErrorContainer>
    );
  }

  const resultCount = elasticsearchData?.total_hits || (data && 'count' in data ? data.count : 0);
  const searchTime = elasticsearchData?.took;
  const results = elasticsearchData?.results || (data && 'results' in data ? data.results : []);

  return (
    <Container>
      <Header>
        <Title>
          X-ray Search
          <ElasticsearchBadge>
            <Zap />
            Powered by Elasticsearch
          </ElasticsearchBadge>
        </Title>
        
        <SearchSection>
          {!filters.search && (
            <SearchExample>
              <ExampleTitle>Try these searches:</ExampleTitle>
              <ExampleQueries>
                <ExampleQuery onClick={() => handleExampleQuery('chest')}>chest</ExampleQuery>
                <ExampleQuery onClick={() => handleExampleQuery('pneumonia')}>pneumonia</ExampleQuery>
                <ExampleQuery onClick={() => handleExampleQuery('P00001')}>P00001</ExampleQuery>
                <ExampleQuery onClick={() => handleExampleQuery('tuberculosis')}>tuberculosis</ExampleQuery>
                <ExampleQuery onClick={() => handleExampleQuery('fracture')}>fracture</ExampleQuery>
                <ExampleQuery onClick={() => handleExampleQuery('normal')}>normal</ExampleQuery>
              </ExampleQueries>
            </SearchExample>
          )}
          
          <SearchContent>
            <SearchBar
              value={filters.search || ''}
              onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
              placeholder="Search by diagnosis, description, patient ID, tags, or body part..."
            />
            
            {getActiveFilters().length > 0 && (
              <ActiveFilters>
                {getActiveFilters().map(filter => (
                  <FilterTag key={filter.key}>
                    {filter.label}: {filter.value}
                    <FilterRemove onClick={() => handleRemoveFilter(filter.key)}>
                      <X />
                    </FilterRemove>
                  </FilterTag>
                ))}
              </ActiveFilters>
            )}
          </SearchContent>
          
          <FilterToggle onClick={() => setShowFilters(!showFilters)} $active={showFilters}>
            <Filter />
            Filters
          </FilterToggle>
        </SearchSection>
      </Header>

      <SearchSection>
        <SearchContent>
          <ResultsSection>
            <ResultsHeader>
              <ResultsCount>
                {isLoading ? 'Searching...' : `${resultCount} X-ray scans found`}
                {searchTime && (
                  <PerformanceInfo>
                    <Clock />
                    {searchTime}ms
                  </PerformanceInfo>
                )}
              </ResultsCount>
            </ResultsHeader>
            
            {isLoading ? (
              <LoadingContainer>
                <div>Searching X-ray database with Elasticsearch...</div>
              </LoadingContainer>
            ) : (
              <XRayGrid 
                xrays={results} 
                onItemClick={(xray) => navigate(`/xray/${xray.id}`)}
              />
            )}
          </ResultsSection>
        </SearchContent>
      </SearchSection>
      
      <FilterPanel
        filters={filters}
        onChange={handleFiltersChange}
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </Container>
  );
};

export default SearchPage; 