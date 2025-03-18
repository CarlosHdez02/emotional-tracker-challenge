import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 1.5rem;
`;

const Card = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 0.5rem;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const DangerButton = styled(Button)`
  background-color: #e74c3c;
  
  &:hover {
    background-color: #c0392b;
  }
`;

const Message = styled.div`
  padding: 0.75rem;
  border-radius: 4px;
  margin: 1rem 0;
  background-color: ${props => props.type === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.type === 'success' ? '#155724' : '#721c24'};
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #2c3e50;
`;

// Modal components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #2c3e50;
`;

const ModalText = styled.p`
  margin-bottom: 1.5rem;
  color: #34495e;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const CancelButton = styled(Button)`
  background-color: #7f8c8d;
  
  &:hover {
    background-color: #636e72;
  }
`;

export default function Profile() {
  const { user, loading, updateProfile, updatePassword } = useContext(AuthContext);
  const router = useRouter();
  
  const [userData, setUserData] = useState({
    name: "",
    role: ""
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
 
  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || "",
        role: user.role || ""
      });
    }
  }, [user]);
  
  // Basic auth protection
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setMessage(null);
      
      await updateProfile(userData);
      
      setMessage({
        type: 'success',
        text: 'Perfil actualizado correctamente'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({
        type: 'error',
        text: 'Error al actualizar el perfil'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleResetPassword = async () => {
    setShowModal(false);
    
    try {
      setIsResetting(true);
      setPasswordMessage(null);
      
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordMessage({
        type: 'success',
        text: 'Contraseña actualizada correctamente'
      });
      
      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setPasswordMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error resetting password:', err);
      
      // Handle different error messages based on status code
      if (err.response && err.response.status === 401) {
        setPasswordMessage({
          type: 'error',
          text: 'La contraseña actual es incorrecta'
        });
      } else {
        setPasswordMessage({
          type: 'error',
          text: 'Error al actualizar la contraseña'
        });
      }
    } finally {
      setIsResetting(false);
    }
  };
  
  
  const openResetModal = (e) => {
    e.preventDefault();
    
    // Validate password inputs before showing confirmation modal
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'Las contraseñas no coinciden'
      });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({
        type: 'error',
        text: 'La contraseña debe tener al menos 8 caracteres'
      });
      return;
    }
    
    setShowModal(true);
  };
  
  if (loading || !user) {
    return (
      <Layout title="Perfil - Terapia Emocional">
        <p>Cargando...</p>
      </Layout>
    );
  }
  
  return (
    <Layout title="Mi Perfil - Terapia Emocional">
      <ProfileContainer>
        <Title>Mi Perfil</Title>
        
        {message && (
          <Message type={message.type}>{message.text}</Message>
        )}
        
        {/* Profile Information Card */}
        <Card>
          <SectionTitle>Información de Perfil</SectionTitle>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">Nombre</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={userData.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="role">Rol</Label>
              <Select
                id="role"
                name="role"
                value={userData.role}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un rol</option>
                <option value="user">Usuario</option>
                <option value="therapist">Terapeuta</option>
                <option value="admin">Administrador</option>
              </Select>
            </FormGroup>
            
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </Form>
        </Card>
        
        {/* Password Reset Card */}
        <Card>
          <SectionTitle>Cambiar Contraseña</SectionTitle>
          
          {passwordMessage && (
            <Message type={passwordMessage.type}>{passwordMessage.text}</Message>
          )}
          
          <Form onSubmit={openResetModal}>
            <FormGroup>
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <Input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Ingresa tu contraseña actual"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Ingresa tu nueva contraseña"
                required
                minLength={8}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirma tu nueva contraseña"
                required
                minLength={8}
              />
            </FormGroup>
            
            <DangerButton type="submit" disabled={isResetting}>
              {isResetting ? 'Actualizando...' : 'Cambiar Contraseña'}
            </DangerButton>
          </Form>
        </Card>
      </ProfileContainer>
      
      {/* Confirmation Modal */}
      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Confirmar cambio de contraseña</ModalTitle>
            <ModalText>
              ¿Estás seguro que deseas cambiar tu contraseña? Esta acción cerrará todas tus sesiones activas y necesitarás iniciar sesión nuevamente.
            </ModalText>
            <ModalActions>
              <CancelButton onClick={() => setShowModal(false)}>
                Cancelar
              </CancelButton>
              <DangerButton onClick={handleResetPassword}>
                Confirmar
              </DangerButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </Layout>
  );
}