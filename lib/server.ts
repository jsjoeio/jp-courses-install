import { serve } from "https://deno.land/std@0.95.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.95.0/http/file_server.ts";
import { extname } from "https://deno.land/std@0.95.0/path/mod.ts";
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

//////////////////////////////////
//////////////////////////////////
// Helper Functions
//////////////////////////////////
//////////////////////////////////

export function getParentDir(path: string) {
  // /Users/jp/Dev/testing/oak-server/examples/static/course
  // Source: https://stackoverflow.com/a/16863827/3015595
  return path.substring(0, path.lastIndexOf("/"));
}

export async function isDirectory(path: string) {
  try {
    const fileInfo = await Deno.stat(path);
    return fileInfo.isDirectory;
  } catch (error) {
    console.error(error, "something went wrong checking if isDirectory");
  }
}

export async function hasHtmlFileForDir(fileName: string, parentDir: string) {
  let hasHtmlFile = false;
  // Source: https://deno.land/std@0.95.0/http/file_server.ts#L167
  for await (const entry of Deno.readDir(parentDir)) {
    if (entry.name === `${fileName}.html` && entry.isFile) {
      hasHtmlFile = true;
      break;
    }
  }
  return hasHtmlFile;
}

export async function handleFileToServe(path: string, root: string) {
  if (path === "/") {
    return `index.html`;
  }

  const fileExt = extname(path);
  const fullFilePath = `${root}${path}`;

  if (fileExt === "" && (await isDirectory(fullFilePath))) {
    // TODO this only looks one level deep
    const fileName = path.substr(1);
    const parentDir = getParentDir(fullFilePath);
    const hasHtmlFile = await hasHtmlFileForDir(fileName, parentDir);
    if (hasHtmlFile) {
      return `${path}.html`;
    }
  }

  return path;
}

// TODO add the rest of the oak server code in
// everything that isn't part of the helper functions
