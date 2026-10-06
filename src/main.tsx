import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
