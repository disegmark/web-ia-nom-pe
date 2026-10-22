This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Estudio creativo iA (`/studio`)

Estudio privado para crear contenido con IA:

- **Avatares** (HeyGen): avatares hiperrealistas de stock o creados desde una sola foto. El guion se divide en escenas (línea en blanco) para videos largos, con la voz de ElevenLabs sincronizada en los labios.
- **Voces** (ElevenLabs): texto a voz en 25+ idiomas con control de estabilidad/estilo y clonación instantánea de voz.
- **Video largo** (fal.ai → PixVerse, Kling, Veo 3): un guion por escenas (generado con Claude a partir de una idea), continuidad encadenando el último fotograma de cada escena con la siguiente, vista previa continua y unión final en un solo MP4.

Configuración (`.env.local`, ver `.env.local.example`): `STUDIO_ACCESS_KEY` (obligatoria — sin ella el estudio queda bloqueado), `HEYGEN_API_KEY`, `ELEVENLABS_API_KEY`, `FAL_KEY` y `ANTHROPIC_API_KEY` (guion automático). Cada pestaña se activa solo si su proveedor está configurado. Los ids de los modelos de video están en `src/lib/studio/config.ts`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
