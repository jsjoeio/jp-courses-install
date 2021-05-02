import { serve } from "https://deno.land/std@0.95.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.95.0/http/file_server.ts";
// Source: https://github.com/thecodeholic/deno-serve-static-files/blob/final-version/http-server/server.ts#L6-L17
export async function fileExists(path: string) {
  try {
    const stats = await Deno.lstat(path);
    return stats && stats.isFile;
  } catch (e) {
    if (e && e instanceof Deno.errors.NotFound) {
      return false;
    } else {
      throw e;
    }
  }
}

// Source: https://github.com/thecodeholic/deno-serve-static-files/blob/final-version/http-server/server.ts#L19-L35
export async function startCourseServer(PORT = 3000) {
  const server = serve({ port: PORT });
  console.log(`🚀 Starting course on http://localhost:${PORT}`);
  console.log(``);
  // TODO listen for keypress
  // https://deno.land/x/keypress@0.0.4
  console.log(`⌨️ To stop course, hit Control + C on your keyboard.`);

  // Source: https://github.com/thecodeholic/deno-serve-static-files/blob/final-version/http-server/server.ts#L19-L35
  for await (const req of server) {
    const path = `${Deno.cwd()}/content${req.url}`;
    console.log("path: ", path);
    if (await fileExists(path)) {
      console.log("does file exist?");
      const content = await serveFile(req, path);
      req.respond(content);
      continue;
    }

    // TODO this isn't working well...
    if (req.url === "/" || req.url === "") {
      // If they go to root, serve the index.html
      const content = await serveFile(req, `${path}index.html`);
      req.respond(content);
    } else {
      req.respond({ status: 404 });
    }
  }
}
