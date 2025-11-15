import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Compiling backend TypeScript...');

// Compile TypeScript
const tsc = spawn('node', [
  join(__dirname, 'node_modules/typescript/bin/tsc'),
  join(__dirname, 'api/server.ts'),
  '--outDir', join(__dirname, 'api'),
  '--module', 'esnext',
  '--target', 'es2020',
  '--esModuleInterop',
  '--allowSyntheticDefaultImports',
  '--skipLibCheck'
], { stdio: 'inherit' });

tsc.on('close', (code) => {
  if (code === 0) {
    console.log('Backend compiled successfully!');
    console.log('Starting backend server...');
    
    // Start the server
    const server = spawn('node', [join(__dirname, 'api/server.js')], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });
    
    server.on('error', (err) => {
      console.error('Failed to start backend server:', err);
    });
  } else {
    console.error('Backend compilation failed with code:', code);
  }
});

tsc.on('error', (err) => {
  console.error('Failed to compile backend:', err);
});