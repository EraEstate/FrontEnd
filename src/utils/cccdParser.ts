/**
 * Parser chuyên dụng cho CCCD (Căn Cước Công Dân) Việt Nam
 * Hỗ trợ cả CCCD gắn chip (mẫu mới 2021+) và CMND 9 số (mẫu cũ)
 * 
 * Layout CCCD mặt trước (mẫu mới):
 *   CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
 *   CĂN CƯỚC CÔNG DÂN / CITIZEN IDENTITY CARD
 *   Số / No.: 0xxxxxxxxxx (12 số)
 *   Họ và tên / Full name: NGUYỄN VĂN A
 *   Ngày sinh / Date of birth: 01/01/1990    Giới tính / Sex: Nam/Male
 *   Quốc tịch / Nationality: Việt Nam
 *   Quê quán / Place of origin: xã X, huyện Y, tỉnh Z
 *   Nơi thường trú / Place of residence: ...
 *   Có giá trị đến / Date of expiry: 01/01/2030
 */

export interface CccdParsedData {
  cccdNumber: string;
  fullName: string;
  dateOfBirth: string; // yyyy-MM-dd
  gender: string;
  nationality: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  expiryDate: string; // yyyy-MM-dd
}

// ─── Helpers ───

/**
 * Normalize OCR text: xóa ký tự nhiễu, chuẩn hóa khoảng trắng,
 * fix lỗi OCR phổ biến với tiếng Việt
 */
function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[|{}[\]]/g, '')        // Bỏ ký tự nhiễu
    .replace(/[""'']/g, '')          // Bỏ dấu ngoặc kép kiểu Unicode
    .replace(/\t/g, ' ')             // Tab → space
    .replace(/ {2,}/g, ' ')          // Nhiều space → 1 space
    // Fix lỗi OCR tiếng Việt phổ biến
    .replace(/0Ộ/g, 'Ộ')
    .replace(/1ện/g, 'iện')
    .replace(/\bCÃN\b/gi, 'CĂN')
    .replace(/\bCUÖC\b/gi, 'CƯỚC')
    .replace(/\bCÔNG\s*DAN\b/gi, 'CÔNG DÂN')
    .replace(/\bNGÀY\s*S1NH\b/gi, 'NGÀY SINH')
    .replace(/\bGl[OỚ]l/gi, 'GIỚI')
    .replace(/\bTÍNH\b/gi, 'TÍNH')
    .replace(/\bQU[ÊE]\s*QU[ÂA]N\b/gi, 'QUÊ QUÁN')
    .replace(/\bTHU[ÒƠ]NG\s*TR[UÚ]\b/gi, 'THƯỜNG TRÚ')
    .trim();
}

/**
 * Parse ngày tháng từ nhiều format trên CCCD VN
 * Hỗ trợ: dd/MM/yyyy, dd-MM-yyyy, dd.MM.yyyy, ddMMyyyy
 */
function parseDate(dateStr: string): string {
  if (!dateStr) return '';

  // Format chuẩn: dd/MM/yyyy hoặc dd-MM-yyyy hoặc dd.MM.yyyy
  const match = dateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    // Validate cơ bản
    const d = parseInt(day), m = parseInt(month), y = parseInt(year);
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
      return `${year}-${month}-${day}`;
    }
  }

  // Format liền: ddMMyyyy (OCR đôi khi bỏ dấu /)
  const compact = dateStr.match(/(\d{2})(\d{2})(\d{4})/);
  if (compact) {
    const day = compact[1], month = compact[2], year = compact[3];
    const d = parseInt(day), m = parseInt(month), y = parseInt(year);
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
      return `${year}-${month}-${day}`;
    }
  }

  return '';
}

// ─── Extractors cho từng field trên CCCD VN ───

/**
 * Tìm số CCCD (12 chữ số) hoặc CMND cũ (9 chữ số)
 * CCCD gắn chip: bắt đầu bằng 0, tổng 12 số
 * Mã tỉnh (3 số đầu): 001-096
 * Giới tính + thế kỷ sinh (1 số): 0-9
 * Năm sinh (2 số) + 6 số random
 */
