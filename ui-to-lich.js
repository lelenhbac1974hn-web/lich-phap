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
    ? `<button type="button" class="le le-${l.loai}${l.nghi ? " le-nghi" : ""} co-thiep" data-thiep="${khoaLe[i]}" title="Nhấn giữ để xem">${esc(l.ten)}<i aria-hidden="true">✦</i></button>`
    : `<span class="le le-${l.loai}${l.nghi ? " le-nghi" : ""}">${esc(l.ten)}</span>`).join("");
  const khoaLon = khoaLe.find(k => T && T.laLeLon(k));
  const ruy = khoaLon ? `<button type="button" class="tl-ruy" data-thiep="${khoaLon}" aria-label="Nhấn giữ để xem về ngày lễ">${T.layThiep(khoaLon).bieu}</button>` : "";
  const nhacHom = nhacCuaNgay(x.j).map(n => {
    const dn = soNam(n, x.j);
    return `<span class="le le-nhac l-${n.loai}">${esc(n.ten)}${dn ? ` · ${dn}` : ""}</span>`;
  }).join("");
  const vh = viecCuaNgay(x.j);
  const chipViec = vh.length ? `<button type="button" class="le le-viec" data-tab="nhac" data-nhac-trang="viec">✓ ${vh.length} việc${vh.length === 1 ? `: ${esc(vh[0].ten.length > 22 ? vh[0].ten.slice(0, 21) + "…" : vh[0].ten)}` : ""}</button>` : "";
  const lo = Array.from({ length: 9 }, () => "<i></i>").join("");
  $("to-lich").innerHTML = `
    <article class="to-lich${nghi ? " nghi" : ""}">
      <div class="gay" aria-hidden="true">${lo}</div>
      <header class="tl-dau">
        <button class="lat" data-buoc="-1" type="button" aria-label="Ngày trước">‹</button>
        <div class="tl-thang"><span>Tháng</span><b>${hai(x.mm)}</b><span>${x.yy}</span></div>
        <button class="lat" data-buoc="1" type="button" aria-label="Ngày sau">›</button>
      </header>
      <div class="tl-than">
        <canvas class="canh" aria-hidden="true"></canvas>
        ${ruy}
        <div class="tl-so">${x.dd}</div>
        <div class="tl-thu">${THU[x.thu]}</div>
        ${chipViec || nhacHom || le ? `<div class="tl-nhan">${chipViec}${nhacHom}${le}</div>` : ""}
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
            <div class="am-thang">Tháng ${THANG_AM[x.am.month - 1]}${x.am.leap ? " nhuận" : ""} <em>${x.du ? "đủ" : "thiếu"}</em></div>
          </div>
        </div>
        <dl class="am-phai">
          <div><dt>Ngày</dt><dd>${x.ccNgay}</dd></div>
          <div><dt>Tháng</dt><dd>${x.ccThang}</dd></div>
          <div><dt>Năm</dt><dd>${x.ccNam}</dd></div>
          <div><dt>Tiết</dt><dd>${x.tiet}</dd></div>
        </dl>
      </footer>
      <div class="tl-bong" aria-hidden="true"></div>
      <button class="goc" data-buoc="1" type="button" aria-label="Xé tờ lịch, sang ngày sau" title="Xé tờ lịch"></button>
    </article>`;
  mua = MUA[Math.floor(((TIET_KHI.indexOf(x.tiet) + 3) % 24) / 6)];
  xepNhan();
}

/* Ngày có nhiều nhắc / lễ: tờ lịch giữ nguyên cỡ, nhãn không được đè lên ca dao.
   Không đủ chỗ thì ẩn câu ca dao; vẫn chưa đủ thì giữ các nhãn đầu, phần còn lại gộp thành nút "+N" sang mục Nhắc. */
function xepNhan() {
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
      them.type = "button"; them.className = "le le-them"; them.dataset.tab = "nhac";
      nhan.append(them);
    }
    them.textContent = `+${an} mục khác`;
  }
}
window.addEventListener("resize", () => requestAnimationFrame(xepNhan));
const laNgayThanhMinh = j => tietKhi(j) === "Thanh minh" && tietKhi(j - 1) !== "Thanh minh";

