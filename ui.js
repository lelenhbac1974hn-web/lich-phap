/* GIAO DIỆN LỊCH PHÁP — chỉ trình bày. Mọi phép tính lấy từ lich-phap.js. */
(function () {
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

  function jdHomNay() {
    const d = new Date();
    return jdFromDate(d.getDate(), d.getMonth() + 1, d.getFullYear());
  }
  const thuCuaJd = j => (j + 1) % 7; // 0 = Chủ Nhật

  const st = { jd: jdHomNay(), viec: "chung" };

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
    const kieng = [
      x.cd.tn && "Tam nương",
      x.cd.nk && "Nguyệt kỵ",
      x.cd.dc && "Dương công kỵ nhật"
    ].filter(Boolean).map(t => `<span class="kieng">${t}</span>`).join("");
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
          ${chipViec || nhacHom || le || kieng ? `<div class="tl-nhan">${chipViec}${nhacHom}${le}${kieng}</div>` : ""}
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
  }
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

  /* ── Phán định tốt xấu ── */
  function vePhanDinh(x) {
    const cd = x.cd, bac = BAC_UI[cd.bac];
    const viec = VIEC.find(v => v.id === st.viec) || VIEC[0];
    const thang = BAC_UI.map((b, i) => `<i class="${b.lop}${i === cd.bac ? " dang" : ""}" title="${b.t}"></i>`).join("");
    const li = (ds, lop) => ds.map(t => `<li class="${lop}">${esc(t)}</li>`).join("");
    $("phan-dinh").className = `the the-phan-dinh ${bac.lop}`;
    $("phan-dinh").innerHTML = `
      <div class="pd-nhan">Phán định · ${esc(viec.ten)}</div>
      <div class="pd-chinh">
        <div class="pd-bac">${bac.t}</div>
        <div class="pd-diem"><b>${cd.diem > 0 ? "+" : ""}${cd.diem}</b><span>điểm</span></div>
      </div>
      <div class="pd-thang" role="img" aria-label="Bậc ${cd.bac + 1} trên 5">${thang}</div>
      ${cd.chan.length ? `<div class="pd-chan"><b>Kỵ tuyệt đối cho việc này</b>${cd.chan.map(esc).join(" · ")}</div>` : ""}
      <div class="pd-ly">
        <div><h4>Điểm cộng</h4><ul>${li(cd.cong, "cong") || '<li class="rong">Không có</li>'}</ul></div>
        <div><h4>Điểm trừ</h4><ul>${li(cd.tru, "tru") || '<li class="rong">Không có</li>'}</ul></div>
      </div>`;
  }

  /* ── Dải tóm tắt dưới tờ lịch (màn hình hẹp): chạm để sang mục Luận giải ── */
  function veTomTat(x) {
    const cd = x.cd, bac = BAC_UI[cd.bac];
    const viec = VIEC.find(v => v.id === st.viec) || VIEC[0];
    const el = $("tom-tat");
    el.className = `tom-tat ${bac.lop}`;
    el.innerHTML = `
      <span class="tt-nhan">Phán định · ${esc(viec.ten)}</span>
      <b class="tt-diem">${cd.diem > 0 ? "+" : ""}${cd.diem}</b>
      <strong class="tt-bac">${bac.t}</strong>
      <span class="tt-phu">Trực ${cd.truc.t} · ${cd.than.t} · Sao ${cd.saoTen} <em>›</em></span>
      <span class="pd-thang">${BAC_UI.map((b, i) => `<i class="${b.lop}${i === cd.bac ? " dang" : ""}"></i>`).join("")}</span>`;
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

  /* ── Mặt đồng hồ 12 giờ can chi ── */
  /* Ý nghĩa 12 thần trực giờ (tóm tắt theo lịch dân gian) */
  const Y_THAN = {
    "Thanh Long": "Mọi việc hanh thông, hợp khởi sự việc lớn.",
    "Minh Đường": "Lợi gặp quý nhân, cầu công danh, giao dịch.",
    "Thiên Hình": "Kỵ kiện tụng, tranh chấp, động dao kéo.",
    "Chu Tước": "Kỵ cãi vã, giấy tờ, kiện cáo; giữ lời ăn tiếng nói.",
    "Kim Quỹ": "Lợi cầu tài, cưới hỏi, nhập kho.",
    "Bảo Quang": "Lợi việc lớn, xuất hành, khai trương.",
    "Bạch Hổ": "Kỵ đi xa, an táng; đề phòng tai nạn, thương tích.",
    "Ngọc Đường": "Lợi học hành, ký kết, nhậm chức.",
    "Thiên Lao": "Việc dễ trì trệ, vướng víu; kỵ việc quan.",
    "Nguyên Vũ": "Đề phòng mất mát, lừa gạt; kỵ giao tiền.",
    "Tư Mệnh": "Tốt cho việc ban ngày, cúng lễ, cầu an.",
    "Câu Trần": "Kỵ khởi công, dời nhà, đào đất."
  };
  /* Hướng xuất hành theo can ngày (bảng phổ biến trong lịch vạn niên Việt Nam) */
  const HY_THAN = ["Đông Bắc", "Tây Bắc", "Tây Nam", "Chính Nam", "Đông Nam", "Đông Bắc", "Tây Bắc", "Tây Nam", "Chính Nam", "Đông Nam"];
  const TAI_THAN = ["Đông Nam", "Đông Nam", "Chính Đông", "Chính Đông", "Chính Bắc", "Chính Nam", "Tây Nam", "Tây Nam", "Chính Tây", "Tây Bắc"];

  function gioChiTiet(j) {
    const canNgay = (j + 9) % 10, chiNgay = (j + 1) % 12, dau = khoiDau(chiNgay);
    return CHI.map((chi, i) => {
      const than = THAN[(i - dau + 12) % 12];
      return { i, chi, khung: KHUNG[i], can: CAN[(canNgay * 2 + i) % 10], than: than.t, hd: than.hd, xung: CHI[(i + 6) % 12] };
    });
  }
  const gioHienTai = () => Math.floor(((new Date().getHours() + 1) % 24) / 2);

  function veMatGio(x) {
    const C = 170, R1 = 162, R0 = 58;
    const cuc = (r, doGoc) => {
      const a = (doGoc - 90) * Math.PI / 180;
      return [C + r * Math.cos(a), C + r * Math.sin(a)];
    };
    const gio = gioChiTiet(x.j);
    const laHomNay = x.j === jdHomNay();
    const bay = new Date(), gioNay = gioHienTai();
    if (st.gioChon == null) st.gioChon = laHomNay ? gioNay : gio.find(g => g.hd).i;
    const chon = gio[st.gioChon];
    let mang = "";
    gio.forEach(g => {
      const a0 = g.i * 30 - 15, a1 = g.i * 30 + 15;
      const [x0, y0] = cuc(R1, a0), [x1, y1] = cuc(R1, a1);
      const [x2, y2] = cuc(R0, a1), [x3, y3] = cuc(R0, a0);
      const d = `M${x0.toFixed(1)} ${y0.toFixed(1)} A${R1} ${R1} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} A${R0} ${R0} 0 0 0 ${x3.toFixed(1)} ${y3.toFixed(1)} Z`;
      const [tx, ty] = cuc(137, g.i * 30), [nx, ny] = cuc(111, g.i * 30), [kx, ky] = cuc(85, g.i * 30);
      const lop = ["mui", g.hd ? "hd" : "hac"];
      if (laHomNay && g.i === gioNay) lop.push("dang");
      if (g.i === st.gioChon) lop.push("chon");
      mang += `<g class="${lop.join(" ")}" data-gio="${g.i}" role="button" tabindex="0" aria-label="Giờ ${g.can} ${g.chi}, ${g.khung} giờ, ${g.than}, ${g.hd ? "hoàng đạo" : "hắc đạo"}">
        <path d="${d}"/>
        <text x="${tx.toFixed(1)}" y="${(ty + 5).toFixed(1)}" class="chi">${g.chi}</text>
        <text x="${nx.toFixed(1)}" y="${(ny + 3).toFixed(1)}" class="than">${g.than}</text>
        <text x="${kx.toFixed(1)}" y="${(ky + 3).toFixed(1)}" class="khung">${g.khung}</text>
      </g>`;
    });
    /* Vạch phút quanh mép và kim chỉ giờ hiện tại */
    let vach = "";
    for (let k = 0; k < 48; k++) {
      const [ax, ay] = cuc(R1 + 4, k * 7.5), [bx, by] = cuc(R1 + (k % 4 ? 8 : 12), k * 7.5);
      vach += `<line x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" class="${k % 4 ? "vach" : "vach dam"}"/>`;
    }
    let kim = "";
    if (laHomNay) {
      const goc = ((bay.getHours() + bay.getMinutes() / 60) * 15) % 360;
      const [ex, ey] = cuc(R1 + 2, goc), [sx, sy] = cuc(R0 - 2, goc);
      kim = `<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" class="kim"/><circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="4.5" class="kim-dau"/>`;
    }
    const tot = gio.filter(g => g.hd);
    const tamTren = laHomNay ? `${hai(bay.getHours())}:${hai(bay.getMinutes())}` : tot.length;
    const tamDuoi = laHomNay ? `giờ ${gio[gioNay].chi}` : "giờ tốt";
    const canNgay = (x.j + 9) % 10, chiNgay = (x.j + 1) % 12;
    $("mat-gio").innerHTML = `
      <div class="the-tieu-de"><h3>Giờ trong ngày</h3><span>Ngày ${x.ccNgay} · ${laHomNay ? "chạm từng giờ để xem" : `${tot.length} giờ hoàng đạo`}</span></div>
      <svg class="dia" viewBox="-6 -6 352 352" role="group" aria-label="Mười hai giờ can chi">
        ${vach}
        ${mang}
        ${kim}
        <circle cx="${C}" cy="${C}" r="${R0 - 7}" class="tam"/>
        <circle cx="${C}" cy="${C}" r="${R0 - 11}" class="tam-vien"/>
        <text x="${C}" y="${C + (laHomNay ? 3 : 1)}" class="tam-so${laHomNay ? " nho" : ""}">${tamTren}</text>
        <text x="${C}" y="${C + 19}" class="tam-chu">${tamDuoi}</text>
      </svg>
      <div class="gio-chi-tiet ${chon.hd ? "hd" : "hac"}">
        <div class="gct-dau">
          <div><b>Giờ ${chon.can} ${chon.chi}</b><span>${chon.khung} giờ${laHomNay && chon.i === gioNay ? " · đang diễn ra" : ""}</span></div>
          <em>${chon.hd ? "Hoàng đạo" : "Hắc đạo"}</em>
        </div>
        <p><strong>${chon.than}</strong> — ${Y_THAN[chon.than] || ""}</p>
        <p class="gct-xung">Giờ xung tuổi <b>${chon.xung}</b></p>
      </div>
      <div class="huong">
        <div><span>Hỷ thần</span><b>${HY_THAN[canNgay]}</b></div>
        <div><span>Tài thần</span><b>${TAI_THAN[canNgay]}</b></div>
        <div><span>Ngày xung</span><b>${CHI[(chiNgay + 6) % 12]}</b></div>
      </div>`;
  }

  /* ── Ba thẻ: Trực · Thần · Tú ── */
  function veBoBa(x) {
    const { truc, than, saoTen, saoTot } = x.cd;
    const the = (nhan, ten, lop, tag, mo) => `
      <div class="the the-nho ${lop}">
        <div class="tn-nhan">${nhan}</div>
        <div class="tn-ten">${ten}</div>
        <div class="tn-tag">${tag}</div>
        <p>${mo}</p>
      </div>`;
    $("bo-ba").innerHTML =
      the("Thập nhị trực", `Trực ${truc.t}`, truc.g > 0 ? "tot" : truc.g < 0 ? "xau" : "vua",
        truc.g > 0 ? "Trực tốt" : truc.g < 0 ? "Trực xấu" : "Trực trung bình", esc(truc.v)) +
      the("Hoàng đạo · Hắc đạo", than.t, than.hd ? "tot" : "xau",
        than.hd ? "Ngày hoàng đạo" : "Ngày hắc đạo",
        than.hd ? "Thần hoàng đạo chủ trì — thuận cho việc khởi sự." : "Thần hắc đạo chủ trì — nên tránh việc lớn.") +
      the("Nhị thập bát tú", `Sao ${saoTen}`, saoTot ? "tot" : "xau",
        saoTot ? "Cát tú" : "Hung tú",
        `Năm ${x.ccNam} · tuổi ${x.conGiap}. Tiết ${x.tiet}.`);
  }

  /* ── Lịch tháng ── */
  function veLichThang(x) {
    const dau = jdFromDate(1, x.mm, x.yy);
    const soNgay = jdFromDate(1, x.mm === 12 ? 1 : x.mm + 1, x.mm === 12 ? x.yy + 1 : x.yy) - dau;
    const lech = (thuCuaJd(dau) + 6) % 7; // tuần bắt đầu Thứ Hai
    const hom = jdHomNay();
    let o = "";
    for (let i = 0; i < lech; i++) o += `<div class="o trong"></div>`;
    for (let n = 0; n < soNgay; n++) {
      const j = dau + n, am = amCuaJd(j), cd = chamDiem(j, am, st.viec);
      const le = leCuaNgay(j), thu = thuCuaJd(j);
      const lop = ["o", BAC_UI[cd.bac].lop];
      if (j === st.jd) lop.push("chon");
      if (j === hom) lop.push("hom-nay");
      if (thu === 0 || le.some(l => l.nghi)) lop.push("do");
      const amTxt = am.day === 1 ? `${am.day}/${am.month}${am.leap ? "n" : ""}` : am.day;
      const nh = nhacCuaNgay(j);
      const vh = viecCuaNgay(j);
      const ten = nh.map(n => n.ten).concat(vh.map(v => v.ten), le.length ? [le[0].ten] : []).join(" · ");
      if (nh.length) lop.push("co-nhac");
      o += `<button type="button" class="${lop.join(" ")}" data-jd="${j}" title="${esc(`${BAC_UI[cd.bac].t} · ${ccNgay(j)}${ten ? " · " + ten : ""}`)}">
        ${nh.length ? '<span class="o-nhac"></span>' : ""}
        ${vh.length ? `<span class="o-viec">${vh.length}</span>` : ""}
        <span class="o-duong">${n + 1}</span>
        <span class="o-am${am.day === 1 || am.day === 15 ? " moc" : ""}">${amTxt}</span>
        <span class="o-cham"></span>
        ${(() => {
          const T = window.ThiepLe;
          const kl = T && le.map(l => T.khoaCuaLe(l, am, n + 1, x.mm)).find(k => T.laLeLon(k));
          if (kl) return `<span class="o-bieu" aria-hidden="true">${T.layThiep(kl).bieu}</span>`;
          return le.length ? '<span class="o-le"></span>' : "";
        })()}
      </button>`;
    }
    const amDau = amCuaJd(dau), amCuoi = amCuaJd(dau + soNgay - 1);
    const chuThich = BAC_UI.map(b => `<span class="${b.lop}"><i></i>${b.t}</span>`).join("");
    $("lich-thang").innerHTML = `
      <div class="the-tieu-de">
        <h3>Tháng ${x.mm} <small>${x.yy}</small></h3>
        <span>Âm lịch: tháng ${THANG_AM[amDau.month - 1]}${amDau.month !== amCuoi.month ? " – " + THANG_AM[amCuoi.month - 1] : ""}, năm ${ccNam(amCuoi.year)}</span>
        <div class="doi-thang">
          <button type="button" class="lat nho" data-thang="-1" aria-label="Tháng trước">‹</button>
          <button type="button" class="lat nho" data-thang="1" aria-label="Tháng sau">›</button>
        </div>
      </div>
      <div class="luoi dau-thu">${["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((t, i) => `<div class="${i === 6 ? "do" : ""}">${t}</div>`).join("")}</div>
      <div class="luoi">${o}</div>
      <div class="chu-thich">${chuThich}</div>`;
  }

  /* ── Sao Ngọc Hạp ── */
  /* ── CSDL sao Ngọc Hạp: tra theo tên sao của chương trình ── */
  const CSDL = window.NGOC_HAP_CSDL || { sao: [] };
  const saoTheoTen = new Map();
  CSDL.sao.forEach(s => { saoTheoTen.set(s.ten, s); (s.ct || []).forEach(t => { if (!saoTheoTen.has(t)) saoTheoTen.set(t, s); }); });

  function veNgocHap(x) {
    const nh = x.cd.nh;
    const ds = (sao, lop) => sao.length
      ? sao.map(s => {
          const r = saoTheoTen.get(s[0]);
          return `<li class="${lop}"><button type="button" class="sao-nut" data-sao="${esc(s[0])}"><b>${esc(s[0])}${r && r.han ? `<small>${esc(r.han)}</small>` : ""}</b><span>${esc(s[1] || "")}</span></button></li>`;
        }).join("")
      : `<li class="rong">Không có sao nào chiếu.</li>`;
    $("ngoc-hap").innerHTML = `
      <div class="the-tieu-de">
        <h3>Sao Ngọc Hạp</h3>
        <span>Ngày ${x.ccNgay}, tháng ${THANG_AM[x.am.month - 1]} âm lịch · chạm tên sao để xem nghĩa</span>
        ${CSDL.sao.length ? `<button type="button" class="nut nho tra-sao-mo" data-tra-sao>Tra cứu ${CSDL.sao.length} sao</button>` : ""}
      </div>
      <div class="sao-cot">
        <div>
          <h4 class="tot"><i></i>Cát tinh <em>${nh.tot.length}</em></h4>
          <ul class="sao-ds">${ds(nh.tot, "tot")}</ul>
        </div>
        <div>
          <h4 class="xau"><i></i>Hung tinh <em>${nh.xau.length}</em></h4>
          <ul class="sao-ds">${ds(nh.xau, "xau")}</ul>
        </div>
      </div>`;
  }

  /* ── Thẻ sao và bảng tra cứu (dạng tấm trượt lên từ đáy) ── */
  let tamSao = null;
  function moTam(html, lop) {
    dongTam();
    tamSao = document.createElement("div");
    tamSao.className = `tam-lop ${lop || ""}`;
    tamSao.setAttribute("role", "dialog"); tamSao.setAttribute("aria-modal", "true");
    tamSao.innerHTML = `<div class="tam"><button type="button" class="tam-dong" aria-label="Đóng">✕</button>${html}</div>`;
    document.body.appendChild(tamSao);
    requestAnimationFrame(() => tamSao && tamSao.classList.add("hien"));
    tamSao.addEventListener("click", e => {
      if (e.target === tamSao || e.target.closest(".tam-dong")) dongTam();
      const b = e.target.closest("[data-sao-id]");
      if (b) { const s = CSDL.sao.find(z => z.id === b.dataset.saoId); if (s) moTheSao(s, true); }
      if (e.target.closest("[data-tra-lai]")) moTraSao(tamSao && tamSao.dataset.tim);
    });
    return tamSao;
  }
  function dongTam() { if (!tamSao) return; const t = tamSao; tamSao = null; t.classList.remove("hien"); setTimeout(() => t.remove(), 320); }
  document.addEventListener("keydown", e => { if (e.key === "Escape") dongTam(); });

  function moTheSao(s, tuTra) {
    const thangNay = ttNgay(st.jd).am.month;
    const an = s.an && s.an.thang ? Array.from({ length: 12 }, (_, i) => {
      const v = (s.an.thang[String(i + 1)] || []).join(", ") || "—";
      return `<div class="${i + 1 === thangNay ? "nay" : ""}"><span>T${i + 1}</span><b>${esc(v)}</b></div>`;
    }).join("") : "";
    const ds = (tieu, arr, lop) => arr && arr.length ? `<div class="ts-viec ${lop}"><h4>${tieu}</h4><p>${arr.map(esc).join(" · ")}</p></div>` : "";
    const cu = tamSao && tamSao.dataset.tim;
    const el = moTam(`
      <header class="ts-dau ${s.loai}">
        ${s.han ? `<div class="ts-han" aria-hidden="true">${esc(s.han)}</div>` : ""}
        <span class="ts-loai">${s.loai === "tot" ? "Cát tinh · sao tốt" : "Hung tinh · sao xấu"}</span>
        <h3>${esc(s.ten)}</h3>
        ${s.han ? `<p class="ts-han-nho">${esc(s.han)}</p>` : ""}
      </header>
      <div class="ts-than">
        ${s.nghia ? `<p class="ts-nghia">${esc(s.nghia)}</p>` : `<p class="ts-nghia rong">Sách không ghi nghĩa riêng cho sao này.</p>`}
        ${ds("Nên", s.nen, "nen")}${ds("Kỵ", s.ky, "ky")}
        ${an ? `<h4 class="ts-an-tieu">An sao theo tháng âm${s.an.theo === "can" ? " (theo can ngày)" : s.an.theo === "ngayam" ? " (theo ngày âm)" : ""}</h4><div class="ts-an">${an}</div>` : ""}
        <p class="ts-nguon">Nguồn: Ngọc Hạp Thông Thư${s.trang.length ? `, tr. ${s.trang.join(", ")}` : ""}${s.han ? " · tên chữ Hán theo bản 1926" : ""}<br>
          <span class="${s.tt ? "da" : "chua"}">${s.tt ? "✓ Đã đối chiếu đủ với sách" : "⚠ Cần xem lại: sách in chưa đủ hoặc chưa nhất quán"}</span></p>
        ${tuTra ? `<button type="button" class="nut nho" data-tra-lai>‹ Về danh sách</button>` : ""}
      </div>`, "lop-sao");
    if (cu) el.dataset.tim = cu;
  }

  function moTraSao(tim) {
    const el = moTam(`
      <header class="tra-dau"><h3>Tra cứu sao Ngọc Hạp</h3><p>${CSDL.sao.length} sao · theo Ngọc Hạp Thông Thư</p>
        <input type="search" class="tra-o" placeholder="Gõ tên sao, ví dụ: thiên đức" aria-label="Tìm sao" value="${esc(tim || "")}" /></header>
      <ul class="tra-ds"></ul>`, "lop-tra");
    const o = el.querySelector(".tra-o"), ul = el.querySelector(".tra-ds");
    const bo = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();
    const ve2 = () => {
      const q = bo(o.value.trim()); el.dataset.tim = o.value;
      const ds = CSDL.sao.filter(s => !q || bo(s.ten).includes(q) || (s.han || "").includes(o.value.trim()))
        .sort((a, b) => a.ten.localeCompare(b.ten, "vi"));
      ul.innerHTML = ds.map(s => `<li><button type="button" data-sao-id="${esc(s.id)}" class="${s.loai}"><i></i><b>${esc(s.ten)}</b>${s.han ? `<small>${esc(s.han)}</small>` : ""}<span>${esc((s.nghia || "").slice(0, 60))}${(s.nghia || "").length > 60 ? "…" : ""}</span></button></li>`).join("")
        || `<li class="rong">Không tìm thấy sao nào.</li>`;
    };
    o.addEventListener("input", ve2); ve2();
  }

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-sao]");
    if (b) { const s = saoTheoTen.get(b.dataset.sao); if (s) moTheSao(s); else baoTam("Chưa có dữ liệu sách cho sao này."); return; }
    if (e.target.closest("[data-tra-sao]")) moTraSao("");
  });

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
      ghi: typeof n.ghi === "string" ? n.ghi.trim().slice(0, 160) : ""
    };
  }
  function docNhac() {
    try {
      const a = JSON.parse(localStorage.getItem(KHOA_NHAC) || "[]");
      return Array.isArray(a) ? a.filter(hopLe).map(chuanHoa) : [];
    } catch (e) { return []; }
  }
  let nhac = docNhac(), dangSua = null, choXoa = null, nhacChon = null, henXoa = 0;
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
  const conLai = k => k === 0 ? "Hôm nay" : k === 1 ? "Ngày mai" : `Còn ${k} ngày`;
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
    $("ds-nhac").innerHTML = ds.length ? `<ul class="nhac-ds">${ds.map(({ n, j, con }) => {
      const t = j == null ? null : ttNgay(j), dn = j == null ? null : soNam(n, j);
      return `<li class="nhac-muc l-${n.loai}${con <= n.truoc ? " gan" : ""}${nhacChon === n.id ? " duoc-chon" : ""}${dangSua === n.id ? " dang-sua" : ""}" data-chon="${esc(n.id)}" tabindex="0" aria-selected="${nhacChon === n.id}">
        <button type="button" class="nhac-con" ${j == null ? "disabled" : `data-jd="${j}"`} title="Xem ngày này">
          <b>${con === 0 ? "Hôm nay" : con === 1 ? "Mai" : con > 999 ? "—" : con}</b><span>${con > 1 && con <= 999 ? "ngày nữa" : "&nbsp;"}</span>
        </button>
        <div class="nhac-nd">
          <div class="nhac-ten">${esc(n.ten)} <em>${LOAI[n.loai].ten}</em></div>
          <div class="nhac-ngay">Hằng năm ngày <b>${ngayGoc(n)}</b>${t ? ` · lần tới ${THU[thuCuaJd(j)]} ${hai(t.dd)}/${hai(t.mm)}/${t.yy}${LOAI[n.loai].lich === "duong" ? ` (${t.am.day}/${t.am.month} âm)` : ""}` : ""}</div>
          ${dn || n.ghi ? `<div class="nhac-phu">${[dn, n.ghi && esc(n.ghi)].filter(Boolean).join(" · ")}</div>` : ""}
        </div>
      </li>`;
    }).join("")}</ul>` : `<div class="nhac-trong"><b>Chưa có lời nhắc nào</b>Bấm "＋ Thêm" để thêm ngày giỗ, sinh nhật hoặc sự kiện. Lời nhắc sẽ hiện trên tờ lịch, lịch tháng và dải báo đầu trang khi sắp đến ngày.</div>`;

    /* Nhóm nút Thêm · Sửa · Xoá: Sửa và Xoá chỉ sáng khi đã chọn một lời nhắc */
    if (nhacChon && !nhac.some(x => x.id === nhacChon)) nhacChon = null;
    $("n-sua").disabled = !nhacChon;
    $("n-xoa").disabled = !nhacChon;
    const chac = !!nhacChon && choXoa === nhacChon;
    $("n-xoa").classList.toggle("chac", chac);
    $("n-xoa").textContent = chac ? "Bấm lần nữa để xoá" : "Xoá";
    $("n-goi-y").textContent = !nhac.length ? "" : nhacChon ? "" : "Chạm vào một lời nhắc để sửa hoặc xoá.";

    const gan = ds.filter(x => x.j != null && x.con <= x.n.truoc);
    $("bao-nhac").innerHTML = gan.map(({ n, j, con }) =>
      `<button type="button" class="bao l-${n.loai}${con === 0 ? " hom-nay" : ""}" data-jd="${j}">
        <b>${conLai(con)}</b><span>${esc(n.ten)}</span><em>${ngayGoc(n)}</em>
      </button>`).join("");
  }

  /* ── Khung nhập ── */
  function datNhanForm() {
    const l = LOAI[$("n-loai").value], am = l.lich === "am";
    $("n-nhan-ngay").textContent = am ? "Ngày âm" : "Ngày dương";
    $("n-nhan-thang").textContent = am ? "Tháng âm" : "Tháng dương";
    $("n-nhan-nam").innerHTML = `${l.nam}${am ? " âm lịch" : ""} <em>(tuỳ chọn)</em>`;
    $("n-ngay").max = am ? 30 : 31;
  }
  function moForm(mo) {
    $("nhac").classList.toggle("mo-form", mo);
    $("n-mo").textContent = mo ? "Đóng" : "＋ Thêm";
    $("n-mo").classList.toggle("dang-mo", mo);
  }
  function xoaForm() {
    dangSua = null;
    moForm(false);
    $("f-nhac").reset();
    $("n-loi").textContent = "";
    $("n-luu").textContent = "Thêm nhắc";
    $("n-huy").hidden = true;
    datNhanForm();
  }
  function napForm(n) {
    dangSua = n.id;
    moForm(true);
    $("khung").scrollTop = 0;
    $("n-ten").value = n.ten; $("n-loai").value = n.loai;
    $("n-ngay").value = n.ngay; $("n-thang").value = n.thang;
    $("n-nam").value = n.nam == null ? "" : n.nam;
    $("n-truoc").value = String(n.truoc); $("n-ghi").value = n.ghi;
    if ($("n-truoc").value !== String(n.truoc)) $("n-truoc").value = "3";
    $("n-luu").textContent = "Lưu thay đổi";
    $("n-huy").hidden = false;
    $("n-loi").textContent = "";
    datNhanForm();
    $("n-ten").focus();
  }
  function docForm() {
    const so = id => $(id).value.trim() === "" ? null : Number($(id).value);
    const n = {
      ten: $("n-ten").value, loai: $("n-loai").value,
      ngay: so("n-ngay"), thang: so("n-thang"), nam: so("n-nam"),
      truoc: Number($("n-truoc").value), ghi: $("n-ghi").value
    };
    const am = LOAI[n.loai].lich === "am";
    if (!n.ten.trim()) return { loi: "Chưa nhập tên lời nhắc.", o: "n-ten" };
    if (!soNguyen(n.thang, 1, 12)) return { loi: "Tháng phải từ 1 đến 12.", o: "n-thang" };
    const toiDa = am ? 30 : NGAY_TOI_DA[n.thang - 1];
    if (!soNguyen(n.ngay, 1, toiDa)) return { loi: `Ngày phải từ 1 đến ${toiDa}${am ? " (tháng âm dài nhất 30 ngày)" : ` với tháng ${n.thang} dương lịch`}.`, o: "n-ngay" };
    if (n.nam != null && !soNguyen(n.nam, 1800, 2199)) return { loi: "Năm phải từ 1800 đến 2199, hoặc để trống.", o: "n-nam" };
    return { n };
  }

  function ganNhac() {
    $("n-loai").addEventListener("change", datNhanForm);
    $("n-mo").addEventListener("click", () => {
      if (window.matchMedia("(max-width:760px)").matches) {
        const mo = !$("nhac").classList.contains("mo-form");
        if (mo) { xoaForm(); moForm(true); $("n-ten").focus(); } else xoaForm();
      } else { xoaForm(); $("n-ten").focus(); }
      veNhac();
    });
    $("n-huy").addEventListener("click", () => { xoaForm(); veNhac(); });
    $("n-lay").addEventListener("click", () => {
      const t = ttNgay(st.jd), am = LOAI[$("n-loai").value].lich === "am";
      $("n-ngay").value = am ? t.am.day : t.dd;
      $("n-thang").value = am ? t.am.month : t.mm;
      $("n-loi").textContent = am && t.am.leap ? "Ngày đang xem thuộc tháng nhuận; lời nhắc sẽ lặp theo tháng thường cùng số." : "";
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
    /* Chạm một lời nhắc để chọn (chạm lại để bỏ chọn); ô đếm ngày vẫn mở ngày đó */
    const chonNhac = li => {
      nhacChon = nhacChon === li.dataset.chon ? null : li.dataset.chon;
      choXoa = null;
      veNhac();
    };
    $("ds-nhac").addEventListener("click", e => {
      if (e.target.closest("[data-jd]")) return;
      const li = e.target.closest("[data-chon]");
      if (li) chonNhac(li);
    });
    $("ds-nhac").addEventListener("keydown", e => {
      const li = e.target.closest("[data-chon]");
      if (li && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); chonNhac(li); }
    });
    $("n-sua").addEventListener("click", () => {
      const n = nhac.find(x => x.id === nhacChon);
      choXoa = null;
      if (n) { napForm(n); veNhac(); }
    });
    $("n-xoa").addEventListener("click", () => {
      if (!nhacChon) return;
      clearTimeout(henXoa);
      if (choXoa === nhacChon) {
        nhac = nhac.filter(x => x.id !== nhacChon);
        if (dangSua === nhacChon) xoaForm();
        choXoa = null; nhacChon = null; luuNhac(); ve();
      } else {
        choXoa = nhacChon; veNhac();
        henXoa = setTimeout(() => { choXoa = null; veNhac(); }, 4000);
      }
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
      ghi: typeof v.ghi === "string" ? v.ghi.slice(0, 500) : "",
      xong: !!v.xong, xongLuc: Number(v.xongLuc) || null, taoLuc: Number(v.taoLuc) || Date.now(), daBao: !!v.daBao
    };
  }
  let viec = (() => {
    try { const a = JSON.parse(docKhoa(KHOA_VIEC, "[]")); return Array.isArray(a) ? a.filter(v => v && v.ten).map(chuanViec) : []; }
    catch (e) { return []; }
  })();
  let locViec = "homnay", viecChon = null, viecSua = null, choXoaViec = null, henXoaViec = 0;
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
    el.innerHTML = `<span>${noiDung}</span>${hoanTac ? '<button type="button" id="bt-hoan">Hoàn tác</button>' : ""}`;
    el.classList.add("hien");
    if (hoanTac) $("bt-hoan").onclick = () => { hoanTac(); el.classList.remove("hien"); };
    henBao = setTimeout(() => el.classList.remove("hien"), giuLau ? 9000 : 4500);
  }

  function veMucViec(v) {
    const hom = jdHomNay(), qh = quaHan(v);
    const ngay = v.jd == null ? "" : `<span class="vm-ngay${qh ? " qua-han" : v.jd === hom ? " hom-nay" : ""}">${nhanNgayViec(v.jd)}${v.gio ? ` · ${v.gio}` : ""}</span>`;
    const lap = v.lap !== "khong" ? `<span class="vm-lap" title="${LAP[v.lap]}">↻ ${LAP[v.lap]}</span>` : "";
    const ghi = v.ghi ? `<span class="vm-ghi">${esc(v.ghi.split("\n")[0])}</span>` : "";
    const chon = viecChon === v.id;
    const uu = v.uuTien ? `<span class="vm-uu p${v.uuTien}">⚑ ${UU[v.uuTien]}</span>` : "";
    return `<li class="viec-muc p${v.uuTien}${v.xong ? " da-xong" : ""}${chon ? " duoc-chon" : ""}${viecSua === v.id ? " dang-sua" : ""}${qh ? " qua-han" : ""}"
        data-viec-id="${esc(v.id)}" tabindex="0" role="option" aria-selected="${chon}">
      <span class="vm-cham" aria-hidden="true">${v.xong ? "✓" : ""}</span>
      <div class="vm-nd">
        <div class="vm-ten">${esc(v.ten)}</div>
        ${ngay || lap || uu || ghi ? `<div class="vm-phu">${ngay}${lap}${uu}${ghi}</div>` : ""}
      </div>
    </li>`;
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
    if (locViec === "xong") {
      const ds = nhom.xong.slice().sort((a, b) => (b.xongLuc || 0) - (a.xongLuc || 0)).slice(0, 60);
      html = ds.length ? `<ul class="ds-viec">${ds.map(veMucViec).join("")}</ul><button type="button" class="nut nho xoa-xong" data-xoa-xong>Xoá hết việc đã xong</button>` : "";
    } else {
      const ds = sap(nhom[locViec]), cum = new Map();
      ds.forEach(v => {
        const k = v.jd == null ? "khong" : quaHan(v) && v.jd < hom ? "qua" : String(v.jd);
        if (!cum.has(k)) cum.set(k, []);
        cum.get(k).push(v);
      });
      const tieuDe = k => k === "khong" ? "Chưa đặt ngày" : k === "qua" ? "Quá hạn" :
        (j => `${nhanNgayViec(j, false) === "Hôm nay" || nhanNgayViec(j, false) === "Ngày mai" ? nhanNgayViec(j) + " · " : ""}${THU[thuCuaJd(j)]} ${hai(ttNgay(j).dd)}/${hai(ttNgay(j).mm)} <em>${ttNgay(j).am.day}/${ttNgay(j).am.month} âm</em>`)(+k);
      const thuTu = [...cum.keys()].sort((a, b) => (a === "qua" ? -1 : b === "qua" ? 1 : a === "khong" ? 1 : b === "khong" ? -1 : +a - +b));
      html = thuTu.map(k => `<section class="cum-viec${k === "qua" ? " cum-qua" : ""}"><h4>${tieuDe(k)}<i>${cum.get(k).length}</i></h4><ul class="ds-viec">${cum.get(k).map(veMucViec).join("")}</ul></section>`).join("");
    }
    if (!html) {
      const loi = { homnay: ["Hôm nay rảnh việc", "Bấm “＋ Thêm”, gõ một câu như “Gọi anh Tuấn 9h sáng mai” — ứng dụng tự điền ngày, giờ."],
        saptoi: ["Chưa có việc sắp tới", "Thêm việc có ngày, ví dụ “Họp giao ban thứ 2 hằng tuần”, “Đi lễ chùa rằm”."],
        tatca: ["Chưa có việc nào", "Bấm “＋ Thêm” để thêm việc đầu tiên."],
        xong: ["Chưa hoàn thành việc nào", "Chạm chọn một việc rồi bấm “✓ Xong”."] }[locViec];
      html = `<div class="viec-trong"><b>${loi[0]}</b>${loi[1]}</div>`;
    }
    $("ds-viec").innerHTML = html;

    /* Nhóm nút: Xong · Sửa · Xoá chỉ sáng khi đã chọn một việc */
    const vc = viec.find(v => v.id === viecChon);
    if (!vc) viecChon = null;
    $("v-xong").disabled = $("v-sua").disabled = $("v-xoa").disabled = !vc;
    $("v-xong").textContent = vc && vc.xong ? "↺ Chưa xong" : "✓ Xong";
    const chac = !!vc && choXoaViec === vc.id;
    $("v-xoa").classList.toggle("chac", chac);
    $("v-xoa").textContent = chac ? "Bấm lần nữa" : "Xoá";
    const coViec = locViec === "xong" ? nhom.xong.length : nhom[locViec].length;
    $("v-goi-y").textContent = coViec && !vc ? "Chạm vào một việc để chọn, rồi bấm Xong, Sửa hoặc Xoá." : "";

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
    $("nhac").classList.add("mo-viec");
    $("v-mo").textContent = "Đóng"; $("v-mo").classList.add("dang-mo");
    $("v-go").value = v ? v.ten : "";
    $("v-ngay").value = v ? jdSangO(v.jd) : ""; $("v-gio").value = v && v.gio || "";
    datUu(v ? v.uuTien : 0); $("v-lap").value = v ? v.lap : "khong"; $("v-ghi").value = v ? v.ghi : "";
    $("v-luu").textContent = v ? "Lưu thay đổi" : "Thêm việc"; $("v-loi").textContent = "";
    hieuNhap();
    $("v-go").focus();
  }
  function dongFormViec() {
    viecSua = null;
    $("nhac").classList.remove("mo-viec");
    $("v-mo").textContent = "＋ Thêm"; $("v-mo").classList.remove("dang-mo");
  }
  /* Gõ câu tự nhiên: hiện nhãn xem trước và tự điền các ô chưa sửa tay */
  function hieuNhap() {
    const g = $("v-go").value.trim();
    if (!g) { $("v-hieu").innerHTML = ""; return; }
    const k = phanTichViec(g), the = [];
    if (k.jd != null) the.push(`<span class="the-ngay">📅 ${nhanNgayViec(k.jd)}${k.jd - jdHomNay() > 1 ? ` · ${ttNgay(k.jd).am.day}/${ttNgay(k.jd).am.month} âm` : ""}</span>`);
    if (k.gio) the.push(`<span class="the-gio">⏰ ${k.gio}</span>`);
    if (k.lap !== "khong") the.push(`<span class="the-lap">↻ ${LAP[k.lap]}</span>`);
    if (k.uuTien) the.push(`<span class="the-uu p${k.uuTien}">⚑ Ưu tiên ${UU[k.uuTien].toLowerCase()}</span>`);
    /* Gợi ý: tên lễ tết nhận ra được, ngày trùng lễ, và các lựa chọn khi câu chưa rõ tháng */
    const jdHien = chamTay.ngay ? oSangJd($("v-ngay").value) : k.jd;
    if (chamTay.ngay && jdHien != null && the.length && /the-ngay/.test(the[0])) the[0] = `<span class="the-ngay">📅 ${nhanNgayViec(jdHien)} · ${ttNgay(jdHien).am.day}/${ttNgay(jdHien).am.month} âm</span>`;
    if (k.le) the.push(`<span class="the-le">🎉 ${esc(k.le)}</span>`);
    else if (jdHien != null) {
      const le = leCuaNgay(jdHien).filter(l => l.loai !== "ram").map(l => l.ten);
      if (le.length) the.push(`<span class="the-le">🎉 Trùng ${esc(le[0])}</span>`);
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
        baoTam(`⏰ Đến giờ: “${esc(v.ten)}”${v.ghi ? ` — ${esc(v.ghi.split("\n")[0])}` : ""}`, null, true);
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
    $("nhac").addEventListener("click", e => {
      const b = e.target.closest("[data-nhac-trang]");
      if (b) datTrang(b.dataset.nhacTrang);
    });
    /* Khung nhập */
    $("v-go").addEventListener("input", hieuNhap);
    $("v-ngay").addEventListener("change", () => { chamTay.ngay = 1; hieuNhap(); });
    $("v-hieu").addEventListener("click", e => {
      const b = e.target.closest("[data-goi-jd]");
      if (!b) return;
      $("v-ngay").value = jdSangO(+b.dataset.goiJd); chamTay.ngay = 1; hieuNhap();
    });
    $("v-gio").addEventListener("change", () => { chamTay.gio = 1; });
    $("v-lap").addEventListener("change", () => { chamTay.lap = 1; });
    $("v-uu").addEventListener("click", e => { const b = e.target.closest("[data-uu]"); if (b) { chamTay.uu = 1; datUu(+b.dataset.uu); } });
    $("v-huy").addEventListener("click", () => { dongFormViec(); veViec(); });
    $("v-mo").addEventListener("click", () => { if ($("nhac").classList.contains("mo-viec")) dongFormViec(); else moFormViec(null); veViec(); });
    $("f-viec").addEventListener("submit", e => {
      e.preventDefault();
      const g = $("v-go").value.trim();
      if (!g) { $("v-loi").textContent = "Chưa nhập việc cần làm."; $("v-go").focus(); return; }
      const k = phanTichViec(g);
      // Tên: khi thêm mới lấy phần còn lại sau khi tách ngày giờ; khi sửa mà người dùng không gõ thêm ngày giờ thì giữ nguyên câu
      const ten = (viecSua && k.jd == null && !k.gio ? g : k.ten) || g;
      const du = { ten, jd: oSangJd($("v-ngay").value), gio: $("v-gio").value || null, uuTien: docUu(), lap: $("v-lap").value, ghi: $("v-ghi").value };
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
    /* Nhóm nút Xong · Sửa · Xoá */
    $("v-xong").addEventListener("click", () => {
      if (!viecChon) return;
      const id = viecChon, v = viec.find(x => x.id === id);
      if (!v) return;
      if (!v.xong && v.lap === "khong") viecChon = null; // việc xong rời khỏi danh sách đang xem
      tichViec(id);
    });
    $("v-sua").addEventListener("click", () => {
      const v = viec.find(x => x.id === viecChon);
      if (v) { choXoaViec = null; moFormViec(v); veViec(); $("khung").scrollTop = 0; }
    });
    $("v-xoa").addEventListener("click", () => {
      if (!viecChon) return;
      clearTimeout(henXoaViec);
      if (choXoaViec === viecChon) {
        const cu = viec.slice(), v = viec.find(x => x.id === viecChon);
        viec = viec.filter(x => x.id !== viecChon);
        if (viecSua === viecChon) dongFormViec();
        viecChon = null; choXoaViec = null; luuViec(); ve();
        baoTam(`Đã xoá “${esc(v.ten)}”`, () => { viec = cu; luuViec(); ve(); });
      } else {
        choXoaViec = viecChon; veViec();
        henXoaViec = setTimeout(() => { choXoaViec = null; veViec(); }, 4000);
      }
    });
    $("loc-viec").addEventListener("click", e => {
      const b = e.target.closest("[data-loc]");
      if (b) { locViec = b.dataset.loc; viecChon = null; choXoaViec = null; veViec(); }
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
      /* Chạm một việc để chọn (sáng lên); chạm lại để bỏ chọn */
      viecChon = viecChon === id ? null : id;
      choXoaViec = null;
      veViec();
    });
    ds.addEventListener("keydown", e => {
      const li = e.target.closest("[data-viec-id]");
      if (li && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); li.click(); }
    });
    setInterval(soatGio, 20000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) { soatGio(); veViec(); } });
    soatGio();
  }

  /* Số trên nút Nhắc ở thanh menu đáy = việc hôm nay/quá hạn + ngày lặp lại sắp đến */
  function capNhatDemTab() {
    const n = (+$("dem-viec").textContent || 0) * !$("dem-viec").hidden + (+$("dem-lap").textContent || 0) * !$("dem-lap").hidden;
    const el = $("dem-nhac-tab");
    el.hidden = !n; el.textContent = n;
  }

  function veDaiViec() {
    $("dai-viec").innerHTML = VIEC.map(v =>
      `<button type="button" class="viec${v.id === st.viec ? " chon" : ""}" data-viec="${v.id}">${esc(v.ten)}</button>`).join("");
  }

  function ve() {
    const x = thongTin(st.jd, st.viec);
    veDaiViec();
    veToLich(x);
    veTomTat(x);
    vePhanDinh(x);
    veMatGio(x);
    veBoBa(x);
    veLichThang(x);
    veNgocHap(x);
    veNhac();
    veViec();
    capNhatDemTab();
    $("o-ngay").value = `${x.yy}-${hai(x.mm)}-${hai(x.dd)}`;
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
  $("nut-hom-nay").addEventListener("click", () => den(jdHomNay()));
  $("nut-hom-nay-logo").addEventListener("click", e => { e.preventDefault(); den(jdHomNay()); });
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

  ganNhac();
  ganViec();
  ganGiuLe();
  ganTab();
  ganChieuCao();
  ve();
  /* Kim đồng hồ chạy theo giờ thật khi đang xem hôm nay */
  setInterval(() => {
    if (document.hidden || st.jd !== jdHomNay()) return;
    veMatGio(thongTin(st.jd, st.viec));
  }, 30000);
  ganNghieng();
  ganVuot();
  requestAnimationFrame(khungHinh);
})();
