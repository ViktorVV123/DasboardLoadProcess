import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './global.scss';
import { App } from '@/components/App';
import {Dashboard} from "@/pages/dashboard/Dashboard";


const root = document.getElementById('root');
if (!root) {
    throw new Error('root not found');
}

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <App />,
            children: [{ index: true, element: <Dashboard /> }],
        },
    ],
    // в проде приложение живёт под /cdu-portal/, в dev — от корня
    { basename: __ENV__ === 'production' ? '/cdu-portal' : '/' },
);

createRoot(root).render(<RouterProvider router={router} />);
