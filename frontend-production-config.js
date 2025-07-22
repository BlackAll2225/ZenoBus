// =============================================================================
// Frontend Production Configuration for ZentroBus
// =============================================================================

// 1. Update FE/src/services/api.ts
const apiConfig = `
import axios from 'axios';

// Dynamic API base URL based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                     (import.meta.env.PROD 
                       ? 'https://your-domain.com/api' 
                       : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor để thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        window.location.href = '/login';
      }
    }
    
    if (error.response?.status === 403) {
      // Forbidden - redirect to home
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

export default api;
`;

// 2. Create FE/.env.production
const envProduction = `
# Production Environment Variables
VITE_API_BASE_URL=https://your-domain.com/api
VITE_BACKEND_URL=https://your-domain.com
VITE_APP_NAME=ZentroBus
VITE_APP_VERSION=1.0.0
`;

// 3. Update FE/vite.config.ts for production build
const viteConfig = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          routing: ['react-router-dom'],
          utils: ['axios', 'date-fns'],
        },
      },
    },
  },
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
`;

// 4. Vercel deployment configuration (vercel.json)
const vercelConfig = `
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://your-domain.com/api",
    "VITE_BACKEND_URL": "https://your-domain.com"
  },
  "build": {
    "env": {
      "VITE_API_BASE_URL": "https://your-domain.com/api",
      "VITE_BACKEND_URL": "https://your-domain.com"
    }
  }
}
`;

// 5. Package.json scripts update
const packageJsonScripts = `
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:staging": "tsc && vite build --mode staging",
    "build:production": "tsc && vite build --mode production",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "deploy": "npm run build:production && vercel --prod"
  }
}
`;

// =============================================================================
// DEPLOYMENT INSTRUCTIONS
// =============================================================================

console.log(`
🚀 FRONTEND DEPLOYMENT GUIDE
===============================

📋 STEP 1: UPDATE API CONFIGURATION
1. Replace FE/src/services/api.ts with the updated version above
2. Create FE/.env.production with your domain
3. Update FE/vite.config.ts for production optimization

📋 STEP 2: VERCEL DEPLOYMENT

Option A: Vercel CLI
--------------------
1. Install Vercel CLI:
   npm install -g vercel

2. Login to Vercel:
   vercel login

3. Deploy from project root:
   cd FE
   vercel --prod

4. Set environment variables:
   vercel env add VITE_API_BASE_URL production
   vercel env add VITE_BACKEND_URL production

Option B: GitHub Integration (Recommended)
------------------------------------------
1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - Framework Preset: Vite
   - Root Directory: FE
   - Build Command: npm run build
   - Output Directory: dist
6. Add Environment Variables:
   - VITE_API_BASE_URL: https://your-domain.com/api
   - VITE_BACKEND_URL: https://your-domain.com
7. Deploy

📋 STEP 3: UPDATE BACKEND CORS
After getting Vercel URL, update BE/src/config/cors.js:

const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://localhost:3000',
    'https://your-app.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

📋 STEP 4: CUSTOM DOMAIN (Optional)
1. In Vercel dashboard, go to your project
2. Go to Settings > Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Update CORS settings with new domain

📋 STEP 5: PERFORMANCE OPTIMIZATION
1. Enable Vercel Analytics
2. Set up monitoring alerts
3. Configure caching headers
4. Enable compression

🔧 ENVIRONMENT VARIABLES REFERENCE
==================================
Development:  http://localhost:5000/api
Staging:      https://staging.your-domain.com/api
Production:   https://your-domain.com/api

✅ FINAL CHECKLIST
==================
- [ ] Frontend builds successfully
- [ ] API connection works in production
- [ ] Authentication flow works
- [ ] Payment integration works
- [ ] All pages load correctly
- [ ] CORS configured properly
- [ ] SSL certificates valid
- [ ] Monitoring set up

🎉 Your ZentroBus application is now fully deployed!
`);

// Export configurations for easy access
module.exports = {
  apiConfig,
  envProduction,
  viteConfig,
  vercelConfig,
  packageJsonScripts
}; 