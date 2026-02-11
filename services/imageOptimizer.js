const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

function resolveOutputFormat() {
    const raw = (process.env.IMAGE_OUTPUT_FORMAT || 'webp').toLowerCase();
    return raw === 'avif' ? 'avif' : 'webp';
}

async function optimizeUploadedImage(file, options = {}) {
    if (!file || !file.path || !file.mimetype || !file.mimetype.startsWith('image/')) {
        return file;
    }

    const format = options.format || resolveOutputFormat();
    const quality = Number(options.quality || 82);
    const maxWidth = Number(options.maxWidth || 2200);
    const parsed = path.parse(file.path);
    const outputPath = path.join(parsed.dir, `${parsed.name}.${format}`);

    try {
        let pipeline = sharp(file.path).rotate();
        if (maxWidth > 0) {
            pipeline = pipeline.resize({
                width: maxWidth,
                fit: 'inside',
                withoutEnlargement: true
            });
        }
        pipeline = format === 'avif'
            ? pipeline.avif({ quality })
            : pipeline.webp({ quality });

        await pipeline.toFile(outputPath);

        if (outputPath !== file.path && fs.existsSync(file.path)) {
            await fsp.unlink(file.path);
        }

        const stat = await fsp.stat(outputPath);
        file.path = outputPath;
        file.filename = path.basename(outputPath);
        file.mimetype = format === 'avif' ? 'image/avif' : 'image/webp';
        file.size = stat.size;
        return file;
    } catch (error) {
        console.warn('Image optimization skipped:', error.message);
        return file;
    }
}

module.exports = {
    optimizeUploadedImage
};
