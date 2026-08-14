import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const repositoryRoot = path.resolve(frontendDir, "..");
const outputDir = path.join(frontendDir, "out");
const headOpeningTag = /<head(?:\s[^>]*)?>/i;

function resolveFragmentPath(configuredPath) {
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(repositoryRoot, configuredPath);
}

async function collectHTMLFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectHTMLFiles(entryPath));
      continue;
    }
    if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".html") {
      files.push(entryPath);
    }
  }

  return files;
}

function injectAfterHead(html, fragment, filePath) {
  const match = headOpeningTag.exec(html);
  if (!match || match.index === undefined) {
    throw new Error(`[build-head-fragment] Unable to find an opening <head> tag in "${filePath}".`);
  }

  const headEnd = match.index + match[0].length;
  const remainder = html.slice(headEnd);
  const lineStart = remainder.match(/^(\r?\n)([ \t]*)/);
  const newline = lineStart?.[1] ?? "\n";
  const indentation = lineStart?.[2] ?? "";
  const formattedFragment = fragment
    .split(/\r?\n/)
    .map((line) => line ? `${indentation}${line}` : "")
    .join(newline);
  const suffix = lineStart ? "" : newline;

  return `${html.slice(0, headEnd)}${newline}${formattedFragment}${suffix}${remainder}`;
}

async function main() {
  const configuredPath = process.env.BUILD_HEAD_FRAGMENT_FILE?.trim();
  if (!configuredPath) {
    return;
  }

  const fragmentPath = resolveFragmentPath(configuredPath);
  let fragment;

  try {
    fragment = await readFile(fragmentPath, "utf8");
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`[build-head-fragment] Unable to read "${fragmentPath}": ${reason}`);
  }

  fragment = fragment.trim();
  if (!fragment) {
    throw new Error(`[build-head-fragment] Fragment file "${fragmentPath}" is empty.`);
  }

  let htmlFiles;
  try {
    htmlFiles = await collectHTMLFiles(outputDir);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`[build-head-fragment] Unable to scan "${outputDir}": ${reason}`);
  }

  if (htmlFiles.length === 0) {
    throw new Error(`[build-head-fragment] No HTML files found in "${outputDir}".`);
  }

  const transformedFiles = await Promise.all(htmlFiles.map(async (filePath) => {
    const html = await readFile(filePath, "utf8");
    return {
      filePath,
      html: injectAfterHead(html, fragment, filePath),
    };
  }));

  await Promise.all(transformedFiles.map(({ filePath, html }) => writeFile(filePath, html, "utf8")));
  process.stdout.write(`[build-head-fragment] Injected "${fragmentPath}" into ${htmlFiles.length} HTML files.\n`);
}

await main();
