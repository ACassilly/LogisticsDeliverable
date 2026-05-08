import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Note: next lint removed in Next.js 16 — use eslint directly (npm run lint / npx eslint .)
const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default eslintConfig;
