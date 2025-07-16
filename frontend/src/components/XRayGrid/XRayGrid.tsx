import React from 'react';
import styled from 'styled-components';
import { Calendar, MapPin, User, Tag, Eye } from 'lucide-react';
import { XRayRecord } from '../../types';
import { theme } from '../../styles/theme';
import { format } from 'date-fns';

interface XRayGridProps {
  xrays: XRayRecord[];
  onItemClick?: (xray: XRayRecord) => void;
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
  margin-top: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: ${theme.spacing.md};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.sm};
  }
`;

const Card = styled.div`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.lg};
    border-color: ${theme.colors.primary[300]};
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background: ${theme.colors.gray[100]};
  overflow: hidden;
`;

const XRayImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.1) brightness(1.1);
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.gray[200]};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.sm};
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: ${theme.spacing.sm};
  right: ${theme.spacing.sm};
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.base};
  font-size: ${theme.fontSizes.xs};
  font-weight: ${theme.fontWeights.medium};
`;

const Content = styled.div`
  padding: ${theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
`;

const Diagnosis = styled.div`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const Description = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.sm};
  line-height: 1.5;
  margin-bottom: ${theme.spacing.md};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const MetadataItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.xs};
  
  svg {
    width: 14px;
    height: 14px;
    color: ${theme.colors.primary[500]};
  }
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
`;

const TagItem = styled.span`
  background: ${theme.colors.primary[50]};
  color: ${theme.colors.primary[700]};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.base};
  font-size: ${theme.fontSizes.xs};
  border: 1px solid ${theme.colors.primary[200]};
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: ${theme.spacing['3xl']};
  color: ${theme.colors.text.secondary};
`;

const EmptyTitle = styled.h3`
  font-size: ${theme.fontSizes.lg};
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text.primary};
`;

const EmptyDescription = styled.p`
  font-size: ${theme.fontSizes.sm};
`;

const XRayGrid: React.FC<XRayGridProps> = ({ xrays, onItemClick }) => {
  const handleCardClick = (xray: XRayRecord) => {
    if (onItemClick) {
      onItemClick(xray);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  if (xrays.length === 0) {
    return (
      <Grid>
        <EmptyState>
          <EmptyTitle>No X-ray scans found</EmptyTitle>
          <EmptyDescription>
            Try adjusting your search criteria or filters to find more results.
          </EmptyDescription>
        </EmptyState>
      </Grid>
    );
  }

  return (
    <Grid>
      {xrays.map((xray) => (
        <Card key={xray.id} onClick={() => handleCardClick(xray)}>
          <ImageContainer>
            {xray.image_url ? (
              <XRayImage 
                src={xray.image_url} 
                alt={`X-ray of ${xray.body_part} - ${xray.diagnosis}`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const placeholder = target.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : null}
            <ImagePlaceholder style={{ display: xray.image_url ? 'none' : 'flex' }}>
              X-ray Image Not Available
            </ImagePlaceholder>
            <ImageOverlay>
              <Eye size={12} />
            </ImageOverlay>
          </ImageContainer>
          
          <Content>
            <Header>
              <PatientInfo>
                <User />
                {xray.patient_id}
              </PatientInfo>
            </Header>
            
            <Diagnosis>{xray.diagnosis}</Diagnosis>
            <Description>{xray.description}</Description>
            
            <MetadataGrid>
              <MetadataItem>
                <Calendar />
                {formatDate(xray.scan_date)}
              </MetadataItem>
              <MetadataItem>
                <MapPin />
                {xray.institution}
              </MetadataItem>
            </MetadataGrid>
            
            {xray.tags && (
              <Tags>
                <MetadataItem>
                  <Tag />
                </MetadataItem>
                {(() => {
                  // Handle both string and array formats for tags
                  const tagArray: string[] = Array.isArray(xray.tags) 
                    ? xray.tags 
                    : (xray.tags as string).split(' ').filter((tag: string) => tag.trim());
                  
                  return (
                    <>
                      {tagArray.slice(0, 3).map((tag: string, index: number) => (
                        <TagItem key={index}>{tag}</TagItem>
                      ))}
                      {tagArray.length > 3 && (
                        <TagItem>+{tagArray.length - 3} more</TagItem>
                      )}
                    </>
                  );
                })()}
              </Tags>
            )}
          </Content>
        </Card>
      ))}
    </Grid>
  );
};

export default XRayGrid; 