const http = require('http');

const data = JSON.stringify({
  nom: "Administrateur",
  email: "admin@ecole.com",
  password: "admin123"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/connexion',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
