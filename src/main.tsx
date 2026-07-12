import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {SessionProvider} from './services/sessionStore.ts';
import {InstitutionProvider} from './services/institutionStore.ts';
import {LanguageProvider} from './context/language/LanguageContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <InstitutionProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </InstitutionProvider>
    </SessionProvider>
  </StrictMode>,
);

