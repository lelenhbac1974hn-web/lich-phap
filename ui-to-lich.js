/* Lịch Pháp © 2026 Lê Lệnh Bắc. Bảo lưu mọi quyền. Bản chính thức, miễn phí: https://lelenhbac1974hn-web.github.io/lich-phap/ — cấm đưa lên chợ ứng dụng, bán hay phát hành lại khi chưa được phép (xem LICENSE). */
/* GIAO DIỆN — TỜ LỊCH: vẽ tờ lịch, lễ tết (nhấn giữ mở thiệp), hiệu ứng lật 4 hướng, vuốt, nghiêng 3D, cảnh động theo mùa.
   Giao diện chia nhiều tệp, nạp theo thứ tự trong index.html: ui-chung → ui-to-lich → ui-gio-thang → ui-sao → ui-nhac → ui-khoi-dong.
   Các tệp dùng chung tên khai báo ở mức ngoài cùng (hằng, hàm, trạng thái st); chỉ ui-khoi-dong.js gắn sự kiện chung và vẽ lần đầu. */
"use strict";

/* ── Tờ lịch bloc ── */
function veToLich(x) {
  const nghi = x.thu === 0 || x.le.some(l => l.nghi);
  const [cau, loai] = TUC_NGU[x.j % TUC_NGU.length];
  const T = window.ThiepLe;
  const leDs = x.le.slice();
  if (laNgayThanhMinh(x.j)) leDs.push({ ten: "Tiết Thanh minh — tảo mộ", loai: "tiet", nghi: false, khoa: "dac:thanhminh" });
  const khoaLe = leDs.map(l => l.khoa || (T ? T.khoaCuaLe(l, x.am, x.dd, x.mm) : null));
  const le = leDs.map((l, i) => khoaLe[i]
    ? `<button type="button" class="le le-${l.loai}${l.nghi ? " le-nghi" : ""} co-thiep" data-thiep="${khoaLe[i]}" title="Chạm để xem về ngày này"><i class="le-bieu" aria-hidden="true">${T.layThiep(khoaLe[i]).bieu}</i>${esc(l.ten)}</button>`
    : `<span class="le le-${l.loai}${l.nghi ? " le-nghi" : ""}">${ic("sao")}${esc(l.ten)}</span>`).join("");
  /* Mỗi lễ có thiệp: biểu tượng riêng của lễ đứng trước tên, chạm cả dòng để mở thiệp (anh Bắc 21/11/2026: bỏ vòng biểu tượng
     riêng ở góc tờ, một chỗ chạm duy nhất) */
  canhLe = T ? khoaLe.find(k => T.laLeLon(k)) || null : null;
  canhTrang = T ? khoaLe.some(k => k && (T.layThiep(k) || {}).trang) : false;
  /* Việc và ngày nhắc viết như dòng ghi tay mực xanh trên tờ lịch (anh Bắc chọn mẫu A, 20/11/2026): biểu tượng theo loại,
     tên, phần phụ nhạt; gạch chân chấm báo chạm được để sang thẻ Nhắc; việc quá hạn mực đỏ. Lễ tết là chữ vàng nâu, không gạch.
     Tờ hôm nay còn gom cả ngày nhắc sắp đến và việc quá hạn — thay cho dải báo riêng đầu trang. */
  const hom = jdHomNay(), laHom = x.j === hom, catTen = t => t.length > 24 ? t.slice(0, 23) + "…" : t;
  const nhanNhac = (n, phu) => `<button type="button" class="tl-ghi" data-tab="nhac" data-nhac-trang="lap" data-muc-id="${esc(n.id)}"><i class="ic">${chonBieu(n.ten, n.loai, n.bieu)}</i><b>${esc(catTen(n.ten))}</b>${phu ? `<em>· ${phu}</em>` : ""}</button>`;
  const nhanViec = (v, phu, qua) => `<button type="button" class="tl-ghi${qua ? " qua" : ""}" data-tab="nhac" data-nhac-trang="viec" data-muc-id="${esc(v.id)}"><i class="ic">${chonBieu(v.ten, "viec", v.bieu)}</i><b>${esc(catTen(v.ten))}</b>${phu ? `<em>· ${phu}</em>` : ""}</button>`;
  const nhacHom = viec.filter(v => !v.xong && v.jd != null && laHom && v.jd < hom).map(v => nhanViec(v, chuThuong(chuDem(v.jd - hom)), 1))
    .concat(viecCuaNgay(x.j).map(v => nhanViec(v, v.gio || "")))
    .concat(nhacCuaNgay(x.j).map(n => nhanNhac(n, chuThuong(soNam(n, x.j) || ""))))
    .concat(laHom ? sapToi().filter(o => o.j != null && o.con > 0 && o.con <= o.n.truoc).map(o => nhanNhac(o.n, chuThuong(chuDem(o.con)))) : [])
    /* nhắc tự động (rằm, mồng Một, tuổi xung): chạm thì mở chỗ bật tắt trong Menu */
    .concat(nhacTuDong(x.j).map(o => `<button type="button" class="tl-ghi" data-gioi-thieu="nhac-tu-dong"><i class="ic">${o.bieu}</i><b>${esc(o.ten)}</b>${o.phu ? `<em>· ${o.phu}</em>` : ""}</button>`))
    .join("");
  const lo = Array.from({ length: 9 }, () => "<i></i>").join("");
  const totXau = totXauChanTo(x);
  $("to-lich").innerHTML = `
    <article class="to-lich${nghi ? " nghi" : ""}">
      <div class="gay" aria-hidden="true">${lo}</div>
      <header class="tl-dau">
        <button class="lat" data-buoc="-1" type="button" aria-label="Ngày trước">‹</button>
        <div class="tl-thang"><span>Tháng</span><b>${hai(x.mm)}</b><span>${x.yy}</span></div>
        <button class="lat" data-buoc="1" type="button" aria-label="Ngày sau">›</button>
      </header>
      <div class="tl-than">
        <div class="tl-anh" aria-hidden="true"></div>
        <canvas class="canh" aria-hidden="true"></canvas>
        <div class="tl-so">${x.dd}</div>
        <div class="tl-thu">${THU[x.thu]}</div>
        ${nhacHom || le ? `<div class="tl-nhan">${nhacHom}${le}</div>` : ""}
        <blockquote class="tl-cau">
          <p>${esc(cau).replace(/\n/g, "<br>")}</p>
          <cite>${esc(loai)} Việt Nam</cite>
        </blockquote>
      </div>
      <footer class="tl-am">
        <div class="am-trai">
          ${svgTrang(x.am.day, 46)}
          <div>
            <div class="am-so">${x.am.day}</div>
            <div class="am-thang">Tháng ${THANG_AM[x.am.month - 1]}${x.am.leap ? " nhuận" : ""} <em title="${x.du ? "Tháng đủ (30 ngày)" : "Tháng thiếu (29 ngày)"}">${x.du ? "(đ)" : "(t)"}</em></div>
            ${window.ThoiTiet ? window.ThoiTiet.dong(x.j) : ""}
            ${totXau.f}
          </div>
        </div>
        ${totXau.e}
        <dl class="am-phai">
          ${jdCanChi(x.j) !== x.j ? `<div title="Từ 23 giờ đã sang giờ Tý của ngày mới"><dt>Từ 23 giờ${hinhChi(ccNgay(x.j + 1))}</dt><dd>${ccNgay(x.j + 1)}</dd></div>` : `<div><dt>Ngày${hinhChi(x.ccNgay)}</dt><dd>${x.ccNgay}</dd></div>`}
          <div><dt>Tháng${hinhChi(x.ccThang)}</dt><dd>${x.ccThang}</dd></div>
          <div><dt>Năm${hinhChi(x.ccNam)}</dt><dd>${x.ccNam}</dd></div>
          <div><dt>Tiết</dt><dd>${x.tiet}</dd></div>
        </dl>
        ${totXau.g}
      </footer>
      <div class="tl-bong" aria-hidden="true"></div>
      <button class="goc" data-buoc="1" type="button" aria-label="Xé tờ lịch, sang ngày sau" title="Xé tờ lịch"></button>
    </article>`;
  mua = MUA[Math.floor(((TIET_KHI.indexOf(x.tiet) + 3) % 24) / 6)];
  xepNhan();
}

