import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import { AppRouter } from './app/AppRouter'
import { Analytics } from './app/components/Analytics'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <BrowserRouter>
      <Analytics />
      <AppRouter />
    </BrowserRouter>
  </HelmetProvider>,
)
