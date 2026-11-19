/* Lịch Pháp © 2026 Lê Lệnh Bắc. Bảo lưu mọi quyền. Bản chính thức, miễn phí: https://lelenhbac1974hn-web.github.io/lich-phap/ — cấm đưa lên chợ ứng dụng, bán hay phát hành lại khi chưa được phép (xem LICENSE). */
/* GIAO DIỆN — LỚP NÂNG CAO: mở khóa bằng mã tác giả cấp (mỗi người một mã), việc Cưới hỏi và Nhập trạch xét cả tuổi người.
   Mã chỉ so bằng băm SHA-256 (ma-nang-cao.js); đây là khóa hiển thị, không phải khóa bảo mật dữ liệu. */
"use strict";

const KHOA_NC = "lichphap:nang-cao", KHOA_NGUOI = "lichphap:nguoi";
const MUOI_NC = "lichphap-nang-cao:";
const docNC = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const ghiNC = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* trình duyệt chặn lưu */ } };
/* Đã mở khóa khi băm đã lưu còn trong danh sách mã đang dùng (mã bị thu hồi thì tự khóa lại ở bản sau) */
const moKhoaNC = () => { const h = docNC(KHOA_NC); return !!h && (window.LP_MA || []).includes(h); };
async function bamMa(ma) {
  const chuan = String(ma).toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!(window.crypto && crypto.subtle)) throw new Error("Trình duyệt không hỗ trợ kiểm mã (cần mở qua https)");
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(MUOI_NC + chuan));
  return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, "0")).join("");
}

/* Năm sinh (âm lịch) của người được xét — lưu trong máy, luan-sach.js đọc qua window.LP_NGUOI */
function docNguoi() { try { return JSON.parse(docNC(KHOA_NGUOI) || "{}") || {}; } catch (e) { return {}; } }
window.LP_NGUOI = docNguoi();
function ghiNguoi(k, v) {
  const n = docNguoi(), y = Number(v);
  if (y >= 1900 && y <= 2100) n[k] = y; else delete n[k];
  ghiNC(KHOA_NGUOI, JSON.stringify(n)); window.LP_NGUOI = n;
}

/* Dải việc: việc nâng cao chỉ hiện khi đã mở khóa */
const viecHien = () => VIEC.filter(v => !v.nangCao || moKhoaNC());
function giuViecHopLe() { if (!viecHien().some(v => v.id === st.viec)) st.viec = "chung"; }

/* Ô nhập năm sinh trong thẻ phán định khi đang xét việc nâng cao */
function oTuoi() {
  const v = VIEC.find(x => x.id === st.viec);
  if (!v || !v.nangCao) return "";
  const n = docNguoi(), am = amCuaJd(st.jd).year;
  const o = (k, nhan) => {
    const y = n[k];
    return `<label class="nc-o"><span>${nhan}</span><input type="number" inputmode="numeric" min="1900" max="2100" placeholder="năm sinh âm" data-nguoi="${k}" value="${y || ""}">
      <em>${y ? `${CAN[(y + 6) % 10]} ${CHI[(y + 8) % 12]} · ${am - y + 1} tuổi` : ""}</em></label>`;
  };
  return `<div class="nc-tuoi"><b>${ic("khoa")} Lớp nâng cao · xét tuổi</b>
    ${st.viec === "cuoihoi" ? o("trai", "Chú rể") + o("gai", "Cô dâu") : o("giaChu", "Gia chủ")}
    <small>Năm sinh theo âm lịch; tuổi tính theo tuổi mụ. Chỉ lưu trong máy này.</small></div>`;
}
document.addEventListener("change", e => {
  const i = e.target.closest("[data-nguoi]");
  if (!i) return;
  ghiNguoi(i.dataset.nguoi, i.value);
  ve();
});

/* Trang "Lớp nâng cao" trong menu */
function trangNangCao() {
  if (moKhoaNC()) return `<section><h4>Đã mở khóa</h4>
      <p>Dải việc có thêm <b>Cưới hỏi</b> và <b>Nhập trạch</b>. Khi chọn, thẻ phán định có ô nhập năm sinh chú rể, cô dâu hoặc gia chủ để xét tuổi:</p>
      <ul><li><b>Cưới hỏi:</b> Kim lâu cô dâu, năm hung niên, Tam tai, tháng Đại lợi, ngày xung tuổi, Châu đường, ngày Bất tương, ngày kỵ cưới gả của Thông Thư và Chánh Tông.</li>
      <li><b>Nhập trạch:</b> Tam tai, ngày xung tuổi gia chủ, ngày tốt nhập trạch; Kim lâu, Hoang ốc chỉ nhắc (sách ghi cho cất nhà).</li></ul>
      <p><button type="button" class="nut nho" data-nc="khoa">Khóa lại trên máy này</button></p></section>`;
  return `<section><h4>Mở khóa bằng mã tác giả cấp</h4>
      <p>Lớp nâng cao xét ngày cưới hỏi, nhập trạch theo tuổi người. Mỗi người dùng một mã riêng do tác giả cấp.</p>
      <div class="nc-nhap"><input type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="LP-XXXX-XXXX-XX" data-nc-ma>
      <button type="button" class="nut nut-chinh" data-nc="mo">Mở khóa</button></div>
      <p class="nc-bao" aria-live="polite"></p></section>`;
}
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-nc]");
  if (!b) return;
  const vung = b.closest(".gt-than");
  if (b.dataset.nc === "khoa") { ghiNC(KHOA_NC, null); giuViecHopLe(); ve(); if (vung) vung.innerHTML = trangNangCao(); return; }
  const o = vung && vung.querySelector("[data-nc-ma]"), bao = vung && vung.querySelector(".nc-bao");
  try {
    const h = await bamMa(o ? o.value : "");
    if ((window.LP_MA || []).includes(h)) { ghiNC(KHOA_NC, h); ve(); vung.innerHTML = trangNangCao(); }
    else if (bao) bao.textContent = "Mã không đúng hoặc đã bị thu hồi.";
  } catch (er) { if (bao) bao.textContent = er.message; }
});