/* Tốt xấu của việc đang chọn (theo kiểu luận đang chọn) đặt ngay ở chân tờ, vùng âm lịch; chạm để sang Luận giải.
   Ba kiểu, chọn trong menu Giao diện → Tờ lịch (anh Bắc chốt 19/11/2026):
     g (mặc định) — một hàng mỏng cuối vùng âm: việc · kết quả · lý do rút gọn;
     e — triện vuông giữa ngày âm và lưới can chi;  f — dòng kết quả + thang 5 bậc dưới tháng âm;
     goc — tờ lịch gốc: không có ở chân tờ, hiện dải tóm tắt riêng bên dưới.
   Vẽ cả ba, CSS chỉ hiện kiểu đang chọn (body[data-kieu-to]). */
function totXauChanTo(x) {
  const soBac = st.kieu === "sach" ? x.ls.bac : x.cd.bac, bac = BAC_UI[soBac], viec = VIEC.find(v => v.id === st.viec) || VIEC[0];
  const nhan = `aria-label="${esc(viec.ten)}: ${bac.t} — xem luận giải"`, thang = BAC_UI.map((b, i) => `<i${i <= soBac ? ` class="${bac.lop}"` : ""}></i>`).join("");
  return {
    e: `<button type="button" class="tl-trien ${bac.lop}" data-tab="luan" ${nhan}>${bac.t.split(" ").join("<br>")}</button>`,
    f: `<button type="button" class="tl-bac-f ${bac.lop}" data-tab="luan" ${nhan}><b>${bac.t}</b><span class="tl-thang5">${thang}</span><em>›</em></button>`,
    g: `<button type="button" class="tl-hang ${bac.lop}" data-tab="luan" ${nhan}><span>${esc(viec.ten)}</span><b>${bac.t}</b><em>${esc(lyDoNgan(x))}</em><i>›</i></button>`
  };
}

