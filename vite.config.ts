
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY || ''),
      'process.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL || ''),
      'process.env.MERCADOPAGO_PUBLIC_KEY': JSON.stringify(env.MERCADOPAGO_PUBLIC_KEY || 'APP_USR-53816ce6-db4e-44ce-9617-be591d0b61ed'),
      'process.env.MERCADOPAGO_ACCESS_TOKEN': JSON.stringify(env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-3935114367490901-012801-37187df83856a1dab6590347bbf9c58b-188695400'),
      'process.env.MERCADOPAGO_CLIENT_ID': JSON.stringify(env.MERCADOPAGO_CLIENT_ID || '3935114367490901'),
      'process.env.MERCADOPAGO_CLIENT_SECRET': JSON.stringify(env.MERCADOPAGO_CLIENT_SECRET || 'Yw0QHJEiFda7vdoOBHR0U18W6Tnxzt9S'),
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    server: {
      port: 3000,
      host: true,
      hmr: false
    }
  };
});
