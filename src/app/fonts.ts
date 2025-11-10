// File: fonts.ts
// Path: /src/app/fonts.ts
// Custom font configuration for BebasNeue (headings) and Montserrat (body text)

import localFont from 'next/font/local'

// BebasNeue for headings
export const bebasNeue = localFont({
  src: [
    {
      path: '../../public/fonts/BebasNeue-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-heading',
  display: 'swap',
})

// Montserrat for body text
export const montserrat = localFont({
  src: [
    {
      path: '../../public/fonts/Montserrat-VariableFont.woff2',
      weight: '100 900',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Montserrat-Italic-VariableFont.woff2',
      weight: '100 900',
      style: 'italic',
    },
  ],
  variable: '--font-body',
  display: 'swap',
})