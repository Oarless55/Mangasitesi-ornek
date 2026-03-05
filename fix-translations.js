const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, 'public', 'js');

function fixTranslations(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            fixTranslations(filePath);
        } else if (file.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('Onayla Mật Khẩu')) {
                content = content.split('Onayla Mật Khẩu').join('Şifreyi Onayla');
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Fixed translation in ${file}`);
            }
        }
    }
}

fixTranslations(jsDir);
console.log('Fix complete!');
