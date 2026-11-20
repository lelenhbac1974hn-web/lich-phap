/* Lịch Pháp © 2026 Lê Lệnh Bắc. Bảo lưu mọi quyền. Bản chính thức, miễn phí: https://lelenhbac1974hn-web.github.io/lich-phap/ — cấm đưa lên chợ ứng dụng, bán hay phát hành lại khi chưa được phép (xem LICENSE). */
/* GIAO DIỆN — PHẦN DÙNG CHUNG: hằng, tiện ích, trạng thái st, thông tin một ngày, chuyển mục, chiều cao màn hình, bảng chẩn đoán.
   Giao diện chia nhiều tệp, nạp theo thứ tự trong index.html: ui-chung → ui-to-lich → ui-gio-thang → ui-sao → ui-nhac → ui-khoi-dong.
   Các tệp dùng chung tên khai báo ở mức ngoài cùng (hằng, hàm, trạng thái st); chỉ ui-khoi-dong.js gắn sự kiện chung và vẽ lần đầu. */
"use strict";

const THANG_AM = ["Giêng", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "Tám", "Chín", "Mười", "Mười Một", "Chạp"];
const CON_GIAP = ["Chuột", "Trâu", "Hổ", "Mèo", "Rồng", "Rắn", "Ngựa", "Dê", "Khỉ", "Gà", "Chó", "Lợn"];
const BAC_UI = [
  { t: "Rất xấu", lop: "b0" },
  { t: "Xấu", lop: "b1" },
  { t: "Bình thường", lop: "b2" },
  { t: "Tốt", lop: "b3" },
  { t: "Rất tốt", lop: "b4" }
];

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const hai = n => String(n).padStart(2, "0");
/* Giao diện sáng / tối: "tu-dong" theo cài đặt của máy, hoặc "sang", "toi" do người dùng chọn trong menu */
const KHOA_GD = "lichphap:giao-dien";
const mayToi = window.matchMedia("(prefers-color-scheme: dark)");
function layGiaoDien() { try { return localStorage.getItem(KHOA_GD) || "tu-dong"; } catch (e) { return "tu-dong"; } }
/* Bộ áo: "co-dien" (mặc định, giấy kem gáy đỏ) · "tre" (Trẻ trung: bạc hà, kem, chữ tròn) · "hien-dai" (xanh thẫm, tím, vàng — luôn tối).
   Chỉ đổi biến màu và phông; màu mang nghĩa (đỏ xấu, xanh tốt, 5 bậc) giữ nguyên nghĩa. */
const KHOA_AO = "lichphap:bo-ao", BO_AO = ["co-dien", "tre", "hien-dai"];
function layAo() { try { const a = localStorage.getItem(KHOA_AO); return BO_AO.includes(a) ? a : "co-dien"; } catch (e) { return "co-dien"; } }
function datAo(a) {
  a = BO_AO.includes(a) ? a : "co-dien";
  try { if (a === "co-dien") localStorage.removeItem(KHOA_AO); else localStorage.setItem(KHOA_AO, a); } catch (e) { /* chỉ đổi trong phiên */ }
  apGiaoDien(a);
}
function apGiaoDien(aoTam) {
  const ao = aoTam || layAo(), g = layGiaoDien(), toi = ao === "hien-dai" || g === "toi" || (g !== "sang" && mayToi.matches);
  if (ao === "co-dien") delete document.documentElement.dataset.ao; else document.documentElement.dataset.ao = ao;
  document.documentElement.toggleAttribute("data-toi", toi);
  const mau = document.querySelector('meta[name="theme-color"]');
  if (mau) mau.content = ao === "tre" ? "#3F9688" : ao === "hien-dai" ? "#0E1726" : "#B3261E";
  const m = document.querySelector('meta[name="color-scheme"]');
  if (m) m.content = toi ? "dark" : "light";
}
function datGiaoDien(g) {
  try { if (g === "tu-dong") localStorage.removeItem(KHOA_GD); else localStorage.setItem(KHOA_GD, g); } catch (e) { /* không lưu được: chỉ đổi trong phiên */ document.documentElement.toggleAttribute("data-toi", g === "toi"); return; }
  apGiaoDien();
}
mayToi.addEventListener("change", () => apGiaoDien());
apGiaoDien();
/* Kiểu tờ lịch — tốt xấu ở chân tờ: "g" (mặc định) hàng mỏng có lý do · "e" triện · "f" thang 5 bậc dưới tháng âm ·
   "goc" tờ lịch gốc, dải tốt xấu riêng bên dưới */
const KHOA_TO = "lichphap:to-lich", KIEU_TO = ["g", "e", "f", "goc"];
const kieuToHopLe = k => KIEU_TO.includes(k) ? k : "g";
function layToLich() { try { return kieuToHopLe(localStorage.getItem(KHOA_TO)); } catch (e) { return "g"; } }
function datToLich(k) {
  k = kieuToHopLe(k);
  try { if (k === "g") localStorage.removeItem(KHOA_TO); else localStorage.setItem(KHOA_TO, k); } catch (e) { /* không lưu được: chỉ đổi trong phiên */ }
  document.body.dataset.kieuTo = k;
}
document.body.dataset.kieuTo = layToLich();
/* Biểu tượng nét nhỏ đi kèm chữ (thay emoji màu) — cùng bộ với biểu tượng Nhắc việc */
const ic = k => window.BieuTuong ? `<i class="ic">${window.BieuTuong.svg(k)}</i>` : "";

