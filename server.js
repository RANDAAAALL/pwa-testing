const PORT = 3000;

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

const server = Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;
    
    // Default to index.html for root
    if (path === "/") {
      path = "/index.html";
    }

    const filePath = `.${path}`;
    const file = Bun.file(filePath);

    // If file doesn't exist, return 404
    if (!file.size) {
      return new Response("Not Found", { status: 404 });
    }

    // Determine the content type based on extension
    const ext = path.substring(path.lastIndexOf("."));
    const contentType = mimeTypes[ext] || "text/plain";

    const headers = { "Content-Type": contentType };
    
    // Special mime type for PWA manifest
    if (path === "/manifest.json") {
      headers["Content-Type"] = "application/manifest+json";
    }

    // Disable browser caching for Service Worker to make development / testing easy
    if (path === "/sw.js") {
      headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate";
    }

    return new Response(file, { headers });
  },
});

console.log(`Server running at http://localhost:${PORT}`);
