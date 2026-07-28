const { loadEnvConfig } = require('@next/env');
const projectDir = process.cwd();
loadEnvConfig(projectDir);

console.log(process.env.SUPABASE_SERVICE_ROLE_KEY);
