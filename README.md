# 📸 Pinterest-Style Media Gallery

A clean, dark masonry grid gallery — works on GitHub Pages, no server needed.

---

## 📁 Folder Structure

```
your-repo/
├── index.html        ← The gallery page
├── media.json        ← Auto-generated file list (don't edit manually)
├── generate.bat      ← Double-click this on Windows to update media.json
├── README.md
└── media/            ← DROP YOUR IMAGES & VIDEOS HERE
    ├── photo1.jpg
    ├── photo2.png
    ├── clip1.mp4
    └── ...
```

---

## 🚀 How To Use (Every Time You Add New Files)

### Step 1 — Add your files
Drop your images and videos into the **`media/`** folder.

**Supported formats:**
- Images: `jpg`, `jpeg`, `png`, `gif`, `webp`, `avif`, `svg`
- Videos: `mp4`, `webm`, `mov`, `ogg`

### Step 2 — Run generate.bat
Double-click **`generate.bat`**

It will scan your media folder and update `media.json` automatically.
You'll see how many files were found.

### Step 3 — Push to GitHub
Use GitHub Desktop (or git) to push your changes.

Your gallery is live! ✅

---

## ✨ Features

- 5-column masonry grid (auto-height, Pinterest style)
- Responsive: 4 cols → 3 cols → 2 cols → 1 col on mobile
- Random shuffle on every page load
- Shuffle button to re-randomize
- Filter tabs: All / Images / Videos
- Hover: videos auto-play silently
- Click any item: opens fullscreen lightbox
- Press `Esc` or click outside to close lightbox

---

## ⚙️ Customization (in index.html)

Open `index.html` in any text editor and find this section near the bottom:

```js
const MEDIA_JSON = 'media.json';   // path to JSON file
const MEDIA_FOLDER = 'media/';     // your media folder name
```

If you rename your folder, update `MEDIA_FOLDER` here.

---

## ❓ Troubleshooting

| Problem | Solution |
|---|---|
| Page shows "media.json not found" | Run `generate.bat` first |
| Files not showing | Check file extension is supported |
| generate.bat shows 0 files | Make sure files are inside the `media/` folder |
| Videos not playing on GitHub Pages | Use `.mp4` format (best compatibility) |
