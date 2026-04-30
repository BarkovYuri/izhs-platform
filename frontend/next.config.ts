import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // standalone-сборка: для прод-Docker (мини-runtime, без node_modules)
  output: "standalone",
  // Разрешаем next/image грузить картинки с нашего же домена и с S3-бакета
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "remstroy70.ru" },
      { protocol: "https", hostname: "s3.twcstorage.ru" },
      { protocol: "https", hostname: "*.twcstorage.ru" },
      // dev: backend на 127.0.0.1:8000
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
      { protocol: "http", hostname: "localhost", port: "8000" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
