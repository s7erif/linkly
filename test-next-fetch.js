const http = require('http');

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Headers:", req.headers);
    res.writeHead(200);
    res.end('OK');
    server.close();
  });
});

server.listen(8080, async () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log("key is:", key ? key.substring(0, 15) : undefined);
  try {
    const res = await fetch('http://localhost:8080/storage/v1/object/avatars/test', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": 'text/plain',
      },
      body: 'hello'
    });
    console.log("Response:", res.status);
  } catch (e) {
    console.error(e);
  }
});
