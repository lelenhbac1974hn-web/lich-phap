/* Lịch Pháp © 2026 Lê Lệnh Bắc. Bảo lưu mọi quyền. Bản chính thức, miễn phí: https://lelenhbac1974hn-web.github.io/lich-phap/ — cấm đưa lên chợ ứng dụng, bán hay phát hành lại khi chưa được phép (xem LICENSE). */
/* GIAO DIỆN — NHẮC: biểu tượng, Ngày lặp lại (giỗ, sinh nhật, kỷ niệm), Nhắc việc, hiểu câu tiếng Việt, thông báo tạm, nhắc đúng giờ.
   Giao diện chia nhiều tệp, nạp theo thứ tự trong index.html: ui-chung → ui-to-lich → ui-gio-thang → ui-sao → ui-nhac → ui-khoi-dong.
   Các tệp dùng chung tên khai báo ở mức ngoài cùng (hằng, hàm, trạng thái st); chỉ ui-khoi-dong.js gắn sự kiện chung và vẽ lần đầu. */
"use strict";

/* ── Biểu tượng: bộ vẽ sẵn trong bieu-tuong.js, tự chọn theo nội dung hoặc người dùng chọn ── */
const BTU = window.BieuTuong;
const chonBieu = (ten, loai, daChon) => BTU.svg(BTU.chon(ten, loai, daChon));
const bieuHopLe = b => typeof b === "string" && BTU.BT[b] ? b : "";
function veChonBieu(id) {
  $(id).innerHTML = `<button type="button" class="cb-tu chon" data-bieu="" title="Tự chọn theo nội dung">Tự động</button>` +
    BTU.ds.map(k => `<button type="button" data-bieu="${k}" title="${BTU.BT[k].ten}" aria-label="${BTU.BT[k].ten}">${BTU.svg(k)}</button>`).join("");
  $(id).addEventListener("click", e => { const b = e.target.closest("[data-bieu]"); if (b) datBieu(id, b.dataset.bieu); });
}
function datBieu(id, k) { $(id).querySelectorAll("[data-bieu]").forEach(b => b.classList.toggle("chon", b.dataset.bieu === (k || ""))); }
const docBieu = id => ($(id).querySelector(".chon") || { dataset: { bieu: "" } }).dataset.bieu;

/* ═════════ TỜ SOẠN (Nhắc việc, Ngày lặp lại) ═════════
   Một tờ giấy trượt lên che danh sách; mỗi trường là một dòng kẻ của trang sổ. Ngày, giờ, loại… chọn bằng lịch nhỏ,
   lưới số và chip của app — không bật bảng chọn ngày/giờ hay hộp chọn của hệ điều hành. Giá trị vẫn nằm trong các ô ẩn
   (v-ngay, v-gio, v-lap, n-loai, n-ngay, n-thang, n-truoc) để phần hiểu câu và lưu dữ liệu giữ nguyên. */
function dungSoan() {
  if ($("sx-nen")) return;
  const nen = document.createElement("div");
  nen.className = "sx-nen"; nen.id = "sx-nen";
  document.body.append(nen, $("f-viec"), $("f-nhac"));
  nen.addEventListener("click", dongSoanDangMo);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && document.body.classList.contains("dang-soan")) dongSoanDangMo(); });
}
function hienSoan(id, mo) {
  $(id).classList.toggle("mo", mo);
  document.body.classList.toggle("dang-soan", !!document.querySelector(".tam-soan.mo"));
  if (mo) $(id).querySelector(".sx-than").scrollTop = 0;
}
function dongSoanDangMo() {
  if ($("f-viec").classList.contains("mo")) { dongFormViec(); veViec(); }
  if ($("f-nhac").classList.contains("mo")) { xoaForm(); veNhac(); }
}
const chip = (chon, attr, chu) => `<button type="button" class="c${chon ? " chon" : ""}" ${attr}>${chu}</button>`;
/* Lịch nhỏ của app: một tháng, mỗi ô có ngày âm; hôm nay vòng vàng, ngày chọn tô màu chính */
function lichNho(jdChon, xem) {
  const dau = jdFromDate(1, xem.mm, xem.yy), soNgay = jdFromDate(1, xem.mm === 12 ? 1 : xem.mm + 1, xem.mm === 12 ? xem.yy + 1 : xem.yy) - dau;
  const lech = (thuCuaJd(dau) + 6) % 7, hom = jdHomNay();
  let o = "";
  for (let k = 0; k < Math.ceil((lech + soNgay) / 7) * 7; k++) {
    const j = dau - lech + k, t = ttNgay(j), ngoai = t.mm !== xem.mm;
    const lop = [ngoai ? "ngoai" : "", j === hom ? "hn" : "", j === jdChon ? "chon" : "", thuCuaJd(j) === 0 ? "cn" : ""].filter(Boolean).join(" ");
    o += `<button type="button" class="${lop}" data-ln-jd="${j}" aria-label="${nhanNgay(j, true)} · ${nhanAm(j)}"><b>${t.dd}</b><small>${t.am.day === 1 ? `1/${t.am.month}` : t.am.day}</small></button>`;
  }
  return `<div class="ln-dau"><button type="button" data-ln-thang="-1" aria-label="Tháng trước">‹</button><b>Tháng ${xem.mm} · ${xem.yy}</b><button type="button" data-ln-thang="1" aria-label="Tháng sau">›</button></div>
    <div class="ln-luoi">${["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((t, i) => `<i${i === 6 ? ' class="cn"' : ""}>${t}</i>`).join("")}${o}</div>`;
}
/* Lưới giờ 24 tiếng và phút */
const PHUT = [0, 10, 15, 20, 30, 45];
function luoiGio(gio) {
  const [h, p] = gio ? gio.split(":").map(Number) : [null, null];
  return `<p>Giờ</p><div class="lg lg-gio">${[...Array(24)].map((_, i) => `<button type="button" class="${i === h ? "chon" : ""}" data-lg-h="${i}">${hai(i)}</button>`).join("")}</div>
    <p>Phút</p><div class="lg lg-phut">${PHUT.map(x => `<button type="button" class="${x === p ? "chon" : ""}" data-lg-p="${x}">${hai(x)}</button>`).join("")}</div>
    ${gio ? `<button type="button" class="sx-lien" data-lg-bo>${ic("huy")}Không nhắc giờ</button>` : ""}`;
}

