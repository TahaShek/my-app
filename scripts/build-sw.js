const fs = require("fs");
const path = require("path");

// Read environment variables
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "";
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "";
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "";

// Read the service worker template
const swTemplatePath = path.join(__dirname, "../public/firebase-messaging-sw.template.js");
const swOutputPath = path.join(__dirname, "../public/firebase-messaging-sw.js");

let swContent;
if (fs.existsSync(swTemplatePath)) {
  swContent = fs.readFileSync(swTemplatePath, "utf-8");
} else {
  // If template doesn't exist, read the current file
  swContent = fs.readFileSync(swOutputPath, "utf-8");
}

// Replace placeholders or hardcoded values with environment variables
swContent = swContent
  .replace(/apiKey:\s*"[^"]*"/, `apiKey: "${apiKey}"`)
  .replace(/authDomain:\s*"[^"]*"/, `authDomain: "${authDomain}"`)
  .replace(/projectId:\s*"[^"]*"/, `projectId: "${projectId}"`)
  .replace(/messagingSenderId:\s*"[^"]*"/, `messagingSenderId: "${messagingSenderId}"`)
  .replace(/appId:\s*"[^"]*"/, `appId: "${appId}"`);

// Write the service worker
fs.writeFileSync(swOutputPath, swContent);
console.log("Service worker built with environment variables");
