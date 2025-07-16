import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Search, 
  User, 
  Stethoscope, 
  Shield,
  ExternalLink,
  Eye,
  Edit2,
  Settings
} from 'lucide-react';
import { XRayAPI } from '../services/api';
import { XRayRecord } from '../types';
import { theme } from '../styles/theme';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
`;

const Subtitle = styled.p`
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto;
`;

const AdminGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${theme.spacing.xl};
`;

const AdminCard = styled.div`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.lg};
  
  &:hover {
    box-shadow: ${theme.shadows.xl};
    transform: translateY(-2px);
  }
  
  transition: all 0.3s ease;
`;

const CardTitle = styled.h3`
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
`;

const CardIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;
  margin-bottom: ${theme.spacing.md};
  
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary[600]};
          color: white;
          &:hover {
            background: ${theme.colors.primary[700]};
          }
        `;
      case 'danger':
        return `
          background: ${theme.colors.critical[600]};
          color: white;
          &:hover {
            background: ${theme.colors.critical[700]};
          }
        `;
      default:
        return `
          background: ${theme.colors.surface};
          color: ${theme.colors.text.primary};
          border: 1px solid ${theme.colors.border};
          &:hover {
            background: ${theme.colors.primary[50]};
            border-color: ${theme.colors.primary[300]};
          }
        `;
    }
  }}
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const XRayList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.lg};
`;

const XRayItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${theme.colors.surface};
  }
`;

const XRayInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const XRayThumbnail = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border};
`;

const XRayDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const PatientId = styled.div`
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.text.primary};
  font-family: ${theme.fonts.mono};
`;

const XRayMeta = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
`;

const SmallButton = styled.button<{ $variant?: 'view' | 'delete' }>`
  padding: ${theme.spacing.xs};
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$variant === 'delete' ? `
    background: ${theme.colors.critical[100]};
    color: ${theme.colors.critical[600]};
    &:hover {
      background: ${theme.colors.critical[200]};
    }
  ` : `
    background: ${theme.colors.primary[100]};
    color: ${theme.colors.primary[600]};
    &:hover {
      background: ${theme.colors.primary[200]};
    }
  `}
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.fontSizes.base};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const StatsCard = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[700]} 100%);
  color: white;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  margin-bottom: ${theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${theme.fontSizes.sm};
  opacity: 0.9;
`;

const AdminDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch X-ray data
  const { data: xrays, isLoading } = useQuery({
    queryKey: ['admin-xrays', searchTerm],
    queryFn: () => XRayAPI.getXRays({ search: searchTerm }),
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => XRayAPI.getStats(),
  });

  // Delete X-ray mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => XRayAPI.deleteXRay(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-xrays'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const handleDeleteXRay = (id: number, patientId: string) => {
    if (window.confirm(`Are you sure you want to delete X-ray for patient ${patientId}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewXRay = (id: number) => {
    window.open(`/xray/${id}`, '_blank');
  };

  return (
    <Container>
      <Header>
        <Title>
          <Shield size={32} />
          Admin Control Panel
        </Title>
        <Subtitle>
          Simple administration panel for managing X-ray scans, body parts, and user access.
        </Subtitle>
      </Header>

      <StatsCard>
        <StatValue>{stats?.total_scans || 0}</StatValue>
        <StatLabel>Total X-ray Scans in Database</StatLabel>
      </StatsCard>

      <AdminGrid>
        {/* X-ray Management */}
        <AdminCard>
          <CardTitle>
            <CardIcon $color={theme.colors.primary[600]}>
              <Stethoscope size={20} />
            </CardIcon>
            X-ray Management
          </CardTitle>
          
          <ActionButton 
            $variant="primary" 
            onClick={() => window.open('/upload', '_blank')}
          >
            <Plus size={16} />
            Add New X-ray
          </ActionButton>
          
          <ActionButton onClick={() => window.open('/database', '_blank')}>
            <Eye size={16} />
            View All X-rays
          </ActionButton>
          
          <SearchInput
            type="text"
            placeholder="Search X-rays to manage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <XRayList>
            {isLoading ? (
              <div style={{ padding: theme.spacing.md, textAlign: 'center' }}>
                Loading X-rays...
              </div>
            ) : (
              xrays?.results?.slice(0, 5).map((xray) => (
                <XRayItem key={xray.id}>
                  <XRayInfo>
                    {xray.image_url ? (
                      <XRayThumbnail src={xray.image_url} alt={`X-ray ${xray.patient_id}`} />
                    ) : (
                      <div style={{ width: 50, height: 50, background: theme.colors.surface, borderRadius: theme.borderRadius.md }} />
                    )}
                    <XRayDetails>
                      <PatientId>{xray.patient_id}</PatientId>
                      <XRayMeta>{xray.body_part} - {xray.diagnosis}</XRayMeta>
                    </XRayDetails>
                  </XRayInfo>
                  <ActionButtons>
                    <SmallButton onClick={() => handleViewXRay(xray.id)}>
                      <Eye size={14} />
                    </SmallButton>
                    <SmallButton 
                      $variant="delete" 
                      onClick={() => handleDeleteXRay(xray.id, xray.patient_id)}
                    >
                      <Trash2 size={14} />
                    </SmallButton>
                  </ActionButtons>
                </XRayItem>
              ))
            )}
          </XRayList>
        </AdminCard>

        {/* Body Part Management */}
        <AdminCard>
          <CardTitle>
            <CardIcon $color={theme.colors.success[600]}>
              <User size={20} />
            </CardIcon>
            Body Part Categories
          </CardTitle>
          
          <ActionButton 
            $variant="primary"
            onClick={() => window.open('http://127.0.0.1:8000/admin/xray_search/bodypart/add/', '_blank')}
          >
            <Plus size={16} />
            Add New Body Part
          </ActionButton>
          
          <ActionButton onClick={() => window.open('http://127.0.0.1:8000/admin/xray_search/bodypart/', '_blank')}>
            <Eye size={16} />
            Manage Body Parts
          </ActionButton>
          
          <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.text.secondary, margin: 0 }}>
            Current body parts: {Object.keys(stats?.body_part_distribution || {}).join(', ')}
          </p>
        </AdminCard>

        {/* User Management */}
        <AdminCard>
          <CardTitle>
            <CardIcon $color={theme.colors.warning[600]}>
              <Shield size={20} />
            </CardIcon>
            Admin Users
          </CardTitle>
          
          <ActionButton 
            $variant="primary"
            onClick={() => window.open('http://127.0.0.1:8000/admin/auth/user/add/', '_blank')}
          >
            <Plus size={16} />
            Add New Admin
          </ActionButton>
          
          <ActionButton onClick={() => window.open('http://127.0.0.1:8000/admin/auth/user/', '_blank')}>
            <User size={16} />
            Manage Users
          </ActionButton>
          
          <ActionButton onClick={() => window.open('http://127.0.0.1:8000/admin/', '_blank')}>
            <Settings size={16} />
            Advanced Settings
            <ExternalLink size={14} />
          </ActionButton>
        </AdminCard>
      </AdminGrid>
    </Container>
  );
};

export default AdminDashboard; 