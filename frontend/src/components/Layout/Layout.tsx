import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Activity, Search, BarChart3, Database, Upload, Shield } from 'lucide-react';
import { theme } from '../../styles/theme';

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: ${theme.colors.background};
  border-bottom: 1px solid ${theme.colors.border};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  box-shadow: ${theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: ${theme.zIndex.sticky};
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.sm} ${theme.spacing.md};
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: ${theme.breakpoints.lg}) {
    flex-direction: column;
    gap: ${theme.spacing.md};
    align-items: stretch;
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    gap: ${theme.spacing.sm};
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.primary[600]};
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.xl};
  text-decoration: none;
  
  &:hover {
    color: ${theme.colors.primary[700]};
  }
  
  @media (max-width: ${theme.breakpoints.lg}) {
    justify-content: center;
    margin-bottom: ${theme.spacing.sm};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.fontSizes.lg};
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    flex-wrap: wrap;
    justify-content: center;
    gap: ${theme.spacing.sm};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${theme.spacing.xs};
    width: 100%;
  }
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  color: ${props => props.$isActive ? theme.colors.primary[600] : theme.colors.text.secondary};
  background: ${props => props.$isActive ? theme.colors.primary[50] : 'transparent'};
  font-weight: ${props => props.$isActive ? theme.fontWeights.medium : theme.fontWeights.normal};
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${theme.colors.primary[600]};
    background: ${theme.colors.primary[50]};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
    justify-content: center;
    padding: ${theme.spacing.md};
    font-size: ${theme.fontSizes.sm};
  }
`;

const AdminLink = styled.a`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.primary[600]};
  background: ${theme.colors.primary[50]};
  font-weight: ${theme.fontWeights.medium};
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${theme.colors.primary[700]};
    background: ${theme.colors.primary[100]};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
    justify-content: center;
    padding: ${theme.spacing.md};
    font-size: ${theme.fontSizes.sm};
  }
`;

const Main = styled.main`
  flex: 1;
  padding: ${theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding-top: ${theme.spacing.xl};
  margin-top: 0;
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.lg} ${theme.spacing.md};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing.md} ${theme.spacing.sm};
  }
`;

const Footer = styled.footer`
  background: ${theme.colors.surface};
  border-top: 1px solid ${theme.colors.border};
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.sm};
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.md};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.fontSizes.xs};
  }
`;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <LayoutContainer>
      <Header>
        <HeaderContent>
          <Logo to="/">
            <Activity />
            Medical Image Search
          </Logo>
          
          <Navigation>
            <NavLink to="/" $isActive={isActive('/')}>
              <BarChart3 />
              Dashboard
            </NavLink>
            <NavLink to="/search" $isActive={isActive('/search')}>
              <Search />
              Search X-rays
            </NavLink>
            <NavLink to="/browse" $isActive={isActive('/browse')}>
              <Activity />
              Browse Categories
            </NavLink>
            <NavLink to="/database" $isActive={isActive('/database')}>
              <Database />
              Browse Database
            </NavLink>
            <NavLink to="/upload" $isActive={isActive('/upload')}>
              <Upload />
              Upload X-ray
            </NavLink>
            <AdminLink href="http://localhost:8000/admin/" target="_blank" rel="noopener noreferrer">
              <Shield />
              Admin Panel
            </AdminLink>
          </Navigation>
        </HeaderContent>
      </Header>
      
      <Main>
        {children}
      </Main>
      
      <Footer>
        <p>© 2024 Medical Image Search Platform. Built for medical professionals.</p>
      </Footer>
    </LayoutContainer>
  );
};

export default Layout; 