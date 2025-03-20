import React from 'react';
import styled from 'styled-components';


export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: ${props => props.maxWidth || '500px'};
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  color: ${props => props.color || '#2c3e50'};
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  
  &:hover {
    color: #34495e;
  }
`;

export const ModalText = styled.p`
  color: #34495e;
  margin-bottom: 1.5rem;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

export const Button = styled.button`
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const CancelButton = styled(Button)`
  background-color: #e0e0e0;
  color: #333;
  
  &:hover:not(:disabled) {
    background-color: #d0d0d0;
  }
`;

export const ConfirmButton = styled(Button)`
  background-color: ${props => props.color || '#3498db'};
  color: white;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.hoverColor || '#2980b9'};
  }
`;

export const DeleteButton = styled(ConfirmButton)`
  background-color: #e74c3c;
  
  &:hover:not(:disabled) {
    background-color: #c0392b;
  }
`;

export const Spinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;


export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar eliminacion", 
  message = "Estas s eguro que quieres borrar el record?.",
  confirmText = "Borrar",
  cancelText = "Cancel",
  isLoading = false
}) => {
  if (!isOpen) return null;
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()} maxWidth="400px">
        <ModalHeader>
          <ModalTitle color="#e74c3c">{title}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <ModalText>{message}</ModalText>
        
        <ButtonGroup>
          <CancelButton onClick={onClose} disabled={isLoading}>
            {cancelText}
          </CancelButton>
          <DeleteButton onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner /> {confirmText === "Borrar" ? "Borrando..." : "Procesando..."}
              </>
            ) : (
              confirmText
            )}
          </DeleteButton>
        </ButtonGroup>
      </ModalContainer>
    </ModalOverlay>
  );
};