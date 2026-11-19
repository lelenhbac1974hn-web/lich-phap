/* Lịch Pháp © 2026 Lê Lệnh Bắc. Bảo lưu mọi quyền. Bản chính thức, miễn phí: https://lelenhbac1974hn-web.github.io/lich-phap/ — cấm đưa lên chợ ứng dụng, bán hay phát hành lại khi chưa được phép (xem LICENSE). */
/* LUẬN NGÀY THEO SÁCH — xét ngày theo đúng thứ tự Ngọc Hạp Thông Thư dạy, mỗi lý do kèm số trang.
   Dữ liệu: luan-giai.js (quy tắc chương luận giải), ngoc-hap.js (sao, nghĩa, nên, kỵ), lich-phap.js (âm lịch, can chi, trực, thần ngày).
   Cách xếp mức (5 bậc như kiểu cộng sao):
     0 Rất xấu  — phạm một trong sáu ngày "sao tốt không cứu được" (TT tr.9), hoặc ngày sách ghi kiêng mọi việc / đại hung cho việc này;
     1 Xấu      — phạm quy tắc kiêng của việc này, hoặc sao xấu kỵ việc này nhiều hơn sao tốt hợp việc này (không có Giải thần giải);
     2–4        — không phạm kiêng: xét hoàng đạo, trực tốt (TT tr.153–154), sao tốt hợp việc, quy tắc tốt theo việc;
                  sao xấu nhẹ (TT tr.11) chỉ bị trừ khi không có sao tốt gánh đỡ. */
