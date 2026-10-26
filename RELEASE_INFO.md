# RELEASE INFORMATION & PUBLISHING GUIDE
## ELEMENTAL LEGENDS: THE CURSE OF THE HOLLOW REALM
### Version 1.0.0 — Final Master Release

---

## 1. Release Metadata

- **Game Title**: Elemental Legends: The Curse of the Hollow Realm
- **Version**: `1.0.0` (Level 5 Final Release)
- **Target Platform**: Desktop Web Browsers (HTML5 / WebGL)
- **Engine**: Three.js (r162.0) + Vite (5.1.6)
- **Build Output Directory**: `dist/`
- **Distributable Package**: `release/elemental-legends-v1.0.0-html5.zip` (1.09 MB)
- **Source Code Repository**: [https://github.com/viswaksakthivel5/elemental-legends](https://github.com/viswaksakthivel5/elemental-legends)

---

## 2. Publishing Guide: itch.io (Recommended Free HTML5 Host)

The standalone ZIP archive `release/elemental-legends-v1.0.0-html5.zip` has been formatted specifically according to the official [itch.io HTML5 Game Specification](https://itch.io/docs/creators/html5), with `index.html` located at the root of the archive and all asset paths configured relatively (`base: './'`).

### Step-by-Step itch.io Upload Instructions:
1. Log in to your account at [itch.io](https://itch.io/) (or create a free account).
2. Click your profile icon in the upper-right corner and select **Create new game**.
3. Fill in the Project Details:
   - **Title**: `Elemental Legends: The Curse of the Hollow Realm`
   - **Short description / Tagline**: `A multi-level dark fantasy 3D action-adventure featuring elemental combat, Echo Vision exploration, and epic boss battles.`
   - **Classification**: `Games`
   - **Kind of project**: Select **HTML** (*You have a ZIP or HTML file that will be played in the browser*).
4. Upload the Distributable Package:
   - In the **Uploads** section, click **Upload files**.
   - Select the file: `release/elemental-legends-v1.0.0-html5.zip` from your project folder.
   - Once uploaded, check the checkbox: **This file will be played in the browser**.
5. Configure Embed Options:
   - **Viewport dimensions**: Set **1280** px width by **720** px height.
   - **Orientation**: Default (Landscape).
   - Check the checkbox: **Automatically start on page load**.
   - Check the checkbox: **Fullscreen button** (*Allows players to play in true fullscreen*).
   - Check the checkbox: **Enable scrollbars** (optional, leave unchecked).
6. Upload Cover Image & Screenshots:
   - **Cover image**: Upload `screenshots/gameplay_banner.jpg` (or `public/elemental_legends_banner.jpg`).
   - **Screenshots**: Upload gameplay banners from the `screenshots/` directory.
7. Description & Details:
   - Paste the gameplay overview, controls table, and story from `README.md`.
8. Visibility:
   - Set visibility to **Public** (or **Restricted** with password if previewing).
   - Click **Save & view page**.
9. Test the live playable game directly in your browser!

---

## 3. Alternative Publishing Guide: GitHub Pages

You can also host the game directly on GitHub for free via GitHub Pages:

### Method A: Deploy via `gh-pages` Branch
Run the following commands in the project folder:
```bash
# 1. Build the production release
npm run build

# 2. Push the dist directory to gh-pages branch
git subtree push --prefix dist origin gh-pages
```
Then in GitHub repository settings:
- Navigate to **Settings** > **Pages**.
- Set **Source** to `Deploy from a branch`.
- Select branch `gh-pages` / `/ (root)`.
- Your game will be live at: `https://viswaksakthivel5.github.io/elemental-legends/`

---

## 4. Local Offline Play & Verification

To run or demonstrate the compiled production release locally without Vite development mode:
```bash
# Option 1: Using Vite Preview
npm run preview

# Option 2: Using npx serve on the dist directory
npx serve dist
```
Navigate to the displayed local port (e.g. `http://localhost:4173/` or `http://localhost:3000/`) to test the compiled release build.

---

## 5. System Requirements

- **Minimum Hardware**: Modern dual-core CPU, 4 GB RAM, integrated graphics (Intel HD 5000 / AMD Radeon Vega or better).
- **Recommended Hardware**: Quad-core CPU, 8 GB RAM, dedicated GPU (Nvidia GeForce GTX 1050 / AMD Radeon RX 560 or higher).
- **Supported Web Browsers**:
  - Google Chrome (v90+)
  - Microsoft Edge (v90+)
  - Mozilla Firefox (v88+)
  - Brave / Opera / Vivaldi
  - Safari (v15+ on macOS)
- **Input Devices**: Keyboard and Mouse (Mouse orbit look with pointer lock, WASD movement).