/* ═════════ NHẮC NGÀY LẶP LẠI ═════════ */
const KHOA_NHAC = "lichphap:nhac";
const LOAI = {
  gio: { ten: "Ngày giỗ", lich: "am", nam: "Năm mất", dem: k => `Giỗ năm thứ ${k}` },
  sinhnhat: { ten: "Sinh nhật", lich: "duong", nam: "Năm sinh", dem: k => `Tròn ${k} tuổi` },
  sukien: { ten: "Sự kiện", lich: "duong", nam: "Năm bắt đầu", dem: k => `Năm thứ ${k}` },
  sukienam: { ten: "Sự kiện âm lịch", lich: "am", nam: "Năm bắt đầu", dem: k => `Năm thứ ${k}` }
};
const NGAY_TOI_DA = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const soNguyen = (v, a, b) => Number.isInteger(v) && v >= a && v <= b;
function hopLe(n) {
  return n && typeof n.ten === "string" && n.ten.trim() && LOAI[n.loai] &&
    soNguyen(n.thang, 1, 12) &&
    soNguyen(n.ngay, 1, LOAI[n.loai].lich === "am" ? 30 : NGAY_TOI_DA[n.thang - 1]) &&
    (n.nam == null || soNguyen(n.nam, 1800, 2199));
}
function chuanHoa(n) {
  return {
    id: typeof n.id === "string" && n.id ? n.id : `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    ten: n.ten.trim().slice(0, 80), loai: n.loai, ngay: n.ngay, thang: n.thang,
    nam: n.nam == null ? null : n.nam,
    truoc: soNguyen(n.truoc, 0, 60) ? n.truoc : 3,
    ghi: typeof n.ghi === "string" ? n.ghi.trim().slice(0, 160) : "",
    bieu: bieuHopLe(n.bieu)
  };
}
function docNhac() {
  try {
    const a = JSON.parse(localStorage.getItem(KHOA_NHAC) || "[]");
    return Array.isArray(a) ? a.filter(hopLe).map(chuanHoa) : [];
  } catch (e) { return []; }
}
let nhac = docNhac(), dangSua = null, nhacChon = null;
function luuNhac() {
  try { localStorage.setItem(KHOA_NHAC, JSON.stringify(nhac)); return true; } catch (e) { return false; }
}

/* Thông tin âm – dương của một ngày, có nhớ đệm */
const demNgay = new Map();
function ttNgay(j) {
  let t = demNgay.get(j);
  if (!t) {
    if (demNgay.size > 3000) demNgay.clear();
    const [dd, mm, yy] = jdToDate(j);
    t = { j, dd, mm, yy, am: amCuaJd(j) };
    demNgay.set(j, t);
  }
  return t;
}
/* Ngày j có trúng lời nhắc n không.
   – Âm lịch: bỏ qua tháng nhuận; ngày 30 gặp tháng thiếu thì lấy ngày 29 (ngày cuối tháng).
   – Dương lịch: 29/2 gặp năm không nhuận thì lấy 28/2. */
function khopNhac(n, t) {
  if (LOAI[n.loai].lich === "duong") {
    if (t.mm !== n.thang) return false;
    if (t.dd === n.ngay) return true;
    return n.ngay === 29 && n.thang === 2 && t.dd === 28 && ttNgay(t.j + 1).dd === 1;
  }
  if (t.am.leap || t.am.month !== n.thang) return false;
  if (t.am.day === n.ngay) return true;
  return n.ngay === 30 && t.am.day === 29 && ttNgay(t.j + 1).am.day === 1;
}
const nhacCuaNgay = j => { const t = ttNgay(j); return nhac.filter(n => khopNhac(n, t)); };
function lanToi(n, tu) {
  for (let k = 0; k < 400; k++) if (khopNhac(n, ttNgay(tu + k))) return tu + k;
  return null;
}
function soNam(n, j) {
  if (n.nam == null) return null;
  const t = ttNgay(j), k = (LOAI[n.loai].lich === "duong" ? t.yy : t.am.year) - n.nam;
  return k > 0 ? LOAI[n.loai].dem(k) : null;
}
const ngayGoc = n => `${n.ngay}/${n.thang} ${LOAI[n.loai].lich === "am" ? "âm lịch" : "dương lịch"}`;

/* ── Khuôn dòng danh sách dùng chung (luật giao diện 5, 6): biểu tượng · tên · dòng phụ · một nhãn phải.
   Danh sách nằm trên một trang sổ tay. Chạm dòng: dòng sáng lên (đánh dấu, không mở gì — tránh lẫn khi vuốt);
   chạm biểu tượng đầu dòng (hoặc Enter): mở tấm trượt chi tiết. ── */
function dongSo(o) {
  return `<li class="dong-so${o.sang ? " sang" : ""}${o.lop ? " " + o.lop : ""}" ${o.attr} tabindex="0" aria-selected="${!!o.sang}">
    <button type="button" class="ds-bieu ds-mo" data-mo aria-label="Mở chi tiết: ${esc(o.ten)}">${o.bieu}</button>
    <span class="ds-nd"><b>${esc(o.ten)}</b>${o.phu ? `<small>${o.phu}</small>` : ""}</span>
    ${o.dem ? `<span class="ds-dem${o.demLop ? " " + o.demLop : ""}">${o.dem}</span>` : ""}</li>`;
}
/* Nút có biểu tượng trước chữ (luật giao diện 4) */
const nutBt = (bt, chu, them) => `<button type="button" ${them || ""}>${ic(bt)}<span>${chu}</span></button>`;
/* Tấm trượt chi tiết một mục: tiêu đề, ngày, các dòng, ghi chú, hàng nút */
function moTamCT(o) {
  const el = moTam(`<div class="tam-ct">
    <div class="ct-dau"><span class="ds-bieu" aria-hidden="true">${o.bieu}</span><h3>${esc(o.ten)}</h3></div>
    ${o.ngay ? `<p class="ct-ngay">${o.ngay}</p>` : ""}
    ${o.dong.filter(Boolean).map(d => `<p>${d}</p>`).join("")}
    ${o.ghi ? `<p class="ct-ghi">${ic("ghiChu")}<span>${esc(o.ghi).replace(/\n/g, "<br>")}</span></p>` : `<p class="ct-rong">Chưa có ghi chú</p>`}
    <div class="ct-nut">${o.nut}</div></div>`, "lop-ct");
  el.addEventListener("click", e => {
    const b = e.target.closest("[data-ct]");
    if (b) o.lam(b.dataset.ct);
    else if (e.target.closest("[data-jd]")) dongTam(); // "Xem tờ lịch": bộ xử lý chung mở ngày, ở đây chỉ đóng tấm
  });
  return el;
}
function sapToi() {
  const hom = jdHomNay();
  return nhac.map(n => { const j = lanToi(n, hom); return { n, j, con: j == null ? 9999 : j - hom }; })
    .sort((a, b) => a.con - b.con || a.n.ten.localeCompare(b.n.ten, "vi"));
}

function veNhac() {
  const ds = sapToi();
  const dem = $("dem-nhac");
  dem.hidden = !nhac.length; dem.textContent = nhac.length;
  const soGan = ds.filter(x => x.j != null && x.con <= x.n.truoc).length;
  $("dem-lap").hidden = !soGan; $("dem-lap").textContent = soGan;
  if (nhacChon && !nhac.some(x => x.id === nhacChon)) nhacChon = null;
  /* Một dải liền, ngày tới sớm nhất lên đầu; phân loại bằng biểu tượng, không tô nền theo loại */
  $("ds-nhac").innerHTML = ds.length ? `<ul class="ds-so">${ds.map(({ n, j, con }) => {
    const dn = j == null ? null : soNam(n, j);
    const phu = [j == null ? "" : nhanNgay(j), LOAI[n.loai].lich === "am" ? `${n.ngay}/${n.thang} âm` : "", dn ? chuThuong(dn) : ""].filter(Boolean).join(" · ");
    return dongSo({ attr: `data-chon="${esc(n.id)}"`, sang: nhacChon === n.id, bieu: chonBieu(n.ten, n.loai, n.bieu), ten: n.ten, phu,
      dem: con > 999 ? "—" : chuDem(con), demLop: con <= n.truoc ? "gan" : "" });
  }).join("")}</ul>` : `<div class="nhac-trong"><b>Chưa có ngày lặp lại nào</b>Bấm “Thêm” rồi gõ một câu, ví dụ “Giỗ bố 20/10 âm”. Ngày sắp đến sẽ hiện trên tờ lịch và lịch tháng.</div>`;
}
/* Tấm chi tiết một ngày lặp lại: Sửa · Xoá (xoá có Hoàn tác) · Xem tờ lịch ngày đó */
function moTamNhac(n) {
  const hom = jdHomNay(), j = lanToi(n, hom), dn = j == null ? null : soNam(n, j);
  moTamCT({
    bieu: chonBieu(n.ten, n.loai, n.bieu), ten: n.ten, ghi: n.ghi,
    ngay: j == null ? "" : `${nhanNgay(j, true)} · ${nhanAm(j)}`,
    dong: [`${LOAI[n.loai].ten} · hằng năm ngày ${ngayGoc(n)}${dn ? ` · ${chuThuong(dn)}` : ""}`,
      j == null ? "" : `${chuDem(j - hom)} · ${n.truoc ? `nhắc trước ${n.truoc} ngày` : "nhắc đúng ngày"}`],
    nut: (j == null ? "" : nutBt("homNay", "Xem tờ lịch", `class="ct-chu" data-jd="${j}"`)) +
      nutBt("sua", "Sửa", `class="ct-chu" data-ct="sua"`) + nutBt("xoa", "Xoá", `class="ct-chu ct-xoa" data-ct="xoa"`),
    lam: k => {
      dongTam();
      if (k === "sua") { napForm(n); veNhac(); return; }
      const cu = nhac.slice();
      nhac = nhac.filter(x => x.id !== n.id);
      if (dangSua === n.id) xoaForm();
      nhacChon = null; luuNhac(); ve();
      baoTam(`Đã xoá “${esc(n.ten)}”`, () => { nhac = cu; luuNhac(); ve(); });
    }
  });
}

/* ── Khung nhập ── */
/* Ngày giỗ (ngày mất) và sinh nhật (ngày sinh) là ngày đã xảy ra: có năm thì không được ở tương lai (anh Bắc chốt 19/11/2026).
   Âm lịch so theo năm – tháng – ngày âm của hôm nay; dương lịch so theo ngày dương. */
function loiTuongLai(n) {
  if (n.nam == null || !Number.isInteger(n.nam) || (n.loai !== "gio" && n.loai !== "sinhnhat")) return "";
  const am = LOAI[n.loai].lich === "am", t = ttNgay(jdHomNay());
  const nay = am ? [t.am.year, t.am.month, t.am.day] : [t.yy, t.mm, t.dd];
  const co = [n.nam, n.thang || 1, n.ngay || 1];
  const sau = co[0] !== nay[0] ? co[0] > nay[0] : co[1] !== nay[1] ? co[1] > nay[1] : co[2] > nay[2];
  if (!sau) return "";
  const goc = n.thang && n.ngay ? `${n.ngay}/${n.thang}${am ? " âm" : ""} năm ${n.nam}` : `năm ${n.nam}`;
  return n.loai === "gio" ? `Ngày mất ${goc} chưa tới. Ngày giỗ phải là ngày đã qua — xem lại năm mất.`
    : `Ngày sinh ${goc} chưa tới. Sinh nhật phải là ngày đã qua — xem lại năm sinh.`;
}
const docSoO = id => { const v = $(id).value.trim(); return v === "" ? null : Number(v); };
/* Cảnh báo ngay khi gõ năm hoặc đổi ngày, loại */
function kiemNam() {
  const n = { loai: $("n-loai").value, ngay: docSoO("n-ngay"), thang: docSoO("n-thang"), nam: docSoO("n-nam") };
  const tl = loiTuongLai(n);
  $("n-nam").classList.toggle("loi", !!tl);
  $("n-loi").textContent = tl;
  return tl;
}
function datNhanForm() {
  const l = LOAI[$("n-loai").value], am = l.lich === "am";
  $("n-nhan-ngay").textContent = am ? "Ngày âm" : "Ngày dương";
  $("n-nhan-nam").textContent = `${l.nam}${am ? " (âm)" : ""}`;
  veSoanLap();
}
/* Vẽ lại các chip, dòng ngày tháng và lưới của tờ soạn Ngày lặp lại theo giá trị trong các ô ẩn */
let luoiLapMo = false;
function veSoanLap() {
  const loai = $("n-loai").value, am = LOAI[loai].lich === "am", ngay = docSoO("n-ngay"), thang = docSoO("n-thang");
  $("n-loai-chon").querySelectorAll("[data-loai]").forEach(b => b.classList.toggle("chon", b.dataset.loai === loai));
  $("n-truoc-chon").querySelectorAll("[data-truoc]").forEach(b => b.classList.toggle("chon", b.dataset.truoc === $("n-truoc").value));
  const tenThang = thang ? (am ? THANG_AM[thang - 1] : thang) : "—";
  $("n-ngay-chon").innerHTML = ngay || thang ? `ngày <u>${ngay || "—"}</u> tháng <u>${tenThang}</u>${am ? "" : " dương"}` : `<span class="mo">Chọn ngày, tháng</span>`;
  $("n-ngay-chon").classList.toggle("dang-mo", luoiLapMo);
  $("n-luoi").hidden = !luoiLapMo;
  if (luoiLapMo) {
    const toiDa = am ? 30 : thang ? NGAY_TOI_DA[thang - 1] : 31;
    $("n-luoi").innerHTML = `<p>Ngày</p><div class="lg lg-ngay">${[...Array(toiDa)].map((_, i) => `<button type="button" class="${i + 1 === ngay ? "chon" : ""}" data-nd="${i + 1}">${i + 1}</button>`).join("")}</div>
      <p>${am ? "Tháng âm" : "Tháng dương"}</p><div class="lg lg-thang">${[...Array(12)].map((_, i) => `<button type="button" class="${i + 1 === thang ? "chon" : ""}" data-nt="${i + 1}">${am ? THANG_AM[i] : `Tháng ${i + 1}`}</button>`).join("")}</div>`;
  }
}
/* Nút Thêm ở đầu thẻ Nhắc: khung nhập đang mở thì thành Đóng */
function datNutThem(id, mo) {
  $(id).innerHTML = mo ? `${ic("huy")}<span>Đóng</span>` : `${ic("them")}<span>Thêm</span>`;
  $(id).classList.toggle("dang-mo", mo);
}
function moForm(mo) {
  hienSoan("f-nhac", mo);
}
/* ── Hiểu câu tự nhiên cho Ngày lặp lại: "Giỗ bố 20/10 âm, năm mất 2021", "Kỷ niệm ngày cưới 25/6/2005" ── */
const SO_THANG = { giêng: 1, gieng: 1, chạp: 12, chap: 12, "mười một": 11, "muoi mot": 11, một: 1, mot: 1, hai: 2, ba: 3, tư: 4, tu: 4, bốn: 4, bon: 4, năm: 5, nam: 5, sáu: 6, bảy: 7, bay: 7, tám: 8, tam: 8, chín: 9, chin: 9, mười: 10, muoi: 10 };
const SO_NGAY = { một: 1, mot: 1, hai: 2, ba: 3, bốn: 4, bon: 4, năm: 5, nam: 5, sáu: 6, bảy: 7, bay: 7, tám: 8, tam: 8, chín: 9, chin: 9, mười: 10, muoi: 10 };
function phanTichLap(goc) {
  let chu = " " + goc + " ";
  const thuong = () => chu.toLowerCase();
  const B = "(?=[\\s,.;!?]|$)";
  const cat = (re, xuLy) => { const m = re.exec(thuong()); if (!m) return false; if (xuLy(m) === false) return false; chu = chu.slice(0, m.index) + " " + chu.slice(m.index + m[0].length); return true; };
  const ket = { ngay: null, thang: null, nam: null, truoc: null, am: false, coLoai: null };
  const t0 = thuong();
  if (/giỗ|gio |ngày kỵ|ngay ky|kỵ nhật|ky nhat|húy nhật|huý nhật/.test(t0)) ket.coLoai = "gio";
  else if (/sinh nhật|sinh nhat|mừng thọ|mung tho/.test(t0)) ket.coLoai = "sinhnhat";
  else if (/kỷ niệm|kỉ niệm|ky niem|ngày cưới|ngay cuoi|đám cưới|dam cuoi|thành lập|thanh lap/.test(t0)) ket.coLoai = "kyniem";
  // Nhắc trước N ngày
  cat(new RegExp(`\\s(?:nhắc|nhac)\\s+(?:trước|truoc)\\s*(\\d{1,2})\\s*(?:ngày|ngay)?${B}`), m => { ket.truoc = +m[1]; });
  // Năm mất / năm sinh / năm cưới
  cat(new RegExp(`\\s(?:năm mất|nam mat|mất năm|mat nam|năm sinh|nam sinh|sinh năm|sinh nam|năm cưới|nam cuoi|cưới năm|cuoi nam|từ năm|tu nam|năm|nam)\\s*(\\d{4})${B}`), m => { ket.nam = +m[1]; });
  // Rằm / mùng N tháng M
  const THANG_RE = "(giêng|gieng|chạp|chap|mười một|muoi mot|một|mot|hai|ba|tư|tu|bốn|bon|năm|nam|sáu|bảy|bay|tám|tam|chín|chin|mười|muoi|\\d{1,2})";
  const soThang = s => /^\d+$/.test(s) ? +s : SO_THANG[s];
  cat(new RegExp(`\\s(?:ngày\\s+|ngay\\s+)?(rằm|ram|(?:mùng|mồng|mung|mong)\\s*(\\d{1,2}|một|mot|hai|ba|bốn|bon|năm|nam|sáu|bảy|bay|tám|tam|chín|chin|mười|muoi))\\s+(?:tháng|thang)\\s+${THANG_RE}${B}`), m => {
    ket.ngay = /^r/.test(m[1]) ? 15 : (/^\d+$/.test(m[2]) ? +m[2] : SO_NGAY[m[2]]); ket.thang = soThang(m[3]); ket.am = true;
  });
  // Ngày D tháng M (năm Y)
  if (ket.ngay == null) cat(new RegExp(`\\s(?:ngày\\s+|ngay\\s+)?(\\d{1,2})\\s+(?:tháng|thang)\\s+${THANG_RE}(?:\\s+(?:năm|nam)\\s+(\\d{4}))?${B}`), m => {
    ket.ngay = +m[1]; ket.thang = soThang(m[2]); if (m[3]) ket.nam = +m[3];
  });
  // dd/mm(/yyyy)
  if (ket.ngay == null) cat(new RegExp(`\\s(?:ngày\\s+|ngay\\s+)?(\\d{1,2})\\s*[/\\-.]\\s*(\\d{1,2})(?:\\s*[/\\-.]\\s*(\\d{4}))?${B}`), m => {
    ket.ngay = +m[1]; ket.thang = +m[2]; if (m[3]) ket.nam = +m[3];
  });
  // Âm lịch / dương lịch nói rõ
  cat(new RegExp(`\\s(âm lịch|am lich|âm|am|ngày âm|ngay am)${B}`), () => { ket.am = true; });
  if (cat(new RegExp(`\\s(dương lịch|duong lich|dương|duong)${B}`), () => {})) ket.duong = true;
  if (!(ket.thang >= 1 && ket.thang <= 12)) { ket.thang = null; }
  // Loại lời nhắc
  if (ket.coLoai === "gio") ket.loai = ket.duong ? "sukien" : "gio";
  else if (ket.coLoai === "sinhnhat") ket.loai = ket.am ? "sukienam" : "sinhnhat";
  else ket.loai = ket.am ? "sukienam" : "sukien";
  ket.ten = chu.replace(/\s+/g, " ").replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, "").replace(/\s+(ngày|ngay)$/i, "").trim();
  if (ket.ten) ket.ten = ket.ten[0].toUpperCase() + ket.ten.slice(1);
  return ket;
}
let chamLap = {}, loaiEp = null;
function hieuNhapLap() {
  const g = $("n-cau").value.trim(), the = [];
  if (!g) { $("n-hieu").innerHTML = ""; veSoanLap(); kiemNam(); return; }
  const k = phanTichLap(g);
  if (loaiEp) k.loai = loaiEp;
  const l = LOAI[k.loai];
  // Tự điền các ô người dùng chưa sửa tay
  if (!chamLap.ten && k.ten) $("n-ten").value = k.ten;
  if (!chamLap.loai) { $("n-loai").value = k.loai; datNhanForm(); }
  if (!chamLap.ngay && k.ngay) $("n-ngay").value = k.ngay;
  if (!chamLap.thang && k.thang) $("n-thang").value = k.thang;
  if (!chamLap.nam && k.nam) $("n-nam").value = k.nam;
  if (!chamLap.truoc && k.truoc != null) $("n-truoc").value = String([0, 1, 3, 7, 15].find(x => x >= k.truoc) ?? 15);
  const [bieu, tenLoai] = k.coLoai === "gio" ? [ic("nen"), "Ngày giỗ"] : k.coLoai === "sinhnhat" ? [ic("banh"), "Sinh nhật"] : k.coLoai === "kyniem" ? [ic("nhan"), "Kỷ niệm"] : [ic("ghim"), "Sự kiện"];
  the.push(`<span class="the-le">${bieu}${tenLoai} · ${l.lich === "am" ? "âm lịch" : "dương lịch"}</span>`);
  const loai = $("n-loai").value, ngay = +$("n-ngay").value, thang = +$("n-thang").value, nam = $("n-nam").value ? +$("n-nam").value : null;
  const thu = chuanHoa({ ten: $("n-ten").value || "x", loai, ngay, thang, nam, truoc: 3 });
  if (hopLe(thu)) {
    const j = lanToi(thu, jdHomNay()), t = j != null && ttNgay(j), dn = j != null && soNam(thu, j);
    the.push(`<span class="the-ngay">${ic("lich")}Hằng năm ${ngayGoc(thu)}${t ? ` · lần tới ${THU_NGAN[thuCuaJd(j)]} ${hai(t.dd)}/${hai(t.mm)}/${t.yy}` : ""}</span>`);
    if (dn) the.push(`<span class="the-lap">${dn}</span>`);
  } else if (k.ngay || k.thang) the.push(`<span class="the-uu p3">Ngày tháng chưa hợp lệ</span>`);
  else the.push(`<span class="the-uu">Thêm ngày, ví dụ “20/10 âm” hoặc “mùng 3 tháng chạp”</span>`);
  // Gợi ý đổi âm/dương khi câu không nói rõ
  if (!k.am && !k.duong) {
    if (loai === "sinhnhat") the.push(`<button type="button" class="goi-y" data-ep-loai="sukienam">Tính theo âm lịch</button>`);
    else if (loai === "sukien") the.push(`<button type="button" class="goi-y" data-ep-loai="sukienam">Tính theo âm lịch</button>`);
    else if (loai === "gio") the.push(`<button type="button" class="goi-y" data-ep-loai="sukien">Giỗ theo dương lịch</button>`);
    else if (loai === "sukienam") the.push(`<button type="button" class="goi-y" data-ep-loai="${k.coLoai === "sinhnhat" ? "sinhnhat" : "sukien"}">Tính theo dương lịch</button>`);
  }
  $("n-hieu").innerHTML = the.join("");
  veSoanLap(); kiemNam();
}

function xoaForm() {
  dangSua = null;
  chamLap = {}; loaiEp = null;
  if ($("n-hieu")) $("n-hieu").innerHTML = "";
  moForm(false);
  $("f-nhac").reset();
  /* Ô ẩn không về giá trị gốc khi reset: đặt lại tay */
  $("n-loai").value = "gio"; $("n-ngay").value = ""; $("n-thang").value = ""; $("n-truoc").value = "3";
  luoiLapMo = false;
  datBieu("n-bieu", "");
  $("n-loi").textContent = ""; $("n-nam").classList.remove("loi");
  $("n-td").textContent = "Ngày lặp lại mới";
  $("n-luu").innerHTML = `${ic("them")}<span>Thêm ngày</span>`;
  datNhanForm();
}
function napForm(n) {
  dangSua = n.id;
  moForm(true);
  $("khung").scrollTop = 0;
  $("n-ten").value = n.ten; $("n-loai").value = n.loai;
  $("n-ngay").value = n.ngay; $("n-thang").value = n.thang;
  $("n-nam").value = n.nam == null ? "" : n.nam;
  $("n-truoc").value = [0, 1, 3, 7, 15].includes(n.truoc) ? String(n.truoc) : "3"; $("n-ghi").value = n.ghi; datBieu("n-bieu", n.bieu);
  $("n-td").textContent = "Sửa ngày lặp lại";
  $("n-luu").innerHTML = `${ic("luu")}<span>Lưu</span>`;
  $("n-loi").textContent = "";
  luoiLapMo = false;
  datNhanForm();
  kiemNam();
}
function docForm() {
  const so = docSoO;
  const n = {
    ten: $("n-ten").value, loai: $("n-loai").value,
    ngay: so("n-ngay"), thang: so("n-thang"), nam: so("n-nam"),
    truoc: Number($("n-truoc").value), ghi: $("n-ghi").value, bieu: docBieu("n-bieu")
  };
  const am = LOAI[n.loai].lich === "am";
  if (!n.ten.trim()) return { loi: "Chưa nhập tên lời nhắc.", o: "n-ten" };
  if (!soNguyen(n.thang, 1, 12)) return { loi: "Chưa chọn tháng.", o: "n-ngay-chon" };
  const toiDa = am ? 30 : NGAY_TOI_DA[n.thang - 1];
  if (!soNguyen(n.ngay, 1, toiDa)) return { loi: n.ngay == null ? "Chưa chọn ngày." : `Ngày phải từ 1 đến ${toiDa}${am ? " (tháng âm dài nhất 30 ngày)" : ` với tháng ${n.thang} dương lịch`}.`, o: "n-ngay-chon" };
  if (n.nam != null && !soNguyen(n.nam, 1800, 2199)) return { loi: "Năm phải từ 1800 đến 2199, hoặc để trống.", o: "n-nam" };
  const tl = loiTuongLai(n);
  if (tl) return { loi: tl, o: "n-nam" };
  return { n };
}

function ganNhac() {
  dungSoan();
  /* Chip loại, nhắc trước; dòng ngày tháng mở lưới số */
  const doiTay = k => { chamLap[k] = 1; if ($("n-cau").value.trim()) hieuNhapLap(); else { veSoanLap(); kiemNam(); } };
  $("n-loai-chon").addEventListener("click", e => { const b = e.target.closest("[data-loai]"); if (!b) return; $("n-loai").value = b.dataset.loai; loaiEp = null; chamLap.loai = 1; datNhanForm(); doiTay("loai"); });
  $("n-truoc-chon").addEventListener("click", e => { const b = e.target.closest("[data-truoc]"); if (!b) return; $("n-truoc").value = b.dataset.truoc; doiTay("truoc"); });
  $("n-ngay-chon").addEventListener("click", () => { luoiLapMo = !luoiLapMo; veSoanLap(); });
  $("n-luoi").addEventListener("click", e => {
    const d = e.target.closest("[data-nd]"), t = e.target.closest("[data-nt]");
    if (d) { $("n-ngay").value = d.dataset.nd; doiTay("ngay"); }
    if (t) { $("n-thang").value = t.dataset.nt; doiTay("thang"); }
    if ((d || t) && docSoO("n-ngay") && docSoO("n-thang")) { luoiLapMo = false; veSoanLap(); }
  });
  $("n-ten").addEventListener("change", () => { chamLap.ten = 1; });
  $("n-nam").addEventListener("input", () => {
    const v = $("n-nam").value.replace(/\D/g, "").slice(0, 4);
    if (v !== $("n-nam").value) $("n-nam").value = v;
    chamLap.nam = 1;
    if (v.length === 4 || v === "") kiemNam(); else { $("n-loi").textContent = ""; $("n-nam").classList.remove("loi"); }
  });
  $("n-cau").addEventListener("input", hieuNhapLap);
  $("n-cau").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); $("f-nhac").requestSubmit(); } });
  $("n-hieu").addEventListener("click", e => {
    const b = e.target.closest("[data-ep-loai]");
    if (b) { loaiEp = b.dataset.epLoai; chamLap.loai = 0; hieuNhapLap(); }
  });
  $("n-mo").addEventListener("click", () => { xoaForm(); moForm(true); $("n-cau").focus(); veNhac(); });
  $("n-huy").addEventListener("click", () => { xoaForm(); veNhac(); });
  $("n-lay").addEventListener("click", () => {
    const t = ttNgay(st.jd), am = LOAI[$("n-loai").value].lich === "am";
    $("n-ngay").value = am ? t.am.day : t.dd;
    $("n-thang").value = am ? t.am.month : t.mm;
    chamLap.ngay = chamLap.thang = 1; luoiLapMo = false; veSoanLap();
    $("n-loi").textContent = am && t.am.leap ? "Ngày đang xem thuộc tháng nhuận; lời nhắc sẽ lặp theo tháng thường cùng số." : "";
    if (!$("n-loi").textContent) kiemNam();
  });
  $("f-nhac").addEventListener("submit", e => {
    e.preventDefault();
    const kq = docForm();
    if (kq.loi) { $("n-loi").textContent = kq.loi; $(kq.o).focus(); return; }
    const moi = chuanHoa(dangSua ? { ...kq.n, id: dangSua } : kq.n);
    nhac = dangSua ? nhac.map(x => x.id === dangSua ? moi : x) : nhac.concat(moi);
    const ok = luuNhac();
    xoaForm();
    ve();
    if (!ok) $("n-loi").textContent = "Trình duyệt không cho lưu dữ liệu; lời nhắc sẽ mất khi đóng trang.";
  });
  /* Chạm một ngày lặp lại: dòng sáng lên; chạm biểu tượng đầu dòng (hoặc Enter) mới mở tấm chi tiết */
  const chonNhac = (li, mo) => {
    const n = nhac.find(x => x.id === li.dataset.chon);
    if (!n) return;
    nhacChon = n.id; veNhac();
    if (mo) moTamNhac(n);
  };
  $("ds-nhac").addEventListener("click", e => { const li = e.target.closest("[data-chon]"); if (li) chonNhac(li, !!e.target.closest("[data-mo]")); });
  $("ds-nhac").addEventListener("keydown", e => {
    const li = e.target.closest("[data-chon]");
    if (li && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); chonNhac(li, true); }
  });
  $("n-xuat").addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ ung_dung: "lich-phap", phien: 2, nhac, viec }, null, 2)], { type: "application/json" }));
    const t = ttNgay(jdHomNay());
    a.download = `lich-phap-sao-luu-${t.yy}${hai(t.mm)}${hai(t.dd)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  $("n-nhap").addEventListener("click", () => $("n-tep").click());
  $("n-tep").addEventListener("change", async e => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      const ds = (Array.isArray(d) ? d : d && d.nhac) || [];
      const khoa = n => `${n.loai}|${n.ngay}|${n.thang}|${n.ten.trim().toLowerCase()}`;
      const co = new Set(nhac.map(khoa));
      const them = ds.filter(hopLe).filter(n => !co.has(khoa(n))).map(n => chuanHoa({ ...n, id: null }));
      nhac = nhac.concat(them);
      const dsViec = (d && Array.isArray(d.viec) ? d.viec : []).filter(v => v && v.ten);
      const coViec = new Set(viec.map(v => `${v.ten.trim().toLowerCase()}|${v.jd}|${v.gio}`));
      const themViec = dsViec.map(v => chuanViec({ ...v, id: null })).filter(v => !coViec.has(`${v.ten.trim().toLowerCase()}|${v.jd}|${v.gio}`));
      viec = viec.concat(themViec);
      luuNhac(); luuViec(); ve();
      baoTam(`Đã nhập ${them.length} ngày lặp lại và ${themViec.length} việc mới${ds.length - them.length + dsViec.length - themViec.length ? ` · bỏ qua ${ds.length - them.length + dsViec.length - themViec.length} mục trùng` : ""}.`);
    } catch (err) {
      baoTam("Tệp không đọc được: không phải tệp sao lưu của Lịch Pháp.");
    }
  });
  datNhanForm();
  datNutThem("n-mo", false);
  $("n-huy").innerHTML = `${ic("huy")}<span>Huỷ</span>`;
  $("n-xuat").innerHTML = `${ic("xuat")}<span>Xuất ra tệp</span>`;
  $("n-nhap").innerHTML = `${ic("nhap")}<span>Nhập từ tệp</span>`;
  $("n-lay").innerHTML = `${ic("homNay")}<span>Lấy ngày đang xem</span>`;
  $("n-luu").innerHTML = `${ic("them")}<span>Thêm ngày</span>`;
}

