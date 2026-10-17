import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cardsDir = path.resolve(__dirname, '../public/cards');
const thumbsDir = path.resolve(cardsDir, 'thumbs');

if (!fs.existsSync(thumbsDir)) {
  fs.mkdirSync(thumbsDir, { recursive: true });
}

async function generateThumbnails() {
  console.log('Generating high-performance thumbnails for TCG cards...');
  const files = fs.readdirSync(cardsDir);
  let totalOrigBytes = 0;
  let totalThumbBytes = 0;
  let processedCount = 0;

  for (const file of files) {
    const filePath = path.join(cardsDir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) continue;

    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

    const baseName = path.parse(file).name;
    const outWebp = path.join(thumbsDir, `${baseName}.webp`);
    const outOriginalExt = path.join(thumbsDir, file);

    totalOrigBytes += stat.size;

    // Generate WebP thumbnail: width 360px, aspect 728/1024 -> ~506px
    await sharp(filePath)
      .resize({ width: 360, height: 506, fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toFile(outWebp);

    // Also generate original format thumbnail as fallback
    if (ext === '.jpeg' || ext === '.jpg') {
      await sharp(filePath)
        .resize({ width: 360, height: 506, fit: 'cover', withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(outOriginalExt);
    } else if (ext === '.png') {
      await sharp(filePath)
        .resize({ width: 360, height: 506, fit: 'cover', withoutEnlargement: true })
        .png({ quality: 80, compressionLevel: 8 })
        .toFile(outOriginalExt);
    }

    const thumbStat = fs.statSync(outWebp);
    totalThumbBytes += thumbStat.size;
    processedCount++;

    const savedPercent = ((1 - thumbStat.size / stat.size) * 100).toFixed(1);
    console.log(
      `✓ [${processedCount}] ${file}: ${(stat.size / 1024 / 1024).toFixed(2)} MB -> ${(thumbStat.size / 1024).toFixed(1)} KB (-${savedPercent}%)`
    );
  }

  console.log('\n=======================================');
  console.log(`Processed ${processedCount} cards.`);
  console.log(`Original total: ${(totalOrigBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Thumbnails total: ${(totalThumbBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total bandwidth saved: -${((1 - totalThumbBytes / totalOrigBytes) * 100).toFixed(1)}%`);
  console.log('=======================================\n');
}

generateThumbnails().catch((err) => {
  console.error('Error generating thumbnails:', err);
  process.exit(1);
});
