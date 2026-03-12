/**
 * Simple script to easily start both frontend and backend for Looks Salon
 * Usage: node start-dashboard.js
 */
import { spawn } from 'child_process';
import process from 'process';

console.log('\n🚀 Starting Looks Salon Dashboard Environment...\n');

// Start backend
const backendParams = process.platform === 'win32'
    ? { cmd: 'cmd.exe', args: ['/c', 'cd backend && npm start'] }
    : { cmd: 'sh', args: ['-c', 'cd backend && npm start'] };

const backend = spawn(backendParams.cmd, backendParams.args, { stdio: 'inherit' });

// Start frontend
setTimeout(() => {
    const frontendParams = process.platform === 'win32'
        ? { cmd: 'cmd.exe', args: ['/c', 'cd frontend && npm run dev'] }
        : { cmd: 'sh', args: ['-c', 'cd frontend && npm run dev'] };

    const frontend = spawn(frontendParams.cmd, frontendParams.args, { stdio: 'inherit' });

    // Handle exits
    process.on('SIGINT', () => {
        console.log('\nClosing servers...');
        backend.kill('SIGINT');
        frontend.kill('SIGINT');
        process.exit();
    });
}, 1000); // 1s delay to let backend start first
