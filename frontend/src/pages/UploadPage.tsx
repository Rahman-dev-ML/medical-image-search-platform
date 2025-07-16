import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { 
  Upload, 
  Image as ImageIcon, 
  User, 
  Calendar, 
  MapPin, 
  Stethoscope, 
  FileText, 
  Tag,
  Save,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { XRayAPI } from '../services/api';
import { theme } from '../styles/theme';
import { useToast } from '../contexts/ToastContext';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const FormSection = styled.div`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const FormFieldFull = styled(FormField)`
  grid-column: 1 / -1;
`;

const Label = styled.label`
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.fontSizes.sm};
`;

const Input = styled.input`
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
  
  &:invalid {
    border-color: ${theme.colors.critical[500]};
  }
`;

const Select = styled.select`
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

const Textarea = styled.textarea`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.base};
  background: ${theme.colors.background};
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const FileUploadArea = styled.div<{ $isDragOver: boolean; $hasFile: boolean }>`
  border: 2px dashed ${props => props.$hasFile ? theme.colors.success[300] : theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  text-align: center;
  background: ${props => props.$isDragOver ? theme.colors.primary[50] : theme.colors.surface};
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: ${theme.colors.primary[300]};
    background: ${theme.colors.primary[50]};
  }
`;

const FileUploadContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const FileUploadIcon = styled.div<{ $hasFile: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: ${theme.borderRadius.lg};
  background: ${props => props.$hasFile ? theme.colors.success[100] : theme.colors.primary[100]};
  color: ${props => props.$hasFile ? theme.colors.success[600] : theme.colors.primary[600]};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FileUploadText = styled.div`
  color: ${theme.colors.text.primary};
  font-weight: ${theme.fontWeights.medium};
`;

const FileUploadSubtext = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.sm};
`;

const TagInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.background};
  min-height: 48px;
  align-items: center;
`;

const TagItem = styled.span`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.primary[100]};
  color: ${theme.colors.primary[700]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.sm};
`;

const TagRemoveButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary[600]};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  
  &:hover {
    color: ${theme.colors.primary[800]};
  }
`;

const TagInputField = styled.input`
  border: none;
  outline: none;
  background: transparent;
  flex: 1;
  min-width: 120px;
  font-size: ${theme.fontSizes.base};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.lg};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: 1px solid ${props => props.$variant === 'primary' ? theme.colors.primary[600] : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.$variant === 'primary' ? theme.colors.primary[600] : theme.colors.background};
  color: ${props => props.$variant === 'primary' ? 'white' : theme.colors.text.primary};
  font-weight: ${theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$variant === 'primary' ? theme.colors.primary[700] : theme.colors.surface};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.$type === 'success' ? theme.colors.success[50] : theme.colors.critical[50]};
  color: ${props => props.$type === 'success' ? theme.colors.success[700] : theme.colors.critical[700]};
  border: 1px solid ${props => props.$type === 'success' ? theme.colors.success[200] : theme.colors.critical[200]};
`;

// Body parts will be fetched from API

interface UploadFormData {
  patient_id: string;
  body_part: string;
  scan_date: string;
  institution: string;
  description: string;
  diagnosis: string;
  tags: string[];
  image: File | null;
}

const UploadPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Fetch body parts from API
  const { data: dropdownData } = useQuery({
    queryKey: ['dropdown-data'],
    queryFn: XRayAPI.getDropdownData,
  });
  
  const [formData, setFormData] = useState<UploadFormData>({
    patient_id: '',
    body_part: '',
    scan_date: '',
    institution: '',
    description: '',
    diagnosis: '',
    tags: [],
    image: null,
  });
  const [tagInput, setTagInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (data: FormData) => XRayAPI.createXRay(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xrays'] });
      setMessage({ type: 'success', text: 'X-ray uploaded successfully!' });
      // Reset form
      setFormData({
        patient_id: '',
        body_part: '',
        scan_date: '',
        institution: '',
        description: '',
        diagnosis: '',
        tags: [],
        image: null,
      });
    },
    onError: (error: any) => {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload X-ray' });
    },
  });

  const handleInputChange = (field: keyof UploadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    const submitData = new FormData();
    submitData.append('patient_id', formData.patient_id);
    submitData.append('body_part', formData.body_part);
    submitData.append('scan_date', formData.scan_date);
    submitData.append('institution', formData.institution);
    submitData.append('description', formData.description);
    submitData.append('diagnosis', formData.diagnosis);
    submitData.append('tags', JSON.stringify(formData.tags));
    submitData.append('image', formData.image);

    uploadMutation.mutate(submitData);
  };

  return (
    <Container>
      <Header>
        <Title>Upload X-ray Scan</Title>
        <Subtitle>
          Add new X-ray scans to the medical imaging database with comprehensive metadata 
          for AI model development and medical research.
        </Subtitle>
      </Header>

      {message && (
        <Message $type={message.type}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </Message>
      )}

      <Form onSubmit={handleSubmit}>
        <FormSection>
          <SectionTitle>
            <ImageIcon />
            X-ray Image
          </SectionTitle>
          
          <FileUploadArea
            $isDragOver={isDragOver}
            $hasFile={!!formData.image}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <FileUploadContent>
              <FileUploadIcon $hasFile={!!formData.image}>
                {formData.image ? <CheckCircle size={24} /> : <Upload size={24} />}
              </FileUploadIcon>
              <FileUploadText>
                {formData.image ? formData.image.name : 'Drop your X-ray image here or click to browse'}
              </FileUploadText>
              <FileUploadSubtext>
                Supports PNG, JPEG files up to 10MB
              </FileUploadSubtext>
            </FileUploadContent>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
          </FileUploadArea>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <User />
            Patient Information
          </SectionTitle>
          
          <FormGrid>
            <FormField>
              <Label>Patient ID</Label>
              <Input
                type="text"
                placeholder="P001211"
                pattern="P\d+"
                value={formData.patient_id}
                onChange={(e) => handleInputChange('patient_id', e.target.value)}
                required
              />
            </FormField>
            
            <FormField>
              <Label>Scan Date</Label>
              <Input
                type="date"
                value={formData.scan_date}
                onChange={(e) => handleInputChange('scan_date', e.target.value)}
                required
              />
            </FormField>
          </FormGrid>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <Stethoscope />
            Medical Information
          </SectionTitle>
          
          <FormGrid>
            <FormField>
              <Label>Body Part</Label>
              <Select
                value={formData.body_part}
                onChange={(e) => handleInputChange('body_part', e.target.value)}
                required
              >
                <option value="">Select body part</option>
                {dropdownData?.body_parts?.map(part => (
                  <option key={part} value={part}>{part}</option>
                )) || []}
              </Select>
            </FormField>
            
            <FormField>
              <Label>Institution</Label>
              <Input
                type="text"
                placeholder="Mayo Clinic"
                value={formData.institution}
                onChange={(e) => handleInputChange('institution', e.target.value)}
                required
              />
            </FormField>
            
            <FormField>
              <Label>Diagnosis</Label>
              <Input
                type="text"
                placeholder="Normal, Pneumonia, Fracture, etc."
                value={formData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                required
              />
            </FormField>
          </FormGrid>
          
          <FormFieldFull>
            <Label>Description</Label>
            <Textarea
              placeholder="Detailed description of the X-ray findings and medical observations..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
          </FormFieldFull>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <Tag />
            Tags
          </SectionTitle>
          
          <FormFieldFull>
            <Label>Medical Tags</Label>
            <TagInput>
              {formData.tags.map((tag, index) => (
                <TagItem key={index}>
                  {tag}
                  <TagRemoveButton type="button" onClick={() => handleRemoveTag(tag)}>
                    <X size={14} />
                  </TagRemoveButton>
                </TagItem>
              ))}
              <TagInputField
                type="text"
                placeholder="Add tags (lung, infection, opacity, etc.)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyPress}
                onBlur={handleAddTag}
              />
            </TagInput>
          </FormFieldFull>
        </FormSection>

        <ButtonContainer>
          <Button type="button" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" $variant="primary" disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? 'Uploading...' : (
              <>
                <Save size={16} />
                Upload X-ray
              </>
            )}
          </Button>
        </ButtonContainer>
      </Form>
    </Container>
  );
};

export default UploadPage; 