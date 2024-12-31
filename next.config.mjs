import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";
import TerserPlugin from 'terser-webpack-plugin';
import crypto from 'crypto';
import withPlugins from 'next-compose-plugins';
import CompressionPlugin from 'compression-webpack-plugin';
import BrotliPlugin from 'brotli-webpack-plugin';
import bundleAnalyzer from '@next/bundle-analyzer';
import path from 'path';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  modularizeImports: {
    '@heroicons/react/?(((\\w*)?/?)*)': {
      transform: '@heroicons/react/{{ matches.[1] }}/{{ member }}',
    },
    'date-fns': {
      transform: 'date-fns/{{ member }}',
    },
  },
  images: {
    loader: 'custom',
    loaderFile: './supabase-image-loader.js',
  },
  webpack: (config, { dev, isServer }) => {
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': path.join(process.cwd(), 'components'),
      '@lib': path.join(process.cwd(), 'lib'),
      '@hooks': path.join(process.cwd(), 'hooks'),
      '@utils': path.join(process.cwd(), 'utils'),
    };

    // Production optimizations only
    if (!dev && !isServer) {
      config.optimization.minimize = true;
      config.optimization.concatenateModules = true;

      // Terser optimization
      config.optimization.minimizer = config.optimization.minimizer || [];
      config.optimization.minimizer.push(
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
              passes: 2,
            },
            mangle: true,
            format: {
              comments: false,
            },
          },
          extractComments: false,
        })
      );

      // Compression
      config.plugins.push(
        new CompressionPlugin({
          filename: '[path][base].gz',
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8,
        }),
        new BrotliPlugin({
          asset: '[path].br[query]',
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8,
        })
      );
      
      // Enhanced chunk splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          // Core framework
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Library code
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module, chunks) {
              const match = module.context?.match(/[\\/]node_modules[\\/](.*?)(?:[\\/]|$)/);
              const packageName = match ? match[1] : 'vendors';
              
              // Group major libraries separately
              if (/(@?react-query|@tanstack)/.test(packageName)) return 'react-query';
              if (/@radix-ui/.test(packageName)) return 'radix-ui';
              if (/@heroicons/.test(packageName)) return 'heroicons';
              if (/date-fns/.test(packageName)) return 'date-fns';
              
              return `npm.${packageName.replace('@', '')}`;
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          // Shared components
          components: {
            test: /[\\/]components[\\/]/,
            name: 'components',
            minChunks: 2,
            priority: 25,
            reuseExistingChunk: true,
          },
          // Shared hooks
          hooks: {
            test: /[\\/]hooks[\\/]/,
            name: 'hooks',
            minChunks: 2,
            priority: 25,
            reuseExistingChunk: true,
          },
          // Common utilities
          utils: {
            test: /[\\/](utils|lib)[\\/]/,
            name: 'utils',
            minChunks: 2,
            priority: 25,
            reuseExistingChunk: true,
          },
          // Other shared code
          shared: {
            name(module, chunks) {
              const names = chunks.map(c => c.name || c.id).filter(Boolean);
              if (names.length === 0) return 'shared';
              return `shared.${crypto
                .createHash('sha1')
                .update(names.join('_'))
                .digest('hex')
                .substring(0, 8)}`;
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          }
        }
      };

      // Asset optimization
      config.module.rules.push({
        test: /\.(jpe?g|png|svg|gif|ico|eot|ttf|woff|woff2|mp4|pdf|webm|txt)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024,
          },
        },
      });
    }
    return config;
  },
};

if (process.env.NODE_ENV === "development") {
  await setupDevPlatform();
}

export default withPlugins([withBundleAnalyzer], nextConfig);
