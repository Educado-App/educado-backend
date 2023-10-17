const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

function transcode(inputPath, baseOutputPath, sizes, format = 'mp4') {
    return new Promise((resolve, reject) => {
        const command = ffmpeg(inputPath);

        for (let size of sizes) {
            const ext = path.extname(baseOutputPath);
            const nameWithoutExt = path.basename(baseOutputPath, ext);
            const dir = path.dirname(baseOutputPath);
            const outputFilename = `${nameWithoutExt}_transcoded${size.width}x${size.height}${ext}`;
            const outputPath = path.join(dir, outputFilename);

            command.output(outputPath)
                .outputOptions([
                    `-vf scale=${size.width}:${size.height}`, 
                    '-strict', 
                    '-2'
                ])
                .toFormat(format);
            
            console.log(`Transcoding ${inputPath} to ${outputPath}`);
        }

        command.on('end', resolve)
            .on('error', reject)
            .run();
    });
}

module.exports = {
    transcode
};