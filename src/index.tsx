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

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [{ index: true, element: <Dashboard /> }],
    },
]);

createRoot(root).render(<RouterProvider router={router} />);
