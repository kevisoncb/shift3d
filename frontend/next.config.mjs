/** @type {import('next').NextConfig} */
// Configuração principal do Next.js otimizada para transpilação de pacotes Three.js
const nextConfig = {
  transpilePackages: ['three'],
  reactStrictMode: true,
};

export default nextConfig;
