/* Lịch Pháp © 2026 Lê Lệnh Bắc. Bảo lưu mọi quyền. Bản chính thức, miễn phí: https://lelenhbac1974hn-web.github.io/lich-phap/ — cấm đưa lên chợ ứng dụng, bán hay phát hành lại khi chưa được phép (xem LICENSE). */
/* LICH PHAP - loi lich phap dung chung (trich nguyen van tu lich-van-nien-pwa/app.js, dong 10-543).
   Khong sua thuat toan o day; giao dien nam o ui.js. */
/* ═════════════ LÕI ÂM LỊCH — THUẬT TOÁN HỒ NGỌC ĐỨC ═════════════ */
const PI = Math.PI,
  TZ = 7.0,
  INT = Math.floor;
function jdFromDate(dd, mm, yy) {
  const a = INT((14 - mm) / 12),
    y = yy + 4800 - a,
    m = mm + 12 * a - 3;
  let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  if (jd < 2299161) jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  return jd;
}
function jdToDate(jd) {
  let a, b, c;
  if (jd > 2299160) {
    a = jd + 32044;
    b = INT((4 * a + 3) / 146097);
    c = a - INT(b * 146097 / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = INT((4 * c + 3) / 1461),
    e = c - INT(1461 * d / 4),
    m = INT((5 * e + 2) / 153);
  return [e - INT((153 * m + 2) / 5) + 1, m + 3 - 12 * INT(m / 10), b * 100 + d - 4800 + INT(m / 10)];
}
function getNewMoonDay(k, tz) {
  const T = k / 1236.85,
    T2 = T * T,
    T3 = T2 * T,
    dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.6705065 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 += -0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr) - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 += 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 += -0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 += -0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 += 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  const dt = T < -11 ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3 : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return INT(Jd1 + C1 - dt + 0.5 + tz / 24);
}
function sunLongDeg(jdn, tz) {
  const T = (jdn - 2451545.5 - tz / 24) / 36525,
    T2 = T * T,
    dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L -= 360 * INT(L / 360);
  return L < 0 ? L + 360 : L;
}
const sunSector = (j, tz) => INT(sunLongDeg(j, tz) / 30);
function lunarM11(yy, tz) {
  const k = INT((jdFromDate(31, 12, yy) - 2415021) / 29.530588853);
  let nm = getNewMoonDay(k, tz);
  if (sunSector(nm, tz) >= 9) nm = getNewMoonDay(k - 1, tz);
  return nm;
}
function leapOffset(a11, tz) {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0,
    i = 1,
    arc = sunSector(getNewMoonDay(k + i, tz), tz);
  do {
    last = arc;
    i++;
    arc = sunSector(getNewMoonDay(k + i, tz), tz);
  } while (arc !== last && i < 14);
  return i - 1;
}
function solar2Lunar(dd, mm, yy, tz) {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, tz);
  if (monthStart > dayNumber) monthStart = getNewMoonDay(k, tz);
  let a11 = lunarM11(yy, tz),
    b11 = a11,
    lunarYear;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = lunarM11(yy - 1, tz);
  } else {
    lunarYear = yy + 1;
    b11 = lunarM11(yy + 1, tz);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let leap = 0,
    lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const lo = leapOffset(a11, tz);
    if (diff >= lo) {
      lunarMonth = diff + 10;
      if (diff === lo) leap = 1;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    leap: leap === 1
  };
}
function lunar2Jd(ld, lm, ly, lleap, tz) {
  let a11, b11;
  if (lm < 11) {
    a11 = lunarM11(ly - 1, tz);
    b11 = lunarM11(ly, tz);
  } else {
    a11 = lunarM11(ly, tz);
    b11 = lunarM11(ly + 1, tz);
  }
  let off = lm - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const lo = leapOffset(a11, tz);
    let lmth = lo - 2;
    if (lmth < 0) lmth += 12;
    if (lleap && lm !== lmth) return null;
    if (lleap || off >= lo) off += 1;
  }
  const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  return getNewMoonDay(k + off, tz) + ld - 1;
}
const amCuaJd = j => solar2Lunar(...jdToDate(j), TZ);

/* ═════════════ CAN CHI · TIẾT KHÍ · TRỰC · SAO ═════════════ */
const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const THU = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const THU_NGAN = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const TIET_KHI = ["Xuân phân", "Thanh minh", "Cốc vũ", "Lập hạ", "Tiểu mãn", "Mang chủng", "Hạ chí", "Tiểu thử", "Đại thử", "Lập thu", "Xử thử", "Bạch lộ", "Thu phân", "Hàn lộ", "Sương giáng", "Lập đông", "Tiểu tuyết", "Đại tuyết", "Đông chí", "Tiểu hàn", "Đại hàn", "Lập xuân", "Vũ thủy", "Kinh trập"];
const KHUNG = ["23–1", "1–3", "3–5", "5–7", "7–9", "9–11", "11–13", "13–15", "15–17", "17–19", "19–21", "21–23"];
const ccNgay = j => `${CAN[(j + 9) % 10]} ${CHI[(j + 1) % 12]}`;
const ccThang = (m, y) => `${CAN[(y * 12 + m + 3) % 10]} ${CHI[(m + 1) % 12]}`;
const ccNam = y => `${CAN[(y + 6) % 10]} ${CHI[(y + 8) % 12]}`;
const tietKhi = j => TIET_KHI[INT(sunLongDeg(j + 1, TZ) / 15)];

/* Nguyệt kiến theo tiết khí — Lập xuân (315°) mở tháng Dần. Trực tính theo mốc này. */
const nguyetKien = j => (INT((sunLongDeg(j + 1, TZ) - 315 + 360) % 360 / 30) + 2) % 12;
const TRUC = [{
  t: "Kiến",
  g: 1,
  v: "Khai trương, nhận chức, xuất hành. Kỵ động thổ, đào giếng."
}, {
  t: "Trừ",
  g: 0,
  v: "Dọn dẹp, tháo dỡ, chữa bệnh, giải hạn. Kỵ khởi công, cưới hỏi."
}, {
  t: "Mãn",
  g: 1,
  v: "Cầu tài, mở kho, tế lễ. Kỵ kiện tụng, uống thuốc."
}, {
  t: "Bình",
  g: 1,
  v: "San lấp, làm đường, đắp nền — rất hợp thi công hạ tầng."
}, {
  t: "Định",
  g: 1,
  v: "Ký kết hợp đồng, nhập trạch, cưới hỏi. Kỵ tranh chấp, đi xa."
}, {
  t: "Chấp",
  g: 1,
  v: "Xây cất, tạo tác. Kỵ di chuyển, xuất hành."
}, {
  t: "Phá",
  g: -1,
  v: "Chỉ hợp phá dỡ công trình cũ. Kỵ mọi việc khởi sự."
}, {
  t: "Nguy",
  g: -1,
  v: "Kỵ lên cao, sông nước — lưu ý an toàn giàn giáo. Chỉ nên tế lễ."
}, {
  t: "Thành",
  g: 1,
  v: "Khởi công, khánh thành, nhập học, kết hôn. Kỵ kiện tụng."
}, {
  t: "Thu",
  g: 0,
  v: "Thu hoạch, nhập kho, thu nợ. Kỵ khởi công, xuất hành, an táng."
}, {
  t: "Khai",
  g: 1,
  v: "Động thổ, khai trương, nhập trạch — trực tốt bậc nhất. Kỵ an táng."
}, {
  t: "Bế",
  g: -1,
  v: "Đắp đê, lấp hố, bít lỗ. Kỵ khởi công, khai trương, chữa bệnh."
}];
const trucCuaNgay = j => TRUC[((j + 1) % 12 - nguyetKien(j) + 12) % 12];
const THAN = [{
  t: "Thanh Long",
  hd: true
}, {
  t: "Minh Đường",
  hd: true
}, {
  t: "Thiên Hình",
  hd: false
}, {
  t: "Chu Tước",
  hd: false
}, {
  t: "Kim Quỹ",
  hd: true
}, {
  t: "Bảo Quang",
  hd: true
}, {
  t: "Bạch Hổ",
  hd: false
}, {
  t: "Ngọc Đường",
  hd: true
}, {
  t: "Thiên Lao",
  hd: false
}, {
  t: "Nguyên Vũ",
  hd: false
}, {
  t: "Tư Mệnh",
  hd: true
}, {
  t: "Câu Trần",
  hd: false
}];
const khoiDau = chi => (chi % 6 * 2 + 8) % 12;
const thanCuaNgay = (j, lunarMonth) => THAN[((j + 1) % 12 - khoiDau((lunarMonth + 1) % 12) + 12) % 12];
function gioTrongNgay(j) {
  const start = khoiDau((j + 1) % 12);
  return CHI.map((c, i) => ({
    chi: c,
    khung: KHUNG[i],
    hd: THAN[(i - start + 12) % 12].hd
  }));
}
const TU = [["Giác", 1], ["Cang", 0], ["Đê", 0], ["Phòng", 1], ["Tâm", 0], ["Vĩ", 1], ["Cơ", 1], ["Đẩu", 1], ["Ngưu", 0], ["Nữ", 0], ["Hư", 0], ["Nguy", 0], ["Thất", 1], ["Bích", 1], ["Khuê", 1], ["Lâu", 1], ["Vị", 1], ["Mão", 0], ["Tất", 1], ["Chủy", 0], ["Sâm", 1], ["Tỉnh", 1], ["Quỷ", 0], ["Liễu", 0], ["Tinh", 0], ["Trương", 1], ["Dực", 0], ["Chẩn", 1]];
const saoCuaNgay = j => TU[(j + 11) % 28];

/* ═════════════ NGÀY KIÊNG CỐ ĐỊNH THEO ÂM LỊCH ═════════════ */
const TAM_NUONG = [3, 7, 13, 18, 22, 27];
const NGUYET_KY = [5, 14, 23];
/* Dương công kỵ nhật — 13 ngày cố định mỗi năm âm lịch, đại kỵ khởi công xây dựng */
const DUONG_CONG = {
  1: [13],
  2: [11],
  3: [9],
  4: [7],
  5: [5],
  6: [3],
  7: [8, 29],
  8: [27],
  9: [25],
  10: [23],
  11: [21],
  12: [19]
};
const laTamNuong = am => TAM_NUONG.includes(am.day);
const laNguyetKy = am => NGUYET_KY.includes(am.day);
const laDuongCong = am => !am.leap && (DUONG_CONG[am.month] || []).includes(am.day);

