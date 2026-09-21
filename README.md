## Local API and authentication

Run `npm run dev` and open the localhost URL printed by Vite. Configure `.env`:

```dotenv
VITE_API_URL=https://your-backend.example/v1
VITE_USE_PROXY=true
```

- `VITE_USE_PROXY=true`: development requests use the local `/v1` proxy, which
  forwards to `VITE_API_URL` and rewrites auth cookies for localhost.
- `VITE_USE_PROXY=false` (or omitted): requests go directly to `VITE_API_URL`.

Restart Vite after changing the switch. Production builds always use
`VITE_API_URL` directly; the development proxy is not included in the build.
An optional `VITE_API_PROXY_TARGET` can override the proxy's upstream API URL.
Requests include credentials. When calling the backend directly, it must allow
the frontend origin with credentials in CORS and supply valid cookie attributes.

Login verifies `/auth/me` before entering the dashboard. Failed session checks
stay on the login screen with an error. Session refresh supports both bearer
tokens and cookies and retries each failed request only once.

Run `npm run test:auth` with Node 22.15+ (or Node 24) for authentication service
regression tests using mocked HTTP responses. These do not verify real browser
cookie acceptance or backend credentials.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
