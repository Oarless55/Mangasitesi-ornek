const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, 'public', 'js');

const dict = {
    'Mật Khẩu *': 'Şifre *',
    'Mật Khẩu': 'Şifre',
    'Mật khẩu *': 'Şifre *',
    'Mật khẩu': 'Şifre',
    'Quay Lại': 'Geri Dön',
    'Quay lại': 'Geri Dön',
    'XEM THÊM': 'DAHA FAZLA GÖSTER',
    'Xem Thêm': 'Daha Fazla Göster',
    'Xem thêm': 'Daha Fazla Göster',
    'xem thêm': 'daha fazla göster'
};

function fixTranslations(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            fixTranslations(filePath);
        } else if (file.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;
            for (const [vi, tr] of Object.entries(dict)) {
                if (content.includes(vi)) {
                    content = content.split(vi).join(tr);
                    modified = true;
                }
            }
            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Fixed translations in ${file}`);
            }
        }
    }
}

fixTranslations(jsDir);
console.log('Fix complete!');
