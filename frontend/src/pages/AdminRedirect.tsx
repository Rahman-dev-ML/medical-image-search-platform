import React, { useEffect } from 'react';
import styled from 'styled-components';
import { ExternalLink, Shield, Settings, Database } from 'lucide-react';
import { theme } from '../styles/theme';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xl};
  min-height: 60vh;
  text-align: center;
`;

const Icon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.primary[100]};
  color: ${theme.colors.primary[600]};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
`;

const Description = styled.p`
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.text.secondary};
  max-width: 600px;
  line-height: 1.6;
`;

const AdminLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.primary[600]};
  color: white;
  text-decoration: none;
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.fontWeights.medium};
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.base};
  
  &:hover {
    background: ${theme.colors.primary[700]};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
  color: ${theme.colors.text.secondary};
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
  
  &:before {
    content: '✓';
    color: ${theme.colors.success[600]};
    font-weight: bold;
  }
`;

const AdminRedirect: React.FC = () => {
  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      window.open('http://127.0.0.1:8000/admin/', '_blank');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Container>
      <Icon>
        <Shield size={40} />
      </Icon>
      
      <div>
        <Title>Admin Panel Access</Title>
        <Description>
          You're being redirected to the Django Admin Panel where you can manage X-ray records, 
          user accounts, and system settings. If the redirect doesn't work automatically, 
          click the button below.
        </Description>
      </div>

      <AdminLink href="http://127.0.0.1:8000/admin/" target="_blank" rel="noopener noreferrer">
        <Settings size={20} />
        Open Admin Panel
        <ExternalLink size={16} />
      </AdminLink>

      <FeatureList>
        <FeatureItem>Add, edit, and delete X-ray records</FeatureItem>
        <FeatureItem>Manage user accounts and permissions</FeatureItem>
        <FeatureItem>Bulk import X-ray data</FeatureItem>
        <FeatureItem>System configuration and settings</FeatureItem>
        <FeatureItem>View detailed analytics and reports</FeatureItem>
      </FeatureList>
    </Container>
  );
};

export default AdminRedirect; 