/* Nhấn giữ một ngày lễ để mở thiệp mô tả */
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
      window.ThiepLe.mo(b.dataset.thiep, `${THU[thuCuaJd(st.jd)]} ${hai(t.dd)}/${hai(t.mm)}/${t.yy} · ${t.am.day}/${t.am.month}${t.am.leap ? " nhuận" : ""} âm lịch`);
      daMo = true; huy();
    }, 480);
  });
  document.addEventListener("pointermove", e => { if (el && Math.hypot(e.clientX - x0, e.clientY - y0) > 10) huy(); });
  ["pointerup", "pointercancel", "pointerleave"].forEach(ev => document.addEventListener(ev, huy));
  document.addEventListener("contextmenu", e => { if (e.target.closest("[data-thiep]")) e.preventDefault(); });
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-thiep]");
    if (!b) return;
    if (!daMo) baoTam("Nhấn giữ để xem về ngày này");
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
   len   — vuốt lên                : lật tờ hôm nay vòng qua gáy lên trên (sang ngày sau)
   gan   — vuốt sang phải / nút ‹  : tờ hôm trước trượt từ trái vào, dán đè lên (về ngày trước)
   xuong — vuốt xuống              : tờ hôm trước lật từ trên gáy úp xuống (về ngày trước) */
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
  if (kieu === "xe") {
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

/* Cảnh động theo mùa (tính từ tiết khí): hoa đào – đom đóm – lá thu – mưa phùn */
const MAU_HAT = {
  xuan: ["#F2A7B5", "#F7C4CE", "#EE8FA3", "#F3D36B"],
  ha: ["#F2C94C", "#F7DD8A", "#E9B949"],
  thu: ["#C8762B", "#B5862A", "#A6451E", "#D9A441"],
  dong: ["#7F93A6", "#9FB0BF"]
};
let hat = [], muaHat = null, tTruoc = 0;
const ngau = (a, b) => a + Math.random() * (b - a);
function hatMoi(m, w, h, dau) {
  const mau = MAU_HAT[m][Math.floor(Math.random() * MAU_HAT[m].length)];
  const p = { x: ngau(0, w), y: dau ? ngau(0, h) : -12, goc: ngau(0, 6.28), pha: ngau(0, 6.28), mau };
  if (m === "xuan") Object.assign(p, { r: ngau(3.5, 6.5), vy: ngau(16, 30), vx: ngau(-8, 8), vg: ngau(-1.6, 1.6) });
  else if (m === "thu") Object.assign(p, { r: ngau(5, 9), vy: ngau(20, 36), vx: ngau(-12, 6), vg: ngau(-1.2, 1.2) });
  else if (m === "ha") Object.assign(p, { r: ngau(1.4, 2.8), vy: ngau(-9, -3), vx: ngau(-4, 4), vg: 0, y: dau ? ngau(0, h) : h + 8 });
  else Object.assign(p, { r: ngau(9, 16), vy: ngau(190, 260), vx: -34, vg: 0 });
  return p;
}
function veHat(c, p, m, t) {
  if (m === "dong") {
    c.globalAlpha = 0.34; c.strokeStyle = p.mau; c.lineWidth = 1; c.lineCap = "round";
    c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.r * 0.18, p.y + p.r); c.stroke();
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
function khungHinh(ms) {
  requestAnimationFrame(khungHinh);
  const cv = document.querySelector("#to-lich > .to-lich:not(.roi) .canh");
  if (!cv || document.hidden) { tTruoc = ms; return; }
  const w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  const c = cv.getContext("2d");
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, h);
  if (giamDong.matches || !w) return;
  if (muaHat !== mua) {
    muaHat = mua;
    const n = { xuan: 14, ha: 16, thu: 11, dong: 30 }[mua];
    hat = Array.from({ length: n }, () => hatMoi(mua, w, h, true));
  }
  const dt = Math.min(0.05, (ms - tTruoc) / 1000 || 0), t = ms / 1000;
  tTruoc = ms;
  for (let i = 0; i < hat.length; i++) {
    const p = hat[i];
    const lac = mua === "dong" ? 0 : Math.sin(t * 0.9 + p.pha) * (mua === "ha" ? 6 : 16);
    p.x += (p.vx + lac) * dt; p.y += p.vy * dt; p.goc += p.vg * dt;
    if (p.y > h + 20 || p.y < -20 || p.x < -24 || p.x > w + 24) hat[i] = hatMoi(mua, w, h, false);
    veHat(c, p, mua, t);
  }
  c.globalAlpha = 1;
}

