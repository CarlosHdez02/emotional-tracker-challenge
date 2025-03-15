import { useContext } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';

const HeaderContainer = styled.header`
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled.a`
  color: white;
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Header = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <HeaderContainer>
      <Nav>
        <Logo>
          <Link href="/">
            <a>TerapiaEmocional</a>
          </Link>
        </Logo>
        
        <NavLinks>
          {user ? (
            <>
              <Link href="/dashboard">
                <NavLink>Panel</NavLink>
              </Link>
              <Link href="/emotions">
                <NavLink>Emociones</NavLink>
              </Link>
              <NavLink onClick={logout}>Cerrar Sesión</NavLink>
              <Link href="/profile">
              <NavLink>Perfil</NavLink>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <NavLink>Iniciar Sesión</NavLink>
              </Link>
              <Link href="/register">
                <NavLink>Registro</NavLink>
              </Link>
            </>
          )}
        </NavLinks>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;