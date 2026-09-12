#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const dbUrlLine = envContent.split('\n').find(line => line.startsWith('DATABASE_URL='));
const DATABASE_URL = dbUrlLine?.split('=')[1];

console.log('Full URL:', DATABASE_URL);

// Parse step by step
const afterProto = DATABASE_URL.split('://')[1];
console.log('After proto:', afterProto);

const [credentials, hostDb] = afterProto.split('@');
console.log('Credentials:', credentials);
console.log('Host/DB:', hostDb);

const [user, password] = credentials.split(':');
console.log('User:', user);
console.log('Password:', password);

const [hostPort, database] = hostDb.split('/');
console.log('HostPort:', hostPort);
console.log('Database:', database);

const [host, port] = hostPort.split(':');
console.log('Host:', host);
console.log('Port:', port);