/* ═════════ NHẮC VIỆC ═════════
   Học theo Todoist (gõ câu tự nhiên, ưu tiên, việc lặp tự dời ngày), Apple Reminders (danh sách thông minh,
   sửa tại chỗ tự lưu) và Microsoft To Do (nhóm theo ngày, hoàn tác khi lỡ tay). */
const KHOA_VIEC = "lichphap:viec", KHOA_TRANG = "lichphap:nhac-trang";
const LAP = { khong: "Không lặp", ngay: "Hằng ngày", tuan: "Hằng tuần", thang: "Hằng tháng", nam: "Hằng năm" };
const UU = ["Không", "Thấp", "Vừa", "Cao"];
const docKhoa = (k, mac) => { try { const v = localStorage.getItem(k); return v == null ? mac : v; } catch (e) { return mac; } };
const ghiKhoa = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
function chuanViec(v) {
  const so = (x, a, b) => Number.isInteger(x) && x >= a && x <= b;
  return {
    id: typeof v.id === "string" && v.id ? v.id : `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    ten: String(v.ten || "").trim().slice(0, 140),
    jd: so(v.jd, 2415021, 2524593) ? v.jd : null, // 1/1/1900 – 31/12/2199
    gio: typeof v.gio === "string" && /^\d{2}:\d{2}$/.test(v.gio) ? v.gio : null,
    uuTien: so(v.uuTien, 0, 3) ? v.uuTien : 0,
    lap: LAP[v.lap] ? v.lap : "khong",
    ghi: typeof v.ghi === "string" ? v.ghi.slice(0, 500) : "", bieu: bieuHopLe(v.bieu),
    xong: !!v.xong, xongLuc: Number(v.xongLuc) || null, taoLuc: Number(v.taoLuc) || Date.now(), daBao: !!v.daBao
  };
}
let viec = (() => {
  try { const a = JSON.parse(docKhoa(KHOA_VIEC, "[]")); return Array.isArray(a) ? a.filter(v => v && v.ten).map(chuanViec) : []; }
  catch (e) { return []; }
})();
let locViec = "homnay", viecChon = null, viecSua = null;
const luuViec = () => ghiKhoa(KHOA_VIEC, JSON.stringify(viec));

/* ── Hiểu câu tiếng Việt: ngày, giờ, lặp, ưu tiên ── */
function phanTichViec(goc) {
  let chu = " " + goc + " ";
  const hom = jdHomNay(), bay = new Date(), ket = { jd: null, gio: null, lap: "khong", uuTien: 0, the: [] };
  const cat = (re, xuLy) => {
    const m = re.exec(chu.toLowerCase());
    if (!m) return false;
    if (xuLy(m) === false) return false;
    chu = chu.slice(0, m.index) + " " + chu.slice(m.index + m[0].length);
    return true;
  };
  const B = "(?=[\\s,.;!?]|$)";
  // Lặp
  cat(new RegExp(`\\s(?:hằng|hàng|mỗi|hang|moi)\\s*(ngày|ngay|tuần|tuan|tháng|thang|năm|nam)${B}`), m => {
    ket.lap = { ngày: "ngay", ngay: "ngay", tuần: "tuan", tuan: "tuan", tháng: "thang", thang: "thang", năm: "nam", nam: "nam" }[m[1]];
  });
  // Ưu tiên
  cat(new RegExp(`\\s(!{1,3}|gấp|khẩn|gap|khan|quan trọng)${B}`), m => {
    ket.uuTien = m[1][0] === "!" ? m[1].length : (/quan/.test(m[1]) ? 2 : 3);
  });
  // Buổi + nay/mai không kèm giờ: "tối nay", "sáng mai"
  let buoiMacDinh = null;
  // Giờ: 8h, 8h30, 8:30, 8 giờ, 14h, kèm sáng/trưa/chiều/tối
  cat(new RegExp(`\\s(?:lúc|luc)?\\s*(\\d{1,2})\\s*(?:h|g|giờ|gio|:)\\s*(\\d{1,2})?\\s*(?:p|phút|phut)?\\s*(sáng|sang|trưa|trua|chiều|chieu|tối|toi|đêm|dem)?${B}`), m => {
    let h = +m[1], p = m[2] ? +m[2] : 0;
    if (h > 23 || p > 59) return false;
    const b = m[3] || "";
    if (/chiều|chieu|tối|toi/.test(b) && h < 12) h += 12;
    else if (/trưa|trua/.test(b) && h < 11) h += 12;
    else if (/đêm|dem/.test(b) && h >= 6 && h < 12) h += 12;
    ket.gio = `${hai(h)}:${hai(p)}`;
  });
  // Ngày
  const ngayTrongThang = (d, mo, y) => d >= 1 && mo >= 1 && mo <= 12 && d <= jdFromDate(1, mo === 12 ? 1 : mo + 1, mo === 12 ? y + 1 : y) - jdFromDate(1, mo, y);
  const daCo = () => ket.jd != null;
  /* Âm lịch: tìm ngày dương của ngày âm d/m, lần tới (từ hôm nay) */
  const amNay = ttNgay(hom).am;
  const jdAm = (d, mo, y) => { const j = lunar2Jd(d, mo, y, false, TZ); if (j == null) return null; const a = amCuaJd(j); return a.day === d && a.month === mo && !a.leap ? j : null; };
  const amToi = (d, mo) => { let j = jdAm(d, mo, amNay.year); if (j == null || j < hom) j = jdAm(d, mo, amNay.year + 1); if (j == null && d === 30) return amToi(29, mo); return j; };
  const duongToi = (d, mo) => { const y = ttNgay(hom).yy; let j = jdFromDate(d, mo, y); if (j < hom) j = jdFromDate(d, mo, y + 1); return j; };
  const thangSau = (mo, y) => mo === 12 ? [1, y + 1] : [mo + 1, y];
  const SO = { một: 1, mot: 1, hai: 2, ba: 3, bốn: 4, bon: 4, tư: 4, tu: 4, năm: 5, nam: 5, sáu: 6, bảy: 7, bay: 7, tám: 8, tam: 8, chín: 9, chin: 9, mười: 10, muoi: 10, giêng: 1, gieng: 1, chạp: 12, chap: 12, "mười một": 11, "muoi mot": 11 };
  const THANG_RE = "(này|nay|tới|toi|sau|giêng|gieng|chạp|chap|mười một|muoi mot|một|mot|hai|ba|tư|tu|năm|nam|sáu|bảy|bay|tám|tam|chín|chin|mười|muoi|\\d{1,2})";
  const NGAY_RE = "(\\d{1,2}|một|mot|hai|ba|bốn|bon|năm|nam|sáu|bảy|bay|tám|tam|chín|chin|mười|muoi)";
  /* "rằm tháng này", "mồng một tháng tới", "mùng 5 tháng 5", "rằm tháng giêng" */
  const ngayAmTheoThang = (d, t) => {
    if (/^(này|nay)$/.test(t)) { const j = jdAm(d, amNay.month, amNay.year) ?? (d === 30 ? jdAm(29, amNay.month, amNay.year) : null); if (j != null && j < hom) ket.daQua = true; return j; }
    if (/^(tới|toi|sau)$/.test(t)) { const [mo, y] = thangSau(amNay.month, amNay.year); return jdAm(d, mo, y) ?? (d === 30 ? jdAm(29, mo, y) : null); }
    const mo = /^\d+$/.test(t) ? +t : SO[t];
    return mo >= 1 && mo <= 12 ? amToi(d, mo) : null;
  };
  if (!daCo()) cat(new RegExp(`\\s(?:ngày\\s+|ngay\\s+)?(rằm|ram|(?:mùng|mồng|mung|mong)\\s*${NGAY_RE})\\s+(?:tháng|thang)\\s+${THANG_RE}(?:\\s+(?:âm lịch|am lich|âm|am))?${B}`), m => {
    const d = /^r/.test(m[1]) ? 15 : (/^\d+$/.test(m[2]) ? +m[2] : SO[m[2]]);
    if (!(d >= 1 && d <= 30)) return false;
    const j = ngayAmTheoThang(d, m[3]);
    if (j == null) return false;
    ket.jd = j; ket.am = true;
  });
  /* "ngày 5 tháng 5 âm", "10/3 âm lịch" */
  if (!daCo()) cat(new RegExp(`\\s(?:ngày\\s+|ngay\\s+)?(\\d{1,2})(?:\\s+(?:tháng|thang)\\s+|/)(\\d{1,2})\\s+(?:âm lịch|am lich|âm|am)${B}`), m => {
    const j = amToi(+m[1], +m[2]); if (j == null) return false; ket.jd = j; ket.am = true;
  });
  /* Cuối tuần, cuối tháng, đầu tháng / đầu tuần sau */
  if (!daCo()) cat(new RegExp(`\\s(?:cuối|cuoi)\\s+(?:tuần|tuan)(\\s+(?:sau|tới|toi))?${B}`), m => {
    const thu = thuCuaJd(hom); let cach = thu === 0 ? 0 : 6 - thu;
    if (m[1]) cach += 7;
    ket.jd = hom + cach;
  });
  if (!daCo()) cat(new RegExp(`\\s(?:cuối|cuoi)\\s+(?:tháng|thang)(\\s+(?:sau|tới|toi|này|nay))?${B}`), m => {
    const t = ttNgay(hom); let [mo, y] = [t.mm, t.yy];
    if (m[1] && /sau|t[oớ]i/.test(m[1])) [mo, y] = thangSau(mo, y);
    const [m2, y2] = thangSau(mo, y);
    ket.jd = jdFromDate(1, m2, y2) - 1;
  });
  if (!daCo()) cat(new RegExp(`\\s(?:đầu|dau)\\s+(?:tháng|thang)\\s+(?:sau|tới|toi)${B}`), () => {
    const t = ttNgay(hom), [mo, y] = thangSau(t.mm, t.yy); ket.jd = jdFromDate(1, mo, y);
  });
  if (!daCo()) cat(new RegExp(`\\s(?:đầu|dau)\\s+(?:tuần|tuan)\\s+(?:sau|tới|toi)${B}`), () => { ket.jd = hom + ((8 - thuCuaJd(hom)) % 7 || 7); });
  /* Tên lễ tết: hiểu ngày nhưng GIỮ chữ trong tên việc ("Mua bánh trung thu") */
  if (!daCo()) {
    const thuong = chu.toLowerCase();
    const LE = [
      [/giao thừa|giao thua|tất niên|tat nien/, () => { let j = jdAm(1, 1, amNay.year + 1) - 1; if (j < hom) j = jdAm(1, 1, amNay.year + 2) - 1; return j; }, "Giao thừa"],
      [/nguyên tiêu|nguyen tieu/, () => amToi(15, 1), "Tết Nguyên Tiêu (Rằm tháng Giêng)"],
      [/khai hạ|khai ha|hạ nêu|ha neu/, () => amToi(7, 1), "Khai hạ"],
      [/hàn thực|han thuc|bánh trôi|banh troi/, () => amToi(3, 3), "Tết Hàn thực"],
      [/giỗ tổ|gio to|hùng vương|hung vuong/, () => amToi(10, 3), "Giỗ Tổ Hùng Vương"],
      [/phật đản|phat dan/, () => amToi(15, 4), "Lễ Phật Đản"],
      [/đoan ngọ|doan ngo|sâu bọ|sau bo/, () => amToi(5, 5), "Tết Đoan Ngọ"],
      [/vu lan|xá tội|xa toi/, () => amToi(15, 7), "Lễ Vu Lan"],
      [/trung thu/, () => amToi(15, 8), "Tết Trung Thu"],
      [/trùng cửu|trung cuu/, () => amToi(9, 9), "Tết Trùng Cửu"],
      [/cơm mới|com moi|trùng thập|trung thap/, () => amToi(10, 10), "Tết Cơm mới"],
      [/hạ nguyên|ha nguyen/, () => amToi(15, 10), "Tết Hạ Nguyên"],
      [/ông táo|ong tao|ông công|ong cong|táo quân|tao quan/, () => amToi(23, 12), "Ông Công Ông Táo"],
      [/thanh minh|tảo mộ|tao mo/, () => { for (let k = 0; k < 370; k++) if (laNgayThanhMinh(hom + k)) return hom + k; return null; }, "Tiết Thanh minh"],
      [/quốc khánh|quoc khanh/, () => duongToi(2, 9), "Quốc khánh"],
      [/giải phóng miền nam|giai phong mien nam|ngày giải phóng|ngay giai phong|thống nhất đất nước/, () => duongToi(30, 4), "Ngày Giải phóng miền Nam"],
      [/quốc tế lao động|quoc te lao dong|ngày lao động|ngay lao dong/, () => duongToi(1, 5), "Quốc tế Lao động"],
      [/văn hoá việt nam|văn hóa việt nam|van hoa viet nam|ngày văn hoá|ngày văn hóa/, () => duongToi(24, 11), "Ngày Văn hóa Việt Nam"],
      [/nhà giáo|nha giao/, () => duongToi(20, 11), "Ngày Nhà giáo Việt Nam"],
      [/phụ nữ việt nam|phu nu viet nam|20\/10/, () => duongToi(20, 10), "Ngày Phụ nữ Việt Nam"],
      [/quốc tế phụ nữ|quoc te phu nu/, () => duongToi(8, 3), "Quốc tế Phụ nữ"],
      [/giáng sinh|giang sinh|noel/, () => duongToi(24, 12), "Lễ Giáng sinh"],
      [/valentine|tình nhân|tinh nhan/, () => duongToi(14, 2), "Lễ Tình nhân"],
      [/tết dương|tet duong|năm mới dương|nam moi duong/, () => duongToi(1, 1), "Tết Dương lịch"],
      [/(?:^|\s)(?:tết|tet)(?=[\s,.;!?]|$)/, () => amToi(1, 1), "Tết Nguyên Đán"]
    ];
    for (const [re, tinh, ten] of LE) if (re.test(thuong)) { const j = tinh(); if (j != null) { ket.jd = j; ket.le = ten; } break; }
  }
  if (!daCo()) cat(new RegExp(`\\s(sáng|sang|trưa|trua|chiều|chieu|tối|toi)\\s+(?:ngày\\s+|ngay\\s+)?(nay|mai|mốt|mot|kia)${B}`), m => {
    ket.jd = hom + (/mai/.test(m[2]) ? 1 : /m[oố]t|kia/.test(m[2]) ? 2 : 0);
    buoiMacDinh = /s[aá]ng/.test(m[1]) ? "08:00" : /tr[uư]a/.test(m[1]) ? "12:00" : /chi[eề]u/.test(m[1]) ? "15:00" : "20:00";
  });
  if (!daCo()) cat(new RegExp(`\\s(hôm nay|hom nay|nay)${B}`), () => { ket.jd = hom; });
  if (!daCo()) cat(new RegExp(`\\s(ngày mai|ngay mai|mai)${B}`), () => { ket.jd = hom + 1; });
  if (!daCo()) cat(new RegExp(`\\s(ngày kia|ngay kia|ngày mốt|ngay mot|mốt|mot|kia)${B}`), () => { ket.jd = hom + 2; });
  if (!daCo()) cat(new RegExp(`\\s(tuần sau|tuan sau|tuần tới|tuan toi)${B}`), () => { ket.jd = hom + ((8 - thuCuaJd(hom)) % 7 || 7); });
  if (!daCo()) cat(new RegExp(`\\s(?:(?:thứ|thu)\\s*(hai|ba|tư|tu|năm|nam|sáu|sau|bảy|bay|[2-7])|t([2-7])|(chủ nhật|chu nhat|cn))(\\s+(?:tuần sau|tuan sau))?${B}`), m => {
    const ten = { hai: 1, ba: 2, tư: 3, tu: 3, năm: 4, nam: 4, sáu: 5, sau: 5, bảy: 6, bay: 6 };
    const thu = m[3] ? 0 : m[2] ? +m[2] - 1 : /^\d$/.test(m[1]) ? +m[1] - 1 : ten[m[1]];
    let cach = (thu - thuCuaJd(hom) + 7) % 7 || 7;
    if (m[4]) cach += 7;
    ket.jd = hom + cach;
  });
  if (!daCo()) cat(new RegExp(`\\s(?:ngày|ngay)?\\s*(\\d{1,2})[/\\-.](\\d{1,2})(?:[/\\-.](\\d{2,4}))?${B}`), m => {
    const t = ttNgay(hom); let d = +m[1], mo = +m[2], y = m[3] ? +m[3] : t.yy;
    if (y < 100) y += 2000;
    if (!ngayTrongThang(d, mo, y)) return false;
    let j = jdFromDate(d, mo, y);
    if (!m[3] && j < hom) j = jdFromDate(d, mo, y + 1);
    ket.jd = j;
  });
  /* "rằm", "mồng một", "mùng 5" chưa nói tháng nào: lấy lần tới gần nhất và gợi ý tháng này / tháng tới */
  const goiYAm = (d, ten) => {
    const [mo2, y2] = thangSau(amNay.month, amNay.year);
    const nay = jdAm(d, amNay.month, amNay.year), toi = jdAm(d, mo2, y2);
    ket.goiY = [];
    if (nay != null && nay >= hom) ket.goiY.push({ nhan: `${ten} tháng này`, jd: nay });
    if (toi != null) ket.goiY.push({ nhan: `${ten} tháng tới`, jd: toi });
    return ket.goiY.length ? ket.goiY[0].jd : null;
  };
  if (!daCo()) cat(new RegExp(`\\s(rằm|ram)${B}`), () => { ket.jd = goiYAm(15, "Rằm"); ket.am = true; });
  if (!daCo()) cat(new RegExp(`\\s(?:mùng|mồng|mung|mong)\\s*${NGAY_RE}${B}`), m => {
    const n = /^\d+$/.test(m[1]) ? +m[1] : SO[m[1]]; if (!(n >= 1 && n <= 10)) return false;
    ket.jd = goiYAm(n, n === 1 ? "Mồng Một" : `Mùng ${n}`); ket.am = true;
  });
  if (!daCo()) cat(new RegExp(`\\s(?:ngày|ngay)\\s+(\\d{1,2})${B}`), m => {
    const t = ttNgay(hom); let d = +m[1], mo = t.mm, y = t.yy;
    if (d < t.dd) { mo++; if (mo > 12) { mo = 1; y++; } }
    if (!ngayTrongThang(d, mo, y)) return false;
    ket.jd = jdFromDate(d, mo, y);
  });
  if (!ket.gio && buoiMacDinh) ket.gio = buoiMacDinh;
  // Có giờ mà không có ngày: hôm nay nếu còn kịp, không thì ngày mai
  if (ket.gio && ket.jd == null) {
    const [h, p] = ket.gio.split(":").map(Number);
    ket.jd = h * 60 + p > bay.getHours() * 60 + bay.getMinutes() ? hom : hom + 1;
  }
  if (ket.lap !== "khong" && ket.jd == null) ket.jd = hom;
  ket.ten = chu.replace(/\s+/g, " ").replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, "").trim();
  if (ket.ten) ket.ten = ket.ten[0].toUpperCase() + ket.ten.slice(1);
  return ket;
}

function nhanNgayViec(jd, coThu) {
  const hom = jdHomNay(), t = ttNgay(jd), k = jd - hom;
  if (k === 0) return "Hôm nay";
  if (k === 1) return "Ngày mai";
  if (k === -1) return "Hôm qua";
  const thu = THU_NGAN[thuCuaJd(jd)], nam = t.yy !== ttNgay(hom).yy ? `/${t.yy}` : "";
  return `${coThu === false ? "" : thu + " "}${hai(t.dd)}/${hai(t.mm)}${nam}`;
}
const hanCua = v => v.jd == null ? Infinity : v.jd * 1440 + (v.gio ? v.gio.split(":").reduce((h, p) => +h * 60 + +p) : 1439.5);
const bayGio = () => { const d = new Date(); return jdHomNay() * 1440 + d.getHours() * 60 + d.getMinutes(); };
const quaHan = v => !v.xong && v.jd != null && hanCua(v) < bayGio() && (v.gio || v.jd < jdHomNay());
const viecCuaNgay = j => viec.filter(v => !v.xong && v.jd === j);
const soViecCan = () => viec.filter(v => !v.xong && v.jd != null && v.jd <= jdHomNay()).length;

function ngayLapTiep(v) {
  const goc = v.jd == null ? jdHomNay() : v.jd;
  if (v.lap === "ngay") return goc + 1;
  if (v.lap === "tuan") return goc + 7;
  const t = ttNgay(goc);
  let mo = t.mm + (v.lap === "thang" ? 1 : 0), y = t.yy + (v.lap === "nam" ? 1 : 0);
  if (mo > 12) { mo = 1; y++; }
  const dai = jdFromDate(1, mo === 12 ? 1 : mo + 1, mo === 12 ? y + 1 : y) - jdFromDate(1, mo, y);
  return jdFromDate(Math.min(t.dd, dai), mo, y);
}

/* ── Thông báo tạm có nút Hoàn tác ── */
let henBao = 0;
function baoTam(noiDung, hoanTac, giuLau) {
  const el = $("bao-tam");
  clearTimeout(henBao);
  el.innerHTML = `<span>${noiDung}</span>${hoanTac ? '<button type="button" id="bt-hoan">' + ic("moLai") + '<span>Hoàn tác</span></button>' : ""}`;
  el.classList.add("hien"); el.removeAttribute("aria-hidden");
  if (hoanTac) $("bt-hoan").onclick = () => { hoanTac(); el.classList.remove("hien"); };
  henBao = setTimeout(() => { el.classList.remove("hien"); el.setAttribute("aria-hidden", "true"); }, giuLau ? 9000 : 4500);
}

/* Một dòng việc. coNgay: ghi ngày ở dòng phụ khi nhóm không theo một ngày (Quá hạn, Đã xong) */
function veMucViec(v, coNgay) {
  const hom = jdHomNay(), qh = quaHan(v), k = v.jd == null ? null : v.jd - hom;
  const phu = [coNgay && v.jd != null ? nhanNgayViec(v.jd) : "", v.gio || "", v.lap !== "khong" ? `↻ ${chuThuong(LAP[v.lap])}` : "",
    v.uuTien ? `ưu tiên ${UU[v.uuTien].toLowerCase()}` : ""].filter(Boolean).join(" · ");
  const dem = v.xong ? "Đã xong" : k == null ? "" : qh ? (k < 0 ? chuDem(k) : "Quá giờ") : (k === 0 || k === 1) && !coNgay ? (v.gio || "") : k === 0 ? (v.gio || "Hôm nay") : chuDem(k); /* trong nhóm Hôm nay / Ngày mai không nhắc lại tên nhóm */
  return dongSo({ attr: `data-viec-id="${esc(v.id)}"`, sang: viecChon === v.id, lop: v.xong ? "da-xong" : "",
    bieu: chonBieu(v.ten, "viec", v.bieu), ten: v.ten, phu, dem, demLop: qh ? "qua" : k === 0 && !v.xong ? "nay" : "" });
}
/* Tấm chi tiết một việc: Xong (hoặc Mở lại) · Sửa · Xoá — Xong và Xoá đều có Hoàn tác */
function moTamViec(v) {
  const xongLuc = v.xong && v.xongLuc ? `Xong lúc ${new Date(v.xongLuc).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}` : "";
  moTamCT({
    bieu: chonBieu(v.ten, "viec", v.bieu), ten: v.ten, ghi: v.ghi,
    ngay: v.jd == null ? "Chưa đặt ngày" : `${nhanNgay(v.jd, true)} · ${nhanAm(v.jd)}${v.gio ? ` · ${v.gio}` : ""}`,
    dong: [[v.uuTien ? `Ưu tiên ${UU[v.uuTien].toLowerCase()}` : "Không ưu tiên", LAP[v.lap].toLowerCase()].join(" · "), xongLuc],
    nut: nutBt(v.xong ? "moLai" : "xong", v.xong ? "Mở lại" : "Xong", `class="ct-chinh" data-ct="xong"`) +
      nutBt("sua", "Sửa", `class="ct-chu" data-ct="sua"`) + nutBt("xoa", "Xoá", `class="ct-chu ct-xoa" data-ct="xoa"`),
    lam: k => {
      dongTam();
      if (k === "xong") { if (!v.xong && v.lap === "khong") viecChon = null; tichViec(v.id); return; }
      if (k === "sua") { moFormViec(v); veViec(); $("khung").scrollTop = 0; return; }
      const cu = viec.slice();
      viec = viec.filter(x => x.id !== v.id);
      if (viecSua === v.id) dongFormViec();
      viecChon = null; luuViec(); ve();
      baoTam(`Đã xoá “${esc(v.ten)}”`, () => { viec = cu; luuViec(); ve(); });
    }
  });
}
/* Tiêu đề nhóm ngày trên trang sổ: chữ thường, con số viết Bodoni như tờ lịch */
function tieuDeNgay(j) {
  const k = j - jdHomNay(), t = ttNgay(j), so = `<span class="so">${hai(t.dd)}/${hai(t.mm)}${t.yy !== ttNgay(jdHomNay()).yy ? "/" + t.yy : ""}</span>`;
  return k === 0 || k === 1 ? `${k ? "Ngày mai" : "Hôm nay"}<em>${THU[thuCuaJd(j)]} ${hai(t.dd)}/${hai(t.mm)} · ${nhanAm(j)}</em>`
    : `${THU[thuCuaJd(j)]} ${so}<em>${nhanAm(j)}</em>`;
}

function veViec() {
  const hom = jdHomNay(), conLai = viec.filter(v => !v.xong);
  const nhom = {
    homnay: conLai.filter(v => v.jd != null && v.jd <= hom),
    saptoi: conLai.filter(v => v.jd != null && v.jd > hom),
    tatca: conLai,
    xong: viec.filter(v => v.xong)
  };
  const TEN = { homnay: "Hôm nay", saptoi: "Sắp tới", tatca: "Tất cả", xong: "Đã xong" };
  $("loc-viec").innerHTML = Object.keys(TEN).map(k =>
    `<button type="button" role="tab" class="loc l-${k}${locViec === k ? " chon" : ""}" data-loc="${k}" aria-selected="${locViec === k}">
      <b>${nhom[k].length}</b><span>${TEN[k]}</span></button>`).join("");

  const sap = ds => ds.slice().sort((a, b) => hanCua(a) - hanCua(b) || b.uuTien - a.uuTien || a.taoLuc - b.taoLuc);
  let html = "";
  if (!viec.some(v => v.id === viecChon)) viecChon = null;
  /* Cả danh sách nằm trên một trang sổ; mỗi nhóm ngày có một dòng tiêu đề */
  const nhomDs = (td, ds, coNgay, lop) => `<h4 class="ds-td${lop ? " " + lop : ""}">${td}</h4><ul class="ds-so">${ds.map(v => veMucViec(v, coNgay)).join("")}</ul>`;
  if (locViec === "xong") {
    const ds = nhom.xong.slice().sort((a, b) => (b.xongLuc || 0) - (a.xongLuc || 0)).slice(0, 60);
    html = ds.length ? `<div class="to-so">${nhomDs("Đã hoàn thành", ds, true)}</div>${nutBt("xoa", "Xoá hết việc đã xong", `class="nut nho xoa-xong" data-xoa-xong`)}` : "";
  } else {
    const ds = sap(nhom[locViec]), cum = new Map();
    ds.forEach(v => {
      const k = v.jd == null ? "khong" : quaHan(v) && v.jd < hom ? "qua" : String(v.jd);
      if (!cum.has(k)) cum.set(k, []);
      cum.get(k).push(v);
    });
    const thuTu = [...cum.keys()].sort((a, b) => (a === "qua" ? -1 : b === "qua" ? 1 : a === "khong" ? 1 : b === "khong" ? -1 : +a - +b));
    html = thuTu.length ? `<div class="to-so">${thuTu.map(k => k === "qua" ? nhomDs("Quá hạn", cum.get(k), true, "qua")
      : k === "khong" ? nhomDs("Chưa đặt ngày", cum.get(k), false) : nhomDs(tieuDeNgay(+k), cum.get(k), false)).join("")}</div>` : "";
  }
  if (!html) {
    const loi = { homnay: ["Hôm nay rảnh việc", "Bấm “Thêm”, gõ một câu như “Gọi anh Tuấn 9h sáng mai” — ứng dụng tự điền ngày, giờ."],
      saptoi: ["Chưa có việc sắp tới", "Thêm việc có ngày, ví dụ “Họp giao ban thứ 2 hằng tuần”, “Đi lễ chùa rằm”."],
      tatca: ["Chưa có việc nào", "Bấm “Thêm” để thêm việc đầu tiên."],
      xong: ["Chưa hoàn thành việc nào", "Chạm một việc rồi bấm “Xong”."] }[locViec];
    html = `<div class="viec-trong"><b>${loi[0]}</b>${loi[1]}</div>`;
  }
  $("ds-viec").innerHTML = html;

  const can = soViecCan();
  $("dem-viec").hidden = !can; $("dem-viec").textContent = can;
  const xb = $("xin-bao");
  xb.hidden = !("Notification" in window) || Notification.permission !== "default" || !viec.some(v => !v.xong && v.gio);
  if (!xb.hidden) xb.innerHTML = `<span>Bật thông báo để được nhắc đúng giờ khi ứng dụng đang mở.</span><button type="button" class="nut nho" data-xin-bao>Bật</button>`;
}

function capNhatViec(id, sua) {
  const i = viec.findIndex(v => v.id === id);
  if (i < 0) return null;
  const truoc = { ...viec[i] };
  viec[i] = chuanViec({ ...viec[i], ...sua });
  if ("jd" in sua || "gio" in sua) viec[i].daBao = false;
  luuViec();
  return truoc;
}
function tichViec(id) {
  const v = viec.find(x => x.id === id);
  if (!v) return;
  const truoc = { ...v };
  const hoan = () => { viec = viec.map(x => x.id === id ? truoc : x); luuViec(); ve(); };
  if (v.xong) { capNhatViec(id, { xong: false, xongLuc: null }); ve(); return; }
  if (v.lap !== "khong") {
    const tiep = ngayLapTiep(v);
    capNhatViec(id, { jd: tiep });
    ve();
    baoTam(`Đã xong “${esc(v.ten)}” · lần tới ${nhanNgayViec(tiep)}`, hoan);
  } else {
    capNhatViec(id, { xong: true, xongLuc: Date.now() });
    ve();
    baoTam(`Đã xong “${esc(v.ten)}”`, hoan);
  }
}

/* ── Khung nhập việc (giống khung Ngày lặp lại) ── */
const jdSangO = jd => jd == null ? "" : (t => `${t.yy}-${hai(t.mm)}-${hai(t.dd)}`)(ttNgay(jd));
const oSangJd = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? jdFromDate(+m[3], +m[2], +m[1]) : null; };
let chamTay = {};
function datUu(n) { document.querySelectorAll("#v-uu [data-uu]").forEach(b => b.classList.toggle("chon", +b.dataset.uu === n)); }
const docUu = () => +(document.querySelector("#v-uu .chon") || { dataset: { uu: 0 } }).dataset.uu;
function moFormViec(v) {
  viecSua = v ? v.id : null; chamTay = v ? { ngay: 1, gio: 1, uu: 1, lap: 1 } : {};
  hienSoan("f-viec", true);
  $("v-go").value = v ? v.ten : "";
  $("v-ngay").value = v ? jdSangO(v.jd) : ""; $("v-gio").value = v && v.gio || "";
  datUu(v ? v.uuTien : 0); $("v-lap").value = v ? v.lap : "khong"; $("v-ghi").value = v ? v.ghi : ""; datBieu("v-bieu", v ? v.bieu : "");
  $("v-td").textContent = v ? "Sửa việc" : "Việc mới";
  $("v-luu").innerHTML = v ? `${ic("luu")}<span>Lưu</span>` : `${ic("them")}<span>Thêm việc</span>`; $("v-loi").textContent = "";
  lichViecMo = gioViecMo = false;
  hieuNhap();
  /* Sửa việc: không tự đặt con trỏ, để bàn phím iPhone khỏi bật lên che nửa tờ khi chỉ muốn đổi ngày */
  if (!v) $("v-go").focus();
}
function dongFormViec() {
  viecSua = null;
  hienSoan("f-viec", false);
}
/* Dòng Ngày (chip Hôm nay · Ngày mai · Chọn ngày + lịch nhỏ), dòng Giờ nhắc (lưới giờ), chip Lặp lại */
let lichViecMo = false, gioViecMo = false, lichViecXem = null;
function veSoanViec() {
  const hom = jdHomNay(), j = oSangJd($("v-ngay").value), gio = $("v-gio").value;
  const khac = j != null && j !== hom && j !== hom + 1;
  $("v-ngay-chon").innerHTML = chip(j === hom, 'data-vn="0"', "Hôm nay") + chip(j === hom + 1, 'data-vn="1"', "Ngày mai") +
    chip(khac || lichViecMo, 'data-vn="lich"', `${ic("lich")}${khac ? `${THU_NGAN[thuCuaJd(j)]} ${hai(ttNgay(j).dd)}/${hai(ttNgay(j).mm)}${ttNgay(j).yy !== ttNgay(hom).yy ? "/" + ttNgay(j).yy : ""}` : "Chọn ngày"}`);
  $("v-lich").hidden = !lichViecMo;
  if (lichViecMo) {
    if (!lichViecXem) { const t = ttNgay(j ?? hom); lichViecXem = { mm: t.mm, yy: t.yy }; }
    $("v-lich").innerHTML = lichNho(j, lichViecXem) + (j != null ? `<button type="button" class="sx-lien" data-ln-bo>${ic("huy")}Chưa đặt ngày</button>` : "");
  }
  $("v-gio-chon").innerHTML = `${gio ? `<b>${gio}</b>` : `<span class="mo">Không nhắc giờ</span>`}${j != null ? `<em>${nhanNgay(j)} · ${nhanAm(j)}</em>` : ""}`;
  $("v-gio-chon").classList.toggle("dang-mo", gioViecMo);
  $("v-gio-luoi").hidden = !gioViecMo;
  if (gioViecMo) $("v-gio-luoi").innerHTML = luoiGio(gio);
  $("v-lap-chon").innerHTML = Object.entries({ khong: "Không", ngay: "Ngày", tuan: "Tuần", thang: "Tháng", nam: "Năm" })
    .map(([k, t]) => chip($("v-lap").value === k, `data-vl="${k}"`, t)).join("");
}
function datNgayViec(j) {
  $("v-ngay").value = jdSangO(j); chamTay.ngay = 1; hieuNhap();
}
/* Gõ câu tự nhiên: hiện nhãn xem trước và tự điền các ô chưa sửa tay */
function hieuNhap() {
  const g = $("v-go").value.trim();
  if (!g) { $("v-hieu").innerHTML = ""; veSoanViec(); return; }
  const k = phanTichViec(g), the = [];
  if (k.jd != null) the.push(`<span class="the-ngay">${ic("lich")}${nhanNgayViec(k.jd)}${k.jd - jdHomNay() > 1 ? ` · ${ttNgay(k.jd).am.day}/${ttNgay(k.jd).am.month} âm` : ""}</span>`);
  if (k.gio) the.push(`<span class="the-hen">${ic("dongHo")}${k.gio}</span>`);
  if (k.lap !== "khong") the.push(`<span class="the-lap">↻ ${LAP[k.lap]}</span>`);
  if (k.uuTien) the.push(`<span class="the-uu p${k.uuTien}">${ic("co")}Ưu tiên ${UU[k.uuTien].toLowerCase()}</span>`);
  /* Gợi ý: tên lễ tết nhận ra được, ngày trùng lễ, và các lựa chọn khi câu chưa rõ tháng */
  const jdHien = chamTay.ngay ? oSangJd($("v-ngay").value) : k.jd;
  if (chamTay.ngay && jdHien != null && the.length && /the-ngay/.test(the[0])) the[0] = `<span class="the-ngay">${ic("lich")}${nhanNgayViec(jdHien)} · ${ttNgay(jdHien).am.day}/${ttNgay(jdHien).am.month} âm</span>`;
  if (k.le) the.push(`<span class="the-le">${ic("sao")}${esc(k.le)}</span>`);
  else if (jdHien != null) {
    const le = leCuaNgay(jdHien).filter(l => l.loai !== "ram").map(l => l.ten);
    if (le.length) the.push(`<span class="the-le">${ic("sao")}Trùng ${esc(le[0])}</span>`);
  }
  if (k.daQua) the.push(`<span class="the-uu p3">Ngày này trong tháng đã qua</span>`);
  if (k.goiY && k.goiY.length > 1) {
    the.push(`<span class="goi-y-nhan">Chọn:</span>` + k.goiY.map(g =>
      `<button type="button" class="goi-y${g.jd === jdHien ? " chon" : ""}" data-goi-jd="${g.jd}">${esc(g.nhan)} · ${hai(ttNgay(g.jd).dd)}/${hai(ttNgay(g.jd).mm)}</button>`).join(""));
  }
  $("v-hieu").innerHTML = the.join("");
  if (!chamTay.ngay && k.jd != null) $("v-ngay").value = jdSangO(k.jd);
  if (!chamTay.gio && k.gio) $("v-gio").value = k.gio;
  if (!chamTay.lap && k.lap !== "khong") $("v-lap").value = k.lap;
  if (!chamTay.uu && k.uuTien) datUu(k.uuTien);
  veSoanViec();
}

/* Chạm một dòng ghi trên tờ lịch: mở đúng mục trong thẻ Nhắc — đổi bộ lọc việc nếu mục nằm ở nhóm khác,
   làm sáng dòng đó và cuộn danh sách tới nó */
function chiToiMuc(trang, id) {
  if (trang === "viec") {
    const v = viec.find(x => x.id === id);
    if (!v) return;
    const hom = jdHomNay(), can = v.xong ? "xong" : v.jd == null ? "tatca" : v.jd > hom ? "saptoi" : "homnay";
    if (locViec !== can && !(locViec === "tatca" && !v.xong)) locViec = can;
    viecChon = id; veViec();
  } else {
    if (!nhac.some(x => x.id === id)) return;
    nhacChon = id; veNhac();
  }
  const toi = () => {
    const li = document.querySelector(trang === "viec" ? `#ds-viec [data-viec-id="${id}"]` : `#ds-nhac [data-chon="${id}"]`);
    if (!li) return;
    /* Đặt thẳng chỗ cuộn của khung danh sách (cuộn mềm bị hiệu ứng chuyển thẻ cắt ngang, không tới nơi); mục nằm giữa khung */
    const khung = li.closest("#ds-viec, #ds-nhac .ds-so");
    if (khung && khung.scrollHeight > khung.clientHeight) {
      const a = li.getBoundingClientRect(), b = khung.getBoundingClientRect();
      khung.scrollTop += a.top - b.top - (khung.clientHeight - a.height) / 2;
    } else li.scrollIntoView({ block: "center" });
    li.classList.remove("vua-them"); void li.offsetWidth; li.classList.add("vua-them");
  };
  /* Cuộn ngay (bố cục đã có sau veViec), cuộn lại một nhịp sau phòng thẻ Nhắc vừa hiện còn đổi kích thước */
  toi(); setTimeout(toi, 120);
}

