<h1 align="center">
  <img src="https://raw.githubusercontent.com/longnghia/read-later/main/public/icon-128.png" height="38" width="38" alt="Read Later Icon">
  Read Later
</h1>

<p align="center">
  A browser extension to efficiently manage and save tabs for later reading
</p>

<p align="center">
  <a href="https://github.com/longnghia/read-later/commits/main">
    <img src="https://img.shields.io/github/commit-activity/m/longnghia/read-later?label=Commits" alt="Commit Activity">
  </a>
  <a href="https://addons.mozilla.org/addon/read-it-later/">
    <img src="https://img.shields.io/amo/rating/read-it-later?label=Firefox" alt="Mozilla Add-on Rating">
  </a>
</p>

## ℹ️ About

This is an improved version of the original Read Later extension, featuring:

- Lighter footprint
- Enhanced user interface
- Manifest V3 support

Older versions:

- [ver 1](https://github.com/paulcoding810/MyExtensions/tree/main/ReadLater)
- [ver 2](https://github.com/paulcoding810/LExtension)
- [ver 3](https://github.com/paulcoding810/read-later-v2)

## 🚀 Features

### Tab Management

- Quick save current tab with `Ctrl + B`
- Open saved tabs in new window. `Cmd/Ctrl/Shift + Click` to also remove tab from reading list

### Group Organization

- Create and manage collections of related tabs

## 🛠️ Installation

### For Users

<a href="https://addons.mozilla.org/en-US/firefox/addon/read-it-later/">
  <img src="https://github.com/user-attachments/assets/a89c4124-119a-4147-822d-23ac1e831d18" alt="Get Read Later for Firefox">
</a>

### For Developers

Prerequisites:

- Node.js >= 14
- Yarn package manager

Setup:

```bash
# Install dependencies
yarn
```

## 💻 Development

```bash
# Start development server
yarn dev
```

## 📦 Building

```bash
# Set VITE_BROWSER=chrome in .env for Firefox build
yarn build
```

### Loading in Chrome

1. Enable Developer mode
2. Click "Load unpacked"
3. Select the `read-later/build` folder

### Loading in Firefox

1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `read-later/build` folder

---
Built with [create-chrome-ext](https://github.com/guocaoyi/create-chrome-ext)
