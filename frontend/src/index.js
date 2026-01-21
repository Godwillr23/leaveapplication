import React from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import App from './App';
import { ToastProvider } from './ToastContext';
import { ConfirmProvider } from './ConfirmContext';

const root = createRoot(document.getElementById('root'));
root.render(
	<ToastProvider>
		<ConfirmProvider>
			<App />
		</ConfirmProvider>
	</ToastProvider>
);
