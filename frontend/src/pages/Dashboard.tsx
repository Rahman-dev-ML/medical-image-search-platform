import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { Search, Activity, Database, Clock, ArrowRight } from 'lucide-react';
import { XRayAPI } from '../services/api';
import { theme } from '../styles/theme';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const WelcomeSection = styled.section`
  text-align: center;
  padding: ${theme.spacing.xl} 0;
`;

const Title = styled.h1`
  font-size: ${theme.fontSizes['4xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.fontSizes['3xl']};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.fontSizes['2xl']};
  }
`;

const Subtitle = styled.p`
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xl};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.fontSizes.base};
    padding: 0 ${theme.spacing.md};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.fontSizes.sm};
  }
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  background: ${theme.colors.primary[600]};
  color: white;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.fontWeights.medium};
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.base};
  
  &:hover {
    background: ${theme.colors.primary[700]};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.lg};
  }
`;

const StatCard = styled.div`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.base};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
    border-color: ${theme.colors.primary[200]};
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.lg};
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const StatValue = styled.div`
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.text.primary};
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.fontWeights.medium};
  margin-top: ${theme.spacing.xs};
`;

const StatDescription = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  line-height: 1.4;
`;

const QuickActions = styled.section`
  margin-top: ${theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
`;

const ActionCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.base};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
    border-color: ${theme.colors.primary[300]};
    
    h3 {
      color: ${theme.colors.primary[600]};
    }
  }
`;

const ActionContent = styled.div`
  flex: 1;
`;

const ActionTitle = styled.h3`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  transition: color 0.2s ease;
`;

const ActionDescription = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  line-height: 1.4;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
  min-height: 200px;
`;

const Dashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: XRayAPI.getStats,
  });

  if (isLoading) {
    return (
      <LoadingContainer>
        <div>Loading dashboard statistics...</div>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <LoadingContainer>
        <div>Unable to load statistics. Please check your connection.</div>
      </LoadingContainer>
    );
  }

  return (
    <DashboardContainer>
      <WelcomeSection>
        <Title>Medical Image Search Platform</Title>
        <Subtitle>
          Search and manage X-ray scans with advanced filtering, AI-powered search,
          and comprehensive metadata analysis for medical research and diagnostics.
        </Subtitle>
        <CTAButton to="/browse">
          <Activity />
          Browse X-ray Database
          <ArrowRight />
        </CTAButton>
      </WelcomeSection>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatIcon $color={theme.colors.primary[600]}>
              <Database />
            </StatIcon>
            <div>
              <StatValue>{stats?.total_scans || 0}</StatValue>
              <StatLabel>Total X-ray Scans</StatLabel>
            </div>
          </StatHeader>
          <StatDescription>
            Complete medical imaging database with metadata
          </StatDescription>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon $color={theme.colors.success[600]}>
              <Activity />
            </StatIcon>
            <div>
              <StatValue>{Object.keys(stats?.body_part_distribution || {}).length}</StatValue>
              <StatLabel>Body Parts Covered</StatLabel>
            </div>
          </StatHeader>
          <StatDescription>
            Comprehensive coverage across medical specialties
          </StatDescription>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon $color={theme.colors.critical[600]}>
              <Clock />
            </StatIcon>
            <div>
              <StatValue>{stats?.recent_scans_30_days || 0}</StatValue>
              <StatLabel>Recent Scans (30 days)</StatLabel>
            </div>
          </StatHeader>
          <StatDescription>
            Newly added scans in the last month
          </StatDescription>
        </StatCard>
      </StatsGrid>

      <QuickActions>
        <SectionTitle>Quick Actions</SectionTitle>
        <ActionGrid>
          <ActionCard to="/search">
            <StatIcon $color={theme.colors.primary[600]}>
              <Search />
            </StatIcon>
            <ActionContent>
              <ActionTitle>Advanced Search</ActionTitle>
              <ActionDescription>
                Search across all X-ray scans with powerful filters and AI-powered matching
              </ActionDescription>
            </ActionContent>
            <ArrowRight color={theme.colors.text.secondary} size={20} />
          </ActionCard>

          <ActionCard to="/browse">
            <StatIcon $color={theme.colors.success[600]}>
              <Activity />
            </StatIcon>
            <ActionContent>
              <ActionTitle>Browse by Body Part</ActionTitle>
              <ActionDescription>
                Explore X-rays organized by anatomical regions and medical specialties
              </ActionDescription>
            </ActionContent>
            <ArrowRight color={theme.colors.text.secondary} size={20} />
          </ActionCard>
        </ActionGrid>
      </QuickActions>
    </DashboardContainer>
  );
};

export default Dashboard; 