const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, 'public', 'js');

const dictionary = {
    'Nhấp để tải lên': 'Yüklemek için tıkla',
    'Cập Nhật': 'Güncelle',
    'Tên Hiện Tại': 'Mevcut İsim',
    'Tên Mới': 'Yeni İsim',
    'Xác Nhận': 'Onayla',
    'Email Hiện Tại': 'Mevcut E-posta',
    'Email Mới': 'Yeni E-posta',
    'Mật khẩu hiện tại': 'Mevcut Şifre',
    'Mật Khẩu Mới': 'Yeni Şifre',
    'Xác Nhận Mật Khẩu': 'Şifreyi Onayla',
    'Thay Đổi': 'Değiştir',
    'Cắt Ảnh Của Bạn': 'Fotoğrafını Kırp',
    'Cắt Ảnh': 'Fotoğrafı Kırp',
    'Tên Hiển Thị': 'Görünen Ad',
    'Email Đăng Ký': 'Kayıtlı E-posta',
    'Đổi Mật Khẩu': 'Şifre Değiştir',
    'Dấu trang': 'Yer İmleri',
    'Lịch sử': 'Geçmiş',
    'Cài đặt': 'Ayarlar',
    'Đang đọc': 'Okunuyor',
    'Hoàn thành': 'Tamamlandı',
    'Tạm ngưng': 'Durduruldu',
    'Vứt bỏ': 'Bırakıldı',
    'Tất cả': 'Tümü',
    'Xoá tất cả': 'Tümünü sil',
    'xoá': 'sil',
    'Xoá': 'Sil',
    'Lưu': 'Kaydet',
    'Huỷ': 'İptal',
    'không có truyện nào': 'roman veya manga yok',
    'Đang Đọc': 'Okunuyor',
    'Đăng Nhập': 'Giriş Yap',
    'Đăng Ký': 'Kayıt Ol',
    'Tên tài khoản': 'Kullanıcı Adı',
    'Mật khẩu': 'Şifre',
    'Quên Mật Khẩu?': 'Şifremi Unuttum?'
};

function translateFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            translateFiles(filePath);
        } else if (file.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;
            for (const [vi, tr] of Object.entries(dictionary)) {
                if (content.includes(vi)) {
                    content = content.split(vi).join(tr);
                    modified = true;
                }
            }
            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Translated strings in ${file}`);
            }
        }
    }
}

translateFiles(jsDir);
console.log('Done!');