/* Ngày có nhiều nhắc / lễ: tờ lịch giữ nguyên cỡ, nhãn không được đè lên ca dao.
   Không đủ chỗ thì ẩn câu ca dao; vẫn chưa đủ thì giữ các nhãn đầu, phần còn lại gộp thành nút "+N" sang mục Nhắc. */
function xepNhan() {
  /* Tên tháng âm dài (Mười Một, nhuận…) không đủ chỗ trên một dòng thì rút "Tháng" thành "T." — chân tờ không nhảy, không tràn sang cột can chi */
  document.querySelectorAll("#to-lich .to-lich:not(.roi) .am-thang").forEach(t => {
    const c = t.firstChild;
    if (!c || c.nodeType !== 3) return;
    c.textContent = c.textContent.replace(/^T\. /, "Tháng ");
    if (t.scrollWidth > t.clientWidth + 1) c.textContent = c.textContent.replace(/^Tháng /, "T. ");
  });
  const than = document.querySelector("#to-lich .tl-than"), nhan = than && than.querySelector(".tl-nhan");
  if (!nhan) return;
  than.classList.remove("an-cau");
  const tran = () => than.scrollHeight > than.clientHeight + 1;
  if (!than.clientHeight || !tran()) return;
  than.classList.add("an-cau");
  const ds = [...nhan.children];
  let an = 0;
  while (tran() && an < ds.length - 1) {
    an++;
    ds[ds.length - an].hidden = true;
    let them = nhan.querySelector(".le-them");
    if (!them) {
      them = document.createElement("button");
      them.type = "button"; them.className = "tl-ghi le-them"; them.dataset.tab = "nhac";
      nhan.append(them);
    }
    them.textContent = `+${an} mục khác`;
  }
}
window.addEventListener("resize", () => requestAnimationFrame(xepNhan));
const laNgayThanhMinh = j => tietKhi(j) === "Thanh minh" && tietKhi(j - 1) !== "Thanh minh";

/* Chạm (hoặc nhấn giữ) một ngày lễ để mở thiệp mô tả */
function ganGiuLe() {
  let hen = 0, el = null, x0 = 0, y0 = 0, daMo = false;
  const huy = () => { clearTimeout(hen); if (el) el.classList.remove("dang-giu"); el = null; };
  document.addEventListener("pointerdown", e => {
    const b = e.target.closest("[data-thiep]");
    if (!b || !window.ThiepLe) return;
    huy(); daMo = false; el = b; x0 = e.clientX; y0 = e.clientY;
    b.classList.add("dang-giu");
    hen = setTimeout(() => {
      const t = ttNgay(st.jd);
      window.ThiepLe.mo(b.dataset.thiep, `${nhanNgay(st.jd, true)} · ${nhanAm(st.jd)}`);
      daMo = true; huy();
    }, 480);
  });
  document.addEventListener("pointermove", e => { if (el && Math.hypot(e.clientX - x0, e.clientY - y0) > 10) huy(); });
  ["pointerup", "pointercancel", "pointerleave"].forEach(ev => document.addEventListener(ev, huy));
  document.addEventListener("contextmenu", e => { if (e.target.closest("[data-thiep]")) e.preventDefault(); });
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-thiep]");
    if (!b) return;
    if (!daMo) { const t = ttNgay(st.jd); window.ThiepLe.mo(b.dataset.thiep, `${nhanNgay(st.jd, true)} · ${nhanAm(st.jd)}`); }
    daMo = false;
  });
}
/* TIET_KHI bắt đầu từ Xuân phân; lùi 3 tiết để Lập xuân mở mùa xuân */
const MUA = ["xuan", "ha", "thu", "dong"];

