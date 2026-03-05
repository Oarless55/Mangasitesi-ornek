const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'public', 'js', 'app.min.js');

let content = fs.readFileSync(targetFile, 'utf8');

const replacements = {
    'CÓ THỂ BẠN CŨNG THÍCH': 'BUNLARI DA BEĞENEBİLİRSİNİZ',
    '"Thg "': '"Ağu "', // Using "Ağu" (for August) or abbreviated month format generically if just checking spacing. We should replace the momment formatting.
    "Thg ": "Ağu " // Usually 'Thg ' handles Moment.js abbreviated months.
};

let modified = false;

// We need to be careful with 'Thg'. It's used as 'Thg 03 2026' in the screenshot. 
// It's probably part of a moment formatting string, or a hardcoded translation in a moment.js locale included in the bundle.
// Let's replace 'Thg ' with '' or a standard Turkish localized date approach if possible, but for a quick fix, replacing the literal string.

if (content.includes('CÓ THỂ BẠN CŨNG THÍCH')) {
    content = content.split('CÓ THỂ BẠN CŨNG THÍCH').join('BUNLARI DA BEĞENEBİLİRSİNİZ');
    modified = true;
}

if (content.includes('CÓ THỂ BẠN CŨNG THÍCH:')) {
    content = content.split('CÓ THỂ BẠN CŨNG THÍCH:').join('BUNLARI DA BEĞENEBİLİRSİNİZ:');
    modified = true;
}

// In the screenshot, the date is "5 Thg 03 2026" and "4 Thg 03 2026". "Thg" is abbreviation for "Tháng" (Month).
// In Turkish, dates are usually "5 Mar 2026" or "5 Mart 2026".
// Let's just remove " Thg" or replace with "" or " " or try to see how it's placed.
if (content.includes(' Thg ')) {
    content = content.split(' Thg ').join(' '); // "4 03 2026" instead of "4 Thg 03 2026"
    modified = true;
}
if (content.includes(' Thg')) {
    content = content.split(' Thg').join(''); // "4 03 2026"
    modified = true;
}
if (content.includes('Thg ')) {
    content = content.split('Thg ').join('');
    modified = true;
}


if (modified) {
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log(`Replaced strings in ${targetFile}`);
} else {
    console.log('No matches found for replacement.');
}
