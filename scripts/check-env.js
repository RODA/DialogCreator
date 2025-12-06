#!/usr/bin/env node

// Default to production if not already set, then enforce it
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

if (process.env.NODE_ENV !== 'production') {
  console.error('Error: NODE_ENV must be set to "production" before building.');
  process.exit(1);
}
