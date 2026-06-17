import React from 'react';
import { ErrorBoundary } from '@/components/errorBoundary/ErrorBoundary';
import { Outlet } from 'react-router-dom';

export const App = () => {
    if (__PLATFORM__ === 'mobile') {
        return <div>Мобильная версия в разработке</div>;
    }

    return (
        <ErrorBoundary>
            <Outlet />
        </ErrorBoundary>
    );
};

