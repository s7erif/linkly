const env = process.env;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;

console.log("SUPABASE_URL:", url);
console.log("NEXT_PUBLIC_SUPABASE_URL:", env.NEXT_PUBLIC_SUPABASE_URL);

if (!key) {
  console.log("No key found");
} else {
  console.log("Key first 12 chars:", key.slice(0, 12));
  if (!key.startsWith("eyJ")) {
    console.log("Token does NOT start with eyJ");
  } else {
    try {
      const parts = key.split(".");
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf8'));
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      console.log("Header:", header);
      console.log("Payload:", payload);
      
      const urlMatch = url.match(/([a-z0-9]+)\.supabase\.co/);
      const urlRef = urlMatch ? urlMatch[1] : (url.match(/([a-z0-9]+)\.pooler\.supabase\.com/) ? url.match(/([a-z0-9]+)\.pooler\.supabase\.com/)[1] : null);
      
      console.log("JWT ref:", payload.ref || payload.iss);
      console.log("URL ref:", urlRef);
    } catch(e) {
      console.error(e);
    }
  }
}
