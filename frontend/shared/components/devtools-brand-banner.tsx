const BANNER = String.raw`
  ___  __     _____ _   _  ____    ____ _   _    _  _____
 / _ \ \ \   / /_ _| \ | |/ ___|  / ___| | | |  / \|_   _|
| | | | \ \ / / | ||  \| | |     | |   | |_| | / _ \ | |
| |_| |  \ V /  | || |\  | |___  | |___|  _  |/ ___ \| |
 \___/    \_/  |___|_| \_|\____|  \____|_| |_/_/   \_\_|
`;

const BANNER_SCRIPT = `
(() => {
  const key = "__OVINC_CHAT_DEVTOOLS_BANNER__";
  if (globalThis[key]) return;
  globalThis[key] = true;
  const banner = ${JSON.stringify(BANNER)};
  console.log("%c" + banner, "color:#111827;font-family:'JetBrains Mono',monospace;font-weight:700;line-height:1.15");
  console.log(
    "%c  %c  %c  %c  %c  %c  %c  %c  ",
    "background:#000000",
    "background:#111111",
    "background:#262626",
    "background:#404040",
    "background:#737373",
    "background:#a3a3a3",
    "background:#d4d4d4",
    "background:transparent"
  );
  console.log("%cOfficial: https://deeix.com  |  Repository: https://github.com/DEEIX-AI/DEEIX-Chat  |  License: Apache License 2.0", "color:#64748b;font-family:'JetBrains Mono',monospace");
})();
`;

export function DevtoolsBrandBanner() {
  return (
    <script
      id="ovinc-devtools-brand"
      dangerouslySetInnerHTML={{ __html: BANNER_SCRIPT }}
    />
  );
}
