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

/* Dải chọn việc (anh Bắc 24/11/2026): chữ có biểu tượng ở đầu, việc đang chọn sáng lên + gạch dưới, không viên tròn.
   Thứ tự và tên gọn chỉ cho dải này; tên đầy đủ (VIEC.ten) vẫn dùng ở Luận giải, Tìm ngày. */
const DAI_VIEC = { chung: ["Việc chung", "lich"], khaitruong: ["Khai trương", "cuaHang"], kyket: ["Ký hợp đồng", "hopDong"],
  dongtho: ["Động thổ", "xeng"], xuathanh: ["Xuất hành", "vali"], cuoihoi: ["Cưới hỏi", "nhan"], nhaptrach: ["Nhập trạch", "nha"] };
const THU_TU_VIEC = Object.keys(DAI_VIEC);
function veDaiViec() {
  giuViecHopLe();
  const dai = $("dai-viec");
  dai.innerHTML = viecHien().slice().sort((a, b) => THU_TU_VIEC.indexOf(a.id) - THU_TU_VIEC.indexOf(b.id)).map(v => {
    const [ten, bt] = DAI_VIEC[v.id] || [v.ten, "lich"], chon = v.id === st.viec;
    return `<button type="button" class="viec${chon ? " chon" : ""}" data-viec="${v.id}" aria-pressed="${chon}" title="${esc(v.ten)}">${ic(bt)}<span data-t="${esc(ten)}">${esc(ten)}</span></button>`;
  }).join("");
  /* Việc đang chọn nằm ngoài khung nhìn thì gạt dải cho thấy; đang thấy thì để yên (không nhảy) */
  const c = dai.querySelector(".viec.chon");
  if (c && dai.scrollWidth > dai.clientWidth) {
    const t = c.offsetLeft - dai.offsetLeft, p = t + c.offsetWidth;
    if (t < dai.scrollLeft) dai.scrollLeft = Math.max(0, t - 16);
    else if (p > dai.scrollLeft + dai.clientWidth) dai.scrollLeft = p - dai.clientWidth + 16;
  }
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
  /* Tìm ngày: tính khi đang mở thẻ đó (điện thoại) hoặc trên màn rộng (mọi mục cùng hiện) */
  if (document.body.dataset.tab === "tim" || window.matchMedia("(min-width:761px)").matches) veTimNgay();
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
  if (!huong || kieu === false) kieu = null; // false: đổi ngày không lật tờ (đổi tháng ở lịch tháng)
  else if (!kieu) kieu = huong > 0 ? "xe" : "gan";
  const toCu = chupToCu(kieu);
  ve();
  dienHieuUng(kieu, toCu);
}
/* Sang tờ lịch của ngày đang chọn — không xé tờ (đây là nhảy tới, không phải lật từng ngày); tờ hiện ra nhẹ như khi đổi thẻ */
function moToLich() {
  if (window.matchMedia("(max-width:760px)").matches) doiTab("ngay");
  else $("to-lich").scrollIntoView({ behavior: giamDong.matches ? "auto" : "smooth", block: "start" });
}
function doiThang(buoc) {
  let [dd, mm, yy] = jdToDate(st.jd);
  mm += buoc;
  if (mm < 1) { mm = 12; yy--; } else if (mm > 12) { mm = 1; yy++; }
  const dai = jdFromDate(1, mm === 12 ? 1 : mm + 1, mm === 12 ? yy + 1 : yy) - jdFromDate(1, mm, yy);
  den(jdFromDate(Math.min(dd, dai), mm, yy), false);
  /* Lưới ngày trượt vào theo hướng đổi tháng (sang tháng sau: từ phải; về tháng trước: từ trái) */
  const luoi = document.querySelector("#lich-thang .luoi:not(.dau-thu)");
  if (luoi && !giamDong.matches) luoi.animate([{ transform: `translateX(${buoc > 0 ? 28 : -28}px)`, opacity: 0.2 }, { transform: "none", opacity: 1 }], { duration: 260, easing: "cubic-bezier(.22,1,.36,1)" });
}
/* Vuốt ngang trên lịch tháng để đổi tháng, giống vuốt tờ lịch: vuốt sang trái = tháng sau, sang phải = tháng trước.
   Vuốt dọc vẫn để cuộn trang; ngay sau một lần vuốt thì bỏ cú chạm vào ô ngày (tránh nhảy sang tờ lịch ngoài ý). */
function ganVuotThang() {
  const vung = $("lich-thang");
  let x0 = null, y0 = 0, t0 = 0, vuaVuot = 0;
  vung.addEventListener("touchstart", e => {
    if (e.touches.length !== 1) { x0 = null; return; }
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = Date.now();
  }, { passive: true });
  vung.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    const ax = Math.abs(dx), ay = Math.abs(dy), nguong = Date.now() - t0 < 600 ? 36 : 60;
    if (ax > nguong && ax > ay * 1.2) { vuaVuot = Date.now(); doiThang(dx < 0 ? 1 : -1); }
  }, { passive: true });
  vung.addEventListener("click", e => { if (Date.now() - vuaVuot < 450) { e.stopPropagation(); e.preventDefault(); } }, true);
}

