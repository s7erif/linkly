const fs = require('fs');

async function main() {
  const formData = new FormData();
  formData.append("file", new Blob(["hello"], { type: "image/png" }), "avatar.png");
  formData.append("cardId", "01ba73dc-fee4-48cd-b7cf-f8ecefa26070");
  formData.append("sessionToken", "0000000000000000000000000000000000000000000000000000000000000000"); // some 64 char hex

  const res = await fetch("http://localhost:3000/api/cards/upload-avatar", {
    method: "POST",
    body: formData
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}

main().catch(console.error);