function jdHomNay() {
  const d = new Date();
  return jdFromDate(d.getDate(), d.getMonth() + 1, d.getFullYear());
}
/* Mốc 23 giờ: giờ Tý (23 giờ) đã sang ngày mới theo can chi, nhưng ngày dương, ngày âm và luận ngày vẫn là hôm nay.
   Chỉ phần can chi (can chi ngày, mười hai giờ, hướng thần, ngày xung) đổi sang ngày mới — jdCanChi. */
const jdLich = () => jdHomNay();
const sauGioTy = () => new Date().getHours() >= 23;
const jdCanChi = j => j + (j === jdHomNay() && sauGioTy() ? 1 : 0);
/* Một cách viết ngày và đếm ngày cho cả app (luật giao diện 8):
   dòng "T2 23/11" (thêm năm khi khác năm nay) · tiêu đề, chi tiết "Thứ Hai 23/11/2026" · âm "15/10 âm" ·
   đếm Hôm nay · Ngày mai · Còn N ngày · Quá N ngày */
function nhanNgay(j, du) {
  const [d, m, y] = jdToDate(j);
  return du ? `${THU[thuCuaJd(j)]} ${hai(d)}/${hai(m)}/${y}`
    : `${THU_NGAN[thuCuaJd(j)]} ${hai(d)}/${hai(m)}${y !== jdToDate(jdHomNay())[2] ? "/" + y : ""}`;
}
const nhanAm = j => { const a = amCuaJd(j); return `${a.day}/${a.month}${a.leap ? " nhuận" : ""} âm`; };
const chuDem = k => k < 0 ? `Quá ${-k} ngày` : k === 0 ? "Hôm nay" : k === 1 ? "Ngày mai" : `Còn ${k} ngày`;
const chuThuong = s => s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
const thuCuaJd = j => (j + 1) % 7; // 0 = Chủ Nhật

/* kieu: "sach" = luận theo sách (luan-sach.js, mặc định từ bản 1.16.0), "sao" = cộng sao (thang điểm); nhớ lựa chọn của người dùng */
const st = { jd: jdLich(), viec: "chung", kieu: (() => { try { return localStorage.getItem("lichphap:kieu-luan") === "sao" ? "sao" : "sach"; } catch (e) { return "sach"; } })() };
const bacTheoKieu = (j, am, viec) => st.kieu === "sach" ? luanTheoSach(j, am, viec).bac : chamDiem(j, am, viec).bac;

/* ── Gom toàn bộ thông tin một ngày ── */
function thongTin(j, viec) {
  const [dd, mm, yy] = jdToDate(j);
  const am = amCuaJd(j);
  const dauThang = j - am.day + 1;
  const du = amCuaJd(dauThang + 29).day === 30;
  return {
    j, dd, mm, yy, am, du,
    thu: thuCuaJd(j),
    le: leCuaNgay(j),
    cd: chamDiem(j, am, viec),
    ls: luanTheoSach(j, am, viec),
    gio: gioTrongNgay(j),
    tiet: tietKhi(j),
    ccNgay: ccNgay(j),
    ccThang: ccThang(am.month, am.year),
    ccNam: ccNam(am.year),
    conGiap: CON_GIAP[(am.year + 8) % 12]
  };
}

/* ── Mặt trăng theo ngày âm ── */
function svgTrang(ngayAm, co) {
  const r = co / 2 - 1, c = co / 2;
  const pha = ((ngayAm - 1) / 29.53) * 2 * Math.PI; // 0 = sóc, π = vọng
  const k = Math.cos(pha);                            // 1 → tối hẳn, -1 → tròn
  const rx = Math.abs(k) * r;
  const tang = ngayAm <= 15;                          // trăng đang lớn dần: sáng bên phải
  const sweepNgoai = tang ? 1 : 0;
  const sweepTrong = (k > 0) === tang ? 0 : 1;
  const d = `M ${c} ${c - r} A ${r} ${r} 0 0 ${sweepNgoai} ${c} ${c + r} A ${rx.toFixed(2)} ${r} 0 0 ${sweepTrong} ${c} ${c - r} Z`;
  return `<svg class="trang" width="${co}" height="${co}" viewBox="0 0 ${co} ${co}" aria-hidden="true">
    <circle cx="${c}" cy="${c}" r="${r}" class="trang-toi"/><path d="${d}" class="trang-sang"/></svg>`;
}

