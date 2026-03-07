import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Agência Pay - Painel',
    short_name: 'Agência Pay',
    description: 'Sistema de simulação e geração de links de pagamento de viagens.',
    id: '/?source=pwa', // ID único para o PWA (Segurança Máxima)
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a', // Cor do fundo da Splash Screen
    theme_color: '#2563eb', // Cor da barra superior do celular (Azul da marca)
    orientation: 'portrait', // Força a abertura sempre em pé (Mobile First)
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}