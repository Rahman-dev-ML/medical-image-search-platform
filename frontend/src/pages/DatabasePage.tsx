import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Database, 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  MapPin, 
  User,
  Stethoscope,
  FileText,
  Download,
  ExternalLink
} from 'lucide-react';
import { XRayAPI } from '../services/api';
import { SearchFilters } from '../types';
import { theme } from '../styles/theme';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
`;

const Subtitle = styled.p`
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.text.secondary};
  max-width: 800px;
  margin: 0 auto;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.lg}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.base};
  background: ${theme.colors.background};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  align-items: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.sm};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.base};
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.fontSizes.sm};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    /* Hide table on very small screens and use card layout instead */
    display: none;
  }
`;

const TableHeader = styled.thead`
  background: ${theme.colors.surface};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.border};
  
  &:hover {
    background: ${theme.colors.primary[50]};
  }
`;

const TableHeaderCell = styled.th`
  padding: ${theme.spacing.md};
  text-align: left;
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.text.primary};
  font-size: ${theme.fontSizes.sm};
`;

const TableCell = styled.td`
  padding: ${theme.spacing.md};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
`;

const PatientIdCell = styled(TableCell)`
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.primary[600]};
  font-family: ${theme.fonts.mono};
`;

const ImageCell = styled(TableCell)`
  width: 60px;
`;

const ImageThumbnail = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border};
`;

const ActionCell = styled(TableCell)`
  width: 100px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.primary[600]};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.xs};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.primary[700]};
  }
`;

const BadgeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
`;

const Badge = styled.span`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.primary[100]};
  color: ${theme.colors.primary[700]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.xs};
  font-weight: ${theme.fontWeights.medium};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

const MobileCardContainer = styled.div`
  display: none;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    display: block;
  }
`;

const MobileCard = styled.div`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  box-shadow: ${theme.shadows.base};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const CardImageThumbnail = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border};
`;

const CardInfo = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const CardSubtitle = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

const CardDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const CardDetail = styled.div`
  font-size: ${theme.fontSizes.sm};
`;

const CardDetailLabel = styled.span`
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.text.primary};
  display: block;
`;

const CardDetailValue = styled.span`
  color: ${theme.colors.text.secondary};
`;

const CardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${theme.spacing.md};
`;

const DatabasePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters] = useState<SearchFilters>({});

  // Fetch X-ray data
  const { data, isLoading, error } = useQuery({
    queryKey: ['database-xrays', searchTerm, filters],
    queryFn: () => XRayAPI.getXRays({ ...filters, search: searchTerm }),
  });

  const handleViewXRay = (id: number) => {
    navigate(`/xray/${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTags = (tags: string[] | string) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.slice(0, 3);
    // Handle string format from Elasticsearch
    return tags.split(' ').filter((tag: string) => tag.trim()).slice(0, 3);
  };

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Database Error</Title>
          <Subtitle>Unable to load X-ray database. Please check your connection.</Subtitle>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>X-ray Database Browser</Title>
        <Subtitle>
          Comprehensive view of all X-ray records in the medical imaging database.
          Search, filter, and manage X-ray scans with detailed metadata.
        </Subtitle>
      </Header>

      <Controls>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search by patient ID, diagnosis, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        
        <StatsContainer>
          <Database size={16} />
          {isLoading ? 'Loading...' : `${data?.count || 0} total records`}
        </StatsContainer>
      </Controls>

      {isLoading ? (
        <LoadingContainer>
          <div>Loading X-ray database...</div>
        </LoadingContainer>
      ) : (
        <>
          <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Image</TableHeaderCell>
              <TableHeaderCell>Patient ID</TableHeaderCell>
              <TableHeaderCell>Body Part</TableHeaderCell>
              <TableHeaderCell>Diagnosis</TableHeaderCell>
              <TableHeaderCell>Institution</TableHeaderCell>
              <TableHeaderCell>Scan Date</TableHeaderCell>
              <TableHeaderCell>Tags</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <tbody>
            {data?.results?.map((xray) => (
              <TableRow key={xray.id}>
                <ImageCell>
                  {xray.image_url ? (
                    <ImageThumbnail src={xray.image_url} alt={`X-ray ${xray.patient_id}`} />
                  ) : (
                    <div style={{ width: 40, height: 40, background: theme.colors.surface, borderRadius: theme.borderRadius.md }} />
                  )}
                </ImageCell>
                <PatientIdCell>{xray.patient_id}</PatientIdCell>
                <TableCell>{xray.body_part}</TableCell>
                <TableCell>{xray.diagnosis}</TableCell>
                <TableCell>{xray.institution}</TableCell>
                <TableCell>{formatDate(xray.scan_date)}</TableCell>
                <TableCell>
                  <BadgeContainer>
                    {formatTags(xray.tags || []).map((tag: string, index: number) => (
                      <Badge key={index}>{tag}</Badge>
                    ))}
                  </BadgeContainer>
                </TableCell>
                <ActionCell>
                  <ActionButton onClick={() => handleViewXRay(xray.id)}>
                    <Eye size={12} />
                    View
                  </ActionButton>
                </ActionCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
        
        <MobileCardContainer>
          {data?.results?.map((xray) => (
            <MobileCard key={xray.id}>
              <CardHeader>
                {xray.image_url ? (
                  <CardImageThumbnail src={xray.image_url} alt={`X-ray ${xray.patient_id}`} />
                ) : (
                  <div style={{ 
                    width: 60, 
                    height: 60, 
                    background: theme.colors.surface, 
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.border}`
                  }} />
                )}
                <CardInfo>
                  <CardTitle>{xray.patient_id}</CardTitle>
                  <CardSubtitle>{xray.body_part} • {xray.diagnosis}</CardSubtitle>
                </CardInfo>
              </CardHeader>
              
              <CardDetails>
                <CardDetail>
                  <CardDetailLabel>Institution</CardDetailLabel>
                  <CardDetailValue>{xray.institution}</CardDetailValue>
                </CardDetail>
                <CardDetail>
                  <CardDetailLabel>Date</CardDetailLabel>
                  <CardDetailValue>{formatDate(xray.scan_date)}</CardDetailValue>
                </CardDetail>
              </CardDetails>
              
              {formatTags(xray.tags || []).length > 0 && (
                <BadgeContainer style={{ marginBottom: theme.spacing.md }}>
                  {formatTags(xray.tags || []).map((tag: string, index: number) => (
                    <Badge key={index}>{tag}</Badge>
                  ))}
                </BadgeContainer>
              )}
              
              <CardActions>
                <ActionButton onClick={() => handleViewXRay(xray.id)}>
                  <Eye size={12} />
                  View
                </ActionButton>
              </CardActions>
            </MobileCard>
          ))}
        </MobileCardContainer>
        </>
      )}
    </Container>
  );
};

export default DatabasePage; 