import './globals.css'
import { Toaster } from 'react-hot-toast'
import Script from 'next/script'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nextree.app'

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dala Qo'riqchisi - Aqlli Daraxt Monitoring Tizimi",
    template: "%s | Dala Qo'riqchisi"
  },
  description: 'Aqlli qishloq xo\'jaligi daraxt monitoring tizimi. Harorat, namlik, tutun va kesilish holatini real vaqtda kuzatish. ESP8266 asosida qurilgan IoT tizim.',
  keywords: [
    'daraxt monitoring',
    'aqlli qishloq xo\'jaligi',
    'IoT',
    'ESP8266',
    'sensor monitoring',
    'real-time monitoring',
    'agricultural monitoring',
    'tree health',
    'smart farming',
    'Uzbekistan agriculture',
    'daraxt sog\'lig\'i',
    'qishloq xo\'jaligi texnologiyalari'
  ],
  authors: [{ name: 'Dala Qo\'riqchisi Team' }],
  creator: 'Dala Qo\'riqchisi',
  publisher: 'Dala Qo\'riqchisi',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    url: '/',
    siteName: "Dala Qo'riqchisi",
    title: "Dala Qo'riqchisi - Aqlli Daraxt Monitoring Tizimi",
    description: 'Aqlli qishloq xo\'jaligi daraxt monitoring tizimi. Harorat, namlik, tutun va kesilish holatini real vaqtda kuzatish.',
    images: [
      {
        url: '/LOGO.png',
        width: 1200,
        height: 630,
        alt: "Dala Qo'riqchisi Logo",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dala Qo'riqchisi - Aqlli Daraxt Monitoring Tizimi",
    description: 'Aqlli qishloq xo\'jaligi daraxt monitoring tizimi. Real vaqtda kuzatish va ogohlantirishlar.',
    images: ['/LOGO.png'],
    creator: '@dalaqoriqchisi',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: '/',
  },
  category: 'technology',
  other: {
    'application-name': "Dala Qo'riqchisi",
    'apple-mobile-web-app-title': "Dala Qo'riqchisi",
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#1e5f3f',
    'msapplication-TileImage': '/mstile-144x144.png',
    'theme-color': '#1e5f3f',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

// Structured Data (JSON-LD) for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: "Dala Qo'riqchisi",
  description: 'Aqlli qishloq xo\'jaligi daraxt monitoring tizimi. Harorat, namlik, tutun va kesilish holatini real vaqtda kuzatish.',
  url: siteUrl,
  applicationCategory: 'AgriculturalMonitoringApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'UZS',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    ratingCount: '1',
  },
  featureList: [
    'Real-time sensor monitoring',
    'Temperature and humidity tracking',
    'Smoke detection',
    'Tree cut detection',
    'Alert notifications',
    'Web dashboard',
    'Mobile responsive',
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

