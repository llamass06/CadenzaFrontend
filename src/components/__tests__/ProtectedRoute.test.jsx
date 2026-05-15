import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

describe('ProtectedRoute', () => {
    beforeEach(() => {
        // Limpiar localStorage antes de cada test
        localStorage.clear();
    });

    it('redirige a /login si no hay token en localStorage', () => {
        render(
            <MemoryRouter initialEntries={['/protegida']}>
                <Routes>
                    <Route 
                        path="/protegida" 
                        element={
                            <ProtectedRoute>
                                <div data-testid="contenido-protegido">Contenido Privado</div>
                            </ProtectedRoute>
                        } 
                    />
                    <Route path="/login" element={<div data-testid="login-page">Página de Login</div>} />
                </Routes>
            </MemoryRouter>
        );

        // El contenido protegido NO debe estar en el documento
        expect(screen.queryByTestId('contenido-protegido')).not.toBeInTheDocument();
        // Debería haberse redirigido a /login y renderizar su contenido
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('renderiza el contenido protegido si hay token en localStorage', () => {
        // Simulamos que el usuario tiene un token
        localStorage.setItem('cadenza_token', 'fake-jwt-token');

        render(
            <MemoryRouter initialEntries={['/protegida']}>
                <Routes>
                    <Route 
                        path="/protegida" 
                        element={
                            <ProtectedRoute>
                                <div data-testid="contenido-protegido">Contenido Privado</div>
                            </ProtectedRoute>
                        } 
                    />
                    <Route path="/login" element={<div data-testid="login-page">Página de Login</div>} />
                </Routes>
            </MemoryRouter>
        );

        // El contenido protegido SÍ debe estar en el documento
        expect(screen.getByTestId('contenido-protegido')).toBeInTheDocument();
        // No debería redirigir a login
        expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });
});