function extractCccdNumber(text: string): string {
  // Ưu tiên: Tìm gần label "Số" / "No" / "Số CCCD"
  const labelMatch = text.match(/(?:s[oố]|no\.?)\s*[:\s]*(\d{12})/i);
  if (labelMatch) return labelMatch[1];

  // CCCD mới: chuỗi đúng 12 chữ số, bắt đầu bằng 0
  const cccdMatch = text.match(/\b(0\d{11})\b/);
  if (cccdMatch) return cccdMatch[1];

  // CCCD mới: bất kỳ 12 chữ số
  const twelveDigit = text.match(/\b(\d{12})\b/);
  if (twelveDigit) return twelveDigit[1];

  // CMND cũ: 9 chữ số
  const cmndMatch = text.match(/\b(\d{9})\b/);
  if (cmndMatch) return cmndMatch[1];

  return '';
}

/**
 * Tìm họ tên trên CCCD VN
 * Label: "Họ và tên" / "Họ tên" / "Full name"
 * Tên VN: toàn chữ HOA, có dấu, tối thiểu 2 từ
 */
function extractFullName(text: string): string {
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Tìm label "Họ và tên" / "Họ tên" / "Full name"
    if (/h[oọ]\s*(v[aà])?\s*t[eê]n|full\s*name/i.test(line)) {
      // Trường hợp 1: Tên cùng dòng sau dấu ":"
      const afterColon = line.replace(/.*(?:h[oọ]\s*(?:v[aà])?\s*t[eê]n|full\s*name)\s*[:\s]*/i, '').trim();
      if (afterColon && afterColon.length > 2 && /[A-ZÀ-Ỹ]/.test(afterColon) && !/^\d/.test(afterColon)) {
        return cleanName(afterColon);
      }
      // Trường hợp 2: Tên nằm ở dòng kế tiếp
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine && nextLine.length > 2 && /[A-ZÀ-Ỹ]/.test(nextLine) && !/^\d/.test(nextLine) && !/ng[aà]y|date|sinh|sex|gi[oớ]i/i.test(nextLine)) {
          return cleanName(nextLine);
        }
      }
    }
  }

  // Fallback: tìm dòng chữ HOA toàn bộ (tên VN) dài 4+ ký tự, có ít nhất 2 từ
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length >= 4 && /^[A-ZÀ-Ỹ\s]+$/.test(trimmed) && trimmed.split(/\s+/).length >= 2) {
      // Loại trừ các header cố định
      if (/C[ÔO]NG\s*H[OÒ]A|CH[UỦ]\s*NGH[IĨ]A|C[ĂA]N\s*C[UƯ][ÔỚ]C|CITIZEN|IDENTITY|CARD/i.test(trimmed)) continue;
      return cleanName(trimmed);
    }
  }

  return '';
}

function cleanName(name: string): string {
  return name
    .replace(/[^A-ZÀ-Ỹa-zà-ỹ\s]/g, '') // Chỉ giữ chữ + khoảng trắng
    .replace(/\s{2,}/g, ' ')
    .trim()
    .toUpperCase();
}

/**
 * Tìm ngày sinh
 * Label VN: "Ngày sinh" / "Ngày, tháng, năm sinh"
 * Label EN: "Date of birth"
 */
