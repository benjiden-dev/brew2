
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourcePath = path.join(process.cwd(), 'public', 'fav2.png');
const publicDir = path.join(process.cwd(), 'public');

async function generate() {
    console.log('Generating icons from', sourcePath);

    // 192x192
    await sharp(sourcePath)
        .resize(192, 192)
        .png()
        .toFile(path.join(publicDir, 'pwa-192x192.png'));

    // 512x512
    await sharp(sourcePath)
        .resize(512, 512)
        .png()
        .toFile(path.join(publicDir, 'pwa-512x512.png'));

    // Favicon
    await sharp(sourcePath)
        .resize(64, 64)
        .png()
        .toFile(path.join(publicDir, 'favicon.png'));

    // Apple Touch Icon (180x180)
    await sharp(sourcePath)
        .resize(180, 180)
        .png()
        .toFile(path.join(publicDir, 'apple-touch-icon.png'));

    console.log('Icons generated!');
}

generate().catch(console.error);