/* ── Nhắc đúng giờ (khi ứng dụng đang mở) ── */
function soatGio() {
  const bay = bayGio();
  let doi = false;
  viec.forEach(v => {
    if (v.xong || v.daBao || v.jd == null || !v.gio) return;
    const han = hanCua(v);
    if (han <= bay && bay - han < 360) {
      v.daBao = true; doi = true;
      baoTam(`${ic("dongHo")}Đến giờ: “${esc(v.ten)}”${v.ghi ? ` — ${esc(v.ghi.split("\n")[0])}` : ""}`, null, true);
      if (navigator.vibrate) navigator.vibrate([180, 80, 180]);
      if ("Notification" in window && Notification.permission === "granted" && navigator.serviceWorker) {
        navigator.serviceWorker.getRegistration().then(r => r && r.showNotification(v.ten, {
          body: `${v.gio}${v.ghi ? " · " + v.ghi : ""}`, icon: "./icon-192.png", badge: "./icon-192.png", tag: v.id
        })).catch(() => {});
      }
    }
  });
  if (doi) { luuViec(); ve(); }
}

function ganViec() {
  const trang = docKhoa(KHOA_TRANG, "viec");
  const datTrang = t => {
    $("nhac").dataset.trang = t;
    document.querySelectorAll("[data-nhac-trang]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.nhacTrang === t)));
    ghiKhoa(KHOA_TRANG, t);
  };
  datTrang(trang === "lap" ? "lap" : "viec");
  $("v-huy").innerHTML = `${ic("huy")}<span>Huỷ</span>`;
  datNutThem("v-mo", false);
  $("nhac").addEventListener("click", e => {
    const b = e.target.closest("[data-nhac-trang]");
    if (b) datTrang(b.dataset.nhacTrang);
  });
  /* Khung nhập */
  $("v-go").addEventListener("input", hieuNhap);
  $("v-hieu").addEventListener("click", e => {
    const b = e.target.closest("[data-goi-jd]");
    if (!b) return;
    datNgayViec(+b.dataset.goiJd);
  });
  /* Ngày: chạm lại chip đang chọn thì bỏ ngày; "Chọn ngày" mở lịch nhỏ */
  $("v-ngay-chon").addEventListener("click", e => {
    const b = e.target.closest("[data-vn]"); if (!b) return;
    if (b.dataset.vn === "lich") { lichViecMo = !lichViecMo; lichViecXem = null; gioViecMo = false; veSoanViec(); return; }
    const j = jdHomNay() + +b.dataset.vn;
    lichViecMo = false;
    $("v-ngay").value = oSangJd($("v-ngay").value) === j ? "" : jdSangO(j); chamTay.ngay = 1; hieuNhap();
  });
  $("v-lich").addEventListener("click", e => {
    const t = e.target.closest("[data-ln-thang]"), d = e.target.closest("[data-ln-jd]");
    if (t) { let { mm, yy } = lichViecXem; mm += +t.dataset.lnThang; if (mm < 1) { mm = 12; yy--; } if (mm > 12) { mm = 1; yy++; } lichViecXem = { mm, yy }; veSoanViec(); }
    else if (d) { lichViecMo = false; datNgayViec(+d.dataset.lnJd); }
    else if (e.target.closest("[data-ln-bo]")) { lichViecMo = false; $("v-ngay").value = ""; chamTay.ngay = 1; hieuNhap(); }
  });
  $("v-gio-chon").addEventListener("click", () => { gioViecMo = !gioViecMo; lichViecMo = false; veSoanViec(); });
  $("v-gio-luoi").addEventListener("click", e => {
    const h = e.target.closest("[data-lg-h]"), p = e.target.closest("[data-lg-p]");
    const [h0, p0] = ($("v-gio").value || "08:00").split(":");
    if (h) $("v-gio").value = `${hai(+h.dataset.lgH)}:${p0}`;
    else if (p) { $("v-gio").value = `${h0}:${hai(+p.dataset.lgP)}`; gioViecMo = false; }
    else if (e.target.closest("[data-lg-bo]")) { $("v-gio").value = ""; gioViecMo = false; }
    else return;
    chamTay.gio = 1;
    if ($("v-gio").value && !oSangJd($("v-ngay").value)) { $("v-ngay").value = jdSangO(jdHomNay()); chamTay.ngay = 1; }
    hieuNhap();
  });
  $("v-lap-chon").addEventListener("click", e => { const b = e.target.closest("[data-vl]"); if (b) { chamTay.lap = 1; $("v-lap").value = b.dataset.vl; veSoanViec(); } });
  $("v-uu").addEventListener("click", e => { const b = e.target.closest("[data-uu]"); if (b) { chamTay.uu = 1; datUu(+b.dataset.uu); } });
  $("v-huy").addEventListener("click", () => { dongFormViec(); veViec(); });
  $("v-mo").addEventListener("click", () => { moFormViec(null); veViec(); });
  $("f-viec").addEventListener("submit", e => {
    e.preventDefault();
    const g = $("v-go").value.trim();
    if (!g) { $("v-loi").textContent = "Chưa nhập việc cần làm."; $("v-go").focus(); return; }
    const k = phanTichViec(g);
    // Tên: khi thêm mới lấy phần còn lại sau khi tách ngày giờ; khi sửa mà người dùng không gõ thêm ngày giờ thì giữ nguyên câu
    const ten = (viecSua && k.jd == null && !k.gio ? g : k.ten) || g;
    const du = { ten, jd: oSangJd($("v-ngay").value), gio: $("v-gio").value || null, uuTien: docUu(), lap: $("v-lap").value, ghi: $("v-ghi").value, bieu: docBieu("v-bieu") };
    if (du.lap !== "khong" && du.jd == null) du.jd = jdHomNay();
    let id;
    if (viecSua) { capNhatViec(viecSua, du); id = viecSua; baoTam(`Đã lưu “${esc(ten)}”`); }
    else { const v = chuanViec(du); viec.push(v); luuViec(); id = v.id; }
    const vMoi = viec.find(v => v.id === id);
    dongFormViec();
    viecChon = id;
    if (locViec === "xong" || (locViec === "homnay" && (vMoi.jd == null || vMoi.jd > jdHomNay())) || (locViec === "saptoi" && !(vMoi.jd > jdHomNay())))
      locViec = vMoi.jd == null ? "tatca" : vMoi.jd > jdHomNay() ? "saptoi" : "homnay";
    ve();
    const moi = document.querySelector(`[data-viec-id="${id}"]`);
    if (moi) { moi.classList.add("vua-them"); moi.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
  });
  $("loc-viec").addEventListener("click", e => {
    const b = e.target.closest("[data-loc]");
    if (b) { locViec = b.dataset.loc; viecChon = null; veViec(); }
  });
  $("xin-bao").addEventListener("click", e => {
    if (!e.target.closest("[data-xin-bao]")) return;
    Notification.requestPermission().then(() => veViec()).catch(() => {});
  });
  const ds = $("ds-viec");
  ds.addEventListener("click", e => {
    const li = e.target.closest("[data-viec-id]"), id = li && li.dataset.viecId;
    if (e.target.closest("[data-xoa-xong]")) {
      const cu = viec.slice(), n = viec.filter(v => v.xong).length;
      viec = viec.filter(v => !v.xong); luuViec(); ve();
      baoTam(`Đã xoá ${n} việc đã xong`, () => { viec = cu; luuViec(); ve(); });
      return;
    }
    if (!id) return;
    /* Chạm một việc: dòng sáng lên; chạm biểu tượng đầu dòng mới mở tấm chi tiết */
    const v = viec.find(x => x.id === id);
    if (v) { viecChon = id; veViec(); if (e.target.closest("[data-mo]")) moTamViec(v); }
  });
  ds.addEventListener("keydown", e => {
    const li = e.target.closest("[data-viec-id]");
    if (li && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); li.querySelector("[data-mo]").click(); }
  });
  setInterval(soatGio, 20000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { soatGio(); veViec(); } });
  soatGio();
}