/* ═════════ HIỆU ỨNG TỜ LỊCH ═════════ */
const giamDong = window.matchMedia("(prefers-reduced-motion: reduce)");
let mua = "xuan";

/* Mép giấy rách răng cưa ngay dưới gáy lịch */
function mepRach() {
  const p = [];
  for (let i = 0; i <= 24; i++) p.push(`${(i / 24 * 100).toFixed(1)}% ${(27 + (i % 2 ? 0 : 4) + Math.random() * 2).toFixed(1)}px`);
  return `polygon(${p.join(",")},100% 100%,0% 100%)`;
}
/* Bốn kiểu lật tờ lịch theo hướng:
   xe    — vuốt sang trái / nút ›  : xé tờ hôm nay, tờ rơi xuống (sang ngày sau)
   len   — vuốt lên                : xé tờ hôm nay, tờ bay lên rồi mờ dần (sang ngày sau)
   gan   — vuốt sang phải / nút ‹  : tờ hôm trước bay từ bên trái về, hiện dần, đáp khít gáy (về ngày trước)
   xuong — vuốt xuống              : tờ hôm trước hạ từ trên xuống, hiện dần, đáp khít gáy (về ngày trước)
   Ba kiểu sau làm lại 1.38.0 theo kiểu xé (anh Bắc 24/11/2026): mép rách, chao nhẹ, mờ dần, chậm và mềm hơn. */
const LOP_HIEU_UNG = ["vao-gan", "vao-xuong", "ha"];
function donHieuUng() {
  document.querySelectorAll("#to-lich > .to-lich.roi").forEach(e => e.remove());
}
/* Gọi TRƯỚC khi vẽ lại: chụp tờ đang xem */
function chupToCu(kieu) {
  donHieuUng();
  if (giamDong.matches || !kieu) return null;
  const a = document.querySelector("#to-lich > .to-lich:not(.roi)");
  if (!a) return null;
  const c = a.cloneNode(true);
  c.classList.remove(...LOP_HIEU_UNG); // tránh tờ chụp lại mang hiệu ứng cũ (gây khựng)
  c.classList.add("roi", `roi-${kieu}`);
  if (kieu === "xe" || kieu === "len") {
    c.style.clipPath = mepRach();
    c.style.setProperty("--lech", `${(Math.random() * 16 - 8).toFixed(1)}deg`);
    c.style.setProperty("--troi", `${(Math.random() * 60 - 30).toFixed(0)}px`);
  }
  return c;
}
/* Gọi SAU khi vẽ lại */
function dienHieuUng(kieu, toCu) {
  const khung = $("to-lich");
  const moi = khung.querySelector(".to-lich:not(.roi)");
  if (toCu) {
    khung.appendChild(toCu);
    if (kieu === "xe" || kieu === "len") {
      toCu.addEventListener("animationend", ev => { if (ev.target === toCu) toCu.remove(); });
      setTimeout(() => toCu.remove(), 1400); // dự phòng nếu trình duyệt bỏ sự kiện
    }
  }
  if (moi && (kieu === "gan" || kieu === "xuong")) {
    /* Lùi ngày: cũng chỉ cho BẢN CHỤP chuyển động (như khi tiến ngày). Tờ thật nằm yên bên dưới,
       nên lớp cảnh động và chữ đổ bóng không phải vẽ lại trong lúc xoay 3D — hết nhấp nháy trên iPhone. */
    const vao = moi.cloneNode(true);
    vao.classList.remove(...LOP_HIEU_UNG);
    vao.classList.add("roi", `vao-${kieu}`);
    /* Tờ bay về cũng là tờ đã xé: mép rách dưới gáy, chao nhẹ theo một góc ngẫu nhiên */
    vao.style.clipPath = mepRach();
    vao.style.setProperty("--lech", `${(Math.random() * 10 - 5).toFixed(1)}deg`);
    vao.style.setProperty("--troi", `${(Math.random() * 40 - 20).toFixed(0)}px`);
    khung.appendChild(vao);
    const xong = () => { vao.remove(); if (toCu) toCu.remove(); };
    vao.addEventListener("animationend", ev => { if (ev.target === vao) xong(); });
    setTimeout(xong, 1400);
  }
}

