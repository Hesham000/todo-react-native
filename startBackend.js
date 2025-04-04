/**
 * Helper script to start the backend server
 * Run with: node startBackend.js
 */

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

console.log('Starting Todo App backend server...');

// Determine the command based on OS
const isWindows = os.platform() === 'win32';
const command = isWindows ? 'npm.cmd' : 'npm';

// Use spawn to run the backend
const backendProcess = spawn(command, ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit' // Show output in this terminal
});

// Handle process events
backendProcess.on('error', (error) => {
  console.error('Failed to start backend server:', error.message);
});

backendProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Backend server exited with code ${code}`);
  } else {
    console.log('Backend server stopped');
  }
});

console.log('Backend server is running on http://localhost:5000');
console.log('Press Ctrl+C to stop the server');

// Keep the script running
process.on('SIGINT', () => {
  console.log('Stopping backend server...');
  backendProcess.kill();
  process.exit(0);
}); 