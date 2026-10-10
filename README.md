# OmniJS 🌟

**OmniJS 3.0.0 — 2026 CMD Edition**

A lightweight JavaScript utility toolkit that runs in the Windows Command Prompt (CMD) using Node.js. It also supports direct commands and an interactive terminal menu.

## Requirements

- Node.js 24 LTS or newer
- Windows CMD, PowerShell, or another terminal
- No third-party npm packages

Check your Node.js installation:

\`\`\`cmd
node --version
\`\`\`

## Quick start

Download \`omni.js\` from this repository, open CMD in the folder where you saved it, and run:

\`\`\`cmd
node omni.js
\`\`\`

Type \`help\` to see the available commands, or \`exit\` to close OmniJS.

## Commands

| Command | What it does |
| --- | --- |
| \`node omni.js help\` | Show help |
| \`node omni.js calc "5 * (2 + 3)"\` | Calculate arithmetic safely |
| \`node omni.js links "https://example.com"\` | Extract unique HTTP(S) links from a webpage |
| \`node omni.js images "https://example.com"\` | Extract image URLs from a webpage |
| \`node omni.js links page.html\` | Extract links from a local HTML file |
| \`node omni.js images page.html\` | Extract images from a local HTML file |
| \`node omni.js clean page.html\` | Save a cleaned copy as \`page.cleaned.html\` |
| \`node omni.js write note.txt "Hello world"\` | Create a UTF-8 text file |

You can also run these commands from the interactive \`OmniJS>\` prompt without typing \`node omni.js\` each time.

## Features

- **Interactive CMD menu** with readable errors and command help.
- **Safe arithmetic parser** for numbers, parentheses, addition, subtraction, multiplication, division, modulo, and exponentiation. It does not use \`eval()\` or \`Function()\`.
- **Link and image extraction** from local HTML files or HTTP(S) pages, with duplicate removal and relative URL resolution for online pages.
- **HTML cleanup copy** that looks for common ad, sponsor, cookie-banner, and modal naming patterns without overwriting the original file.
- **Text file creation** using UTF-8 encoding.
- **Built-in Node.js APIs only**; no npm install step is needed.

## Notes and limitations

- Fetching a website requires an internet connection. Some websites block automated requests or render their content with JavaScript, so not every link or image will be present in the returned HTML.
- HTML cleanup uses simple pattern matching, not a full HTML parser. Review the generated copy before using it; it may miss some elements or remove an unexpected match.
- The calculator accepts arithmetic expressions only, not JavaScript code or named functions.
- Use quotes around URLs, file paths, or text that contains spaces when entering commands in CMD.

## License

No license file is currently specified. Add a license before presenting OmniJS as an open-source project for reuse by others.
