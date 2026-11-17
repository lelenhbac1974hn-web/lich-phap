/* LỄ TẾT — dữ liệu mô tả và "thiệp" hiện khi nhấn giữ ngày lễ trên tờ lịch.
   Khoá: "am:ngày-tháng" (âm lịch), "duong:ngày-tháng" (dương lịch), "dac:..." (ngày đặc biệt).
   © 2026 Lê Lệnh Bắc */
(function () {
  "use strict";

  const LE_TET = {
    "am:1-1": {
      ten: "Tết Nguyên Đán", han: "元旦", nghi: true, bieu: "🧧", hat: ["🌸", "🌸", "🌼", "🧧"], kieu: "roi", phao: true,
      nen: ["#C8261C", "#7A0F0A"],
      tomTat: "Tết của năm mới âm lịch — lễ lớn nhất trong năm, lúc gia đình sum họp, tiễn năm cũ, đón năm mới và tưởng nhớ tổ tiên.",
      phongTuc: ["Cúng giao thừa, đón ông Công ông Táo về", "Xông đất đầu năm, chúc Tết, mừng tuổi lì xì", "Mùng Một Tết cha, mùng Hai Tết mẹ, mùng Ba Tết thầy", "Hái lộc, đi lễ chùa đầu năm"],
      monAn: ["Bánh chưng, bánh tét", "Dưa hành, thịt đông", "Giò lụa, mứt Tết", "Mâm ngũ quả"],
      ca: "Thịt mỡ, dưa hành, câu đối đỏ\nCây nêu, tràng pháo, bánh chưng xanh"
    },
    "am:2-1": { cung: "am:1-1", ten: "Mùng Hai Tết" },
    "am:3-1": { cung: "am:1-1", ten: "Mùng Ba Tết" },
    "am:7-1": {
      ten: "Khai hạ — Hạ cây nêu", han: "開賀", bieu: "🎋", hat: ["🎋", "🌸"], kieu: "roi",
      nen: ["#2E7D4F", "#14452B"],
      tomTat: "Ngày mùng Bảy tháng Giêng: hạ cây nêu dựng từ 23 tháng Chạp, khép lại những ngày Tết, mọi người trở lại làm ăn.",
      phongTuc: ["Hạ cây nêu, làm lễ tạ", "Lễ khai hạ cầu một năm làm ăn thuận lợi"],
      monAn: ["Mâm cơm cúng tạ"]
    },
    "am:15-1": {
      ten: "Tết Nguyên Tiêu — Rằm tháng Giêng", han: "元宵", bieu: "🏮", hat: ["🏮", "✨", "🏮"], kieu: "bay", trang: true,
      nen: ["#B3261E", "#3A0C2E"],
      tomTat: "Đêm rằm đầu tiên của năm mới. Dân gian có câu “Lễ Phật quanh năm không bằng rằm tháng Giêng”.",
      phongTuc: ["Đi lễ chùa cầu an đầu năm", "Thắp đèn lồng, thả hoa đăng", "Ngắm trăng, làm thơ (Tết thơ)"],
      monAn: ["Bánh trôi, bánh chay", "Mâm cỗ chay hoặc cỗ mặn cúng gia tiên"]
    },
    "am:3-3": {
      ten: "Tết Hàn thực", han: "寒食", bieu: "🍡", hat: ["⚪", "🍡", "⚪"], kieu: "bay",
      nen: ["#C77B3B", "#5A2F12"],
      tomTat: "Ngày mùng Ba tháng Ba âm lịch, gắn với tích Giới Tử Thôi. Người Việt làm bánh trôi, bánh chay dâng tổ tiên.",
      phongTuc: ["Nặn bánh trôi, bánh chay cúng gia tiên", "Ngày “ăn đồ nguội” theo tích xưa"],
      monAn: ["Bánh trôi nước nhân đường phên", "Bánh chay rắc vừng"]
    },
    "am:10-3": {
      ten: "Giỗ Tổ Hùng Vương", han: "雄王", nghi: true, bieu: "🥁", hat: ["🌾", "🥁", "🌾"], kieu: "roi",
      nen: ["#8A5A12", "#3D2405"],
      tomTat: "Ngày tưởng nhớ các Vua Hùng dựng nước. Lễ chính tổ chức tại Đền Hùng (Phú Thọ); người lao động được nghỉ làm.",
      phongTuc: ["Dâng hương tại Đền Hùng", "Rước kiệu, đánh trống đồng, hát xoan"],
      monAn: ["Bánh chưng, bánh giầy — tích Lang Liêu"],
      ca: "Dù ai đi ngược về xuôi\nNhớ ngày giỗ Tổ mùng mười tháng ba"
    },
    "am:15-4": {
      ten: "Lễ Phật Đản", han: "佛誕", bieu: "🪷", hat: ["🪷", "✨", "🪷"], kieu: "bay",
      nen: ["#C97A9B", "#4A1F3A"],
      tomTat: "Kỷ niệm ngày Đức Phật Thích Ca đản sinh, rằm tháng Tư âm lịch.",
      phongTuc: ["Đi chùa, tắm Phật", "Thả hoa đăng, phóng sinh", "Ăn chay, làm việc thiện"],
      monAn: ["Cỗ chay"]
    },
    "am:5-5": {
      ten: "Tết Đoan Ngọ", han: "端午", bieu: "🍑", hat: ["🍃", "🍑", "🌿"], kieu: "roi",
      nen: ["#3F8F5B", "#163A24"],
      tomTat: "Ngày mùng Năm tháng Năm, còn gọi là Tết diệt sâu bọ: ăn hoa quả chua, uống rượu nếp để trừ sâu bệnh giữa mùa hè.",
      phongTuc: ["“Giết sâu bọ” ngay khi ngủ dậy", "Hái lá thuốc vào giờ Ngọ", "Nhuộm móng tay, đeo chỉ ngũ sắc cho trẻ"],
      monAn: ["Rượu nếp cái hoa vàng", "Mận, vải, dưa hấu", "Bánh tro (miền Nam, miền Trung)"]
    },
    "am:15-7": {
      ten: "Lễ Vu Lan — Rằm tháng Bảy", han: "盂蘭", bieu: "🌹", hat: ["🌹", "🕯️", "🌸"], kieu: "roi",
      nen: ["#9E1D3D", "#2E0B1A"],
      tomTat: "Mùa báo hiếu cha mẹ, gắn với tích Mục Kiền Liên cứu mẹ. Cũng là ngày xá tội vong nhân.",
      phongTuc: ["Cài hoa hồng lên áo: hồng đỏ còn mẹ, hồng trắng mất mẹ", "Đi chùa cầu siêu, báo hiếu", "Cúng chúng sinh, thả hoa đăng"],
      monAn: ["Cỗ chay", "Cháo trắng, bỏng ngô cúng chúng sinh"],
      ca: "Công cha như núi Thái Sơn\nNghĩa mẹ như nước trong nguồn chảy ra"
    },
    "am:15-8": {
      ten: "Tết Trung Thu", han: "中秋", bieu: "🏮", hat: ["🏮", "⭐", "🏮"], kieu: "bay", trang: true,
      nen: ["#C9771F", "#2A1B4A"],
      tomTat: "Rằm tháng Tám, trăng sáng tròn nhất năm — Tết của thiếu nhi với rước đèn, phá cỗ, xem múa lân.",
      phongTuc: ["Rước đèn ông sao, đèn kéo quân", "Múa lân, phá cỗ trông trăng", "Kể chuyện chú Cuội, chị Hằng"],
      monAn: ["Bánh nướng, bánh dẻo", "Bưởi, hồng, cốm"],
      ca: "Thằng Cuội ngồi gốc cây đa\nĐể trâu ăn lúa gọi cha ời ời"
    },
    "am:9-9": {
      ten: "Tết Trùng Cửu", han: "重九", bieu: "🌼", hat: ["🌼", "🍂"], kieu: "roi",
      nen: ["#C9A227", "#5A4208"],
      tomTat: "Ngày mùng Chín tháng Chín — hai số dương trùng nhau. Người xưa lên cao ngắm cảnh, uống rượu hoa cúc cầu sống lâu.",
      phongTuc: ["Lên cao, ngắm cảnh thu", "Thưởng hoa cúc, uống rượu cúc"],
      monAn: ["Rượu hoa cúc", "Bánh hoa cúc"]
    },
    "am:10-10": {
      ten: "Tết Trùng Thập — Tết Cơm mới", han: "重十", bieu: "🍚", hat: ["🌾", "🍚", "🌾"], kieu: "roi",
      nen: ["#B5862A", "#4A3410"],
      tomTat: "Mùng Mười tháng Mười, sau vụ gặt mùa: dâng cơm gạo mới lên tổ tiên, tạ ơn trời đất.",
      phongTuc: ["Cúng cơm mới gia tiên", "Thầy thuốc làm lễ tưởng nhớ tổ nghề"],
      monAn: ["Cơm gạo mới", "Xôi, chè, bánh dày"]
    },
    "am:15-10": {
      ten: "Tết Hạ Nguyên — Rằm tháng Mười", han: "下元", bieu: "🌕", hat: ["✨", "🕯️"], kieu: "bay", trang: true,
      nen: ["#5A4A8A", "#1C1638"],
      tomTat: "Một trong ba ngày rằm lớn (Thượng Nguyên, Trung Nguyên, Hạ Nguyên). Nhiều nơi làm lễ mừng lúa mới.",
      phongTuc: ["Đi chùa lễ Phật", "Cúng gia tiên"],
      monAn: ["Xôi, chè", "Mâm cơm gạo mới"]
    },
    "am:23-12": {
      ten: "Ông Công Ông Táo chầu trời", han: "灶君", bieu: "🐟", hat: ["🐟", "✨", "🐟"], kieu: "bay",
      nen: ["#C25A1F", "#4A1A06"],
      tomTat: "Ngày tiễn Táo Quân về trời báo cáo việc nhà một năm. Cá chép là phương tiện đưa ông Táo lên trời.",
      phongTuc: ["Cúng ông Công ông Táo trước giờ Ngọ", "Thả cá chép ra sông, hồ", "Dựng cây nêu, dọn dẹp nhà đón Tết"],
      monAn: ["Mâm cỗ cúng", "Mũ ông Công, áo, hia vàng mã", "Cá chép sống"]
    },
    "dac:giaothua": {
      ten: "Giao thừa — Tất niên", han: "除夕", nghi: true, bieu: "🎆", hat: ["✨", "🌸", "🎇"], kieu: "bay", phao: true,
      nen: ["#2A0F3A", "#7A0F0A"],
      tomTat: "Ngày cuối cùng của năm âm lịch. Khoảnh khắc nửa đêm là lúc tiễn năm cũ, đón năm mới.",
      phongTuc: ["Cúng tất niên, cúng giao thừa ngoài trời và trong nhà", "Đón giao thừa, xem pháo hoa", "Hái lộc đầu năm"],
      monAn: ["Mâm cỗ tất niên", "Bánh chưng, xôi gấc, gà luộc"]
    },
    "dac:thanhminh": {
      ten: "Tiết Thanh minh — Tảo mộ", han: "清明", bieu: "🌿", hat: ["🌿", "🌸", "🍃"], kieu: "roi",
      nen: ["#4F8F6A", "#1B3A2A"],
      tomTat: "Tiết trời trong sáng đầu tháng Ba âm lịch. Con cháu đi tảo mộ: sửa sang, thắp hương mộ phần tổ tiên.",
      phongTuc: ["Tảo mộ, sửa sang phần mộ", "Thắp hương tưởng nhớ tổ tiên"],
      monAn: ["Mâm cỗ cúng gia tiên"],
      ca: "Thanh minh trong tiết tháng ba\nLễ là tảo mộ, hội là đạp thanh"
    },
    "dac:ram": {
      ten: "Ngày Rằm — ngày Vọng", han: "望", bieu: "🌕", hat: ["✨", "⭐"], kieu: "bay", trang: true,
      nen: ["#3A3F8A", "#121533"],
      tomTat: "Ngày 15 âm lịch, trăng tròn. Nhiều gia đình thắp hương gia tiên, đi chùa, ăn chay.",
      phongTuc: ["Thắp hương bàn thờ gia tiên, thần tài", "Đi chùa lễ Phật", "Ăn chay, làm việc thiện"],
      monAn: ["Hoa tươi, quả, nước"]
    },
    "dac:mot": {
      ten: "Mồng Một — ngày Sóc", han: "朔", bieu: "🌑", hat: ["✨", "⭐"], kieu: "bay",
      nen: ["#2B2F4A", "#0D0F1C"],
      tomTat: "Ngày đầu tháng âm lịch, trăng non. Mong một tháng mới bình an, thuận lợi.",
      phongTuc: ["Thắp hương gia tiên đầu tháng", "Kiêng nói điều xui, giữ hòa khí", "Đi chùa cầu an"],
      monAn: ["Hoa tươi, quả, nước"]
    },
    "duong:1-1": {
      ten: "Tết Dương lịch", han: "", nghi: true, bieu: "🎆", hat: ["✨", "🎉"], kieu: "bay", phao: true,
      nen: ["#1E4F7A", "#0B1A2E"],
      tomTat: "Ngày đầu năm theo lịch dương. Người lao động được nghỉ một ngày.",
      phongTuc: ["Đón năm mới, xem pháo hoa", "Đặt mục tiêu cho năm mới"],
      monAn: []
    },
    "duong:30-4": {
      ten: "Ngày Giải phóng miền Nam, thống nhất đất nước", han: "", nghi: true, bieu: "🇻🇳", hat: ["🇻🇳", "🕊️", "✨"], kieu: "bay", phao: true,
      nen: ["#C8261C", "#5A0A06"],
      tomTat: "Ngày 30/4/1975, chiến dịch Hồ Chí Minh toàn thắng, đất nước thống nhất. Người lao động được nghỉ.",
      phongTuc: ["Treo cờ Tổ quốc", "Diễu binh, mít tinh kỷ niệm (năm chẵn)"],
      monAn: []
    },
    "duong:1-5": {
      ten: "Ngày Quốc tế Lao động", han: "", nghi: true, bieu: "🛠️", hat: ["🌷", "✨"], kieu: "bay",
      nen: ["#B5402A", "#4A140A"],
      tomTat: "Ngày tôn vinh người lao động trên toàn thế giới. Ở Việt Nam, người lao động được nghỉ, thường liền với 30/4.",
      phongTuc: ["Treo cờ", "Nghỉ ngơi, du lịch cùng gia đình"],
      monAn: []
    },
    "duong:2-9": {
      ten: "Quốc khánh nước CHXHCN Việt Nam", han: "", nghi: true, bieu: "🇻🇳", hat: ["🇻🇳", "⭐", "✨"], kieu: "bay", phao: true,
      nen: ["#D0281D", "#6B0F0A"],
      tomTat: "Ngày 2/9/1945, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình. Người lao động được nghỉ hai ngày.",
      phongTuc: ["Treo cờ Tổ quốc", "Mít tinh, diễu binh, bắn pháo hoa"],
      monAn: [],
      ca: "“Nước Việt Nam có quyền hưởng tự do và độc lập”\n— Tuyên ngôn Độc lập, 1945"
    },
    "duong:24-11": {
      ten: "Ngày Văn hóa Việt Nam", han: "", nghi: true, bieu: "🎭", hat: ["🎭", "📜", "🪕"], kieu: "bay",
      nen: ["#8A1B15", "#2E0A07"],
      tomTat: "Ngày tôn vinh văn hóa Việt Nam, gắn với Hội nghị Văn hóa toàn quốc lần thứ nhất ngày 24/11/1946 do Chủ tịch Hồ Chí Minh chủ trì.",
      phongTuc: ["Hoạt động văn hóa, nghệ thuật", "Tham quan bảo tàng, di tích"],
      monAn: []
    }
  };

  /* Ngày lễ của một ngày → danh sách khoá thiệp */
  /* Khoá thiệp của một mục lễ (null nếu không có thiệp) */
  function khoaCuaLe(l, am, dd, mm) {
    if (l.loai === "am") {
      if (/^Giao thừa/.test(l.ten)) return "dac:giaothua";
      return !am.leap && LE_TET[`am:${am.day}-${am.month}`] ? `am:${am.day}-${am.month}` : null;
    }
    if (l.loai === "duong") return LE_TET[`duong:${dd}-${mm}`] ? `duong:${dd}-${mm}` : null;
    if (l.loai === "ram") return am.day === 15 ? "dac:ram" : "dac:mot";
    return null;
  }
  const laLeLon = k => k && k !== "dac:ram" && k !== "dac:mot";
  const layThiep = khoa => { const d = LE_TET[khoa]; return d && d.cung ? { ...LE_TET[d.cung], ten: d.ten, khoaGoc: d.cung } : d; };

  /* ── Thiệp hiện khi nhấn giữ ── */
  let lop = null, ve = null, henHat = 0;
  const giam = window.matchMedia("(prefers-reduced-motion: reduce)");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function moThiep(khoa, dongNgay) {
    const d = layThiep(khoa);
    if (!d) return;
    dongThiep(true);
    lop = document.createElement("div");
    lop.className = "thiep-lop";
    lop.setAttribute("role", "dialog");
    lop.setAttribute("aria-modal", "true");
    lop.setAttribute("aria-label", d.ten);
    lop.style.setProperty("--n1", d.nen[0]); lop.style.setProperty("--n2", d.nen[1]);
    const ds = (tieu, arr) => arr && arr.length ? `<section><h4>${tieu}</h4><ul>${arr.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>` : "";
    lop.innerHTML = `
      <canvas class="thiep-hat" aria-hidden="true"></canvas>
      <article class="thiep${d.trang ? " co-trang" : ""}">
        <button type="button" class="thiep-dong" aria-label="Đóng">✕</button>
        <div class="thiep-dau">
          ${d.trang ? '<div class="thiep-trang" aria-hidden="true"></div>' : ""}
          ${d.han ? `<div class="thiep-han" aria-hidden="true">${esc(d.han)}</div>` : ""}
          <div class="thiep-bieu" aria-hidden="true">${d.bieu}</div>
          <h3>${esc(d.ten)}</h3>
          <p class="thiep-ngay">${esc(dongNgay || "")}${d.nghi ? ' <span class="thiep-nghi">Ngày nghỉ</span>' : ""}</p>
        </div>
        <div class="thiep-than">
          <p class="thiep-tom">${esc(d.tomTat)}</p>
          ${ds("Phong tục", d.phongTuc)}
          ${ds("Mâm cỗ · món ăn", d.monAn)}
          ${d.ca ? `<blockquote class="thiep-ca">${esc(d.ca).replace(/\n/g, "<br>")}</blockquote>` : ""}
        </div>
      </article>`;
    document.body.appendChild(lop);
    requestAnimationFrame(() => lop.classList.add("hien"));
    lop.addEventListener("click", e => { if (e.target === lop || e.target.closest(".thiep-dong")) dongThiep(); });
    let y0 = null;
    lop.addEventListener("touchstart", e => { y0 = e.touches[0].clientY; }, { passive: true });
    lop.addEventListener("touchend", e => { if (y0 != null && e.changedTouches[0].clientY - y0 > 90 && lop.querySelector(".thiep").scrollTop <= 0) dongThiep(); y0 = null; }, { passive: true });
    document.addEventListener("keydown", phimDong);
    if (navigator.vibrate) navigator.vibrate(12);
    if (!giam.matches) chayHat(lop.querySelector(".thiep-hat"), d);
  }
  function phimDong(e) { if (e.key === "Escape") dongThiep(); }
  function dongThiep(ngay) {
    document.removeEventListener("keydown", phimDong);
    if (ve) { cancelAnimationFrame(ve); ve = null; }
    clearTimeout(henHat);
    const l = lop; lop = null;
    if (!l) return;
    if (ngay) { l.remove(); return; }
    l.classList.remove("hien"); l.classList.add("dong");
    setTimeout(() => l.remove(), 380);
  }

  /* Hạt bay theo chủ đề (emoji) + pháo hoa */
  function chayHat(cv, d) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const kich = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
    kich();
    const c = cv.getContext("2d");
    const W = () => cv.width / dpr, H = () => cv.height / dpr;
    const ngau = (a, b) => a + Math.random() * (b - a);
    const bay = d.kieu === "bay";
    const hat = Array.from({ length: 22 }, (_, i) => taoHat(true));
    function taoHat(dau) {
      return { x: ngau(0, W()), y: dau ? ngau(0, H()) : (bay ? H() + 30 : -30), r: ngau(16, 30), vy: bay ? ngau(-46, -22) : ngau(28, 60),
        vx: ngau(-10, 10), goc: ngau(-0.5, 0.5), vg: ngau(-0.6, 0.6), pha: ngau(0, 6.28), e: d.hat[Math.floor(Math.random() * d.hat.length)], a: ngau(0.55, 0.95) };
    }
    const phao = [];
    function banPhao() {
      const x = ngau(W() * 0.15, W() * 0.85), y = ngau(H() * 0.12, H() * 0.38);
      const mau = ["#FFD36B", "#FF7A6B", "#FFFFFF", "#9FE3B6", "#FFB3D1"][Math.floor(Math.random() * 5)];
      for (let i = 0; i < 46; i++) { const g = (i / 46) * 6.283, v = ngau(70, 150); phao.push({ x, y, vx: Math.cos(g) * v, vy: Math.sin(g) * v, t: 0, song: ngau(1.1, 1.7), mau }); }
      henHat = setTimeout(banPhao, ngau(700, 1400));
    }
    if (d.phao) henHat = setTimeout(banPhao, 350);
    let truoc = performance.now();
    function khung(bay2) {
      ve = requestAnimationFrame(khung);
      if (cv.width !== innerWidth * dpr) kich();
      const dt = Math.min(0.05, (bay2 - truoc) / 1000); truoc = bay2;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W(), H());
      c.textAlign = "center"; c.textBaseline = "middle";
      for (let i = 0; i < hat.length; i++) {
        const p = hat[i];
        p.x += (p.vx + Math.sin(bay2 / 900 + p.pha) * 14) * dt; p.y += p.vy * dt; p.goc += p.vg * dt;
        if (p.y < -40 || p.y > H() + 40) hat[i] = taoHat(false);
        c.save(); c.globalAlpha = p.a; c.translate(p.x, p.y); c.rotate(p.goc);
        c.font = `${p.r}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
        c.fillText(p.e, 0, 0); c.restore();
      }
      for (let i = phao.length - 1; i >= 0; i--) {
        const p = phao[i]; p.t += dt;
        if (p.t > p.song) { phao.splice(i, 1); continue; }
        p.vy += 60 * dt; p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt;
        c.globalAlpha = 1 - p.t / p.song; c.fillStyle = p.mau;
        c.beginPath(); c.arc(p.x, p.y, 2.2, 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
    }
    ve = requestAnimationFrame(khung);
  }

  window.LE_TET = LE_TET;
  window.ThiepLe = { mo: moThiep, dong: dongThiep, khoaCuaLe, laLeLon, layThiep };
})();
