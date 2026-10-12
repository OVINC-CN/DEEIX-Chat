import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";

const fixturesKey = Symbol.for("deeix-web-test-fixtures");
globalThis[fixturesKey] ??= new Map();

/** Run a real TypeScript module with supplied I/O boundaries, without a server. */
export async function loadTypeScriptFixture(relativePath, dependencies = {}) {
  const id = randomUUID();
  const fixtures = globalThis[fixturesKey];
  fixtures.set(id, dependencies);
  try {
    const source = await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
    let code = stripTypeScriptTypes(source, { mode: "transform", sourceUrl: relativePath });
    for (const [specifier, dependency] of Object.entries(dependencies)) {
      const access = `globalThis[Symbol.for("deeix-web-test-fixtures")].get(${JSON.stringify(id)})[${JSON.stringify(specifier)}]`;
      const exports = Object.keys(dependency).map((name) =>
        `export const ${name} = ${access}[${JSON.stringify(name)}];`,
      ).join("\n");
      const url = `data:text/javascript;base64,${Buffer.from(exports).toString("base64")}`;
      code = code.replaceAll(JSON.stringify(specifier), JSON.stringify(url));
    }
    return await import(`data:text/javascript;base64,${Buffer.from(`${code}\n// ${id}`).toString("base64")}`);
  } finally {
    fixtures.delete(id);
  }
}
