# OmniJS 🌟

**OmniJS 3.0.0 — 2026 CMD Edition**

A lightweight JavaScript command-line toolkit for Windows CMD, PowerShell, and other terminals.

## Requirements

- Node.js 18 or newer
- npm (included with Node.js)

Check your installation:

```cmd
node --version
npm --version
```

## Install the global `omni` command

Run this once in CMD:

```cmd
npm install -g github:mantelatomaycon-dot/omni-js
```

After installation, open a new CMD window and use `omni` from any directory. No manual `.cmd` file is needed. npm creates the command shim from this package's `bin` configuration.

If Windows says `omni` is not recognized, check that npm's global executable directory is included in your Windows `Path`. You do not need to create a launcher file yourself.

To update to the latest repository version:

```cmd
npm install -g github:mantelatomaycon-dot/omni-js
```

## Commands

| Command | What it does |
| --- | --- |
| `omni` | Open the interactive menu |
| `omni help` | Show help |
| `omni version` | Show the version |
| `omni calc "5 * (2 + 3)"` | Safely calculate arithmetic |
| `omni links "https://example.com"` | Extract unique HTTP(S) links |
| `omni images "https://example.com"` | Extract image URLs |
| `omni links page.html` | Extract links from a local HTML file |
| `omni images page.html` | Extract images from a local HTML file |
| `omni clean page.html` | Save a cleaned HTML copy |
| `omni write note.txt "Hello world"` | Create a UTF-8 text file |

## Features

- Interactive terminal menu.
- Arithmetic parser that does not use `eval()` or `Function()`.
- Link and image extraction from local HTML files or HTTP(S) pages.
- HTML cleanup saves a copy and leaves the original unchanged.
- UTF-8 text file creation.
- Built-in Node.js APIs only; no third-party runtime packages.

## Limitations

Website requests require an internet connection. Some sites block automated requests or render content with JavaScript. HTML cleanup uses simple pattern matching rather than a full HTML parser, so review the output before using it.

## License

No license file is currently specified.