function extractDateOfBirth(text: string): string {
  // "Ngày sinh" / "Ngày, tháng, năm sinh" / "Date of birth"
  const patterns = [
    /(?:ng[aà]y[\s,]*(?:th[aá]ng[\s,]*n[aă]m[\s,]*)?sinh|date\s*of\s*birth)\s*[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    /sinh\s*ng[aà]y\s*[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    // OCR đôi khi nhận "Ngay sinh" (thiếu dấu)
    /ngay\s*sinh\s*[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseDate(match[1]);
  }

  return '';
}

/**
 * Tìm giới tính
 * CCCD VN: "Giới tính" / "Sex" → Nam/Male, Nữ/Female
 */
function extractGender(text: string): string {
  // Tìm gần label "Giới tính" / "Sex"
  const genderSection = text.match(/(?:gi[oớ]i\s*t[ií]nh|sex)\s*[:\s]*([^\n]{1,20})/i);
  if (genderSection) {
    const val = genderSection[1].trim().toLowerCase();
    if (/^n[uữ]|female/i.test(val)) return 'Nữ';
    if (/^nam|male/i.test(val)) return 'Nam';
  }

  // Fallback: keyword anywhere
  if (/\bNữ\b/.test(text) || /\bFemale\b/i.test(text)) return 'Nữ';
  if (/\bNam\b/.test(text) || /\bMale\b/i.test(text)) return 'Nam';

  return '';
}

/**
 * Tìm quốc tịch
 * CCCD VN luôn ghi "Việt Nam" / "Vietnamese"
 */
function extractNationality(text: string): string {
  const match = text.match(/(?:qu[oố]c\s*t[iị]ch|nationality)\s*[:\s]*([^\n,]{2,30})/i);
  if (match) {
    const val = match[1].trim();
    // Fix OCR errors cho "Việt Nam"
    if (/vi[eệ]t\s*nam|vietnamese/i.test(val)) return 'Việt Nam';
    return val;
  }
  return 'Việt Nam'; // Default cho CCCD VN
}

/**
 * Tìm quê quán
 * Label: "Quê quán" / "Place of origin"
 * Thường có format: xã/phường X, huyện/quận Y, tỉnh/TP Z
 */
function extractPlaceOfOrigin(text: string): string {
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/qu[eê]\s*qu[aá]n|place\s*of\s*origin/i.test(line)) {
      // Cùng dòng
      const afterLabel = line.replace(/.*(?:qu[eê]\s*qu[aá]n|place\s*of\s*origin)\s*[:\s]*/i, '').trim();
      if (afterLabel && afterLabel.length > 3) return afterLabel;
      // Dòng kế
      if (i + 1 < lines.length) {
        const next = lines[i + 1].trim();
        if (next && next.length > 3 && !/n[oơ]i\s*th|place\s*of\s*res|th[uư][oờ]ng/i.test(next)) {
          return next;
        }
      }
    }
  }
  return '';
}

/**
 * Tìm nơi thường trú
 * Label: "Nơi thường trú" / "Place of residence"
 * Địa chỉ đầy đủ VN: số nhà, đường, phường/xã, quận/huyện, tỉnh/TP
 */
function extractPlaceOfResidence(text: string): string {
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/n[oơ]i\s*th[uư][oờ]ng\s*tr[uú]|place\s*of\s*residen/i.test(line)) {
      const afterLabel = line.replace(/.*(?:n[oơ]i\s*th[uư][oờ]ng\s*tr[uú]|place\s*of\s*residen\w*)\s*[:\s]*/i, '').trim();
      if (afterLabel && afterLabel.length > 3) return afterLabel;
      if (i + 1 < lines.length) {
        const next = lines[i + 1].trim();
        // Nơi thường trú có thể dài 2 dòng
        let result = next;
        if (i + 2 < lines.length) {
          const next2 = lines[i + 2].trim();
          if (next2 && !/c[oó]\s*gi[aá]\s*tr[iị]|valid|expiry|h[eế]t\s*h[aạ]n|đ[aặ]c\s*đi[eể]m/i.test(next2) && next2.length > 3) {
            result += ', ' + next2;
          }
        }
        if (result && result.length > 3) return result;
      }
    }
  }

  // Fallback: "Địa chỉ"
  for (let i = 0; i < lines.length; i++) {
    if (/[đd][iị]a\s*ch[iỉ]/i.test(lines[i])) {
      const afterLabel = lines[i].replace(/.*[đd][iị]a\s*ch[iỉ]\s*[:\s]*/i, '').trim();
      if (afterLabel && afterLabel.length > 3) return afterLabel;
      if (i + 1 < lines.length) return lines[i + 1].trim();
    }
  }

  return '';
}

/**
 * Tìm ngày hết hạn / Có giá trị đến
 * Label VN: "Có giá trị đến" / "Hết hạn"
 * Label EN: "Date of expiry" / "Valid until"
 */
