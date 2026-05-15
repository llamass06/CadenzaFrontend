import React from 'react';
import { render, screen } from '@testing-library/react';
import StorageStatus from '../StorageStatus';

describe('StorageStatus', () => {
    it('muestra el estado normal cuando hay espacio suficiente', () => {
        render(<StorageStatus obrasCount={1} maxObras={3} />);

        // Debe mostrar "1 / 3 Obras" (el texto está dividido en varios spans, pero el padre contiene todo)
        const obrasSpan = screen.getByText(/\/ 3 Obras/i).closest('span.text-2xl');
        expect(obrasSpan).toHaveTextContent('1 / 3 Obras');

        // El porcentaje debe ser 33%
        expect(screen.getByText('33%')).toBeInTheDocument();

        // No debe mostrar la advertencia de casi lleno
        expect(screen.queryByText(/¡Solo queda espacio para 1 obra más!/i)).not.toBeInTheDocument();

        // El contador no debe tener clase de error (red o amber)
        // Buscamos el elemento contenedor del 1 / 3
        // getByText(/1/) podría devolver el span padre.
        // screen.getByText('1') pero hay espacios. Usamos query.
        const badge = screen.getByText('Plan Free');
        expect(badge).toHaveClass('text-cadenza-neon');
    });

    it('muestra el estado de advertencia (ámbar) cuando casi está lleno', () => {
        render(<StorageStatus obrasCount={2} maxObras={3} />);

        // El porcentaje debe ser 67%
        expect(screen.getByText('67%')).toBeInTheDocument();

        // Debe mostrar la advertencia
        expect(screen.getByText(/¡Solo queda espacio para 1 obra más!/i)).toBeInTheDocument();

        // El badge debe tener color ámbar
        const badge = screen.getByText('Plan Free');
        expect(badge).toHaveClass('text-amber-500');
    });

    it('muestra el estado de límite alcanzado (rojo) cuando está lleno', () => {
        render(<StorageStatus obrasCount={3} maxObras={3} />);

        // El porcentaje debe ser 100%
        expect(screen.getByText('100%')).toBeInTheDocument();

        // La advertencia de "1 más" NO debe mostrarse porque ya no hay hueco
        expect(screen.queryByText(/¡Solo queda espacio para 1 obra más!/i)).not.toBeInTheDocument();

        // El badge debe tener color rojo
        const badge = screen.getByText('Plan Free');
        expect(badge).toHaveClass('text-red-500');
    });

    it('no sobrepasa el 100% si obrasCount > maxObras', () => {
        render(<StorageStatus obrasCount={5} maxObras={3} />);
        
        // El porcentaje debe seguir siendo 100%
        expect(screen.getByText('100%')).toBeInTheDocument();
        
        // El badge debe seguir en color rojo
        const badge = screen.getByText('Plan Free');
        expect(badge).toHaveClass('text-red-500');
    });
});
