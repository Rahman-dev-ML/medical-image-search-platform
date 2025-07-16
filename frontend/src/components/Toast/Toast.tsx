import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { theme } from '../../styles/theme';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div<{ $type: 'success' | 'error' | 'info'; $isClosing: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  background: ${props => {
    switch (props.$type) {
      case 'success': return theme.colors.success[50];
      case 'error': return theme.colors.critical[50];
      default: return theme.colors.primary[50];
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'success': return theme.colors.success[700];
      case 'error': return theme.colors.critical[700];
      default: return theme.colors.primary[700];
    }
  }};
  border: 1px solid ${props => {
    switch (props.$type) {
      case 'success': return theme.colors.success[200];
      case 'error': return theme.colors.critical[200];
      default: return theme.colors.primary[200];
    }
  }};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  box-shadow: ${theme.shadows.lg};
  animation: ${props => props.$isClosing ? slideOut : slideIn} 0.3s ease;
  z-index: ${theme.zIndex.modal + 1};
  min-width: 300px;
  max-width: 400px;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const Message = styled.div`
  flex: 1;
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: ${theme.borderRadius.base};
  background: transparent;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`;

const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      default:
        return <CheckCircle size={20} />;
    }
  };

  return (
    <ToastContainer $type={type} $isClosing={isClosing}>
      <IconWrapper>
        {getIcon()}
      </IconWrapper>
      <Message>{message}</Message>
      <CloseButton onClick={handleClose}>
        <X size={16} />
      </CloseButton>
    </ToastContainer>
  );
};

export default Toast; 