function extractExpiryDate(text: string): string {
  const patterns = [
    /(?:c[oó]\s*gi[aá]\s*tr[iị]\s*[đd][eế]n|date\s*of\s*expiry|valid\s*until|h[eế]t\s*h[aạ]n)\s*[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    // OCR thiếu dấu: "Co gia tri den"
    /co\s*gia\s*tri\s*den\s*[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseDate(match[1]);
  }

  return '';
}

/**
 * Validate số CCCD theo quy tắc Việt Nam
 * - 12 chữ số
 * - 3 số đầu: mã tỉnh (001-096)
 * - Số thứ 4: giới tính + thế kỷ sinh
 *   0: Nam, sinh 1900-1999
 *   1: Nữ, sinh 1900-1999
 *   2: Nam, sinh 2000-2099
 *   3: Nữ, sinh 2000-2099
 * - Số 5-6: 2 số cuối năm sinh
 * - Số 7-12: số ngẫu nhiên
 */
export function validateCccdNumber(cccd: string): { valid: boolean; province?: string; gender?: string; birthYear?: number } {
  if (!cccd || cccd.length !== 12 || !/^\d{12}$/.test(cccd)) {
    return { valid: false };
  }

  const provinceCode = parseInt(cccd.substring(0, 3));
  const genderCentury = parseInt(cccd[3]);
  const birthYearSuffix = parseInt(cccd.substring(4, 6));

  // Mã tỉnh hợp lệ: 001-096
  if (provinceCode < 1 || provinceCode > 96) {
    return { valid: false };
  }

  // Giới tính + thế kỷ
  let gender: string;
  let century: number;
  switch (genderCentury) {
    case 0: gender = 'Nam'; century = 1900; break;
    case 1: gender = 'Nữ'; century = 1900; break;
    case 2: gender = 'Nam'; century = 2000; break;
    case 3: gender = 'Nữ'; century = 2000; break;
    case 4: gender = 'Nam'; century = 2100; break;
    case 5: gender = 'Nữ'; century = 2100; break;
    default: gender = ''; century = 0;
  }

  const birthYear = century > 0 ? century + birthYearSuffix : undefined;

  // Map mã tỉnh → tên tỉnh
  const provinceMap: Record<number, string> = {
    1: 'Hà Nội', 2: 'Hà Giang', 4: 'Cao Bằng', 6: 'Bắc Kạn', 8: 'Tuyên Quang',
    10: 'Lào Cai', 11: 'Điện Biên', 12: 'Lai Châu', 14: 'Sơn La', 15: 'Yên Bái',
    17: 'Hòa Bình', 19: 'Thái Nguyên', 20: 'Lạng Sơn', 22: 'Quảng Ninh',
    24: 'Bắc Giang', 25: 'Phú Thọ', 26: 'Vĩnh Phúc', 27: 'Bắc Ninh',
    30: 'Hải Dương', 31: 'Hải Phòng', 33: 'Hưng Yên', 34: 'Thái Bình',
    35: 'Hà Nam', 36: 'Nam Định', 37: 'Ninh Bình', 38: 'Thanh Hóa',
    40: 'Nghệ An', 42: 'Hà Tĩnh', 44: 'Quảng Bình', 45: 'Quảng Trị',
    46: 'Thừa Thiên Huế', 48: 'Đà Nẵng', 49: 'Quảng Nam', 51: 'Quảng Ngãi',
    52: 'Bình Định', 54: 'Phú Yên', 56: 'Khánh Hòa', 58: 'Ninh Thuận',
    60: 'Bình Thuận', 62: 'Kon Tum', 64: 'Gia Lai', 66: 'Đắk Lắk',
    67: 'Đắk Nông', 68: 'Lâm Đồng', 70: 'Bình Phước', 72: 'Tây Ninh',
    74: 'Bình Dương', 75: 'Đồng Nai', 77: 'Bà Rịa - Vũng Tàu',
    79: 'TP. Hồ Chí Minh', 80: 'Long An', 82: 'Tiền Giang', 83: 'Bến Tre',
    84: 'Trà Vinh', 86: 'Vĩnh Long', 87: 'Đồng Tháp', 89: 'An Giang',
    91: 'Kiên Giang', 92: 'Cần Thơ', 93: 'Hậu Giang', 94: 'Sóc Trăng',
    95: 'Bạc Liêu', 96: 'Cà Mau',
  };

  return {
    valid: true,
    province: provinceMap[provinceCode] || `Mã tỉnh ${provinceCode}`,
    gender,
    birthYear,
  };
}

/**
 * Main parser: trích xuất tất cả thông tin từ raw OCR text
 */
export function parseCccdText(rawText: string): CccdParsedData {
  const text = normalizeText(rawText);

  const result: CccdParsedData = {
    cccdNumber: extractCccdNumber(text),
    fullName: extractFullName(text),
    dateOfBirth: extractDateOfBirth(text),
    gender: extractGender(text),
    nationality: extractNationality(text),
    placeOfOrigin: extractPlaceOfOrigin(text),
    placeOfResidence: extractPlaceOfResidence(text),
    expiryDate: extractExpiryDate(text),
  };

  // Cross-validate: nếu có số CCCD, dùng nó để suy ra giới tính (nếu OCR miss)
  if (result.cccdNumber && result.cccdNumber.length === 12) {
    const validation = validateCccdNumber(result.cccdNumber);
    if (validation.valid) {
      if (!result.gender && validation.gender) {
        result.gender = validation.gender;
      }
    }
  }

  return result;
}
