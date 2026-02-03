
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.join(process.cwd(), 'public', 'icon.svg');
const publicDir = path.join(process.cwd(), 'public');

async function generate() {
    console.log('Generating icons from', svgPath);

    // 192x192
    await sharp(svgPath)
        .resize(192, 192)
        .png()
        .toFile(path.join(publicDir, 'pwa-192x192.png'));

    // 512x512
    await sharp(svgPath)
        .resize(512, 512)
        .png()
        .toFile(path.join(publicDir, 'pwa-512x512.png'));

    // Favicon (32x32?) or just keep svg. 
    // Let's make an ico just in case? No, modern browsers use SVG or PNG.
    // Let's make a 64x64 PNG for good measure.
    await sharp(svgPath)
        .resize(64, 64)
        .png()
        .toFile(path.join(publicDir, 'favicon.png'));

    console.log('Icons generated!');
}

generate().catch(console.error);
