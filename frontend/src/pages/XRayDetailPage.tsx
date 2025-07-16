import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { ArrowLeft, Calendar, MapPin, User, Stethoscope, FileText, Tag, Download, ExternalLink, Eye } from 'lucide-react';
import { XRayAPI } from '../services/api';
import { theme } from '../styles/theme';
import { format } from 'date-fns';
import { useToast } from '../contexts/ToastContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  max-width: 100%;
  width: 100%;
  overflow-x: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.sm};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.primary[50]};
    border-color: ${theme.colors.primary[300]};
    color: ${theme.colors.primary[600]};
  }
`;

const Title = styled.h1`
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin: 0;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.fontSizes['2xl']};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.fontSizes.xl};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.xl};
  max-width: 100%;
  
  @media (min-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr 350px;
    gap: ${theme.spacing.lg};
  }
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  min-width: 0; /* Prevent flex overflow */
`;

const ImageContainer = styled.div`
  position: relative;
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
  width: 100%;
  max-width: 100%;
`;

const XRayImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: contain;
  display: block;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.gray[100]};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.lg};
`;

const ImageControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-top: 1px solid ${theme.colors.border};
`;

const ControlGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.sm};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.primary[50]};
    border-color: ${theme.colors.primary[300]};
    color: ${theme.colors.primary[600]};
  }
`;

const MetadataSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const MetadataCard = styled.div`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.base};
`;

const MetadataTitle = styled.h3`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const MetadataList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const MetadataItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
`;

const MetadataLabel = styled.div`
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.text.secondary};
  min-width: 100px;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const MetadataValue = styled.div`
  color: ${theme.colors.text.primary};
  flex: 1;
`;

const DiagnosisCard = styled(MetadataCard)`
  border-left: 4px solid ${theme.colors.critical[500]};
`;

const DiagnosisTitle = styled.h2`
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.critical[600]};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const Description = styled.p`
  color: ${theme.colors.text.primary};
  line-height: 1.6;
  margin: 0;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.xs};
`;

const TagItem = styled.span`
  background: ${theme.colors.primary[100]};
  color: ${theme.colors.primary[700]};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: ${theme.colors.text.secondary};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.secondary};
`;

const XRayDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: xray, isLoading, error } = useQuery({
    queryKey: ['xray', id],
    queryFn: () => XRayAPI.getXRayById(parseInt(id || '0')),
    enabled: !!id,
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const handleDownload = async () => {
    if (xray?.image_url) {
      try {
        // Fetch the image as a blob to force download
        const response = await fetch(xray.image_url);
        const blob = await response.blob();
        
        // Create a temporary URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `xray_${xray.patient_id}_${xray.body_part}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error('Download failed:', error);
        // Fallback to opening in new tab
        window.open(xray.image_url, '_blank');
      }
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!', 'success');
    } catch (err) {
      showToast('Unable to copy link. Please copy manually: ' + url, 'error', 5000);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <div>Loading X-ray details...</div>
        </LoadingContainer>
      </Container>
    );
  }

  if (error || !xray) {
    return (
      <Container>
        <ErrorContainer>
          <div>Unable to load X-ray details.</div>
          <BackButton onClick={() => navigate('/search')}>
            <ArrowLeft />
            Back to Search
          </BackButton>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/search')}>
          <ArrowLeft />
          Back to Search
        </BackButton>
        <Title>X-ray Details - {xray.patient_id}</Title>
      </Header>

      <ContentGrid>
        <ImageSection>
          <ImageContainer>
            {xray.image_url ? (
              <XRayImage 
                src={xray.image_url} 
                alt={`X-ray of ${xray.body_part} - ${xray.diagnosis}`}
              />
            ) : (
              <ImagePlaceholder>
                <div>
                  <Eye size={48} />
                  <div>X-ray Image Not Available</div>
                </div>
              </ImagePlaceholder>
            )}
            <ImageControls>
              <ControlGroup>
                <ControlButton onClick={handleDownload}>
                  <Download size={16} />
                  Download
                </ControlButton>
                <ControlButton onClick={handleShare}>
                  <ExternalLink size={16} />
                  Share Link
                </ControlButton>
              </ControlGroup>
              <div style={{ fontSize: theme.fontSizes.sm, color: theme.colors.text.secondary }}>
                Patient: {xray.patient_id}
              </div>
            </ImageControls>
          </ImageContainer>
        </ImageSection>

        <MetadataSection>
          <DiagnosisCard>
            <DiagnosisTitle>{xray.diagnosis}</DiagnosisTitle>
            <Description>{xray.description}</Description>
          </DiagnosisCard>

          <MetadataCard>
            <MetadataTitle>
              <User />
              Patient Information
            </MetadataTitle>
            <MetadataList>
              <MetadataItem>
                <MetadataLabel>
                  <User size={16} />
                  Patient ID:
                </MetadataLabel>
                <MetadataValue>{xray.patient_id}</MetadataValue>
              </MetadataItem>
              <MetadataItem>
                <MetadataLabel>
                  <Stethoscope size={16} />
                  Body Part:
                </MetadataLabel>
                <MetadataValue>{xray.body_part}</MetadataValue>
              </MetadataItem>
            </MetadataList>
          </MetadataCard>

          <MetadataCard>
            <MetadataTitle>
              <Calendar />
              Scan Information
            </MetadataTitle>
            <MetadataList>
              <MetadataItem>
                <MetadataLabel>
                  <Calendar size={16} />
                  Scan Date:
                </MetadataLabel>
                <MetadataValue>{formatDate(xray.scan_date)}</MetadataValue>
              </MetadataItem>
              <MetadataItem>
                <MetadataLabel>
                  <MapPin size={16} />
                  Institution:
                </MetadataLabel>
                <MetadataValue>{xray.institution}</MetadataValue>
              </MetadataItem>
              <MetadataItem>
                <MetadataLabel>
                  <Calendar size={16} />
                  Created:
                </MetadataLabel>
                <MetadataValue>{formatDate(xray.created_at)}</MetadataValue>
              </MetadataItem>
            </MetadataList>
          </MetadataCard>

          {xray.tags && xray.tags.length > 0 && (
            <MetadataCard>
              <MetadataTitle>
                <Tag />
                Tags
              </MetadataTitle>
              <TagList>
                {(() => {
                  // Handle both string and array formats for tags
                  const tagArray: string[] = Array.isArray(xray.tags) 
                    ? xray.tags 
                    : (xray.tags as string).split(' ').filter((tag: string) => tag.trim());
                  
                  return tagArray.map((tag: string, index: number) => (
                    <TagItem key={index}>{tag}</TagItem>
                  ));
                })()}
              </TagList>
            </MetadataCard>
          )}
        </MetadataSection>
      </ContentGrid>
    </Container>
  );
};

export default XRayDetailPage; 