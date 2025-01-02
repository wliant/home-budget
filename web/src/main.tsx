import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {AxiosProvider} from "./contexts/AxiosProvider";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AxiosProvider>
            <App/>
        </AxiosProvider>
    </StrictMode>,
)
