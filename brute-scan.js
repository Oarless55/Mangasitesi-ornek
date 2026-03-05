const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const searchStrings = ['CÓ THỂ BẠN CŨNG THÍCH', 'CŨNG THÍCH', 'Thg', 'thg', 'CÓ THỂ BẠN', 'có thể bạn cũng thích', 'thích'];

function walkSync(dir, filelist = []) {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file === 'node_modules' || file === '.git' || file === 'mongo_extracted' || file === 'mongodb' || file === 'mongodb_data') return;
            filelist = walkSync(filePath, filelist);
        } else {
            filelist.push(filePath);
        }
    });
    return filelist;
}

const allFiles = walkSync(rootDir);
let found = false;

allFiles.forEach(file => {
    if (file.endsWith('.zip') || file.endsWith('.png') || file.endsWith('.jpg')) return;

    try {
        const content = fs.readFileSync(file, 'utf8');
        searchStrings.forEach(str => {
            if (content.toLowerCase().includes(str.toLowerCase())) {
                console.log(`[MATCH] Found "${str}" in: ${file.replace(rootDir, '')}`);
                found = true;
            }
        });
    } catch (e) {
        // Ignore binary read errors
    }
});

if (!found) {
    console.log("No strings found across entire directory tree.");
}