/* ══ SAO TỐT – SAO XẤU · NGỌC HẠP THÔNG THƯ ══
   Mỗi sao có 12 ô theo tháng âm. Ô khớp khi trùng Can, trùng Chi, hoặc trùng cả cặp Can Chi. */
const SAO_TOT = [["Thiên đức", "Tốt mọi việc", ["Đinh", "Thân", "Nhâm", "Tân", "Hợi", "Giáp", "Quý", "Dần", "Bính", "Ất", "Tỵ", "Canh"]], ["Thiên đức hợp", "Tốt mọi việc", ["Nhâm", "Tỵ", "Đinh", "Bính", "Dần", "Kỷ", "Mậu", "Hợi", "Tân", "Canh", "Thân", "Ất"]], ["Nguyệt đức", "Tốt mọi việc", ["Bính", "Giáp", "Nhâm", "Canh", "Bính", "Giáp", "Nhâm", "Canh", "Bính", "Giáp", "Nhâm", "Canh"]], ["Nguyệt đức hợp", "Tốt mọi việc, kỵ tố tụng", ["Tân", "Kỷ", "Đinh", "Ất", "Tân", "Kỷ", "Đinh", "Ất", "Tân", "Kỷ", "Đinh", "Ất"]], ["Thiên hỷ", "Tốt mọi việc, nhất là hôn thú", ["Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu"]], ["Thiên phú", "Tốt xây dựng, khai trương, an táng", ["Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão"]], ["Thiên quý", "Tốt mọi việc", ["Giáp|Ất", "Giáp|Ất", "Giáp|Ất", "Bính|Đinh", "Bính|Đinh", "Bính|Đinh", "Canh|Tân", "Canh|Tân", "Canh|Tân", "Nhâm|Quý", "Nhâm|Quý", "Nhâm|Quý"]], ["Thiên xá", "Tốt tế tự, giải oan, trừ được sao xấu; kỵ động thổ", ["Mậu Dần", "Mậu Dần", "Mậu Dần", "Giáp Ngọ", "Giáp Ngọ", "Giáp Ngọ", "Mậu Thân", "Mậu Thân", "Mậu Thân", "Giáp Tý", "Giáp Tý", "Giáp Tý"]], ["Sinh khí", "Tốt mọi việc, nhất là làm nhà, động thổ, trồng cây", ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"]], ["Thiên phúc", "Tốt mọi việc", ["Kỷ", "Mậu", "", "Tân|Quý", "Canh|Nhâm", "", "Ất", "Giáp", "", "Đinh", "Bính", ""]], ["Thiên thành", "Tốt mọi việc", ["Mùi", "Dậu", "Hợi", "Sửu", "Mão", "Tỵ", "Mùi", "Dậu", "Hợi", "Sửu", "Mão", "Tỵ"]], ["Thiên quan", "Tốt mọi việc", ["Tuất", "Tý", "Dần", "Thìn", "Ngọ", "Thân", "Tuất", "Tý", "Dần", "Thìn", "Ngọ", "Thân"]], ["Thiên mã", "Tốt xuất hành, giao dịch, cầu tài lộc", ["Ngọ", "Thân", "Tuất", "Tý", "Dần", "Thìn", "Ngọ", "Thân", "Tuất", "Tý", "Dần", "Thìn"]], ["Thiên tài", "Tốt cầu tài lộc, khai trương", ["Thìn", "Ngọ", "Thân", "Tuất", "Tý", "Dần", "Thìn", "Ngọ", "Thân", "Tuất", "Tý", "Dần"]], ["Địa tài", "Tốt cầu tài lộc, khai trương", ["Tỵ", "Mùi", "Dậu", "Hợi", "Sửu", "Mão", "Tỵ", "Mùi", "Dậu", "Hợi", "Sửu", "Mão"]], ["Nguyệt tài", "Tốt cầu tài, khai trương, xuất hành, giao dịch", ["Ngọ", "Tỵ", "Tỵ", "Mùi", "Dậu", "Hợi", "Ngọ", "Tỵ", "Tỵ", "Mùi", "Dậu", "Hợi"]], ["Nguyệt ân", "Tốt mọi việc", ["Bính", "Đinh", "Canh", "Kỷ", "Mậu", "Tân", "Nhâm", "Quý", "Canh", "Ất", "Giáp", "Tân"]], ["Nguyệt không", "Tốt làm nhà, làm giường", ["Nhâm", "Canh", "Bính", "Giáp", "Nhâm", "Canh", "Bính", "Giáp", "Nhâm", "Canh", "Bính", "Giáp"]], ["Thánh tâm", "Tốt mọi việc, nhất là cầu phúc, tế tự", ["Hợi", "Tỵ", "Tý", "Ngọ", "Sửu", "Mùi", "Dần", "Thân", "Mão", "Dậu", "Thìn", "Tuất"]], ["Ngũ phú", "Tốt mọi việc", ["Hợi", "Dần", "Tỵ", "Thân", "Hợi", "Dần", "Tỵ", "Thân", "Hợi", "Dần", "Tỵ", "Thân"]], ["Lộc khố", "Tốt cầu tài, khai trương, nhập kho", ["Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão"]], ["Phúc sinh", "Tốt mọi việc", ["Dậu", "Mão", "Tuất", "Thìn", "Hợi", "Tỵ", "Tý", "Ngọ", "Sửu", "Mùi", "Dần", "Thân"]], ["Cát khánh", "Tốt mọi việc", ["Dậu", "Dần", "Hợi", "Thìn", "Sửu", "Ngọ", "Mão", "Thân", "Tỵ", "Tuất", "Mùi", "Tý"]], ["Âm đức", "Tốt mọi việc", ["Dậu", "Mùi", "Tỵ", "Mão", "Sửu", "Hợi", "Dậu", "Mùi", "Tỵ", "Mão", "Sửu", "Hợi"]], ["U vi tinh", "Tốt mọi việc", ["Hợi", "Thìn", "Sửu", "Ngọ", "Mão", "Thân", "Tỵ", "Tuất", "Mùi", "Tý", "Dậu", "Dần"]], ["Mãn đức tinh", "Tốt mọi việc", ["Dần", "Mùi", "Thìn", "Dậu", "Ngọ", "Hợi", "Thân", "Sửu", "Tuất", "Mão", "Tý", "Tỵ"]], ["Kính tâm", "Tốt đối với tang lễ", ["Mùi", "Sửu", "Thân", "Dần", "Dậu", "Mão", "Tuất", "Thìn", "Hợi", "Tỵ", "Tý", "Ngọ"]], ["Tuế hợp", "Tốt mọi việc", ["Sửu", "Tý", "Hợi", "Tuất", "Dậu", "Thân", "Mùi", "Ngọ", "Tỵ", "Thìn", "Mão", "Dần"]], ["Nguyệt giải", "Tốt mọi việc", ["Thân", "Thân", "Dậu", "Dậu", "Tuất", "Tuất", "Hợi", "Hợi", "Ngọ", "Ngọ", "Mùi", "Mùi"]], ["Hoạt điệu", "Tốt, nhưng gặp Thụ tử thì xấu", ["Tỵ", "Tuất", "Mùi", "Tý", "Dậu", "Dần", "Hợi", "Thìn", "Sửu", "Ngọ", "Mão", "Thân"]], ["Giải thần", "Tốt tế tự, giải oan, trừ được sao xấu", ["Thân", "Thân", "Tuất", "Tuất", "Tý", "Tý", "Dần", "Dần", "Thìn", "Thìn", "Ngọ", "Ngọ"]], ["Phổ hộ", "Tốt mọi việc, làm phúc, giá thú, xuất hành", ["Thân", "Dần", "Dậu", "Mão", "Tuất", "Thìn", "Hợi", "Tỵ", "Tý", "Ngọ", "Sửu", "Mùi"]], ["Ích hậu", "Tốt mọi việc, nhất là giá thú", ["Tý", "Ngọ", "Sửu", "Mùi", "Dần", "Thân", "Mão", "Dậu", "Thìn", "Tuất", "Tỵ", "Hợi"]], ["Tục thế", "Tốt mọi việc, nhất là giá thú", ["Sửu", "Mùi", "Dần", "Thân", "Mão", "Dậu", "Thìn", "Tuất", "Tỵ", "Hợi", "Ngọ", "Tý"]], ["Yếu yên", "Tốt mọi việc, nhất là giá thú", ["Dần", "Thân", "Mão", "Dậu", "Thìn", "Tuất", "Tỵ", "Hợi", "Ngọ", "Tý", "Mùi", "Sửu"]], ["Dịch mã", "Tốt mọi việc, nhất là xuất hành", ["Thân", "Tỵ", "Dần", "Hợi", "Thân", "Tỵ", "Dần", "Hợi", "Thân", "Tỵ", "Dần", "Hợi"]], ["Tam hợp", "Tốt mọi việc", ["Ngọ|Tuất", "Mùi|Hợi", "Thân|Tý", "Dậu|Sửu", "Tuất|Dần", "Hợi|Mão", "Tý|Thìn", "Sửu|Tỵ", "Dần|Ngọ", "Mão|Mùi", "Thìn|Thân", "Tỵ|Dậu"]], ["Lục hợp", "Tốt mọi việc", ["Hợi", "Tuất", "Dậu", "Thân", "Mùi", "Ngọ", "Tỵ", "Thìn", "Mão", "Dần", "Sửu", "Tý"]], ["Mẫu thương", "Tốt cầu tài lộc, khai trương, làm kho", ["Hợi|Tý", "Hợi|Tý", "Hợi|Tý", "Dần|Mão", "Dần|Mão", "Dần|Mão", "Thìn|Sửu|Mùi|Tuất", "Thìn|Sửu|Mùi|Tuất", "Thìn|Sửu|Mùi|Tuất", "Thân|Dậu", "Thân|Dậu", "Thân|Dậu"]], ["Phúc hậu", "Tốt cầu tài lộc, khai trương", ["Dần", "Dần", "Dần", "Tỵ", "Tỵ", "Tỵ", "Thân", "Thân", "Thân", "Hợi", "Hợi", "Hợi"]], ["Đại hồng sa", "Tốt mọi việc", ["Tuất|Tý", "Tuất|Tý", "Tuất|Tý", "Thìn|Tỵ", "Thìn|Tỵ", "Thìn|Tỵ", "Ngọ|Mùi", "Ngọ|Mùi", "Ngọ|Mùi", "Thân|Tuất", "Thân|Tuất", "Thân|Tuất"]], ["Dân nhật", "Tốt mọi việc, động thổ, đào đắp, sửa chữa", ["Ngọ", "Ngọ", "Ngọ", "Dậu", "Dậu", "Dậu", "Tý", "Tý", "Tý", "Mão", "Mão", "Mão"]], ["Hoàng ân", "Tốt mọi việc", ["Tuất", "Sửu", "Dần", "Tỵ", "Dậu", "Mão", "Tỵ|Tý", "Ngọ", "Thân|Hợi", "Thìn", "Thân", "Mùi"]]];
const SAO_XAU = [["Thiên cương", "Xấu mọi việc", ["Tỵ", "Tý", "Mùi", "Dần", "Dậu", "Thìn", "Hợi", "Ngọ", "Sửu", "Thân", "Mão", "Tuất"]], ["Thiên lại", "Xấu mọi việc", ["Dậu", "Ngọ", "Mão", "Tý", "Dậu", "Ngọ", "Mão", "Tý", "Dậu", "Ngọ", "Mão", "Tý"]], ["Thiên ngục · Thiên hoả", "Xấu mọi việc, nhất là lợp nhà", ["Tý", "Mão", "Ngọ", "Dậu", "Tý", "Mão", "Ngọ", "Dậu", "Tý", "Mão", "Ngọ", "Dậu"]], ["Tiểu hồng sa", "Xấu mọi việc", ["Tỵ", "Dậu", "Sửu", "Tỵ", "Dậu", "Sửu", "Tỵ", "Dậu", "Sửu", "Tỵ", "Dậu", "Sửu"]], ["Đại hao", "Xấu mọi việc", ["Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ"]], ["Tiểu hao", "Xấu về kinh doanh, cầu tài", ["Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn"]], ["Nguyệt phá", "Xấu về xây dựng nhà cửa", ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"]], ["Kiếp sát", "Kỵ xuất hành, giá thú, an táng, xây dựng", ["Hợi", "Thân", "Tỵ", "Dần", "Hợi", "Thân", "Tỵ", "Dần", "Hợi", "Thân", "Tỵ", "Dần"]], ["Địa phá", "Kỵ xây dựng", ["Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất"]], ["Thổ phủ", "Kỵ xây dựng, động thổ", ["Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu"]], ["Thổ ôn", "Kỵ xây dựng, đào ao, đào giếng", ["Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão"]], ["Thiên ôn", "Kỵ xây dựng", ["Mùi", "Tuất", "Thìn", "Dần", "Ngọ", "Tý", "Dậu", "Thân", "Tỵ", "Hợi", "Sửu", "Mão"]], ["Thụ tử", "Xấu mọi việc, trừ săn bắn", ["Tuất", "Thìn", "Hợi", "Tỵ", "Tý", "Ngọ", "Sửu", "Mùi", "Dần", "Thân", "Mão", "Dậu"]], ["Hoang vu", "Xấu mọi việc", ["Tỵ|Dậu|Sửu", "Tỵ|Dậu|Sửu", "Tỵ|Dậu|Sửu", "Thân|Tý|Thìn", "Thân|Tý|Thìn", "Thân|Tý|Thìn", "Hợi|Mão|Mùi", "Hợi|Mão|Mùi", "Hợi|Mão|Mùi", "Dần|Ngọ|Tuất", "Dần|Ngọ|Tuất", "Dần|Ngọ|Tuất"]], ["Thiên tặc", "Xấu khởi tạo, động thổ, nhập trạch, khai trương", ["Thìn", "Dậu", "Dần", "Mùi", "Tý", "Tỵ", "Tuất", "Mão", "Thân", "Sửu", "Ngọ", "Hợi"]], ["Địa tặc", "Kỵ khởi tạo, an táng, động thổ, xuất hành", ["Sửu", "Tý", "Hợi", "Tuất", "Dậu", "Thân", "Mùi", "Ngọ", "Tỵ", "Thìn", "Mão", "Dần"]], ["Hoả tai", "Xấu làm nhà, lợp nhà", ["Sửu", "Mùi", "Dần", "Thân", "Mão", "Dậu", "Thìn", "Tuất", "Tỵ", "Hợi", "Tý", "Ngọ"]], ["Nguyệt hoả độc hoả", "Xấu lợp nhà, làm bếp", ["Tỵ", "Thìn", "Mão", "Dần", "Sửu", "Tý", "Hợi", "Tuất", "Dậu", "Thân", "Mùi", "Ngọ"]], ["Nguyệt yếm đại hoạ", "Xấu xuất hành, giá thú", ["Tuất", "Dậu", "Thân", "Mùi", "Ngọ", "Tỵ", "Thìn", "Mão", "Dần", "Sửu", "Tý", "Hợi"]], ["Nguyệt hư", "Xấu giá thú, mở cửa, mở hàng", ["Sửu", "Tuất", "Mùi", "Thìn", "Sửu", "Tuất", "Mùi", "Thìn", "Sửu", "Tuất", "Mùi", "Thìn"]], ["Hoàng sa", "Xấu đối với xuất hành", ["Ngọ", "Dần", "Tý", "Ngọ", "Dần", "Tý", "Ngọ", "Dần", "Tý", "Ngọ", "Dần", "Tý"]], ["Lục bất thành", "Xấu đối với xây dựng", ["Dần", "Ngọ", "Tuất", "Tỵ", "Dậu", "Sửu", "Thân", "Tý", "Thìn", "Hợi", "Mão", "Mùi"]], ["Nhân cách", "Xấu giá thú, khởi tạo", ["Dậu", "Mùi", "Tỵ", "Mão", "Sửu", "Hợi", "Dậu", "Mùi", "Tỵ", "Mão", "Sửu", "Hợi"]], ["Thần cách", "Kỵ tế tự", ["Tỵ", "Mão", "Sửu", "Hợi", "Dậu", "Mùi", "Tỵ", "Mão", "Sửu", "Hợi", "Dậu", "Mùi"]], ["Phi ma sát", "Kỵ giá thú, nhập trạch", ["Tý", "Dậu", "Ngọ", "Mão", "Tý", "Dậu", "Ngọ", "Mão", "Tý", "Dậu", "Ngọ", "Mão"]], ["Ngũ quỹ", "Kỵ xuất hành", ["Ngọ", "Dần", "Thìn", "Dậu", "Mão", "Thân", "Sửu", "Tỵ", "Tý", "Hợi", "Mùi", "Tuất"]], ["Băng tiêu ngoạ hãm", "Xấu mọi việc", ["Tỵ", "Tý", "Sửu", "Thân", "Mão", "Tuất", "Hợi", "Ngọ", "Mùi", "Dần", "Dậu", "Thìn"]], ["Hà khôi cấu giảo", "Kỵ khởi công xây dựng, xấu mọi việc", ["Hợi", "Ngọ", "Sửu", "Thân", "Mão", "Tuất", "Tỵ", "Tý", "Mùi", "Dần", "Dậu", "Thìn"]], ["Vãng vong", "Kỵ xuất hành, giá thú, cầu tài lộc, động thổ", ["Dần", "Tỵ", "Thân", "Hợi", "Mão", "Ngọ", "Dậu", "Tý", "Thìn", "Mùi", "Tuất", "Sửu"]], ["Cửu không", "Kỵ xuất hành, cầu tài, khai trương", ["Thìn", "Sửu", "Tuất", "Mùi", "Mão", "Tý", "Dậu", "Ngọ", "Dần", "Hợi", "Thân", "Tỵ"]], ["Trùng tang", "Kỵ giá thú, an táng, khởi công làm nhà", ["Giáp", "Ất", "Kỷ", "Bính", "Đinh", "Kỷ", "Canh", "Tân", "Kỷ", "Nhâm", "Quý", "Kỷ"]], ["Trùng phục", "Kỵ giá thú, an táng", ["Canh", "Tân", "Kỷ", "Nhâm", "Quý", "Mậu", "Giáp", "Ất", "Kỷ", "Bính", "Đinh", "Kỷ"]], ["Lôi công", "Xấu với xây dựng nhà cửa", ["Dần", "Hợi", "Tỵ", "Thân", "Dần", "Hợi", "Tỵ", "Thân", "Dần", "Hợi", "Tỵ", "Thân"]], ["Cô thần", "Xấu với giá thú", ["Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu"]], ["Quả tú", "Xấu với giá thú", ["Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão"]], ["Sát chủ", "Xấu mọi việc", ["Tỵ", "Tý", "Mùi", "Mão", "Thân", "Tuất", "Sửu", "Hợi", "Ngọ", "Dậu", "Dần", "Thìn"]], ["Nguyệt hình", "Xấu mọi việc", ["Tỵ", "Tý", "Thìn", "Thân", "Ngọ", "Sửu", "Dần", "Dậu", "Mùi", "Hợi", "Mão", "Tuất"]], ["Tội chỉ", "Xấu với tế tự, kiện cáo", ["Ngọ", "Tý", "Mùi", "Sửu", "Thân", "Dần", "Dậu", "Mão", "Tuất", "Thìn", "Hợi", "Tỵ"]], ["Ngũ hư", "Kỵ khởi tạo, giá thú, an táng", ["Tỵ|Dậu|Sửu", "Tỵ|Dậu|Sửu", "Tỵ|Dậu|Sửu", "Thân|Tý|Thìn", "Thân|Tý|Thìn", "Thân|Tý|Thìn", "Hợi|Mão|Mùi", "Hợi|Mão|Mùi", "Hợi|Mão|Mùi", "Dần|Ngọ|Tuất", "Dần|Ngọ|Tuất", "Dần|Ngọ|Tuất"]], ["Không phòng", "Kỵ giá thú", ["Thìn", "Tỵ", "Tý", "Tuất", "Hợi", "Mùi", "Dần", "Mão", "Ngọ", "Thân", "Dậu", "Sửu"]], ["Âm thác", "Kỵ xuất hành, giá thú, an táng", ["Canh Tuất", "Tân Dậu", "Canh Thân", "Đinh Mùi", "Bính Ngọ", "Đinh Tỵ", "Giáp Thìn", "Ất Mão", "Giáp Dần", "Quý Sửu", "Nhâm Tý", "Quý Hợi"]], ["Dương thác", "Kỵ xuất hành, giá thú, an táng", ["Giáp Dần", "Ất Mão", "Giáp Thìn", "Đinh Tỵ", "Bính Ngọ", "Đinh Mùi", "Canh Thân", "Tân Dậu", "Canh Tuất", "Quý Hợi", "Nhâm Tý", "Quý Sửu"]], ["Quỷ khốc", "Xấu với tế tự, mai táng", ["Mùi", "Tuất", "Thìn", "Dần", "Ngọ", "Tý", "Dậu", "Thân", "Tỵ", "Hợi", "Sửu", "Mão"]], ["Thổ cấm", "Kỵ xây dựng, an táng, đào ao, đào móng", ["Hợi", "Hợi", "Hợi", "Dần", "Dần", "Dần", "Tỵ", "Tỵ", "Tỵ", "Thân", "Thân", "Thân"]], ["Tứ thời cô quả", "Kỵ giá thú", ["Sửu", "Sửu", "Sửu", "Thìn", "Thìn", "Thìn", "Mùi", "Mùi", "Mùi", "Tuất", "Tuất", "Tuất"]], ["Tam tang", "Kỵ khởi tạo, giá thú, an táng", ["Thìn", "Thìn", "Thìn", "Mùi", "Mùi", "Mùi", "Tuất", "Tuất", "Tuất", "Sửu", "Sửu", "Sửu"]], ["Lỗ ban sát", "Kỵ khởi tạo, đặt cây nóc", ["Tý", "Tý", "Tý", "Mão", "Mão", "Mão", "Ngọ", "Ngọ", "Ngọ", "Dậu", "Dậu", "Dậu"]], ["Phủ đầu sát", "Kỵ khởi tạo, kiêng động thổ", ["Thìn", "Thìn", "Thìn", "Mùi", "Mùi", "Mùi", "Dậu", "Dậu", "Dậu", "Tý", "Tý", "Tý"]]];
function khopSao(o, can, chi) {
  if (!o) return false;
  for (const dk of o.split("|")) {
    const t = dk.trim();
    if (!t) continue;
    if (t.includes(" ")) {
      const [c, z] = t.split(" ");
      if (c === can && z === chi) return true;
    } else if (CAN.includes(t)) {
      if (t === can) return true;
    } else if (t === chi) return true;
  }
  return false;
}
function saoNgocHap(j, thangAm) {
  const can = CAN[(j + 9) % 10],
    chi = CHI[(j + 1) % 12];
  return {
    tot: SAO_TOT.filter(s => khopSao(s[2][thangAm - 1], can, chi)).map(s => [s[0], s[1]]),
    xau: SAO_XAU.filter(s => khopSao(s[2][thangAm - 1], can, chi)).map(s => [s[0], s[1]])
  };
}

/* ═════════════ CHẤM ĐIỂM NGÀY TỐT – XẤU ═════════════ */
const VIEC = [{
  id: "chung",
  ten: "Việc chung",
  trucHop: [],
  chan: []
}, {
  id: "dongtho",
  ten: "Động thổ · Khởi công",
  trucHop: ["Khai", "Kiến", "Bình", "Thành", "Chấp"],
  chan: ["duongcong", "tamnuong"]
}, {
  id: "kyket",
  ten: "Ký kết hợp đồng",
  trucHop: ["Định", "Thành", "Mãn", "Khai"],
  chan: ["tamnuong"]
}, {
  id: "khaitruong",
  ten: "Khai trương · Bàn giao",
  trucHop: ["Khai", "Kiến", "Mãn", "Thành"],
  chan: ["tamnuong", "nguyetky"]
}, {
  id: "xuathanh",
  ten: "Xuất hành · Đi xa",
  trucHop: ["Kiến", "Mãn", "Thành", "Khai"],
  chan: ["tamnuong"]
}];
function chamDiem(j, am, viecId = "chung") {
  const truc = trucCuaNgay(j);
  const than = thanCuaNgay(j, am.month);
  const [saoTen, saoTot] = saoCuaNgay(j);
  const tn = laTamNuong(am),
    nk = laNguyetKy(am),
    dc = laDuongCong(am);
  const viec = VIEC.find(v => v.id === viecId) || VIEC[0];
  let diem = 0;
  const cong = [],
    tru = [];
  if (than.hd) {
    diem += 2;
    cong.push(`Ngày hoàng đạo (${than.t})`);
  } else {
    diem -= 2;
    tru.push(`Ngày hắc đạo (${than.t})`);
  }
  if (truc.g > 0) {
    diem += 2;
    cong.push(`Trực ${truc.t}`);
  } else if (truc.g < 0) {
    diem -= 2;
    tru.push(`Trực ${truc.t}`);
  }
  if (saoTot) {
    diem += 2;
    cong.push(`Sao ${saoTen} — cát tú`);
  } else {
    diem -= 2;
    tru.push(`Sao ${saoTen} — hung tú`);
  }
  if (tn) {
    diem -= 3;
    tru.push("Tam nương sát");
  }
  if (nk) {
    diem -= 2;
    tru.push("Nguyệt kỵ");
  }
  if (dc) {
    diem -= 4;
    tru.push("Dương công kỵ nhật");
  }
  const nh = saoNgocHap(j, am.month);
  const dTot = Math.min(nh.tot.length, 4),
    dXau = Math.min(nh.xau.length, 4);
  diem += dTot - dXau;
  if (nh.tot.length) cong.push(`${nh.tot.length} cát tinh`);
  if (nh.xau.length) tru.push(`${nh.xau.length} hung tinh`);
  const giaiTru = nh.tot.some(s => s[0] === "Thiên xá" || s[0] === "Giải thần");
  if (giaiTru && nh.xau.length) {
    diem += 1;
    cong.push("Có sao giải, chế hoá bớt hung tinh");
  }
  if (viecId !== "chung") {
    if (viec.trucHop.includes(truc.t)) {
      diem += 2;
      cong.push(`Trực ${truc.t} hợp việc này`);
    } else {
      diem -= 1;
    }
  }
  const chan = [];
  if (viec.chan.includes("duongcong") && dc) chan.push("Dương công kỵ nhật — đại kỵ khởi công");
  if (viec.chan.includes("tamnuong") && tn) chan.push("Tam nương sát");
  if (viec.chan.includes("nguyetky") && nk) chan.push("Nguyệt kỵ");
  let bac;
  if (chan.length) bac = 0;else if (diem >= 6) bac = 4;else if (diem >= 3) bac = 3;else if (diem >= 0) bac = 2;else if (diem >= -4) bac = 1;else bac = 0;
  return {
    diem,
    bac,
    cong,
    tru,
    chan,
    truc,
    than,
    saoTen,
    saoTot,
    tn,
    nk,
    dc,
    nh
  };
}
const BAC = [{
  t: "Rất xấu",
  c: "#C0392B",
  s: "#B22D20",
  bg: "rgba(200,60,48,.30)",
  l: "#F7CFC9"
}, {
  t: "Xấu",
  c: "#E07B39",
  s: "#B35A1E",
  bg: "rgba(224,123,57,.26)",
  l: "#FBE0C6"
}, {
  t: "Bình thường",
  c: "#C9A227",
  s: "#8A6D12",
  bg: "rgba(201,162,39,.20)",
  l: "#F6EFCF"
}, {
  t: "Tốt",
  c: "#4CAF50",
  s: "#2E7D32",
  bg: "rgba(76,175,80,.26)",
  l: "#D6EFD8"
}, {
  t: "Rất tốt",
  c: "#00A870",
  s: "#00704A",
  bg: "rgba(0,168,112,.34)",
  l: "#BCEBD8"
}];

/* ═════════════ CƠ SỞ DỮ LIỆU NGÀY LỄ ═════════════ */
const LE_DUONG = {
  "1-1": ["Tết Dương lịch", 1],
  "9-1": ["Ngày truyền thống Học sinh – Sinh viên", 0],
  "3-2": ["Thành lập Đảng Cộng sản Việt Nam", 0],
  "14-2": ["Lễ Tình nhân", 0],
  "27-2": ["Ngày Thầy thuốc Việt Nam", 0],
  "8-3": ["Quốc tế Phụ nữ", 0],
  "20-3": ["Ngày Quốc tế Hạnh phúc", 0],
  "26-3": ["Thành lập Đoàn TNCS Hồ Chí Minh", 0],
  "21-4": ["Ngày Sách và Văn hóa đọc Việt Nam", 0],
  "30-4": ["Ngày Giải phóng miền Nam", 1],
  "1-5": ["Quốc tế Lao động", 1],
  "7-5": ["Chiến thắng Điện Biên Phủ", 0],
  "15-5": ["Thành lập Đội TNTP Hồ Chí Minh", 0],
  "19-5": ["Ngày sinh Chủ tịch Hồ Chí Minh", 0],
  "1-6": ["Quốc tế Thiếu nhi", 0],
  "5-6": ["Ngày Môi trường Thế giới", 0],
  "21-6": ["Ngày Báo chí Cách mạng Việt Nam", 0],
  "28-6": ["Ngày Gia đình Việt Nam", 0],
  "27-7": ["Ngày Thương binh – Liệt sĩ", 0],
  "28-7": ["Thành lập Công đoàn Việt Nam", 0],
  "10-8": ["Ngày vì nạn nhân chất độc da cam", 0],
  "19-8": ["Cách mạng Tháng Tám thành công", 0],
  "2-9": ["Quốc khánh nước CHXHCN Việt Nam", 1],
  "10-9": ["Thành lập Mặt trận Tổ quốc Việt Nam", 0],
  "1-10": ["Ngày Quốc tế Người cao tuổi", 0],
  "10-10": ["Ngày Giải phóng Thủ đô", 0],
  "13-10": ["Ngày Doanh nhân Việt Nam", 0],
  "20-10": ["Ngày Phụ nữ Việt Nam", 0],
  "9-11": ["Ngày Pháp luật Việt Nam", 0],
  "20-11": ["Ngày Nhà giáo Việt Nam", 0],
  "23-11": ["Ngày Di sản Văn hóa Việt Nam", 0],
  "24-11": ["Ngày Văn hóa Việt Nam", 1],
  "19-12": ["Ngày Toàn quốc kháng chiến", 0],
  "22-12": ["Ngày thành lập Quân đội Nhân dân Việt Nam", 0],
  "24-12": ["Lễ Giáng sinh", 0]
};
const LE_AM = {
  "1-1": ["Tết Nguyên Đán — Mùng Một Tết", 1],
  "2-1": ["Mùng Hai Tết", 1],
  "3-1": ["Mùng Ba Tết", 1],
  "4-1": ["Mùng Bốn Tết", 0],
  "7-1": ["Khai hạ — hạ cây nêu", 0],
  "15-1": ["Tết Nguyên Tiêu — Rằm tháng Giêng", 0],
  "3-3": ["Tết Hàn thực — bánh trôi bánh chay", 0],
  "10-3": ["Giỗ Tổ Hùng Vương", 1],
  "15-4": ["Đại lễ Phật Đản", 0],
  "5-5": ["Tết Đoan Ngọ — giết sâu bọ", 0],
  "15-7": ["Lễ Vu Lan — Rằm tháng Bảy", 0],
  "15-8": ["Tết Trung Thu", 0],
  "9-9": ["Tết Trùng Cửu", 0],
  "10-10": ["Tết Trùng Thập — Tết Cơm mới", 0],
  "15-10": ["Tết Hạ Nguyên — Rằm tháng Mười", 0],
  "23-12": ["Ông Táo chầu Trời", 0]
};
const TUC_NGU = [["Ở chọn nơi, chơi chọn bạn", "Tục ngữ"], ["Mất lòng trước, được lòng sau", "Tục ngữ"], ["Nhất thì, nhì thục", "Tục ngữ"], ["Một mẹ nuôi được mười con,\nNhưng mười con không nuôi được một mẹ", "Ca dao"], ["Tham giàu phụ khó, tham sang phụ bần", "Tục ngữ"], ["Con có cha như nhà có nóc", "Tục ngữ"], ["Xanh vỏ đỏ lòng", "Tục ngữ"], ["Thờ cha kính mẹ trước sau\nAnh em hòa thuận mới hầu làm nên", "Ca dao"], ["Bé thì nhờ mẹ, nhờ cha,\nLớn lên nhờ vợ, lúc già nhờ con", "Ca dao"], ["Con dẫu lớn vẫn là con của mẹ,\nĐi hết đời lòng mẹ vẫn theo con", "Ca dao"], ["Chết vinh còn hơn sống nhục", "Tục ngữ"], ["Gừng cay muối mặn", "Tục ngữ"], ["Sáng ướt áo, trưa ráo đầu", "Tục ngữ"], ["Cả sông đông chợ, lắm vợ nhiều con", "Tục ngữ"], ["Bán quạt mùa đông, mua bông mùa hè", "Tục ngữ"], ["Kiến tha lâu cũng đầy tổ", "Tục ngữ"], ["Công cha nghĩa mẹ ơn thầy,\nNgày sau khôn lớn ơn dày biển sâu", "Ca dao"], ["Bỏ thì thương, vương thì tội", "Tục ngữ"], ["Vơ đũa cả nắm", "Tục ngữ"], ["Sinh nghề tử nghiệp", "Tục ngữ"], ["Mưu sự tại nhân thành sự tại thiên", "Tục ngữ"], ["Nói có sách, mách có chứng", "Tục ngữ"], ["Mẹ còn chẳng biết là may,\nMẹ mất mới tiếc những ngày làm con", "Ca dao"], ["Quân tử nhất ngôn", "Tục ngữ"], ["Nhà sạch thì mát, bát sạch ngon cơm", "Tục ngữ"], ["Bà phải có ông, chồng phải có vợ", "Tục ngữ"], ["Ăn trông nồi, ngồi trông hướng", "Tục ngữ"], ["Chết trong còn hơn sống đục", "Tục ngữ"], ["Ăn kĩ no lâu, cày sâu tốt lúa", "Tục ngữ"], ["Làm anh ăn trước, bước đầu\nDạy dỗ em út ngõ hầu thay cha", "Ca dao"], ["Một con chim én không làm nên mùa xuân", "Tục ngữ"], ["Cải bẹ xanh nấu với thịt sườn\nKhổ qua kia hết đắng thì cái sự cang thường hết thương", "Ca dao"], ["Ba mặt một lời", "Tục ngữ"], ["Biển Đông có lúc vơi đầy,\nChứ lòng cha mẹ biển trời nào dâng", "Ca dao"], ["Ba tháng con sẩy, bảy tháng con sa", "Tục ngữ"], ["Việc nhà thì nhác, việc chú bác thì siêng", "Tục ngữ"], ["Mèo què bị trận chó đòi", "Tục ngữ"], ["Oan có đầu, nợ có chủ", "Tục ngữ"], ["Má ơi đừng đánh con đau\nĐể con bắt ốc hái rau má nhờ\nMá ơi đừng đánh con hoài\nĐể con bắt ốc hái xoài má ăn", "Ca dao"], ["Nuôi con chẳng quản chi thân,\nBên ướt mẹ nằm, bên ráo con lăn", "Ca dao"], ["Thương thay chín chữ cù lao,\nTam niên nhũ bộ biết bao nhiêu tình", "Ca dao"], ["Gió bấc hiu hiu, sếu kêu thì rét", "Tục ngữ"], ["Gậy ông đập lưng ông", "Tục ngữ"], ["Ai về tôi gửi đôi giày,\nPhòng khi mưa gió để thầy mẹ đi", "Ca dao"], ["Lên non mới biết non cao,\nNuôi con mới biết công lao mẹ hiền", "Ca dao"], ["Oan oan tương báo, dĩ hận miên miên", "Tục ngữ"], ["Cá lớn nuốt cá bé", "Tục ngữ"], ["Tay bưng đĩa muối chấm gừng\nGừng cay muối mặn xin đừng bỏ nhau", "Ca dao"], ["Anh em như chông như mác", "Tục ngữ"], ["Cha mẹ để của bằng non,\nKhông bằng để đức cho con ở đời", "Ca dao"], ["Chị ngã, em nâng", "Tục ngữ"], ["Anh em khinh trước, làng nước khinh sau", "Tục ngữ"], ["Vắt chanh bỏ vỏ", "Tục ngữ"], ["Gieo gió gặt bão", "Tục ngữ"], ["Cầm cần rau cá ngược xuôi,\nNấu canh rau bợ mà nuôi mẹ già", "Ca dao"], ["Thuốc đắng dã tật, sự thật mất lòng", "Tục ngữ"], ["Lời nói là đọi máu, lời nói là gói vàng", "Tục ngữ"], ["Chết trẻ còn hơn lấy lẽ chồng người", "Tục ngữ"], ["Sóng trước đổ đâu, sóng sau đổ đó", "Tục ngữ"], ["Bênh lý không bênh thân", "Tục ngữ"], ["Chẳng tu, vắng vợ cũng như tu", "Tục ngữ"], ["Rừng nào cọp nấy", "Tục ngữ"], ["Đêm đêm thắp ngọn đèn trời,\nCầu cho cha mẹ sống đời với con", "Ca dao"], ["Yêu nhau lắm, cắn nhau đau", "Tục ngữ"], ["Anh em ăn ở thuận hoà\nChớ điều chếch lệch người ta chê cười", "Ca dao"], ["Cáo chết ba năm quay đầu về núi", "Tục ngữ"], ["Chuột sa chĩnh gạo", "Tục ngữ"], ["Anh em bất nghĩa chi khèo (khoèo), anh dữ như mèo tôi lại như trâu", "Tục ngữ"], ["Ta đi trọn kiếp con người,\nCũng không đi hết những lời mẹ ru", "Ca dao"], ["Đi khắp thế gian không ai tốt bằng Mẹ,\nGánh nặng cuộc đời không ai khổ bằng Cha", "Ca dao"], ["Chiều chiều ra đứng ngõ sau,\nTrông về quê mẹ ruột đau chín chiều", "Ca dao"], ["Bắt người có tóc, ai bắt kẻ trọc đầu", "Tục ngữ"], ["Nước chảy về nguồn, lá rụng về cội", "Tục ngữ"], ["Chị em một ruột cắt ra\nChị không em có cũng là như không", "Ca dao"], ["Ngó lên nuộc lạt mái nhà,\nBao nhiêu nuộc lạt nhớ ông bà bấy nhiêu", "Ca dao"], ["Bốn phương sum họp một nhà\nMiếng trầu lịch sự chén trà phong lưu", "Ca dao"], ["Cây có gốc mới nở cành xanh lá,\nNước có nguồn mới bể cả sông sâu.\nNgười ta nguồn gốc từ đâu,\nCó tổ tiên trước rồi sau có mình", "Ca dao"], ["Xa mặt cách lòng", "Tục ngữ"], ["Cha là hoa phấn giữa đời,\nThiên thu tình mẹ rạng ngời tâm con", "Ca dao"], ["Sống thì con chẳng cho ăn,\nChết thì xôi thịt, làm văn tế trời", "Ca dao"], ["Khôn nhà dại chợ", "Tục ngữ"], ["Cháu bà nội, tội bà ngoại", "Tục ngữ"], ["Đi với phật thì mặc áo cà sa, đi với ma thì mặc áo giấy", "Tục ngữ"], ["Ai người chia sớt nỗi buồn,\nMẹ tôi gánh mãi hoàng hôn một mình", "Ca dao"], ["Lùi một bước tiến ngàn dặm", "Tục ngữ"], ["Thắng không kiêu, bại không nản", "Tục ngữ"], ["Đói lòng ăn đọt chà là,\nĐể cơm nuôi mẹ, mẹ già yếu răng", "Ca dao"], ["Nhất quỷ, nhì ma, thứ ba học trò", "Tục ngữ"], ["Mau sao thì nắng, vắng sao thì mưa", "Tục ngữ"], ["Tiền nào của nấy", "Tục ngữ"], ["Đổi trắng thay đen", "Tục ngữ"], ["Muốn biết phải hỏi, muốn giỏi phải học", "Tục ngữ"], ["Anh em chín họ mười đời\nHai đằng cùng có, chẳng rời nhau ra", "Ca dao"], ["Đứng mũi chịu sào", "Tục ngữ"], ["Tiên học lễ hậu học văn", "Tục ngữ"], ["Nhất nước, nhì phân, tam cần, tứ giống", "Tục ngữ"], ["Miếng ăn là miếng nhục", "Tục ngữ"], ["Cau non về hạt, gái đảm về chồng", "Tục ngữ"], ["Sông sâu sóng cả chớ ngã tay chèo", "Tục ngữ"], ["Vì con sống, mẹ suốt đời lam lũ,\nVì con vui, mẹ gánh hết đau buồn", "Ca dao"], ["Chồng đẹp, vợ đẹp những nhìn mà no", "Tục ngữ"], ["Mẹ ngoảnh đi con dại, mẹ ngoảnh lại con khôn", "Tục ngữ"], ["Mất lòng thánh, được lòng thần", "Tục ngữ"], ["Chồng cần, vợ kiệm là tiên,\nNgông nghênh nhăng nhít là tiền bỏ đi", "Ca dao"], ["Anh em nào phải người xa,\nCùng chung bác mẹ, một nhà cùng thân.\nYêu nhau như thể tay chân,\nAnh em hòa thuận, hai thân vui vầy", "Ca dao"], ["Khôn không qua lẽ, khỏe chẳng qua lời", "Tục ngữ"], ["Gừng càng già càng cay", "Tục ngữ"], ["Chồng nào vợ nấy", "Tục ngữ"], ["Tai vách mạch rừng", "Tục ngữ"], ["Anh ngủ em thức, em chực anh nằm", "Tục ngữ"], ["Nước chảy đá mòn", "Tục ngữ"], ["Gà cồ mà ăn tấm nong\nMấy đời cháu ngoại giỗ ông bao giờ", "Ca dao"], ["Thùng rỗng kêu to", "Tục ngữ"], ["Vợ chồng đạo nghĩa cho bền\nBạn bè chung thủy, dưới trên đàng hoàng", "Ca dao"], ["Anh em như chân như tay,\nVợ chồng như áo cởi ngay nên lìa", "Ca dao"], ["Nhớ ơn chín chữ cù lao,\nBa năm bú mớm biết bao thân tình", "Ca dao"], ["Anh em như thể tay chân", "Tục ngữ"], ["Thương chồng nấu cháo le le\nNấu canh bông bí, nấu chè hột sen", "Ca dao"], ["Phòng bệnh hơn chữa bệnh", "Tục ngữ"], ["Thua keo này bày keo khác", "Tục ngữ"], ["Muốn cho gần mẹ gần cha,\nKhi vào thúng thóc, khi ra quan tiền", "Ca dao"], ["Vàng thật không sợ lửa", "Tục ngữ"], ["Ôm con mẹ đếm sao trời,\nĐếm hoài không hết một đời long đong", "Ca dao"], ["Giận thì mắng, lặng thì thương", "Tục ngữ"], ["Mềm nắn, rắn buông", "Tục ngữ"], ["Ở hiền gặp lành, ở ác gặp ác", "Tục ngữ"], ["Ăn quả nhớ kẻ trồng cây\nUống nước sông, nhớ mạch suối", "Ca dao"], ["Em khôn cũng là em chị, chị dại cũng là chị em", "Tục ngữ"], ["Vụng múa, chê đất lệch", "Tục ngữ"], ["Anh em như tre cùng khóm,\nChị em gái như trái cau non", "Ca dao"], ["Ẵm con chồng không bằng bồng cháu ngoại", "Tục ngữ"], ["Anh em thuận hòa là nhà có phúc", "Tục ngữ"], ["Đa đa ích thiện", "Tục ngữ"], ["Con ai là chẳng giống cha\nCháu ai là chẳng giống bà, giống ông", "Ca dao"], ["Mạch trong nước chảy ra trong,\nThế nào đi nữa còn dòng cũng hơn", "Ca dao"], ["Chớ dung kẻ gian, chớ oan người ngay", "Tục ngữ"], ["Ở bầu thì tròn, ở ống thì dài", "Tục ngữ"], ["Ghét của nào trời trao của nấy", "Tục ngữ"], ["Oán không giải được oán", "Tục ngữ"], ["Chim có tổ người có tông", "Tục ngữ"], ["Tấc đất tấc vàng", "Tục ngữ"], ["Yêu nhau từ thuở trong nôi\nEm nằm em khóc, anh ngồi anh ru", "Ca dao"], ["Con cái khôn ngoan, vẻ vang cha mẹ\nCon cái ngu dại, tổn hại ông cha", "Ca dao"], ["Chim trời ai dễ đếm lông,\nNuôi con ai dễ kể công tháng ngày", "Ca dao"], ["Cá không ăn muối cá ươn,\nCon cãi cha mẹ trăm đường con hư", "Ca dao"], ["Không làm sao nên", "Tục ngữ"], ["Mẹ là tất cả mẹ ơi!\nTrăm năm mẹ gánh đời con lưng còng", "Ca dao"], ["Yêu nên tốt, ghét nên xấu", "Tục ngữ"], ["Vặt đầu cá, vá đầu tôm", "Tục ngữ"], ["Anh em cốt nhục đồng bào,\nVợ chồng là nghĩa lẽ nào không thương", "Ca dao"], ["Cha mẹ giàu con thong thả,\nCha mẹ nghèo con vất vả gian nan", "Ca dao"], ["Mẹ là ngọn gió đưa êm.\nMẹ là dòng suối mơ huyền bao la", "Ca dao"], ["Cày sâu cuốc bẫm", "Tục ngữ"], ["Chiều chiều chim vịt kêu chiều,\nBâng khuâng nhớ mẹ chín chiều ruột đau", "Ca dao"], ["Ả hợp cùng anh duyên ưa phận đẹp", "Tục ngữ"], ["Vạch áo cho người xem lưng", "Tục ngữ"], ["Ông bà là ngọc là vàng\nAi mà biết quý phúc rơi đầy nhà", "Ca dao"], ["Công danh hai chữ tờ mờ\nLấy gì khuya sớm phụng thờ tổ tiên", "Ca dao"], ["Môi hở răng lạnh", "Tục ngữ"], ["Lòng tham vô đáy", "Tục ngữ"], ["Đi một ngày đàng học một sàng khôn", "Tục ngữ"], ["Mềm quá thì yếu, cứng quá thì gãy", "Tục ngữ"], ["Con người có tổ, có tông,\nNhư cây có cội, như sông có nguồn", "Ca dao"], ["Trách ai đặng cá quên nơm,\nĐặng chim bẻ ná, quên ơn sinh thành", "Ca dao"], ["Cãi thầy núi đè", "Tục ngữ"], ["Của một đồng, công một nén", "Tục ngữ"], ["Mẹ già như chuối chín cây,\nGió đưa mẹ rụng, con rày mồ côi", "Ca dao"], ["Mẹ già như ánh trăng khuya,\nDịu dàng soi tỏ bước đi con hiền", "Ca dao"], ["Yêu nhau yêu cả đường đi ghét nhau ghét cả tông chi họ hàng", "Tục ngữ"], ["Dạy con, con nhớ lấy lời,\nTrọng cha, kính mẹ, suốt đời chớ quên", "Ca dao"], ["Râu tôm nấu với ruột bầu\nChồng chan vợ húp gật đầu khen ngon", "Ca dao"], ["Giấy rách phải giữ lấy lề", "Tục ngữ"], ["Sóng Trường Giang, sóng sau đập sóng trước", "Tục ngữ"], ["Chẳng khôn thể chị lâu ngày, chị đái ra váy cũng tày em khôn", "Ca dao"], ["Mồ côi cha, ăn cơm với cá,\nMồ côi mẹ lót lá mà nằm", "Ca dao"], ["Chồng sang đi võng đầu rồng,\nChồng hèn gánh nặng đè còng cả lưng", "Ca dao"], ["Nước đến chân mới nhảy", "Tục ngữ"], ["Ruộng bề bề chẳng bằng nghề trong tay", "Tục ngữ"], ["Nước lã không khuấy nên hồ", "Tục ngữ"], ["Ơn cha nặng lắm ai ơi,\nNghĩa mẹ bằng trời, chín tháng cưu mang", "Ca dao"], ["Ăn quả nhớ kẻ trồng cây", "Tục ngữ"], ["Liệu cơm gắp mắm", "Tục ngữ"], ["Cồng cộc bắt cá dưới sông\nMấy đời cháu ngoại giỗ ông bao giờ", "Ca dao"], ["Đi việc làng giữ lấy họ, đi việc họ giữ lấy anh em", "Tục ngữ"], ["Mẹ già như chuối ba hương.\nNhư xôi nếp một, như đường mía lau", "Ca dao"], ["Anh em như thể chân tay\nCùng cha cùng mẹ hăng say việc nhà", "Ca dao"], ["Bát còn có lúc xô xát, huống chi vợ chồng", "Tục ngữ"], ["Một miệng thì kín, chín miệng thì hở", "Tục ngữ"], ["Đi hỏi già, về nhà hỏi trẻ", "Tục ngữ"], ["Hoa này tàn thì hoa khác nở,\nMất mẹ rồi vạn thuở tìm đâu", "Ca dao"], ["Rau cải nấu với cá rô\nGừng thêm một lát, cho cô giữ chồng", "Ca dao"], ["Bắt cá hai tay", "Tục ngữ"], ["Biết thì thưa thốt, không biết thì dựa cột mà nghe", "Tục ngữ"], ["Má ơi, đừng gả con xa,\nChim kêu, vượn hú biết nhà má đâu", "Ca dao"], ["Mũi dại, lái phải chịu đòn", "Tục ngữ"], ["Chồng tới, vợ phải lui", "Tục ngữ"], ["Thương người như thể thương thân", "Tục ngữ"], ["Con nhà tông không giống lông cũng giống cánh", "Tục ngữ"], ["Một giọt máu đào hơn ao nước lã", "Tục ngữ"], ["Chẳng thi, chẳng đỗ, chẳng sao\nAnh em không được người nào bỏ nhau\nPhải đòi cho được thày Cầu.\nPhải đào hết đất nhà giàu đổ đi", "Ca dao"], ["Muốn ăn thì lăn vào bếp", "Tục ngữ"], ["Trống đánh xuôi, kèn thổi ngược", "Tục ngữ"], ["Ăn cơm mới, nói chuyện cũ", "Tục ngữ"], ["Chim khôn đậu nóc nhà quan,\nTrai khôn tìm vợ, gái ngoan tìm chồng", "Ca dao"], ["Ai đem dùi đục đi hỏi vợ", "Tục ngữ"], ["Đói cho sạch, rách cho thơm", "Tục ngữ"], ["Khôn ngoan đối đáp người ngoài,\nGà cùng một mẹ chớ hoài đá nhau", "Ca dao"], ["Con không nghe mẹ nghe cha, mắm không ưa muối thì ắt là đổ đi", "Tục ngữ"], ["Ai rằng công mẹ như non,\nThật ra công mẹ lại còn lớn hơn", "Ca dao"], ["Chiều chiều ngó ngược ngó xuôi,\nNgó không thấy mẹ, bùi ngùi nhớ thương", "Ca dao"], ["Nuôi con chẳng quản chi thân,\nChỗ ướt mẹ nằm, chỗ ráo con lăn", "Ca dao"], ["Khéo ăn thì no, khéo co thì ấm", "Tục ngữ"], ["Cha một đời oằn vai gánh nặng,\nMẹ một đời đôi dép lạc bàn chân", "Ca dao"], ["Anh em chém nhau đằng dọng, ai chém đằng lưỡi", "Tục ngữ"], ["Thất bại là mẹ thành công", "Tục ngữ"], ["Vẽ đường cho hươu chạy", "Tục ngữ"], ["Công cha đức mẹ cao dày,\nCưu mang trứng nước những ngày ngây thơ.\nNuôi con khó nhọc đến giờ,\nTrưởng thành con phải biết thờ song thân", "Ca dao"], ["Cây kia ăn quả ai trồng\nSông kia uống nước hỏi dòng từ đâu", "Ca dao"], ["Bà con vì tổ vì tiên, không ai vì tiền vì gạo", "Tục ngữ"], ["Cái răng, cái tóc là góc con người", "Tục ngữ"], ["Mưa dầm thấm lâu", "Tục ngữ"], ["Trâu chậm uống nước đục", "Tục ngữ"], ["Nhà em có vại cà đầy\nCó ao rau muống, có đầy chĩnh tương.\nDầu không mỹ vị cao lương\nTrên thờ cha mẹ, dưới nhường anh em.", "Ca dao"], ["Nghèo sinh bệnh, giàu sinh tật", "Tục ngữ"], ["Trăng quầng thì hạn, trăng tán thì mưa", "Tục ngữ"], ["Một con ngựa đau, cả tàu bỏ cỏ", "Tục ngữ"], ["Thắng làm vua thua làm giặc", "Tục ngữ"], ["Cái khó ló cái khôn", "Tục ngữ"], ["Chặng đường bao nỗi đắng cay,\nNuôi con đâu kể tháng ngày gian nan", "Ca dao"], ["Ra đi anh nhớ quê nhà\nNhớ canh rau muống, nhớ cà dầm tương\nNhớ ai dãi nắng, dầm sương\nNhớ ai tát nước bên đường hôm nao", "Ca dao"], ["Khôn ngoan nhớ đức cha ông\nLàm nên phải đoái tổ tông phụng thờ", "Ca dao"], ["Chữ rằng: vấn tổ tầm tông\nCháu con nỡ bỏ cha ông sao đành", "Ca dao"], ["Cây ngay không sợ chết đứng", "Tục ngữ"], ["Ăn khoai nhớ kẻ cho dây mà trồng", "Tục ngữ"], ["Mẹ giàu con có, mẹ khó con không", "Tục ngữ"], ["Vỏ quít dày, móng tay nhọn", "Tục ngữ"], ["Ông ơi chớ vội đi xa\nĐể cho con cháu họp về chung vui", "Ca dao"], ["Một mặt người bằng mười mặt của", "Tục ngữ"], ["Việc người thì sáng, việc mình thì quáng", "Tục ngữ"], ["Cho dù xa cách biển đông,\nMênh mông tình mẹ ngát lòng đại dương", "Ca dao"], ["Anh em một khí huyết phân\nCũng như người có tay chân khác gì.\nAi ơi lấy đấy mà suy\nCó câu đường lệ trong thi để truyền", "Ca dao"], ["Ví dầu con phụng bay qua\nMẹ nói con gà, con cũng nói theo", "Ca dao"], ["Tu đâu cho bằng tu nhà,\nThờ cha kính mẹ mới là chân tu", "Ca dao"], ["Con ho lòng mẹ tan tành,\nCon sốt lòng mẹ như bình nước sôi", "Ca dao"], ["Mẹ già một nắng hai sương.\nTrải thân làm bóng mát đường con đi", "Ca dao"], ["Mẹ già đầu tóc bạc phơ,\nLưng đau con đỡ, mắt mờ con nuôi", "Ca dao"], ["Thứ nhất phải có ông bà\nThứ hai kế đến chính là mẹ cha\nCòn con đứng ở thứ ba\nCháu thì đứng chót đó là thứ tư", "Ca dao"], ["Một câu nhịn, chín câu lành", "Tục ngữ"], ["Đã nghèo còn mắc cái eo", "Tục ngữ"], ["Anh em trên kính dưới nhường\nLà nhà có phúc, mọi đường yên vui", "Ca dao"], ["Rừng vàng biển bạc", "Tục ngữ"], ["Người ta là hoa đất", "Tục ngữ"], ["Cháu ơi cháu ngủ cho lâu\nMẹ cháu đi cấy đồng sâu chưa về\nBắt được con trắm con trê\nTròng cổ mang về bà cháu mình ăn", "Ca dao"], ["Làm người phải biết cương thường\nXem trong ngũ đẳng quân vương đứng đầu", "Ca dao"], ["Trứng rồng lại nở ra rồng\nHạt thông lại nở cây thông rườm rà\nCó cha mới sinh ra ta\nLàm nên thời bởi mẹ cha vun trồng", "Ca dao"], ["Cánh cò cõng nắng cõng mưa,\nMẹ tôi cõng cả bốn mùa gió sương", "Ca dao"], ["Sông có khúc, người có lúc", "Tục ngữ"], ["Tốt danh hơn lành áo", "Tục ngữ"], ["Áo rộng thì lắm ốc nhồi,\nNhững người lắm vợ là người trời bêu", "Ca dao"], ["Công cha nặng lắm ai ơi,\nNghĩa mẹ bằng trời chín tháng cưu mang", "Ca dao"], ["Máu chảy ruột mềm", "Tục ngữ"], ["Đã rằng là nghĩa vợ chồng,\nDầu cho nghiêng núi, cạn sông chẳng rời", "Ca dao"], ["Bốn bể mười nhà", "Tục ngữ"], ["Ấm oái như hai gái lấy một chồng", "Tục ngữ"], ["Nhất canh trì, nhị canh viên, tam canh điền", "Tục ngữ"], ["Vừa ăn cướp, vừa la làng", "Tục ngữ"], ["Anh em như thể tay chân,\nRách lành đùm bọc, dở hay đỡ đần", "Ca dao"], ["No mất ngon, giận mất khôn", "Tục ngữ"], ["Một người biết lo bằng kho người làm", "Tục ngữ"], ["Ơn dưỡng dục một đời con ghi tạc,\nNghĩa sinh thành trọn kiếp mãi không quên", "Ca dao"], ["Bạn bè là nghĩa tương tri", "Tục ngữ"], ["À ơi cháu ngủ cho ngoan\nTiếng Bà ru cháu chứa chan tình người\nBà thương yêu cháu nhất đời\nSẵn sàng vì cháu thiệt thòi bản thân", "Ca dao"], ["Anh em hạt máu sẻ đôi", "Tục ngữ"], ["Đố ai đếm được lá rừng,\nĐố ai đếm được mấy tầng trời cao.\nĐố ai đếm được vì sao,\nĐố ai đếm được công lao mẹ già", "Ca dao"], ["Vắng nghe chim vịt kêu chiều,\nBâng khuâng nhớ mẹ chín chiều ruột đau", "Ca dao"], ["Chồng chung vợ chạ, ai khéo hầu hạ thì được chồng riêng", "Tục ngữ"], ["Giận quá mất khôn", "Tục ngữ"], ["Cọp chết để da, người ta chết để tiếng", "Tục ngữ"], ["Con hư tại mẹ, cháu hư tại bà", "Tục ngữ"], ["Mẹ còn là cả trời hoa,\nCha còn là cả một tòa kim cương", "Ca dao"], ["Rau nào sâu nấy", "Tục ngữ"], ["Khen ai khéo tiện ngù cờ\nKhéo xây bàn án, khéo thờ tổ tiên\nTổ tiên để lại em thờ\nAnh ra ngoài ải, cầm cờ theo vua", "Ca dao"], ["Lên non mới biết non cao,\nNuôi con mới biết công lao mẹ, thầy", "Ca dao"], ["Người sống hơn đống vàng", "Tục ngữ"], ["Chồng như đó, vợ như hom", "Tục ngữ"], ["Trải qua thập tử nhất sinh,\nMẹ già sống mãi yên bình bên con", "Ca dao"], ["Chồng sang vợ được đi giày,\nVợ sang chồng được ghé ngày cậy trông", "Ca dao"], ["Đôi ta là nghĩa tào khang\nXuống khe bắt ốc, lên ngàn hái rau", "Ca dao"], ["Chân cứng đá mềm", "Tục ngữ"], ["Ngồi buồn nhớ mẹ ta xưa,\nMiệng nhai cơm búng, lưỡi lừa cá xương", "Ca dao"], ["Năng làm thì nên", "Tục ngữ"], ["Cây muốn lặng mà gió chẳng dừng", "Tục ngữ"], ["Thuận vợ thuận chồng, tát biển Đông cũng cạn", "Tục ngữ"], ["Trông cho rau muống mau xanh\nĐể em cắt nấu chén canh mặn mà\nNhà em không vịt không gà\nChỉ có dưa muối, đậu cà đãi anh", "Ca dao"], ["Mưa tháng ba hoa đất, mưa tháng tư hư đất", "Tục ngữ"], ["Chiều người lấy việc, chiều chồng lấy con", "Tục ngữ"], ["Lời nói chẳng mất tiền mua,\nLựa lời mà nói cho vừa lòng nhau", "Ca dao"], ["Lá rụng về cội", "Tục ngữ"], ["Mẹ nghèo mưa dột mái tranh,\nTrải bao bất hạnh muôn phần gian truân", "Ca dao"], ["Mống đông vồng tây, chẳng mưa dây cũng bão giật", "Tục ngữ"], ["Thương cho roi cho vọt, ghét cho ngọt cho bùi", "Tục ngữ"], ["Tu đâu cho bằng tu nhà,\nThờ cha kính mẹ mới chân tu", "Ca dao"], ["Mẹ dạy thì con khéo, cha dạy thì con khôn", "Tục ngữ"], ["Anh em hiền thật là hiền,\nBởi một đồng tiền nên mất lòng nhau", "Ca dao"], ["Lặng nhìn sợi tóc như sương,\nVướng trên đầu lược mà thương mẹ già", "Ca dao"], ["Phúc bất trùng lai, hoạ vô đơn chí", "Tục ngữ"], ["Một nụ cười bằng mười thang thuốc bổ", "Tục ngữ"], ["Có công mài sắt, có ngày nên kim", "Tục ngữ"], ["Gạo chợ, nước sông, củi đồng, nồi đất", "Tục ngữ"], ["Chẻ củi xem thớ, lấy vợ xem tông", "Tục ngữ"], ["Anh em trong nhà đóng cửa bảo nhau", "Tục ngữ"], ["Không có lửa làm sao có khói", "Tục ngữ"], ["Ngưu tầm ngưu, mã tầm mã", "Tục ngữ"], ["Chân yếu tay mềm", "Tục ngữ"], ["Chớ thấy sóng cả mà rã tay chèo", "Tục ngữ"], ["Muốn ăn cá cả phải thả câu dài", "Tục ngữ"], ["Một miếng khi đói bằng một gói khi no", "Tục ngữ"], ["Kính lão đắc thọ", "Tục ngữ"], ["Quả báo nhãn tiền", "Tục ngữ"], ["Nhớ con tựa cửa chờ mong,\nMắt mờ khô lệ mẹ trông con về", "Ca dao"], ["Xa nhà cách trường", "Tục ngữ"], ["Ơn cha mẹ trời cao khôn thấu\nNghĩa anh em xương cốt ruột rà\nMuốn cho trên thuận dưới hòa\nChẳng thà chịu nhục hơn là rẽ nhau", "Ca dao"], ["Có tình thì đãi người dưng\nAnh em bất nghĩa thì đừng anh em", "Ca dao"], ["Thương em vì cá trích ve\nVì rau muống luộc, vì mè trộn măng", "Ca dao"], ["Tay làm hàm nhai, tay quai miệng trễ", "Tục ngữ"], ["Kính trên nhường dưới", "Tục ngữ"], ["Nước lã mà vã nên hồ,\nTay không mà nổi cơ đồ mới ngoan", "Ca dao"], ["Chồng đã giận, vợ bớt lời", "Tục ngữ"], ["Miệng ru mắt nhỏ hai hàng,\nNuôi con khôn lớn mẹ càng thêm lo", "Ca dao"], ["Nhà giàu đứt tay bằng ăn mày đổ ruột", "Tục ngữ"], ["Đàn ông xây nhà, đàn bà xây tổ ấm", "Tục ngữ"], ["Phú quý sinh lễ nghĩa, bần cùng sinh đạo tặc", "Tục ngữ"], ["Vắt cổ chày ra nước", "Tục ngữ"], ["Còn nước, còn tát", "Tục ngữ"], ["Cơm chẳng lành, canh chẳng ngọt.\nChín đụn mười con cũng lìa", "Ca dao"], ["Ai về Phú Thọ cùng ta\nVui ngày giỗ tổ tháng ba mùng mười", "Ca dao"], ["Cái ngủ mày ngủ cho lâu,\nMẹ mày đi cấy ruộng sâu chưa về", "Ca dao"], ["Bé không vin, cả gãy cành", "Tục ngữ"], ["Chung lưng đấu sức", "Tục ngữ"], ["Tử hiếu song thân lạc, gia hòa vạn sự thành", "Tục ngữ"], ["Ăn không ngồi rồi", "Tục ngữ"], ["Vắng chủ nhà gà mọc đuôi tôm", "Tục ngữ"], ["Một cây làm chẳng nên non ba cây chụm lại nên hòn núi cao", "Tục ngữ"], ["Người đẹp vì lụa, lúa tốt vì phân", "Tục ngữ"], ["Khôn đâu tới trẻ, khỏe đâu tới già", "Tục ngữ"], ["Một điều nhịn chín điều lành", "Tục ngữ"], ["Một câu nhịn bằng chín câu lành", "Tục ngữ"], ["Muốn gì được nấy", "Tục ngữ"], ["Lòng mẹ như bát nước đầy,\nMai này khôn lớn, ơn này tính sao", "Ca dao"], ["Góp gió thành bão", "Tục ngữ"], ["Cắt dây bầu dây bí, ai nỡ cắt dây chị dây em", "Tục ngữ"], ["Vắng chủ nhà gà vọc niêu tôm", "Tục ngữ"], ["Lửa thử vàng, gian nan thử sức", "Tục ngữ"], ["Anh em hiếu thảo thuận hiền\nChớ vì đồng tiền mà mất lòng nhau", "Ca dao"], ["Mạnh vì gạo, bạo vì tiền", "Tục ngữ"], ["Mẹ nuôi con biển hồ lai láng,\nCon nuôi mẹ tính tháng tính ngày", "Ca dao"], ["Gần mực thì đen, gần đèn thì sáng", "Tục ngữ"], ["Giấu đầu hở đuôi", "Tục ngữ"], ["Dù đi khắp bốn phương trời,\nCông cha nghĩa mẹ không ai sánh bằng", "Ca dao"], ["Bán anh em xa, mua láng giềng gần", "Tục ngữ"], ["Mẹ già ở tấm lều tranh,\nSớm thăm tối viếng mới đành dạ con", "Ca dao"], ["Đói lòng ăn trái ổi non,\nNhịn cơm nuôi mẹ cho tròn nghĩa xưa", "Ca dao"], ["Cha già tuổi đã đủ trăm,\nChạnh lòng nhớ tới đằm đằm lụy sa", "Ca dao"], ["Bao năm gian khổ héo hon,\nMẹ luôn cam chịu nuôi con nên người", "Ca dao"], ["Đêm khuya trăng rụng xuống cầu,\nCảm thương cha mẹ dãi dầu ruột đau", "Ca dao"], ["Tôm rằn lột bỏ đuôi\nGiã gạo cho trắng mà nuôi mẹ già.\nBa tiền một khứa cá buôi\nCũng mua cho được để nuôi mẹ già", "Ca dao"], ["Đi đâu mà bỏ mẹ già,\nGối nghiêng ai sửa\nChén trà ai dâng?", "Ca dao"], ["Mẹ già hết gạo treo niêu,\nMà anh khăn đỏ khăn điều vắt vai", "Ca dao"], ["Cha mẹ sinh con trời sinh tính", "Tục ngữ"], ["Ả Chức chàng Ngưu", "Tục ngữ"], ["Đèn nhà ai nhà nấy rạng", "Tục ngữ"], ["Lá lành đùm lá rách", "Tục ngữ"], ["Công cha như núi Thái Sơn,\nNghĩa mẹ như nước trong nguồn chảy ra.\nMột lòng thờ mẹ kính cha,\nCho tròn chữ hiếu mới là đạo con", "Ca dao"], ["Trời mưa cho ướt lá dừa\nCho tươi luống cải cho vừa lòng em.\nCho em hái đọt rau dền,\nNấu tô canh ngọt dâng lên mẹ già.", "Ca dao"], ["Anh em ai đầy nồi nấy,\nVợ chồng không thấy lìa nhau", "Ca dao"], ["Uống nước nhớ nguồn", "Tục ngữ"], ["Người thanh tiếng nói cũng thanh,\nChuông kêu khẽ đánh bên thành cũng kêu", "Ca dao"], ["Trời cao, biển rộng, đất dày,\nƠn cha nghĩa mẹ, ơn thầy chớ quên", "Ca dao"], ["Ai ơi giữ chí cho bền\nDù ai xoay hướng đổi nền mặc ai\nXin đừng làm, nói đơn sai\nTin mình đừng sợ những lời dèm pha", "Ca dao"], ["Đưa kim qua nỗi ưu phiền,\nMẹ ngồi vá lại cho nguyên sự đời", "Ca dao"], ["Của ăn của để", "Tục ngữ"], ["Con hơn cha là nhà có phúc", "Tục ngữ"], ["Vong ân bội nghĩa", "Tục ngữ"], ["Anh em ghét nhau, ốm đau tìm đến", "Tục ngữ"], ["Sinh lão bệnh tử", "Tục ngữ"], ["Yêu nhau như thể tay chân,\nAnh em hòa thuận, hai thân vui vầy", "Ca dao"], ["Gió mùa thu mẹ ru con ngủ,\nNăm canh dài, mẹ thức đủ năm canh", "Ca dao"], ["Thẳng như ruột ngựa", "Tục ngữ"], ["Chết đứng còn hơn sống quỳ", "Tục ngữ"], ["Ngàn năm tóc mẹ còn bay,\nNgàn năm tình mẹ sống đầy trong con", "Ca dao"], ["Vỏ quýt dày có móng tay nhọn", "Tục ngữ"], ["Tốt gỗ hơn tốt nước sơn", "Tục ngữ"], ["Bóc ngắn cắn dài", "Tục ngữ"]];
function leCuaNgay(j) {
  const [dd, mm] = jdToDate(j);
  const am = amCuaJd(j);
  const ds = [];
  const d = LE_DUONG[`${dd}-${mm}`];
  if (d) ds.push({
    ten: d[0],
    loai: "duong",
    nghi: d[1] === 1
  });
  if (!am.leap) {
    const a = LE_AM[`${am.day}-${am.month}`];
    if (a) ds.push({
      ten: a[0],
      loai: "am",
      nghi: a[1] === 1
    });
    // Giao thừa: ngày cuối cùng của tháng Chạp
    if (am.month === 12 && amCuaJd(j + 1).month === 1) ds.push({
      ten: "Giao thừa — Tất niên",
      loai: "am",
      nghi: true
    });
  }
  if (!ds.some(x => x.loai === "am")) {
    if (am.day === 1) ds.push({
      ten: `Mùng Một tháng ${am.month}${am.leap ? " nhuận" : ""}`,
      loai: "ram",
      nghi: false
    });else if (am.day === 15) ds.push({
      ten: `Ngày Rằm tháng ${am.month}${am.leap ? " nhuận" : ""}`,
      loai: "ram",
      nghi: false
    });
  }
  return ds;
}