/* Nghiêng 3D + vệt sáng theo con trỏ */
function ganNghieng() {
  const khung = $("to-lich");
  if (!window.matchMedia("(hover: hover)").matches) return;
  khung.addEventListener("pointermove", e => {
    if (giamDong.matches) return;
    const r = khung.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    khung.style.setProperty("--ry", `${((px - 0.5) * 9).toFixed(2)}deg`);
    khung.style.setProperty("--rx", `${((0.5 - py) * 7).toFixed(2)}deg`);
    khung.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
    khung.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
    khung.classList.add("dang-nghieng");
  });
  khung.addEventListener("pointerleave", () => {
    khung.classList.remove("dang-nghieng");
    khung.style.setProperty("--rx", "0deg");
    khung.style.setProperty("--ry", "0deg");
  });
}

/* Vuốt trên tờ lịch theo 4 hướng để lật ngày */
function ganVuot() {
  const khung = $("to-lich");
  let x0 = null, y0 = 0, t0 = 0;
  khung.addEventListener("touchstart", e => {
    if (e.touches.length !== 1) { x0 = null; return; }
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = Date.now();
  }, { passive: true });
  khung.addEventListener("touchmove", e => { if (x0 !== null) e.preventDefault(); }, { passive: false });
  khung.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    const ax = Math.abs(dx), ay = Math.abs(dy), nhanh = Date.now() - t0 < 600;
    const nguong = nhanh ? 36 : 60;
    if (ax > nguong && ax > ay * 1.2) den(st.jd + (dx < 0 ? 1 : -1), dx < 0 ? "xe" : "gan");
    else if (ay > nguong && ay > ax * 1.2) den(st.jd + (dy < 0 ? 1 : -1), dy < 0 ? "len" : "xuong");
  }, { passive: true });
}

/* Cảnh động trên tờ lịch — một canvas, tối đa hai lớp hạt chồng nhau (anh Bắc 21/11/2026):
     lớp lễ  — ngày lễ lớn: hạt của thiệp (hoa Tết, đèn lồng…); rằm, Nguyên tiêu, Trung thu thêm vầng trăng mờ;
     lớp trời — thời tiết thật hôm nay (mưa, mưa to, dông, sương, tuyết, nắng), không có thì cảnh theo mùa
                (hoa đào – đom đóm – lá thu – mưa phùn).
   Ba kiểu mưa phải nhìn khác nhau: mưa phùn hạt li ti lất phất · mưa vệt vừa · mưa to vệt dài, dày, bắn nước ở đáy ·
   dông: mưa to bị gió quật xiên, trời tối lại, chớp có tia. Bật tắt từng thứ ở Menu → Giao diện → Hiệu ứng.
   Tiết kiệm: vẽ 30 khung/giây; tờ lịch không hiện (thẻ khác, app ẩn) thì nghỉ, chỉ dò lại mỗi 0,4 giây. */
