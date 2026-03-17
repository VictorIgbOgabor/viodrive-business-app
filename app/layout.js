import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title:       'VIOdrive Business — Logistics Dashboard',
  description: 'Manage your business shipments, track deliveries, and monitor logistics performance.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#231F1B',
              color:      '#F5EFE6',
              border:     '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'Outfit, sans-serif',
              fontSize:   '14px',
            },
            success: {
              iconTheme: { primary: '#E8450A', secondary: '#F5EFE6' },
            },
            error: {
              iconTheme: { primary: '#FF7070', secondary: '#F5EFE6' },
            },
          }}
        />
      </body>
    </html>
  )
}
