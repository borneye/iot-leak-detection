require('dotenv').config({ path: __dirname + '/.env' });
console.log('Current directory:', __dirname);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('All env vars:', process.env);
