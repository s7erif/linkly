import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/app/page.tsx",
    "src/components/FormPanel.tsx",
    "src/components/PreviewPanel.tsx",
    "src/components/SharePanel.tsx",
    "src/app/gallery/page.js",
    "src/components/Navbar.js",
  ]),
]);

export default eslintConfig;