(function () {
  "use strict";
  const MUA = m => m <= 3 ? "xuân" : m <= 6 ? "hạ" : m <= 9 ? "thu" : "đông";
  /* Từ khoá việc để đọc phần "nên / kỵ" của từng sao trong CSDL */
  const TU_VIEC = {
    dongtho: ["động thổ", "làm nhà", "xây", "khởi tạo", "khởi công", "dựng", "lợp", "đào", "sửa", "tu tạo", "tạo tác", "đặt cây nóc", "làm kho"],
    kyket: ["giao dịch", "ký", "hợp đồng", "buôn bán", "cầu tài", "mua bán", "kiện"],
    khaitruong: ["khai trương", "mở cửa hàng", "mở hàng", "buôn bán", "cầu tài", "nhập kho", "giao dịch", "tài lộc"],
    xuathanh: ["xuất hành", "đi xa", "di chuyển", "rời chỗ ở", "đi lại"],
    cuoihoi: ["cưới", "giá thú", "hôn nhân", "gả", "lấy vợ", "lấy chồng", "ăn hỏi", "trầu cau", "nạp thái"],
    nhaptrach: ["nhập trạch", "về nhà mới", "nhà mới", "nhập thất", "di cư", "rời chỗ ở", "dời nhà"]
  };
  const MOI_VIEC = /mọi việc|trăm việc|bách sự/i;
  const ghep = t => t.toLowerCase();
  function hopViec(ds, viec) {
    const s = ghep((ds || []).join(" · "));
    if (MOI_VIEC.test(s)) return true;
    return viec !== "chung" && (TU_VIEC[viec] || []).some(k => s.includes(k));
  }
  let SAO = null;
  function saoCSDL() {
    if (!SAO) { SAO = new Map(); (window.NGOC_HAP_CSDL ? window.NGOC_HAP_CSDL.sao : []).forEach(s => (s.ct || []).forEach(t => SAO.set(t, s))); }
    return SAO;
  }
  /* Ngày có khớp một quy tắc không */
  function khop(q, n) {
    const b = q.bang;
    switch (q.kieu) {
      case "thang": return (b[n.thang] || []).some(v => khopSao(v, n.can, n.chi));
      case "ngayam": return (b[n.thangSo] || []).some(v => Number(v) === n.ngay);
      case "canchi": return b.includes(n.canChi);
      case "thangcanchi": return (b[n.thang] || []).includes(n.canChi);
      case "xichkhau": return (n.ngay + n.thangSo) % 6 === 4;   // Xích khẩu: T1 mùng 3, 9…; T2 mùng 2, 8…
      case "nam": return (b[n.canNam] || []).some(x => x.thang === n.thang && x.ngay === n.canChi);
      case "tiet": {
        const doi = n.tietMai !== n.tiet;
        if (doi && b.tu_ly.truoc_tiet.includes(n.tietMai)) return "Tứ ly (trước " + n.tietMai + " một ngày)";
        if (doi && b.tu_tuyet.truoc_tiet.includes(n.tietMai)) return "Tứ tuyệt (trước " + n.tietMai + " một ngày)";
        return false;
      }
    }
    return false;
  }
  const trangTT = tr => "TT tr." + (tr || []).join(", ");

  /* Thông tin ngày để khớp quy tắc. thang = tháng tra bảng theo địa chi (tháng nhuận chia đôi, thangAnSao — Chánh Tông tr.90);
     thangSo = số tháng âm, dùng cho quy tắc tính theo mùng (Dương công, con nước…) */
  function thongTinNgay(j, am) {
    const can = CAN[(j + 9) % 10], chi = CHI[(j + 1) % 12];
    return { thang: thangAnSao(am), thangSo: am.month, ngay: am.day, can, chi, canChi: can + " " + chi,
      canNam: CAN[(am.year + 6) % 10], tiet: tietKhi(j), tietMai: tietKhi(j + 1) };
  }
  /* Sáu ngày đại kỵ (Thụ tử, Sát chủ, Tam nương, Nguyệt kỵ, Dương công kỵ, con nước): sách dạy sao tốt không cứu được.
     Dùng chung cho cả hai kiểu luận để hai kiểu không bao giờ nói ngược nhau ở những ngày này. */
  function ngayDaiKy(j, am) {
    const LG = window.LUAN_GIAI, n = thongTinNgay(j, am);
    return LG.quyTac.filter(q => LG.khongCuu.ds.includes(q.id) && khop(q, n)).map(q => q.ten.split(" (")[0]);
  }
  /* ── Lớp nâng cao: xét tuổi người (cưới hỏi: trai và gái; nhập trạch: gia chủ) ──
     nguoi = { trai, gai, giaChu } là năm sinh âm lịch; tuổi tính theo tuổi mụ (năm âm của ngày xét − năm sinh + 1).
     Trả về các điều tốt / kiêng / nhắc để gộp vào luận theo sách. Bảng ở LUAN_GIAI.tuoi (luan-giai-bo-sung.json). */
  const chiNam = y => CHI[(y + 8) % 12];
  const ccNamSinh = y => CAN[(y + 6) % 10] + " " + chiNam(y);
  function chuDuong(j, am, T) {
    const dauThang = j - am.day + 1, du = amCuaJd(dauThang + 29).day === 30, v = T.vong;
    const i0 = v.indexOf(du ? T.khoiDu : T.khoiThieu), buoc = (am.day - 1) % 8;
    return v[((i0 + (du ? buoc : -buoc)) % 8 + 8) % 8];
  }
  function xetTuoi(j, am, viecId, nguoi, LG) {
    const T = LG.tuoi, tot = [], kieng = [], nhac = [], tr = s => "(" + s + ")";
    if (!T) return { tot, kieng, nhac, thieu: true };
    nguoi = nguoi || {};
    const nam = am.year, chiN = chiNam(nam), canChiNgay = CAN[(j + 9) % 10] + " " + CHI[(j + 1) % 12];
    const xung = (y, ai) => { if (y && (T.xungTuoi.bang[ccNamSinh(y)] || []).includes(canChiNgay)) kieng.push({ t: `Ngày ${canChiNgay} xung tuổi ${ai} (${ccNamSinh(y)})`, muc: "hung", trang: T.xungTuoi.trang }); };
    const tamTai = (y, ai) => { if (y && (T.tamTai[chiNam(y)] || []).includes(chiN)) kieng.push({ t: `Năm ${chiN}: ${ai} tuổi ${chiNam(y)} gặp Tam tai — tránh việc lớn mới khởi`, muc: "hung", trang: T.tamTai.trang }); };
    if (viecId === "cuoihoi") {
      /* Châu đường không cần tuổi: chỉ luận tháng đủ thiếu, không luận tiết khí */
      const cd = chuDuong(j, am, T.chuDuong);
      if (T.chuDuong.tot.includes(cd)) tot.push({ t: `Châu đường ngày cưới rơi chữ ${cd} — tốt`, muc: "cat", nd: 1, trang: T.chuDuong.trang });
      else if (T.chuDuong.chanhKy.includes(cd)) kieng.push({ t: `Châu đường ngày cưới rơi chữ ${cd} — chánh kỵ`, muc: "hung", trang: T.chuDuong.trang });
      else nhac.push({ t: `Châu đường rơi chữ ${cd} — kỵ nếu còn cha mẹ chồng`, trang: T.chuDuong.trang });
      const { trai, gai } = nguoi || {};
      if (!trai && !gai) return { tot, kieng, nhac, thieu: true };
      if (gai) {
        const tuoi = nam - gai + 1;
        if (T.kimLauCuoi.donVi.includes(tuoi % 10)) kieng.push({ t: `Cô dâu ${tuoi} tuổi (tuổi mụ) phạm Kim lâu — năm nay không nên cưới`, muc: "hung", trang: T.kimLauCuoi.trang });
        if (T.hungNien.gai[chiNam(gai)] === chiN) kieng.push({ t: `Năm ${chiN} là năm hung niên của cô dâu tuổi ${chiNam(gai)}`, muc: "hung", trang: T.hungNien.trang });
        const dl = T.daiLoi[chiNam(gai)], th = am.month, k = dl ? dl.findIndex(c => c.includes(th)) : -1;
        if (k === 0) tot.push({ t: `Tháng ${th} là tháng Đại lợi của cô dâu tuổi ${chiNam(gai)}`, muc: "cat", nd: 1, trang: T.daiLoi.trang });
        else if (k >= 4) kieng.push({ t: `Tháng ${th}: ${T.daiLoi.ten[k]}`, muc: "hung", trang: T.daiLoi.trang });
        else if (k > 0) nhac.push({ t: `Tháng ${th}: ${T.daiLoi.ten[k]}`, trang: T.daiLoi.trang });
        tamTai(gai, "cô dâu"); xung(gai, "cô dâu");
      }
      if (trai) {
        if (T.hungNien.trai[chiNam(trai)] === chiN) kieng.push({ t: `Năm ${chiN} là năm hung niên của chú rể tuổi ${chiNam(trai)}`, muc: "hung", trang: T.hungNien.trang });
        tamTai(trai, "chú rể"); xung(trai, "chú rể");
      }
    } else if (viecId === "nhaptrach") {
      const y = nguoi.giaChu;
      if (!y) return { tot, kieng, nhac, thieu: true };
      const tuoi = nam - y + 1, chuc = Math.floor(tuoi / 10), dv = tuoi % 10, KL = T.kimLauNha;
      const cung = dv === 0 ? (chuc === 5 ? "Trung cung" : KL.vong[KL.chuc[chuc]]) : KL.vong[(KL.chuc[chuc] + dv) % 8];
      if (KL.pham[cung]) nhac.push({ t: `Gia chủ ${tuoi} tuổi (tuổi mụ) rơi cung ${cung}: ${KL.pham[cung]} (sách ghi cho cất nhà)`, trang: KL.trang });
      const ho = ((chuc - 1 + dv) % 6 + 6) % 6;
      if (T.hoangOc.xau.includes(ho)) nhac.push({ t: `Gia chủ ${tuoi} tuổi rơi ${T.hoangOc.cung[ho]} (Hoang ốc, sách ghi cho cất nhà)`, trang: T.hoangOc.trang });
      tamTai(y, "gia chủ"); xung(y, "gia chủ");
    }
    return { tot, kieng, nhac, thieu: false };
  }
  /* Ngày xung tuổi người đang xét — dùng chung cho Cộng sao */
  function kyTuoi(j, am, viecId) {
    const LG = window.LUAN_GIAI, x = xetTuoi(j, am, viecId, window.LP_NGUOI, LG);
    return x.kieng.filter(k => /^Ngày .* xung tuổi/.test(k.t)).map(k => k.t);
  }
  function luanTheoSach(j, am, viecId = "chung") {
    const LG = window.LUAN_GIAI;
    if (!LG) throw new Error("Chưa nạp luan-giai.js");
    const n = thongTinNgay(j, am);
    const khongCuu = [], kieng = [], tot = [], nhac = [];
    /* 1. Quy tắc trong chương luận giải */
    for (const q of LG.quyTac) {
      if (!q.viec.includes(viecId)) continue;
      const k = khop(q, n);
      if (!k) continue;
      const muc = { t: typeof k === "string" ? k : q.ten, nd: q.nd, trang: trangTT(q.trang), muc: q.muc };
      if (LG.khongCuu.ds.includes(q.id)) khongCuu.push(muc);
      else if (/hung/.test(q.muc)) kieng.push(muc);
      else tot.push(muc);
    }
    /* 2. Thần ngày hoàng đạo – hắc đạo (TT tr.45–47) và trực (TT tr.153–154) */
    const than = thanCuaNgay(j, thangAnSao(am)), truc = trucCuaNgay(j);
    if (than.hd) tot.push({ t: `Ngày hoàng đạo (${than.t})`, trang: "TT tr.45–47", muc: "cat" });
    else nhac.push({ t: `Ngày hắc đạo (${than.t})`, trang: "TT tr.45–47" });
    const trucTot = LG.trucTot.ds.includes(truc.t);
    if (trucTot) tot.push({ t: `Trực ${truc.t}`, trang: trangTT(LG.trucTot.trang), muc: "cat" });
    /* 3. Sao Ngọc Hạp của ngày, đọc "nên / kỵ" theo việc */
    const nh = saoNgocHap(j, thangAnSao(am)), m = saoCSDL();
    const giai = nh.tot.some(s => s[0] === "Giải thần");
    const nhe = new Set(LG.saoXauNhe.ds);
    const laNhe = ten => ten.split(" · ").some(t => nhe.has(t)) || [...nhe].some(t => ten.startsWith(t));
    const saoTot = [], saoXau = [], saoXauNhe = [];
    nh.tot.forEach(([ten]) => { const s = m.get(ten); if (s && hopViec((s.nen || []).concat(s.nghia ? [s.nghia] : []), viecId)) saoTot.push(ten); });
    nh.xau.forEach(([ten]) => {
      const s = m.get(ten); if (!s) return;
      if (laNhe(ten)) { saoXauNhe.push(ten); return; }
      if (hopViec((s.ky || []).concat(s.nghia ? [s.nghia] : []), viecId)) saoXau.push(ten);
    });
    if (saoTot.length) tot.push({ t: `Sao tốt hợp việc: ${saoTot.join(", ")}`, trang: "TT tr.9; bảng 12 tháng", muc: "cat" });
    if (saoXau.length && !giai) kieng.push({ t: `Sao xấu kỵ việc này: ${saoXau.join(", ")}`, trang: "TT tr.10–11; bảng 12 tháng", muc: "hung", sao: true });
    if (saoXau.length && giai) nhac.push({ t: `Có Giải thần giải trừ sao xấu: ${saoXau.join(", ")}`, trang: trangTT([9, 153]) });
    if (saoXauNhe.length) nhac.push({ t: `Sao xấu nhẹ: ${saoXauNhe.join(", ")} — ${saoTot.length || nh.tot.length ? "có sao tốt gánh đỡ" : "không có sao tốt gánh đỡ"}`, trang: trangTT(LG.saoXauNhe.trang) });
    /* 3b. Lớp nâng cao: tuổi người */
    let tuoiThieu = false;
    if (viecId === "cuoihoi" || viecId === "nhaptrach") {
      const tu = xetTuoi(j, am, viecId, window.LP_NGUOI, LG);
      tuoiThieu = tu.thieu;
      tot.push(...tu.tot); kieng.push(...tu.kieng); nhac.push(...tu.nhac);
      if (tu.thieu) nhac.push({ t: viecId === "cuoihoi" ? "Chưa nhập năm sinh chú rể, cô dâu — mới xét ngày, chưa xét tuổi" : "Chưa nhập năm sinh gia chủ — mới xét ngày, chưa xét tuổi" });
    }
    /* 4. Xếp mức */
    let bac, ket;
    const quyTacKieng = kieng.filter(k => !k.sao), daiHung = quyTacKieng.some(k => k.muc === "dai_hung");
    const catTheoViec = tot.filter(t => t.nd && t.muc && /cat/.test(t.muc)).length;
    if (khongCuu.length) { bac = 0; ket = "Phạm ngày đại kỵ — sách dạy sao tốt không cứu được (TT tr.9)"; }
    else if (daiHung) { bac = 0; ket = "Ngày sách ghi kiêng mọi việc / đại hung cho việc này"; }
    else if (quyTacKieng.length) { bac = 1; ket = "Phạm ngày kiêng của việc này"; }
    else if (kieng.length && saoXau.length > saoTot.length) { bac = 1; ket = "Sao xấu kỵ việc này nhiều hơn sao tốt hợp việc"; }
    else {
      let d = (than.hd ? 1 : 0) + (trucTot ? 1 : 0) + Math.min(saoTot.length, 2) + catTheoViec;
      if (saoXauNhe.length && !saoTot.length && !nh.tot.length) d -= 1;
      if (kieng.length) d -= 1;
      bac = d >= 4 ? 4 : d >= 2 ? 3 : 2;
      ket = bac === 4 ? "Hoàng đạo, trực tốt, có sao và quy tắc tốt cho việc này" : bac === 3 ? "Không phạm kiêng, có điều tốt cho việc này" : "Không phạm kiêng, ít điều tốt";
    }
    return { bac, ket, khongCuu, kieng, tot, nhac, than, truc, tuoiThieu };
  }
  window.luanTheoSach = luanTheoSach;
  window.ngayDaiKy = ngayDaiKy;
  window.kyTuoi = kyTuoi;
})();
