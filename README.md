[![Badge Commits]][Commit Rate]
[![Badge Issues]][Issues]
[![Badge License]][License]
[![Badge Mozilla]][Mozilla]
[![Badge Chrome]][Chrome]

---

<h1 align="center">
<sub>
<img src="public/img/logo-48.png" height="38" width="38">
</sub>
Read Later
</h1>

---

<p align="center">
<a href="https://addons.mozilla.org/addon/read-it-later/"><img src="https://user-images.githubusercontent.com/585534/107280546-7b9b2a00-6a26-11eb-8f9f-f95932f4bfec.png" alt="Get Read Later for Firefox"></a>
<a href="https://chromewebstore.google.com/detail/read-later/cbkpffbpdnkdlfdaoeakdelhmakefomb"><img src="https://user-images.githubusercontent.com/585534/107280622-91a8ea80-6a26-11eb-8d07-77c548b28665.png" alt="Get Read Later for Chromium"></a>
</p>

---

Read Later is a browser extension to efficiently manage and save tabs for later reading

---

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

Prerequisites:

- Node.js >= 14
- Yarn package manager

Setup:

```bash
# Install dependencies
yarn
```

### 💻 Development (Chrome)

```bash
# Start development server
yarn dev
```

### 🏗️ Building

```bash
yarn build # for Chrome extension
yarn build:firefox # for Firefox add-on
```

### 📦 Packing

To create a zip file for distribution, run:

```bash
yarn zip # for chrome
yarn zip:firefox # for firefox
```

### Loading in Chrome

1. Enable Developer mode
2. Click "Load unpacked"
3. Select the `build` folder

### Loading in Firefox

1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `build` folder

---

Built with [create-chrome-ext](https://github.com/guocaoyi/create-chrome-ext)

<!----------------------------------[ Badges ]--------------------------------->

[Mozilla]: https://addons.mozilla.org/addon/read-it-later/
[Chrome]: https://chromewebstore.google.com/detail/read-later/cbkpffbpdnkdlfdaoeakdelhmakefomb
[License]: LICENSE.txt
[Commit Rate]: https://github.com/paulcoding810/read-later-v3/commits/main
[Issues]: https://github.com/paulcoding810/read-later-v3/issues
[Badge Commits]: https://img.shields.io/github/commit-activity/m/paulcoding810/read-later-v3?label=Commits
[Badge Mozilla]: https://img.shields.io/amo/v/read-it-later
[Badge Chrome]: https://img.shields.io/chrome-web-store/v/cbkpffbpdnkdlfdaoeakdelhmakefomb
[Badge License]: https://img.shields.io/badge/License-MIT-blue.svg
[Badge Issues]: https://img.shields.io/github/issues/paulcoding810/read-later-v3/issues
