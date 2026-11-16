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
    const le = x.le.map(l => `<span class="le le-${l.loai}${l.nghi ? " le-nghi" : ""}">${esc(l.ten)}</span>`).join("");
    const kieng = [
      x.cd.tn && "Tam nương",
      x.cd.nk && "Nguyệt kỵ",
      x.cd.dc && "Dương công kỵ nhật"
    ].filter(Boolean).map(t => `<span class="kieng">${t}</span>`).join("");
    const nhacHom = nhacCuaNgay(x.j).map(n => {
      const dn = soNam(n, x.j);
      return `<span class="le le-nhac l-${n.loai}">${esc(n.ten)}${dn ? ` · ${dn}` : ""}</span>`;
    }).join("");
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
          <div class="tl-so">${x.dd}</div>
          <div class="tl-thu">${THU[x.thu]}</div>
          ${nhacHom || le || kieng ? `<div class="tl-nhan">${nhacHom}${le}${kieng}</div>` : ""}
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
  /* Gọi TRƯỚC khi vẽ lại: chụp tờ đang xem để cho nó rơi */
  function chupToCu(huong) {
    if (giamDong.matches || huong <= 0) return null;
    const a = document.querySelector("#to-lich > .to-lich:not(.roi)");
    if (!a) return null;
    const c = a.cloneNode(true);
    c.classList.add("roi");
    c.style.clipPath = mepRach();
    c.style.setProperty("--lech", `${(Math.random() * 16 - 8).toFixed(1)}deg`);
    c.style.setProperty("--troi", `${(Math.random() * 60 - 30).toFixed(0)}px`);
    return c;
  }
  /* Gọi SAU khi vẽ lại */
  function dienHieuUng(huong, toCu) {
    const khung = $("to-lich");
    if (toCu) {
      khung.appendChild(toCu);
      toCu.addEventListener("animationend", () => toCu.remove(), { once: true });
    } else if (huong < 0 && !giamDong.matches) {
      const moi = khung.querySelector(".to-lich");
      if (moi) moi.classList.add("ha");
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

  /* Vuốt ngang trên tờ lịch để lật ngày */
  function ganVuot() {
    const khung = $("to-lich");
    let x0 = null, y0 = 0;
    khung.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    khung.addEventListener("touchend", e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) den(st.jd + (dx < 0 ? 1 : -1));
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
  function datChieuCao() {
    const vv = window.visualViewport;
    const h = Math.round(vv ? vv.height : window.innerHeight);
    const dangGo = document.activeElement && document.activeElement.matches("input,select,textarea");
    const cu = parseInt(document.documentElement.style.getPropertyValue("--cao"), 10) || 0;
    if (dangGo && h < cu) return; // bàn phím đang mở: giữ nguyên bố cục
    document.documentElement.style.setProperty("--cao", `${h}px`);
  }
  function ganChieuCao() {
    datChieuCao();
    window.addEventListener("resize", datChieuCao);
    window.addEventListener("orientationchange", () => setTimeout(datChieuCao, 250));
    if (window.visualViewport) window.visualViewport.addEventListener("resize", datChieuCao);
    document.addEventListener("focusout", () => setTimeout(datChieuCao, 250));
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
  function veMatGio(x) {
    const C = 170, R1 = 160, R0 = 62;
    const cuc = (r, doGoc) => {
      const a = (doGoc - 90) * Math.PI / 180;
      return [C + r * Math.cos(a), C + r * Math.sin(a)];
    };
    const laHomNay = x.j === jdHomNay();
    const gioNay = Math.floor(((new Date().getHours() + 1) % 24) / 2);
    let mang = "";
    x.gio.forEach((g, i) => {
      const a0 = i * 30 - 15, a1 = i * 30 + 15;
      const [x0, y0] = cuc(R1, a0), [x1, y1] = cuc(R1, a1);
      const [x2, y2] = cuc(R0, a1), [x3, y3] = cuc(R0, a0);
      const d = `M${x0.toFixed(1)} ${y0.toFixed(1)} A${R1} ${R1} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} A${R0} ${R0} 0 0 0 ${x3.toFixed(1)} ${y3.toFixed(1)} Z`;
      const [tx, ty] = cuc(126, i * 30), [kx, ky] = cuc(92, i * 30);
      const dang = laHomNay && i === gioNay;
      mang += `<g class="mui ${g.hd ? "hd" : "hac"}${dang ? " dang" : ""}">
        <path d="${d}"><title>Giờ ${g.chi} (${g.khung}h) — ${g.hd ? "hoàng đạo" : "hắc đạo"}</title></path>
        <text x="${tx.toFixed(1)}" y="${(ty + 5).toFixed(1)}" class="chi">${g.chi}</text>
        <text x="${kx.toFixed(1)}" y="${(ky + 3.5).toFixed(1)}" class="khung">${g.khung}</text>
      </g>`;
    });
    const tot = x.gio.filter(g => g.hd);
    $("mat-gio").innerHTML = `
      <div class="the-tieu-de"><h3>Giờ hoàng đạo</h3><span>${laHomNay ? `Đang giờ ${x.gio[gioNay].chi}` : "12 giờ can chi"}</span></div>
      <svg class="dia" viewBox="0 0 340 340" role="img" aria-label="Sáu giờ hoàng đạo: ${tot.map(g => g.chi).join(", ")}">
        <circle cx="${C}" cy="${C}" r="${R1 + 6}" class="vanh"/>
        ${mang}
        <circle cx="${C}" cy="${C}" r="${R0 - 8}" class="tam"/>
        <text x="${C}" y="${C - 6}" class="tam-so">${tot.length}</text>
        <text x="${C}" y="${C + 14}" class="tam-chu">giờ tốt</text>
      </svg>
      <div class="gio-ds">${tot.map(g => `<span><b>${g.chi}</b>${g.khung}h</span>`).join("")}</div>`;
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
      const ten = nh.map(n => n.ten).concat(le.length ? [le[0].ten] : []).join(" · ");
      if (nh.length) lop.push("co-nhac");
      o += `<button type="button" class="${lop.join(" ")}" data-jd="${j}" title="${esc(`${BAC_UI[cd.bac].t} · ${ccNgay(j)}${ten ? " · " + ten : ""}`)}">
        ${nh.length ? '<span class="o-nhac"></span>' : ""}
        <span class="o-duong">${n + 1}</span>
        <span class="o-am${am.day === 1 || am.day === 15 ? " moc" : ""}">${amTxt}</span>
        <span class="o-cham"></span>
        ${le.length ? '<span class="o-le"></span>' : ""}
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
  function veNgocHap(x) {
    const nh = x.cd.nh;
    const ds = (sao, lop) => sao.length
      ? sao.map(s => `<li class="${lop}"><b>${esc(s[0])}</b><span>${esc(s[1] || "")}</span></li>`).join("")
      : `<li class="rong">Không có sao nào chiếu.</li>`;
    $("ngoc-hap").innerHTML = `
      <div class="the-tieu-de">
        <h3>Sao Ngọc Hạp</h3>
        <span>Ngày ${x.ccNgay}, tháng ${THANG_AM[x.am.month - 1]} âm lịch</span>
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
  let nhac = docNhac(), dangSua = null, choXoa = null;
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
    const demTab = $("dem-nhac-tab"), soGan = ds.filter(x => x.j != null && x.con <= x.n.truoc).length;
    demTab.hidden = !soGan; demTab.textContent = soGan;
    $("ds-nhac").innerHTML = ds.length ? `<ul class="nhac-ds">${ds.map(({ n, j, con }) => {
      const t = j == null ? null : ttNgay(j), dn = j == null ? null : soNam(n, j);
      return `<li class="nhac-muc l-${n.loai}${con <= n.truoc ? " gan" : ""}${dangSua === n.id ? " dang-sua" : ""}">
        <button type="button" class="nhac-con" ${j == null ? "disabled" : `data-jd="${j}"`} title="Xem ngày này">
          <b>${con === 0 ? "Hôm nay" : con === 1 ? "Mai" : con > 999 ? "—" : con}</b><span>${con > 1 && con <= 999 ? "ngày nữa" : "&nbsp;"}</span>
        </button>
        <div class="nhac-nd">
          <div class="nhac-ten">${esc(n.ten)} <em>${LOAI[n.loai].ten}</em></div>
          <div class="nhac-ngay">Hằng năm ngày <b>${ngayGoc(n)}</b>${t ? ` · lần tới ${THU[thuCuaJd(j)]} ${hai(t.dd)}/${hai(t.mm)}/${t.yy}${LOAI[n.loai].lich === "duong" ? ` (${t.am.day}/${t.am.month} âm)` : ""}` : ""}</div>
          ${dn || n.ghi ? `<div class="nhac-phu">${[dn, n.ghi && esc(n.ghi)].filter(Boolean).join(" · ")}</div>` : ""}
        </div>
        <div class="nhac-tac">
          <button type="button" data-sua="${esc(n.id)}">Sửa</button>
          <button type="button" class="${choXoa === n.id ? "chac" : ""}" data-xoa="${esc(n.id)}">${choXoa === n.id ? "Bấm lần nữa để xoá" : "Xoá"}</button>
        </div>
      </li>`;
    }).join("")}</ul>` : `<div class="nhac-trong"><b>Chưa có lời nhắc nào</b>Thêm ngày giỗ, sinh nhật hoặc sự kiện ở khung bên trái. Lời nhắc sẽ hiện trên tờ lịch, lịch tháng và dải báo đầu trang khi sắp đến ngày.</div>`;

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
    $("n-mo").textContent = mo ? "Đóng khung nhập" : "＋ Thêm lời nhắc";
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
    $("n-mo").addEventListener("click", () => moForm(!$("nhac").classList.contains("mo-form")));
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
    $("ds-nhac").addEventListener("click", e => {
      const b = e.target.closest("[data-sua],[data-xoa]");
      if (!b) return;
      if (b.dataset.sua) {
        const n = nhac.find(x => x.id === b.dataset.sua);
        choXoa = null;
        if (n) { napForm(n); veNhac(); }
      } else if (choXoa === b.dataset.xoa) {
        nhac = nhac.filter(x => x.id !== choXoa);
        if (dangSua === choXoa) xoaForm();
        choXoa = null; luuNhac(); ve();
      } else { choXoa = b.dataset.xoa; veNhac(); }
    });
    $("n-xuat").addEventListener("click", () => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify({ ung_dung: "lich-phap", phien: 1, nhac }, null, 2)], { type: "application/json" }));
      const t = ttNgay(jdHomNay());
      a.download = `nhac-ngay-${t.yy}${hai(t.mm)}${hai(t.dd)}.json`;
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
        luuNhac(); ve();
        $("n-loi").textContent = `Đã nhập ${them.length} lời nhắc mới${ds.length - them.length ? `, bỏ qua ${ds.length - them.length} mục trùng hoặc không hợp lệ` : ""}.`;
      } catch (err) {
        $("n-loi").textContent = "Tệp không đọc được: không phải tệp nhắc ngày của Lịch Pháp.";
      }
    });
    datNhanForm();
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
    $("o-ngay").value = `${x.yy}-${hai(x.mm)}-${hai(x.dd)}`;
    document.title = `${hai(x.dd)}/${hai(x.mm)}/${x.yy} · ${x.am.day}/${x.am.month} âm · Lịch Pháp`;
  }

  const JD_MIN = jdFromDate(1, 1, 1900), JD_MAX = jdFromDate(31, 12, 2199);
  function den(j) {
    const cu = st.jd;
    st.jd = Math.min(JD_MAX, Math.max(JD_MIN, j));
    const huong = Math.sign(st.jd - cu);
    const toCu = chupToCu(huong);
    ve();
    dienHieuUng(huong, toCu);
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
    const b = e.target.closest("[data-buoc],[data-jd],[data-thang],[data-viec],[data-tab]");
    if (!b) return;
    if (b.dataset.tab) doiTab(b.dataset.tab);
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
    if (e.key === "ArrowLeft") den(st.jd - 1);
    else if (e.key === "ArrowRight") den(st.jd + 1);
  });

  ganNhac();
  ganTab();
  ganChieuCao();
  ve();
  ganNghieng();
  ganVuot();
  requestAnimationFrame(khungHinh);
})();
