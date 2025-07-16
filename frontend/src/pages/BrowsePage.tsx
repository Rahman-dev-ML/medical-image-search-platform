import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Stethoscope, 
  Users, 
  Calendar, 
  MapPin, 
  Search,
  ArrowRight,
  Eye
} from 'lucide-react';
import { XRayAPI } from '../services/api';
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
  max-width: 600px;
  margin: 0 auto;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${theme.spacing.md};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.sm};
  }
`;

const CategoryCard = styled.div`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.base};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.lg};
    border-color: ${theme.colors.primary[300]};
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.md};
`;

const CategoryTitle = styled.h3`
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const CategoryIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.primary[100]};
  color: ${theme.colors.primary[600]};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CategoryCount = styled.div`
  background: ${theme.colors.primary[600]};
  color: white;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
`;

const CategoryDescription = styled.p`
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.md};
  line-height: 1.5;
`;

const CategoryStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.critical[600]};
`;

const getBodyPartDescription = (bodyPart: string) => {
  const descriptions: Record<string, string> = {
  'Chest': 'Thoracic imaging including lungs, heart, and chest cavity for respiratory and cardiac conditions',
  'Knee': 'Joint imaging for orthopedic assessment of knee injuries, arthritis, and bone conditions',
  'Spine': 'Spinal column imaging for back pain, disc problems, and vertebral conditions',
  'Hip': 'Pelvic and hip joint imaging for fractures, arthritis, and joint replacement planning',
  'Shoulder': 'Shoulder joint and surrounding structures for rotator cuff and bone injuries',
  'Ankle': 'Ankle and foot imaging for fractures, sprains, and joint conditions',
  'Wrist': 'Wrist and hand imaging for fractures, carpal tunnel, and joint disorders',
  'Elbow': 'Elbow joint imaging for fractures, tennis elbow, and joint conditions',
  'Pelvis': 'Pelvic imaging for fractures, hip conditions, and reproductive health',
    'Abdomen': 'Abdominal imaging for digestive system, organ assessment, and internal conditions',
    'Kidney': 'Renal imaging for kidney function assessment, stones, and urological conditions'
  };
  
  return descriptions[bodyPart] || `Medical imaging for ${bodyPart.toLowerCase()} assessment and diagnostic analysis`;
};

const BrowsePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch statistics (much faster than all X-rays)
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['browse-stats'],
    queryFn: () => XRayAPI.getStats(),
  });

  // Fetch dynamic body parts from API
  const { data: dropdownData } = useQuery({
    queryKey: ['dropdown-data'],
    queryFn: XRayAPI.getDropdownData,
  });

  const handleCategoryClick = (bodyPart: string) => {
    navigate(`/search?body_part=${encodeURIComponent(bodyPart)}`);
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingState>Loading medical categories...</LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorState>Unable to load categories. Please try again.</ErrorState>
      </Container>
    );
  }

  // Get body part counts from stats API
  const bodyPartCounts = stats?.body_part_distribution || {};

  // Get all unique body parts from both API and stats
  const allBodyParts = new Set<string>();
  
  // Add body parts from API
  dropdownData?.body_parts?.forEach(bp => allBodyParts.add(bp));
  
  // Add body parts that have X-rays from stats
  Object.keys(bodyPartCounts).forEach(bp => allBodyParts.add(bp));
  
  const categories = Array.from(allBodyParts).map(bodyPart => ({
    name: bodyPart,
    description: getBodyPartDescription(bodyPart),
    count: bodyPartCounts[bodyPart] || 0
  })).sort((a, b) => b.count - a.count); // Sort by count descending

  return (
    <Container>
      <Header>
        <Title>Browse by Body Part</Title>
        <Subtitle>
          Explore our medical imaging database organized by anatomical categories. 
          Each category shows the total number of X-ray scans available for that body part.
          Click on any category to view all X-rays for that specific anatomical region.
        </Subtitle>
      </Header>

      <CategoriesGrid>
        {categories.map((category) => (
          <CategoryCard 
            key={category.name}
            onClick={() => handleCategoryClick(category.name)}
          >
            <CategoryHeader>
              <CategoryTitle>
                <CategoryIcon>
                  <Stethoscope size={24} />
                </CategoryIcon>
                {category.name}
              </CategoryTitle>
              <CategoryCount>{category.count}</CategoryCount>
            </CategoryHeader>
            
            <CategoryDescription>
              {category.description}
            </CategoryDescription>
            
            <CategoryStats>
              <StatItem>
                <Users size={14} />
                {category.count} scans
              </StatItem>
              <ArrowRight size={14} />
            </CategoryStats>
          </CategoryCard>
        ))}
      </CategoriesGrid>
    </Container>
  );
};

export default BrowsePage; 