/* ── Chuyển mục bằng thanh menu chạm ── */
const TAB = ["ngay", "gio", "thang", "luan", "nhac"];
function doiTab(t) {
  const cu = TAB.indexOf(document.body.dataset.tab), moi = TAB.indexOf(t);
  if (moi < 0 || moi === cu) return;
  document.body.style.setProperty("--huong", moi > cu ? 1 : -1);
  document.body.dataset.tab = t;
  $("thanh-tab").style.setProperty("--i", moi);
  document.querySelectorAll("#thanh-tab .tab").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === t)));
  $("khung").scrollTop = 0;
  if (t === "ngay") requestAnimationFrame(xepNhan);
}
/* Chiều cao vùng nhìn thấy thật (iPhone cài ra màn hình chính có lúc báo sai qua CSS) */
/* Chiều cao màn hình chuẩn.
   – Khi cài ra màn hình chính (chạy toàn màn hình): lấy kích thước màn hình thật của máy (screen.width/height),
     không phụ thuộc phóng to, bàn phím hay cách Safari tính vùng nhìn.
   – Khi mở trong trình duyệt: lấy chiều cao khung bố cục. */
const chayRieng = () => window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
function chieuCaoChuan() {
  if (chayRieng() && window.screen && screen.width && screen.height) {
    const doc = window.matchMedia("(orientation: portrait)").matches;
    return doc ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);
  }
  return document.documentElement.clientHeight || window.innerHeight;
}
function datChieuCao() {
  const h = Math.round(chieuCaoChuan());
  document.documentElement.style.setProperty("--cao", `${h}px`);
  document.documentElement.classList.toggle("chay-rieng", chayRieng());
  if (!$("chan-doan").hidden) veChanDoan();
}
/* Bảng thông số màn hình: nhấn giữ con dấu 曆 ở góc trên khoảng 1 giây để bật/tắt */
function veChanDoan() {
  const cs = getComputedStyle(document.documentElement);
  const tam = document.createElement("div");
  tam.style.cssText = "position:fixed;top:env(safe-area-inset-top);bottom:env(safe-area-inset-bottom);left:0;width:0;visibility:hidden";
  document.body.appendChild(tam);
  const r = tam.getBoundingClientRect();
  const tren = Math.round(r.top), duoi = Math.round(window.innerHeight - r.bottom);
  tam.remove();
  const vv = window.visualViewport;
  const tab = $("thanh-tab").getBoundingClientRect();
  $("chan-doan").innerHTML = [
    ["Chạy toàn màn hình", chayRieng() ? "có" : "không"],
    ["screen", `${screen.width} × ${screen.height} @${window.devicePixelRatio}x`],
    ["innerHeight", window.innerHeight],
    ["clientHeight", document.documentElement.clientHeight],
    ["visualViewport", vv ? `${Math.round(vv.height)} · zoom ${vv.scale.toFixed(2)}` : "—"],
    ["Vùng an toàn trên / dưới", `${tren} / ${duoi}`],
    ["Chiều cao đang dùng", cs.getPropertyValue("--cao").trim()],
    ["Menu đáy cách mép dưới", Math.round(chieuCaoChuan() - tab.bottom)]
  ].map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join("") + `<small>Nhấn giữ con dấu 曆 để đóng</small>`;
}
function ganChieuCao() {
  datChieuCao();
  /* Khoá chiều dọc khi cài ra màn hình chính (Android hỗ trợ; iPhone không cho khoá nên dùng lớp che "xoay lại") */
  if (chayRieng() && screen.orientation && screen.orientation.lock) screen.orientation.lock("portrait").catch(() => {});
  window.addEventListener("resize", datChieuCao);
  window.addEventListener("orientationchange", () => setTimeout(datChieuCao, 300));
  window.addEventListener("pageshow", datChieuCao);
  let henGiu = 0;
  const logo = $("nut-hom-nay-logo");
  logo.addEventListener("touchstart", () => {
    henGiu = setTimeout(() => { henGiu = -1; const cd = $("chan-doan"); cd.hidden = !cd.hidden; if (!cd.hidden) veChanDoan(); }, 900);
  }, { passive: true });
  logo.addEventListener("touchend", e => { if (henGiu === -1) e.preventDefault(); clearTimeout(henGiu); henGiu = 0; });
  logo.addEventListener("touchmove", () => { clearTimeout(henGiu); henGiu = 0; }, { passive: true });
  logo.addEventListener("contextmenu", e => e.preventDefault());
  /* Chặn phóng to bằng hai ngón và chạm đúp trên iPhone, để giao diện luôn giữ nguyên tỉ lệ */
  ["gesturestart", "gesturechange", "gestureend"].forEach(ev =>
    document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
  let lanCham = 0;
  document.addEventListener("touchend", e => {
    const bay = Date.now();
    if (bay - lanCham < 320 && !e.target.closest("input,select,textarea")) e.preventDefault();
    lanCham = bay;
  }, { passive: false });
}
function ganTab() {
  $("thanh-tab").addEventListener("pointerdown", e => {
    const b = e.target.closest(".tab");
    if (!b || giamDong.matches) return;
    const r = b.getBoundingClientRect(), g = document.createElement("span");
    g.className = "gon";
    g.style.left = `${e.clientX - r.left}px`; g.style.top = `${e.clientY - r.top}px`;
    b.appendChild(g);
    g.addEventListener("animationend", () => g.remove(), { once: true });
  });
}

