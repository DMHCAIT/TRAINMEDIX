#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const lines = envContent.split('\n');
lines.forEach(line => {
  if (line.includes('DATABASE') || line.includes('POSTGRES')) {
    console.log(line);
  }
});