let canhLe = null, canhTrang = false;
const MAU_HAT = {
  xuan: ["#F2A7B5", "#F7C4CE", "#EE8FA3", "#F3D36B"],
  ha: ["#F2C94C", "#F7DD8A", "#E9B949"],
  thu: ["#C8762B", "#B5862A", "#A6451E", "#D9A441"],
  dong: ["#8A9BAB", "#A3B2BF"],
  mua: ["#6F8FAD", "#8AA3BB"], "mua-to": ["#4F7397", "#6A88A8"], set: ["#4A6A8C", "#6481A0"],
  tuyet: ["#FFFFFF", "#EEF3F8"], suong: ["#9AA5AE"], nang: ["#F6D58A"]
};
const SO_HAT = { xuan: 14, ha: 16, thu: 11, dong: 46, mua: 40, "mua-to": 80, set: 72, tuyet: 34, suong: 5, nang: 3, le: 10 };
/* Hình vệt mưa: dài r, nét, độ đậm */
const MUA_NET = { dong: [0.8, 0.3], mua: [1.2, 0.42], "mua-to": [1.7, 0.5], set: [1.7, 0.52] };
let tTruoc = 0, lanVe = 0, chop = 0, henChop = 0, tiaChop = null;
const lopHat = new Map(), bung = [];   // hạt của từng lớp (theo khoá cảnh), giọt bắn ở đáy tờ
const ngau = (a, b) => a + Math.random() * (b - a);
/* Hạt emoji của ngày lễ vẽ sẵn một lần ra ảnh nhỏ, mỗi khung chỉ dán ảnh (nhẹ hơn vẽ chữ) */
const anhEmoji = {};
function anhCua(e) {
  if (anhEmoji[e]) return anhEmoji[e];
  const o = document.createElement("canvas"); o.width = o.height = 64;
  const g = o.getContext("2d"); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = '48px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.fillText(e, 32, 34);
  return (anhEmoji[e] = o);
}
/* Danh sách lớp cần vẽ: [lớp lễ?, lớp trời?] */
function chonLop() {
  const hu = layHieuUng(), lop = [];
  if (hu.le && canhLe && window.ThiepLe) { const d = ThiepLe.layThiep(canhLe); if (d && d.hat) lop.push({ k: "le:" + canhLe, loai: "le", le: d }); }
  let troi = null;
  if (hu.troi && st.jd === jdHomNay() && window.ThoiTiet) {
    const t = ThoiTiet.hienTai();
    if (t) {
      const c = t.ma;
      troi = c >= 95 ? "set" : (c >= 63 && c <= 67) || c === 81 || c === 82 ? "mua-to" : (c >= 51 && c <= 61) || c === 80 ? "mua"
        : c === 45 || c === 48 ? "suong" : (c >= 71 && c <= 77) || c === 85 || c === 86 ? "tuyet" : c <= 1 && t.ngayDem ? "nang" : null;
    }
  }
  if (!troi && hu.mua) troi = mua;
  if (troi) lop.push({ k: troi, loai: troi });
  return lop;
}
function hatMoi(cn, w, h, dau, thua) {
  const m = cn.loai, bang = MAU_HAT[m] || MAU_HAT.xuan, mau = bang[Math.floor(Math.random() * bang.length)];
  const p = { x: ngau(-40, w + 40), y: dau ? ngau(0, h) : -24, goc: ngau(0, 6.28), pha: ngau(0, 6.28), mau };
  if (m === "xuan") Object.assign(p, { r: ngau(3.5, 6.5), vy: ngau(16, 30), vx: ngau(-8, 8), vg: ngau(-1.6, 1.6) });
  else if (m === "thu") Object.assign(p, { r: ngau(5, 9), vy: ngau(20, 36), vx: ngau(-12, 6), vg: ngau(-1.2, 1.2) });
  else if (m === "ha") Object.assign(p, { r: ngau(1.4, 2.8), vy: ngau(-9, -3), vx: ngau(-4, 4), vg: 0, y: dau ? ngau(0, h) : h + 8 });
  else if (m === "dong") Object.assign(p, { r: ngau(2.5, 5), vy: ngau(80, 130), vx: ngau(-20, -8), vg: 0 });            // mưa phùn: li ti, chậm
  else if (m === "mua") Object.assign(p, { r: ngau(13, 19), vy: ngau(380, 470), vx: -40, vg: 0 });
  else if (m === "mua-to") Object.assign(p, { r: ngau(26, 36), vy: ngau(660, 780), vx: -70, vg: 0 });
  else if (m === "set") Object.assign(p, { r: ngau(28, 40), vy: ngau(620, 740), vx: ngau(-230, -170), vg: 0 }); // gió quật xiên
  else if (m === "tuyet") Object.assign(p, { r: ngau(1.4, 3.2), vy: ngau(18, 34), vx: ngau(-6, 6), vg: 0 });
  else if (m === "suong") Object.assign(p, { r: ngau(70, 130), vy: 0, vx: ngau(5, 11) * (Math.random() < 0.5 ? -1 : 1), vg: 0, y: ngau(h * 0.15, h * 0.85), x: dau ? ngau(0, w) : (Math.random() < 0.5 ? -120 : w + 120) });
  else if (m === "nang") Object.assign(p, { r: ngau(26, 46), vy: 0, vx: 0, vg: 0, x: ngau(w * 0.05, w * 0.75), y: 0 });
  else if (m === "le") {
    const bay = cn.le.kieu === "bay";
    Object.assign(p, { e: cn.le.hat[Math.floor(Math.random() * cn.le.hat.length)], r: ngau(15, 22), vy: bay ? ngau(-26, -14) : ngau(18, 32), vx: ngau(-6, 6), vg: ngau(-0.5, 0.5), y: dau ? ngau(0, h) : (bay ? h + 14 : -14) });
  }
  return p;
}
function veHat(c, p, m, t, w, h, toi) {
  if (MUA_NET[m]) {
    const [net, dam] = MUA_NET[m], keo = p.vx / p.vy;   // vệt nghiêng theo hướng rơi
    c.globalAlpha = dam; c.strokeStyle = p.mau; c.lineWidth = net; c.lineCap = "round";
    c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - keo * p.r, p.y - p.r); c.stroke();
    return;
  }
  if (m === "ha") {
    const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * 1.7 + p.pha));
    const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
    g.addColorStop(0, p.mau); g.addColorStop(1, "rgba(242,201,76,0)");
    c.globalAlpha = a; c.fillStyle = g;
    c.beginPath(); c.arc(p.x, p.y, p.r * 4, 0, 6.2832); c.fill();
    return;
  }
  if (m === "tuyet") {
    c.globalAlpha = toi ? 0.75 : 0.9; c.fillStyle = toi ? p.mau : "#B9C6D2";
    c.beginPath(); c.arc(p.x + Math.sin(t + p.pha) * 4, p.y, p.r, 0, 6.2832); c.fill();
    return;
  }
  if (m === "suong") {
    const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    g.addColorStop(0, toi ? "rgba(210,215,220,.16)" : "rgba(140,150,160,.16)"); g.addColorStop(1, "rgba(140,150,160,0)");
    c.globalAlpha = 1; c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.2832); c.fill();
    return;
  }
  if (m === "nang") {
    /* Vệt nắng xiên từ mép trên, sáng tối chậm */
    const a = 0.06 + 0.06 * (0.5 + 0.5 * Math.sin(t * 0.5 + p.pha));
    const g = c.createLinearGradient(p.x, 0, p.x + h * 0.35, h);
    g.addColorStop(0, "rgba(246,213,138,.9)"); g.addColorStop(1, "rgba(246,213,138,0)");
    c.globalAlpha = a; c.fillStyle = g;
    c.beginPath(); c.moveTo(p.x, 0); c.lineTo(p.x + p.r, 0); c.lineTo(p.x + p.r + h * 0.35, h); c.lineTo(p.x + h * 0.35, h); c.closePath(); c.fill();
    return;
  }
  if (m === "le") {
    c.save(); c.globalAlpha = 0.6; c.translate(p.x, p.y); c.rotate(p.goc * 0.4);
    c.drawImage(anhCua(p.e), -p.r / 2, -p.r / 2, p.r, p.r); c.restore();
    return;
  }
  c.save();
  c.translate(p.x, p.y); c.rotate(p.goc);
  c.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(t * 1.3 + p.pha))); // lật mặt khi rơi
  c.globalAlpha = m === "xuan" ? 0.7 : 0.62; c.fillStyle = p.mau;
  c.beginPath();
  if (m === "xuan") {
    c.moveTo(0, -p.r); c.bezierCurveTo(p.r, -p.r * 0.6, p.r * 0.7, p.r * 0.8, 0, p.r);
    c.bezierCurveTo(-p.r * 0.7, p.r * 0.8, -p.r, -p.r * 0.6, 0, -p.r);
  } else {
    c.moveTo(0, -p.r * 1.3); c.quadraticCurveTo(p.r, 0, 0, p.r * 1.3); c.quadraticCurveTo(-p.r, 0, 0, -p.r * 1.3);
  }
  c.fill();
  c.restore();
}
/* Vầng trăng mờ ở góc trên trái (rằm, Nguyên tiêu, Trung thu) */
function veVangTrang(c, w, t, toi) {
  const x = 34, y = 28, r = 12, a = 0.55 + 0.1 * Math.sin(t * 0.6);   // góc trên trái, tránh số ngày lớn
  const g = c.createRadialGradient(x, y, r * 0.6, x, y, r * 3.2);
  g.addColorStop(0, toi ? "rgba(255,226,150,.35)" : "rgba(240,200,110,.28)"); g.addColorStop(1, "rgba(240,200,110,0)");
  c.globalAlpha = 1; c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 3.2, 0, 6.2832); c.fill();
  c.globalAlpha = a; c.fillStyle = toi ? "#F6DFA0" : "#F1D48C"; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
}
/* Tia chớp: đường gấp khúc từ mép trên xuống, có nhánh, hiện trong chớp mắt */
function taoTiaChop(w, h) {
  const diem = [[ngau(w * 0.2, w * 0.8), 0]];
  while (diem[diem.length - 1][1] < h * 0.55) { const [x, y] = diem[diem.length - 1]; diem.push([x + ngau(-22, 22), y + ngau(14, 30)]); }
  const goc = diem[Math.floor(diem.length * 0.4)], nhanh = [goc];
  for (let i = 0; i < 4; i++) { const [x, y] = nhanh[nhanh.length - 1]; nhanh.push([x + ngau(6, 20), y + ngau(10, 22)]); }
  return [diem, nhanh];
}
function nghiCanh() { tTruoc = 0; setTimeout(() => requestAnimationFrame(khungHinh), 400); }
function khungHinh(ms) {
  const cv = document.querySelector("#to-lich > .to-lich:not(.roi) .canh");
  if (!cv || document.hidden || !cv.clientWidth) return nghiCanh();
  requestAnimationFrame(khungHinh);
  if (ms - lanVe < 31) return;   // 30 khung/giây là đủ cho hạt rơi, tốn nửa so với 60
  lanVe = ms;
  const w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  const c = cv.getContext("2d");
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, h);
  if (giamDong.matches) return;
  const lop = chonLop(), hu = layHieuUng(), toi = document.documentElement.hasAttribute("data-toi");
  const t = ms / 1000, dt = tTruoc ? Math.min(0.05, (ms - tTruoc) / 1000) : 0;
  tTruoc = ms;
  const troi = (lop.find(l => l.loai !== "le") || {}).loai;
  /* Mưa to, dông: trời tối lại một chút */
  if (troi === "mua-to" || troi === "set") { c.globalAlpha = 1; c.fillStyle = toi ? "rgba(0,0,0,.16)" : (troi === "set" ? "rgba(52,62,78,.13)" : "rgba(60,72,86,.08)"); c.fillRect(0, 0, w, h); }
  if (hu.le && canhTrang) veVangTrang(c, w, t, toi);
  const dung = new Set(lop.map(l => l.k));
  for (const k of [...lopHat.keys()]) if (!dung.has(k)) lopHat.delete(k);
  for (const cn of lop) {
    const m = cn.loai, ghep = lop.length > 1;
    if (!lopHat.has(cn.k)) {
      const n = Math.round((SO_HAT[m] || 12) * (ghep && m === "le" ? 0.7 : ghep && /^(xuan|ha|thu)$/.test(m) ? 0.6 : 1));
      lopHat.set(cn.k, Array.from({ length: n }, () => hatMoi(cn, w, h, true)));
    }
    const hat = lopHat.get(cn.k);
    for (let i = 0; i < hat.length; i++) {
      const p = hat[i];
      const lac = MUA_NET[m] && m !== "dong" || m === "suong" || m === "nang" ? 0 : Math.sin(t * 0.9 + p.pha) * (m === "ha" ? 6 : m === "tuyet" || m === "dong" ? 5 : 16);
      p.x += (p.vx + lac) * dt; p.y += p.vy * dt; p.goc += p.vg * dt;
      if ((m === "mua-to" || m === "set") && p.y > h - 6 && bung.length < 40) bung.push({ x: p.x, y: h - ngau(2, 18), t: 0 });
      if (p.y > h + 20 || p.y < -44 || p.x < -260 || p.x > w + 260) hat[i] = hatMoi(cn, w, h, false);
      veHat(c, p, m, t, w, h, toi);
    }
  }
  /* Giọt bắn ở đáy tờ khi mưa to: vòng nhỏ loang ra rồi tắt */
  for (let i = bung.length - 1; i >= 0; i--) {
    const b = bung[i]; b.t += dt;
    if (b.t > 0.35 || (troi !== "mua-to" && troi !== "set")) { bung.splice(i, 1); continue; }
    c.globalAlpha = 0.35 * (1 - b.t / 0.35); c.strokeStyle = MAU_HAT["mua-to"][0]; c.lineWidth = 1;
    c.beginPath(); c.ellipse(b.x, b.y, 2 + b.t * 22, 0.8 + b.t * 5, 0, 0, 6.2832); c.stroke();
  }
  /* Dông: chớp sáng nhanh kèm tia chớp, cách nhau 4–8 giây */
  if (troi === "set") {
    if (!henChop) henChop = t + ngau(2, 4);
    if (t > henChop) { chop = 1; tiaChop = taoTiaChop(w, h); henChop = t + ngau(4, 8); }
    if (chop > 0) {
      c.globalAlpha = chop * 0.3; c.fillStyle = "#FFFFFF"; c.fillRect(0, 0, w, h);
      if (tiaChop && chop > 0.45) {
        c.globalAlpha = chop; c.strokeStyle = toi ? "#FFF6D8" : "#F4E6B0"; c.lineWidth = 1.8; c.lineJoin = "round";
        for (const duong of tiaChop) { c.beginPath(); duong.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); }
      }
      chop = Math.max(0, chop - dt * 3.2);
    }
  } else henChop = 0;
  c.globalAlpha = 1;
}