/* ── Sự kiện ── */
document.addEventListener("keydown", e => { const d = e.target.closest && e.target.closest(".tn-dong"); if (d && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); d.click(); } });
/* Luận giải có hai trang: Luận ngày · Giờ và xuất hành */
function doiLuan(t) {
  document.body.dataset.trangLuan = t === "gio" ? "gio" : "ngay";
  document.querySelectorAll("#luan-tab [data-luan]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.luan === document.body.dataset.trangLuan)));
  $("khung").scrollTop = 0;
}
doiLuan("ngay");
document.addEventListener("click", e => {
  const lt = e.target.closest("[data-luan]");
  if (lt) { doiLuan(lt.dataset.luan); return; }
  const tk = e.target.closest("[data-tim-khoang],[data-tim-muc]");
  if (tk) { if (tk.dataset.timKhoang) st.timKhoang = +tk.dataset.timKhoang; if (tk.dataset.timMuc) st.timMuc = +tk.dataset.timMuc; veTimNgay(); return; }
  const dt = e.target.closest("[data-tim-chon]");
  if (dt && !e.target.closest("[data-jd]")) {
    st.timChon = +dt.dataset.timChon;
    document.querySelectorAll(".tn-dong.sang").forEach(d => d.classList.remove("sang"));
    dt.classList.add("sang");
    return;
  }
  const k = e.target.closest("[data-kieu]");
  if (k) {
    st.kieu = k.dataset.kieu === "sao" ? "sao" : "sach";
    try { localStorage.setItem("lichphap:kieu-luan", st.kieu); } catch (er) { /* trình duyệt chặn lưu: chỉ giữ trong phiên */ }
    ve();
    return;
  }
  const b = e.target.closest("[data-buoc],[data-jd],[data-thang],[data-viec],[data-tab],[data-gio],[data-mo-to]");
  if (!b) return;
  /* Lịch tháng: chạm ô chỉ chọn ngày (tóm tắt hiện dưới lưới); chạm lần nữa vào ô đang chọn hoặc nút "Mở tờ lịch" mới sang tờ lịch */
  if (b.dataset.moTo !== undefined) { moToLich(); return; }
  if (b.dataset.jd && b.closest("#lich-thang")) {
    const j = Math.min(JD_MAX, Math.max(JD_MIN, Number(b.dataset.jd)));
    if (j === st.jd) moToLich();
    else {
      st.jd = j; st.gioChon = null; ve();
      /* Chữ to: tóm tắt có thể nằm dưới mép màn hình — cuộn vừa đủ cho thấy, đang thấy thì đứng yên */
      const p = document.querySelector("#lich-thang .ngay-chon");
      if (p && window.matchMedia("(max-width:760px)").matches) p.scrollIntoView({ block: "nearest", behavior: giamDong.matches ? "auto" : "smooth" });
    }
    return;
  }
  if (b.dataset.gio) { st.gioChon = Number(b.dataset.gio); veMatGio(thongTin(st.jd, st.viec)); }
  else if (b.dataset.tab) {
    doiTab(b.dataset.tab);
    if (b.dataset.nhacTrang) {
      const nut = document.querySelector(`#nhac [role="tab"][data-nhac-trang="${b.dataset.nhacTrang}"]`);
      if (nut) nut.click();
      if (!window.matchMedia("(max-width:760px)").matches) $("nhac").scrollIntoView({ behavior: "smooth", block: "start" });
      /* Dòng ghi trên tờ lịch mang mã mục: làm sáng đúng mục đó và cuộn tới nó (không giữ chỗ cuộn của lần trước) */
      if (b.dataset.mucId) chiToiMuc(b.dataset.nhacTrang, b.dataset.mucId);
    }
  }
  else if (b.dataset.buoc) den(st.jd + Number(b.dataset.buoc));
  else if (b.dataset.jd) { den(Number(b.dataset.jd)); doiTab("ngay"); }
  else if (b.dataset.thang) doiThang(Number(b.dataset.thang));
  else if (b.dataset.viec) { st.viec = b.dataset.viec; ve(); }
});
$("nut-hom-nay").addEventListener("click", () => den(jdLich()));
$("nut-hom-nay").insertAdjacentHTML("afterbegin", ic("homNay"));
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
  capNhatBuoi();
  const hom = jdLich(), ty = sauGioTy();
  if (hom !== homTruoc) { const dangXemHom = st.jd === homTruoc; homTruoc = hom; tyTruoc = ty; if (dangXemHom && !document.hidden) { den(hom); return; } }
  if (ty !== tyTruoc && !document.hidden) { tyTruoc = ty; if (st.jd === hom) { st.gioChon = null; ve(); return; } }
  if (document.hidden || st.jd !== hom) return;
  veMatGio(thongTin(st.jd, st.viec));
}, 30000);
ganNghieng();
ganVuot();
ganVuotThang();
hienHuongDanLanDau();
requestAnimationFrame(khungHinh);


/* Tải sẵn bài viết về sao khi máy rảnh, để lần đầu mở thẻ sao đã có bài đầy đủ */
setTimeout(() => { if (typeof taiBaiSao === "function") taiBaiSao(); }, 4000);
