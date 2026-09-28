import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * ADR-006: RTL is first-class. Physical-direction Tailwind utilities (ml-*, pr-*, left-*,
 * text-left, rounded-l-*, border-r-*, …) are banned in className strings — use logical
 * equivalents (ms-*, pe-*, start-*, text-start, rounded-s-*, border-e-*).
 */
const PHYSICAL_DIRECTION =
  '/(^|\\s|:)-?(ml|mr|pl|pr|left|right|border-l|border-r|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br|scroll-ml|scroll-mr|scroll-pl|scroll-pr)-|(^|\\s|:)(text-left|text-right|float-left|float-right|clear-left|clear-right)($|\\s)/';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: `JSXAttribute[name.name='className'] Literal[value=${PHYSICAL_DIRECTION}]`,
          message:
            'Use logical (RTL-safe) utilities: ms/me, ps/pe, start/end, text-start/end, rounded-s/e, border-s/e.',
        },
        {
          selector: `JSXAttribute[name.name='className'] TemplateElement[value.raw=${PHYSICAL_DIRECTION}]`,
          message:
            'Use logical (RTL-safe) utilities: ms/me, ps/pe, start/end, text-start/end, rounded-s/e, border-s/e.',
        },
      ],
    },
  },
  {
    // Phase 3 (ADR-007): the WebGL scene follows the React Three Fiber render-loop idiom —
    // GPU objects (materials, uniforms, object refs) are created once and mutated inside
    // useFrame, outside React's render cycle. The React Compiler purity rules assume
    // immutable render data and do not model this; they stay on everywhere else.
    files: ['src/scene/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'node_modules/**',
    'next-env.d.ts',
    'playwright-report/**',
    'test-results/**',
    'coverage/**',
    // Payload-generated artifacts — kept byte-identical to the generator output.
    'src/migrations/**',
    'src/payload-types.ts',
    'src/app/(payload)/admin/importMap.js',
  ]),
]);
