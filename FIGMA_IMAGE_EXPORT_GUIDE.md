# How to Export Images from Figma

## Step-by-Step Guide:

### 1. **Open Your Figma Design**
   - Go to: https://www.figma.com/design/74GwFF7vVU7zLsULJ2Xbqk/Ecom

### 2. **Select the Banner Image**
   - Click on the banner/carousel image in the Home screen
   - You should see 3 banner images with vegetables

### 3. **Export Settings** (Right Panel)
   - Look for the "Export" section in the right panel
   - Click the **"+"** button to add export settings
   - Choose format: **PNG** (recommended for images with transparency)
   - Set resolution: **2x** or **3x** for high-quality mobile displays
   
### 4. **Export Each Banner**
   - Export Banner 1 → Save as `banner1.png`
   - Export Banner 2 → Save as `banner2.png`
   - Export Banner 3 → Save as `banner3.png`

### 5. **Place in Project**
   - Move the exported images to:
     ```
     shopping-app/assets/
     ```
   - Your file structure should look like:
     ```
     assets/
     ├── banner1.png
     ├── banner2.png
     └── banner3.png
     ```

### 6. **Alternative: Bulk Export**
   - Select all 3 banners (hold Shift and click each)
   - Click "Export" and choose folder
   - Rename files as needed

---

## 🚨 Important Notes:

1. **File Names**: Must be exactly `banner1.png`, `banner2.png`, `banner3.png`
2. **Location**: Must be in `assets/` folder (not `assets/images/`)
3. **Format**: PNG is recommended for best quality
4. **Size**: Figma exports at selected resolution (2x or 3x)
5. **Don't compress**: Keep original quality for best results

---

## ⚡ Quick Tip:
If you can't export from Figma (view-only access), you can:
1. Take screenshots of each banner
2. Crop them to remove extra space
3. Save as PNG files with correct names
4. Place in `assets/` folder

---

## 🎯 Current Status:
The code is ready and will automatically load these images when you place them in the assets folder.

If the images are not showing, check:
- File names are correct (case-sensitive)
- Files are in `assets/` folder
- Files are PNG format
- Run `npx expo start --clear` to clear cache
