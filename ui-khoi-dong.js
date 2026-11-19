/* Lịch Pháp © 2026 Lê Lệnh Bắc. Bảo lưu mọi quyền. Bản chính thức, miễn phí: https://lelenhbac1974hn-web.github.io/lich-phap/ — cấm đưa lên chợ ứng dụng, bán hay phát hành lại khi chưa được phép (xem LICENSE). */
/* GIAO DIỆN — VẼ LẠI VÀ KHỞI ĐỘNG: đếm trên nút Nhắc, dải việc, hàm ve()/den(), sự kiện chung, vẽ lần đầu.
   Giao diện chia nhiều tệp, nạp theo thứ tự trong index.html: ui-chung → ui-to-lich → ui-gio-thang → ui-sao → ui-nhac → ui-khoi-dong.
   Các tệp dùng chung tên khai báo ở mức ngoài cùng (hằng, hàm, trạng thái st); chỉ ui-khoi-dong.js gắn sự kiện chung và vẽ lần đầu. */
"use strict";

/* Số trên nút Nhắc ở thanh menu đáy = việc hôm nay/quá hạn + ngày lặp lại sắp đến */
function capNhatDemTab() {
  const n = (+$("dem-viec").textContent || 0) * !$("dem-viec").hidden + (+$("dem-lap").textContent || 0) * !$("dem-lap").hidden;
  const el = $("dem-nhac-tab");
  el.hidden = !n; el.textContent = n;
}

function veDaiViec() {
  giuViecHopLe();
  $("dai-viec").innerHTML = viecHien().map(v =>
    `<button type="button" class="viec${v.id === st.viec ? " chon" : ""}" data-viec="${v.id}">${esc(v.ten)}</button>`).join("");
}

function ve() {
  const x = thongTin(st.jd, st.viec);
  veDaiViec();
  veToLich(x);
  veTomTat(x);
  vePhanDinh(x);
  veMatGio(x);
  veLichThang(x);
  veNgocHap(x);
  veNhac();
  veViec();
  capNhatDemTab();
  $("o-ngay").value = `${x.yy}-${hai(x.mm)}-${hai(x.dd)}`;
  $("ngay-viet").innerHTML = `${hai(x.dd)}/${hai(x.mm)}/${x.yy} <small>${x.am.day}/${x.am.month}${x.am.leap ? "n" : ""} âm</small>`;
  document.title = `${hai(x.dd)}/${hai(x.mm)}/${x.yy} · ${x.am.day}/${x.am.month} âm · Lịch Pháp`;
}

const JD_MIN = jdFromDate(1, 1, 1900), JD_MAX = jdFromDate(31, 12, 2199);
function den(j, kieu) {
  const cu = st.jd;
  st.jd = Math.min(JD_MAX, Math.max(JD_MIN, j));
  if (st.jd !== cu) st.gioChon = null;
  const huong = Math.sign(st.jd - cu);
  if (!huong) kieu = null;
  else if (!kieu) kieu = huong > 0 ? "xe" : "gan";
  const toCu = chupToCu(kieu);
  ve();
  dienHieuUng(kieu, toCu);
}
function doiThang(buoc) {
  let [dd, mm, yy] = jdToDate(st.jd);
  mm += buoc;
  if (mm < 1) { mm = 12; yy--; } else if (mm > 12) { mm = 1; yy++; }
  const dai = jdFromDate(1, mm === 12 ? 1 : mm + 1, mm === 12 ? yy + 1 : yy) - jdFromDate(1, mm, yy);
  den(jdFromDate(Math.min(dd, dai), mm, yy));
}

/* ── Sự kiện ── */
document.addEventListener("click", e => {
  const k = e.target.closest("[data-kieu]");
  if (k) {
    st.kieu = k.dataset.kieu === "sao" ? "sao" : "sach";
    try { localStorage.setItem("lichphap:kieu-luan", st.kieu); } catch (er) { /* trình duyệt chặn lưu: chỉ giữ trong phiên */ }
    ve();
    return;
  }
  const b = e.target.closest("[data-buoc],[data-jd],[data-thang],[data-viec],[data-tab],[data-gio]");
  if (!b) return;
  if (b.dataset.gio) { st.gioChon = Number(b.dataset.gio); veMatGio(thongTin(st.jd, st.viec)); }
  else if (b.dataset.tab) {
    doiTab(b.dataset.tab);
    if (b.dataset.nhacTrang) {
      const nut = document.querySelector(`#nhac [role="tab"][data-nhac-trang="${b.dataset.nhacTrang}"]`);
      if (nut) nut.click();
      if (!window.matchMedia("(max-width:760px)").matches) $("nhac").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  else if (b.dataset.buoc) den(st.jd + Number(b.dataset.buoc));
  else if (b.dataset.jd) { den(Number(b.dataset.jd)); doiTab("ngay"); }
  else if (b.dataset.thang) doiThang(Number(b.dataset.thang));
  else if (b.dataset.viec) { st.viec = b.dataset.viec; ve(); }
});
$("nut-hom-nay").addEventListener("click", () => den(jdLich()));
$("nut-hom-nay-logo").addEventListener("click", e => { e.preventDefault(); moGioiThieu(); });
/* Máy tính: bấm vào đâu trên ô cũng mở bảng chọn ngày (điện thoại tự mở khi chạm) */
$("o-ngay").addEventListener("click", e => { try { e.target.showPicker(); } catch (er) { /* trình duyệt cũ: để mặc định */ } });
$("o-ngay").addEventListener("change", e => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e.target.value);
  if (m) den(jdFromDate(+m[3], +m[2], +m[1]));
});
document.addEventListener("keydown", e => {
  if (e.target.matches("input,select,textarea")) return;
  if (e.key === "ArrowLeft") den(st.jd - 1, "gan");
  else if (e.key === "ArrowRight") den(st.jd + 1, "xe");
  else if (e.key === "ArrowUp" && document.body.dataset.tab === "ngay") { e.preventDefault(); den(st.jd + 1, "len"); }
  else if (e.key === "ArrowDown" && document.body.dataset.tab === "ngay") { e.preventDefault(); den(st.jd - 1, "xuong"); }
});

veChonBieu("n-bieu"); veChonBieu("v-bieu");
ganNhac();
ganViec();
ganGiuLe();
ganTab();
ganChieuCao();
ve();
/* Kim đồng hồ chạy theo giờ thật khi đang xem hôm nay; qua 0 giờ tự lật sang ngày mới.
   Qua 23 giờ (sang giờ Tý) chỉ vẽ lại phần can chi, ngày dương giữ nguyên */
let homTruoc = jdLich(), tyTruoc = sauGioTy();
setInterval(() => {
  const hom = jdLich(), ty = sauGioTy();
  if (hom !== homTruoc) { const dangXemHom = st.jd === homTruoc; homTruoc = hom; tyTruoc = ty; if (dangXemHom && !document.hidden) { den(hom); return; } }
  if (ty !== tyTruoc && !document.hidden) { tyTruoc = ty; if (st.jd === hom) { st.gioChon = null; ve(); return; } }
  if (document.hidden || st.jd !== hom) return;
  veMatGio(thongTin(st.jd, st.viec));
}, 30000);
ganNghieng();
ganVuot();
hienHuongDanLanDau();
requestAnimationFrame(khungHinh);

