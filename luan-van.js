/* Lịch Pháp © 2026 Lê Lệnh Bắc. Bảo lưu mọi quyền. Bản chính thức, miễn phí: https://lelenhbac1974hn-web.github.io/lich-phap/ — cấm đưa lên chợ ứng dụng, bán hay phát hành lại khi chưa được phép (xem LICENSE). */
/* LỜI LUẬN NGÀY — hai tầng: (1) tầng luật: từ kết quả luận theo sách ra dàn ý có vai, có chiều (window.DAN_Y);
   (2) tầng lời: đọc dàn ý thành lời văn (window.LUAN_VAN2). Nạp sau luan-sach.js. Kiểm thử: nguon-csdl/cong-cu/hoi-quy-luan-van.js. */
(function () {
  "use strict";
  const { TEN_DOC } = window.LV_KHO;
  /* Tên quy tắc trong dữ liệu → tên đọc cho người dùng. Hai luật "Sát chủ" phụ đổi tên để khỏi lẫn với Sát chủ đại kỵ. */
  const goTen = t => { const g = String(t).replace(/ \(.*$/, "").trim(); return TEN_DOC[g] || g; };
  const VIEC_KHAC = ["dongtho", "kyket", "khaitruong", "xuathanh"];
  const tach = (ds, dau) => { const m = ds.find(x => x.t.startsWith(dau)); return m ? m.t.slice(dau.length).replace(/ — .*$/, "").split(", ").flatMap(x => x.split(" · ")).map(x => x.trim()).filter(Boolean) : []; };
  const khac = (a, daCo) => a.filter(x => !daCo.has(x) && daCo.add(x));

  function lap(j, viec = "chung") {
    const am = amCuaJd(j), ls = luanTheoSach(j, am, viec), tA = thangAnSao(am);
    const nh = saoNgocHap(j, tA), tr = trucCuaNgay(j), th = thanCuaNgay(j, tA), tu = saoCuaNgay(j);
    const daCo = new Set();                                         // mỗi tên chỉ được xuất hiện một lần trong dàn ý
    /* 1. Sáu ngày đại kỵ */
    const daiKy = khac(ls.khongCuu.map(k => goTen(k.t)), daCo);
    /* 2. Ngày kiêng theo việc: luật sách ghi đại hung / hung (không kể sao) */
    const qt = ls.kieng.filter(k => !k.sao);
    const kiengDaiHung = khac(qt.filter(k => k.muc === "dai_hung").map(k => goTen(k.t)), daCo);
    const kiengHung = khac(qt.filter(k => k.muc !== "dai_hung").map(k => goTen(k.t)), daCo);
    /* 5. Sao */
    const saoXauViec = khac(tach(ls.kieng, "Sao xấu kỵ việc này: "), daCo);
    const saoDuocGiai = khac(tach(ls.nhac, "Có Giải thần giải trừ sao xấu: "), daCo);
    const nheMuc = ls.nhac.find(k => /^Sao xấu nhẹ/.test(k.t));
    const saoXauNhe = khac(tach(ls.nhac, "Sao xấu nhẹ: "), daCo), nheCoGanh = nheMuc ? !/không có sao tốt/.test(nheMuc.t) : false;
    const saoTotHop = khac(tach(ls.tot, "Sao tốt hợp việc: "), daCo);
    const quyTacCat = khac(ls.tot.filter(t => t.nd).map(t => goTen(t.t)), daCo);
    const saoTotKhac = khac(nh.tot.flatMap(s => s[0].split(" · ")).filter(t => t !== "Giải thần"), daCo);
    /* Ý quyết định mức — đúng thứ tự xét của sách */
    let qd;
    if (daiKy.length) qd = { loai: "dai_ky", chieu: -1, ten: daiKy };
    else if (kiengDaiHung.length) qd = { loai: "kieng_dai_hung", chieu: -1, ten: kiengDaiHung };
    else if (kiengHung.length) qd = { loai: "kieng", chieu: -1, ten: kiengHung };
    else if (ls.bac === 1) qd = { loai: "sao_xau_hon", chieu: -1, ten: saoXauViec };
    else if (ls.bac >= 3) qd = { loai: "nhieu_dieu_tot", chieu: 1, ten: [] };
    else qd = { loai: "binh", chieu: 0, ten: [] };
    /* Điểm thuận, điểm nghịch (không lặp lại ý quyết định) */
    const thuan = [], nghich = [], go = [];
    if (th.hd) thuan.push({ loai: "hoang_dao", ten: [th.t] }); else nghich.push({ loai: "hac_dao", ten: [th.t] });
    if (tr.g > 0) thuan.push({ loai: "truc_tot", ten: [tr.t] }); else if (tr.g < 0) nghich.push({ loai: "truc_xau", ten: [tr.t] });
    if (saoTotHop.length) thuan.push({ loai: "sao_tot_hop", ten: saoTotHop });
    else if (saoTotKhac.length) thuan.push({ loai: "sao_tot_khac", ten: saoTotKhac.slice(0, 4) });
    if (quyTacCat.length) thuan.push({ loai: "quy_tac_cat", ten: quyTacCat });
    if (tu[1]) thuan.push({ loai: "tu_cat", ten: [tu[0]] }); else nghich.push({ loai: "tu_hung", ten: [tu[0]] });
    if (qd.loai !== "kieng_dai_hung" && kiengDaiHung.length) nghich.push({ loai: "kieng_dai_hung", ten: kiengDaiHung });
    if (qd.loai !== "kieng" && kiengHung.length) nghich.push({ loai: "kieng", ten: kiengHung });
    if (qd.loai !== "sao_xau_hon" && saoXauViec.length) nghich.push({ loai: "sao_xau_viec", ten: saoXauViec });
    if (saoDuocGiai.length) go.push({ loai: "giai_than", ten: saoDuocGiai });
    if (saoXauNhe.length) (nheCoGanh ? go : nghich).push({ loai: nheCoGanh ? "xau_nhe_co_ganh" : "xau_nhe_khong_ganh", ten: saoXauNhe });
    /* Ngoại lệ theo việc (chỉ khi đang xem việc chung): việc nào nên tránh dù ngày không xấu, việc nào hợp */
    const viecTranh = [], viecHop = [];
    if (viec === "chung" && !daiKy.length) for (const v of VIEC_KHAC) {
      const r = luanTheoSach(j, am, v);
      if (r.bac <= 1) viecTranh.push({ viec: v, vi: [...new Set([...r.khongCuu, ...r.kieng].map(k => k.sao ? tach([k], "Sao xấu kỵ việc này: ") : [goTen(k.t)]).flat())].slice(0, 3) });
      else if (r.bac >= 3) viecHop.push(v);
    }
    return { j, viec, bac: ls.bac, am: { ngay: am.day, thang: am.month, nhuan: !!am.leap, thangTra: tA }, ccNgay: ccNgay(j),
      than: { ten: th.t, hd: !!th.hd }, truc: { ten: tr.t, g: tr.g }, tu: { ten: tu[0], cat: !!tu[1] },
      qd, thuan, nghich, go, viecTranh, viecHop };
  }

  /* ═════════ KIỂM DÀN Ý — các điều luôn phải đúng; trả danh sách lỗi (rỗng là đạt) ═════════ */
  function kiem(d) {
    const loi = [], them = (dk, t) => { if (!dk) loi.push(t); };
    /* trực, tú, thần ngày là ba hệ tên riêng (trực Nguy và sao Nguy trùng chữ nhưng khác hệ) — chỉ kiểm trùng trong sao và quy tắc */
    const rieng = x => /^(truc_|tu_|hoang_dao|hac_dao)/.test(x.loai);
    const moiTen = [...d.qd.ten, ...[...d.thuan, ...d.nghich, ...d.go].filter(x => !rieng(x)).flatMap(x => x.ten)];
    them(new Set(moiTen).size === moiTen.length, "một tên xuất hiện hai lần: " + moiTen.filter((t, i) => moiTen.indexOf(t) !== i).join(", "));
    them(moiTen.every(t => t && !/[()·]|undefined|null/.test(t)), "tên còn ký hiệu kỹ thuật: " + moiTen.filter(t => /[()·]/.test(t)).join(", "));
    if (d.bac === 0) them(["dai_ky", "kieng_dai_hung"].includes(d.qd.loai), "mức Rất xấu mà ý quyết định là " + d.qd.loai);
    if (d.bac === 1) them(["kieng", "sao_xau_hon"].includes(d.qd.loai), "mức Xấu mà ý quyết định là " + d.qd.loai);
    if (d.bac >= 3) them(d.qd.loai === "nhieu_dieu_tot", "mức Tốt mà ý quyết định là " + d.qd.loai);
    if (d.bac === 2) them(d.qd.loai === "binh", "mức Bình thường mà ý quyết định là " + d.qd.loai);
    them(d.qd.chieu >= 0 || d.qd.ten.length > 0, "ý quyết định xấu mà không có tên");
    if (d.bac >= 3) them(d.thuan.some(x => ["hoang_dao", "truc_tot", "sao_tot_hop", "quy_tac_cat"].includes(x.loai)), "mức Tốt mà không có điểm thuận nào nêu được");
    if (d.bac >= 2) them(!d.nghich.some(x => x.loai === "kieng_dai_hung" || x.loai === "kieng"), "mức từ Bình thường trở lên mà còn ngày kiêng theo việc");
    them(d.thuan.filter(x => x.loai === "hoang_dao").length + d.nghich.filter(x => x.loai === "hac_dao").length === 1, "thần ngày phải có đúng một ý");
    d.viecTranh.forEach(v => them(v.vi.length > 0, "việc nên tránh mà không nêu được lý do: " + v.viec));
    if (d.qd.loai === "dai_ky") them(!d.viecTranh.length && !d.viecHop.length, "ngày đại kỵ không xét ngoại lệ theo việc");
    return loi;
  }
  function hoiQuy(tu, den, viecs = ["chung", "dongtho", "kyket", "khaitruong", "xuathanh"]) {
    const loi = [], dem = {}; let n = 0;
    for (let j = tu; j <= den; j++) for (const v of viecs) {
      const d = lap(j, v), l = kiem(d); n++;
      const k = d.bac + ":" + d.qd.loai; dem[k] = (dem[k] || 0) + 1;
      if (l.length && loi.length < 30) loi.push(`${jdToDate(j).join("/")} ${v}: ${l.join("; ")}`);
      else if (l.length) loi.length++;
    }
    return { soDanY: n, soLoi: loi.length, viDuLoi: loi.slice(0, 12), phanBo: dem };
  }
  window.DAN_Y = { lap, kiem, hoiQuy, goTen, TEN_DOC };
})();
(function () {
  "use strict";
  /* Kho lời (luan-van-mau.js, sinh từ CSDL — không sửa tay):
     MAU câu theo loại ý · CUM vế kể một điểm thuận/nghịch · GOP vế kể gộp thần–trực–tú · NOI chữ nối {a} + cụm ý + {b}
     TRICH câu thơ, câu sách theo ngày kỵ/sao · THO_THU_TU 12 câu thơ theo tháng · CON_CHI con vật ↔ chi ngày · TEN_VIEC tên việc trong lời */
  const { MAU, CUM, GOP, NOI, TRICH, THO_THU_TU, CON_CHI, TEN_VIEC } = window.LV_KHO;
  const DAI_KY_AM = ["Nguyệt kỵ", "Tam nương sát"];             // đại kỵ tính theo ngày âm: thơ khớp đúng ngày, được ưu tiên
  const DAI_KY = ["Thụ tử", "Sát chủ", "Tam nương sát", "Nguyệt kỵ", "Dương công kỵ", "ngày con nước"];
  /* "chung" không bao giờ in nguyên chữ: lời dùng "các việc thường" / "mọi việc" / danh sách việc */
  const SAU_VIEC = Object.keys(TEN_VIEC).slice(1);
  const SO = ["", "mùng một", "mùng hai", "mùng ba", "mùng bốn", "mùng năm", "mùng sáu", "mùng bảy", "mùng tám", "mùng chín", "mùng mười",
    "mười một", "mười hai", "mười ba", "mười bốn", "rằm", "mười sáu", "mười bảy", "mười tám", "mười chín", "hai mươi",
    "hai mươi mốt", "hai mươi hai", "hai mươi ba", "hai mươi tư", "hai mươi lăm", "hai mươi sáu", "hai mươi bảy", "hai mươi tám", "hai mươi chín", "ba mươi"];
  const SO_DEM = ["", "một", "hai", "ba", "bốn", "năm", "sáu"];

  /* ═════════ HÀM CHUNG ═════════ */
  const bam = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const chon = (j, o, ds) => ds[bam(j + ":" + o) % ds.length];
  const dien = (t, v) => t.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");
  const noi = a => a.length <= 1 ? (a[0] || "") : a.slice(0, -1).join(", ") + " và " + a[a.length - 1];
  const hoa = s => s.charAt(0).toUpperCase() + s.slice(1);
  const dau = s => (String(s).trim().match(/^[^\s,;:—]+/) || [""])[0].toLowerCase();
  /* Chữ nối mở câu: chữ đầu, hoặc chữ thứ hai khi câu mở bằng "Ngày" (Ngày lại…, Ngày tuy…) */
  const moNoi = s => { const w = String(s).trim().toLowerCase().split(/[\s,;:—]+/); return w[0] === "ngày" ? (w[1] || "") : w[0]; };
  const don = s => String(s).replace(/\s*·\s*/g, ", ").replace(/\s{2,}/g, " ").replace(/\s+([,.;:])/g, "$1").replace(/\.\./g, ".").replace(/(^|\s)([Nn])gày ngày /g, "$1$2gày ").trim();
  const demChu = s => (String(s).match(/[^\s—–:;,.«»()!?]+/g) || []).length;
  const cauCua = s => (String(s).match(/[^.!?]+[.!?]*/g) || []).map(x => x.trim()).filter(Boolean);
  /* Quá 4 sao thì nêu 3 sao đầu */
  const dsTen = (a, xau) => a.length > 4 ? noi(a.slice(0, 3)) + (xau ? " cùng mấy sao xấu khác" : " cùng các sao tốt khác") : noi(a);

  function ghep(j, viec = "chung") {
    const d = DAN_Y.lap(j, viec), bac = d.bac, chung = viec === "chung", qd = d.qd;
    const sung = [], doan = [], tho = [], nguon = new Set();
    /* lay(ô, kho, giá trị, lọc): lọc bỏ câu không hợp tình huống; lọc hết thì dùng cả kho */
    const layMau = (o, ds, f) => { let p = f ? ds.filter(f) : ds; if (!p.length) p = ds; const t = /^(noi_|ket_|khong_cuu)/.test(o) ? p[(j + bam(o)) % p.length] : chon(j, o, p); sung.push(o + "#" + ds.indexOf(t)); return t; };
    const lay = (o, ds, v, f) => dien(layMau(o, ds, f), v);
    /* Theo dõi chữ mở câu để hai câu liền nhau không cùng chữ nối, một chữ nối không dùng hai lần */
    let truoc = ""; const daDung = new Set();
    const ghi = s => { const c = cauCua(s); if (c.length) { truoc = moNoi(c[c.length - 1]); c.forEach(x => daDung.add(moNoi(x))); } return s; };
    const khacMo = t => { const w = moNoi(typeof t === "string" ? t : t.a); return !CHU_NOI.has(w) || (w !== truoc && !daDung.has(w)); };
    /* Vế câu cho một nhóm ý */
    /* Mỗi tên chỉ nói một lần: tên đã nói (kể cả phần của tên ghép "Đại hao, Tử khí, Quan phù") thì không nhắc lại */
    const phan = t => String(t).toLowerCase().split(/,\s*|\s+và\s+/).map(x => x.trim()).filter(Boolean);
    const daNoi = new Set(), nhan = t => phan(t).forEach(x => daNoi.add(x));
    const coGiai = d.go.some(g => g.loai === "giai_than");
    const rieng = x => /^(truc_|tu_|hoang_dao|hac_dao)/.test(x.loai);
    /* Ngày đã nói Sát chủ đại kỵ thì không nhắc thêm luật Sát chủ lối khác (chỉ nói Sát chủ một lần) */
    const conLai = x => rieng(x) ? x.ten : x.ten.filter(t => !/Giải thần/i.test(t) && !phan(t).every(p => daNoi.has(p))
      && !(daNoi.has("sát chủ") && /^Sát chủ /i.test(t)));
    /* Vế câu cho một nhóm ý (hai vế liền nhau không mở cùng một chữ: "được…, được…") */
    const cum = (ds0, o) => { const ra = []; let w = "", ds = ds0;
      const qt = ds0.find(x => x.loai === "quy_tac_cat"), sg = ds0.find(x => /^sao_tot/.test(x.loai));
      if (qt && sg) { const rieng2 = qt.ten.filter(t => t[0] !== t[0].toLowerCase());
        ds = ds0.map(x => x === sg ? { ...x, ten: [...x.ten, ...rieng2] } : x === qt ? { ...x, ten: x.ten.filter(t => !rieng2.includes(t)) } : x); }
      /* Thần, trực, tú cùng chiều: hai phần ba số ngày kể gộp một lần ("gặp cả Thanh Long hoàng đạo, trực Chấp và sao Cơ"),
         còn lại kể từng thứ kèm lời chú — để các ngày không đi một khuôn */
      const loi = ds.filter(x => /^(hoang_dao|hac_dao|truc_|tu_)/.test(x.loai));
      let gop = "";
      if (loi.length >= 2 && bam(j + ":gop:" + o) % 3) {
        const tenLoi = loi.map(x => /hoang_dao/.test(x.loai) ? x.ten[0] + " hoàng đạo" : /hac_dao/.test(x.loai) ? x.ten[0] + " hắc đạo" : /^truc_/.test(x.loai) ? "trực " + x.ten[0] : "sao " + x.ten[0]);
        gop = lay(o + "_gop", GOP[o === "nghich" ? "nghich" : "thuan"], { ds: noi(tenLoi) }, t => loi.length === 3 || !/ba điều/.test(t));
        ds = ds.filter(x => !loi.includes(x));
      }
      for (const x of ds) { const ten = conLai(x); if (!ten.length) continue; ten.forEach(nhan);
        const s = lay(o + "_" + x.loai, CUM[x.loai], { ten: ten[0], ds: dsTen(ten, o === "nghich") }, t => dau(t) !== w && !(ten.length > 4 && /cùng chiếu/.test(t))); w = dau(s); ra.push(s); }
      if (!gop) return ra.join(", ");
      return ra.length ? gop + ", " + (o === "nghich" ? "thêm " : "lại ") + ra.join(", ") : gop; };
    /* Chữ nối: chọn theo chiều (kieu), tránh trùng chữ mở với câu trước */
    const noiCau = (kieu, noiDung) => { const k = layMau("noi_" + kieu, NOI[kieu], khacMo); return ghi(hoa(k.a + noiDung + k.b)); };
    const v = { viec: chung ? (bac === 0 ? "mọi việc" : "việc lớn") : TEN_VIEC[viec], am_ngay: SO[d.am.ngay] };
    const c0 = `Ngày ${d.ccNgay}, ${SO[d.am.ngay]} tháng ${THANG_AM[d.am.thang - 1]}${d.am.nhuan ? " nhuận" : ""}`;
    const ngayAm = c0.slice(c0.indexOf(", ") + 2);
    const c0m = dien(layMau("mo_ngay", MAU.mo_ngay), { cc: d.ccNgay, am: ngayAm, nham: (d.am.ngay === 15 ? "nhằm đúng " : "nhằm ") + ngayAm });
    /* Câu đi liền sau câu mở không lặp chữ của câu mở (xét… Xét…, Nói về ngày… Nói về điều lành…) */
    const sauMo = t => !(/xét/i.test(c0m) && /^Xét/.test(t)) && !(/^(Nói|Luận|Bàn)/.test(c0m) && /^(Nói|Nếu nói)/.test(t));
    const chi = String(d.ccNgay).split(" ").pop();
    qd.ten.forEach(nhan);
    let daSatChu = false;
    const satChu = ds => { if (!daSatChu && ds.some(t => /Sát chủ/i.test(t) && t !== "Sát chủ")) { daSatChu = true; return ghi(lay("satchu_khac", MAU.satchu_khac, v, khacMo)); } return ""; };

    if (qd.loai === "dai_ky") {
      /* ═══ Đại kỵ: phạm gì (đoạn 1, kèm thơ/câu sách) → lời sách → ý cùng chiều → điều tốt "dẫu… cũng không cứu được" ═══ */
      const ky = qd.ten, vk = { ...v, ky: noi(ky), n: SO_DEM[ky.length] || String(ky.length) };
      const theoAm = ky.length === 1 && DAI_KY_AM.includes(ky[0]);
      const mo = ky.length > 1 ? lay("qd_dai_ky_nhieu", MAU.qd_dai_ky_nhieu, vk) : lay("qd_dai_ky", theoAm && !/tức|nhằm/.test(c0m) ? MAU.qd_dai_ky.concat(MAU.qd_dai_ky_am) : MAU.qd_dai_ky, vk);
      let p1 = mo.startsWith(",") ? c0 + mo : c0m + ". " + hoa(mo);
      const coTrich = ky.filter(k => TRICH[k]), kyTrich = coTrich.find(k => DAI_KY_AM.includes(k)) || coTrich[0];
      const p2 = [];
      if (kyTrich) {
        const tc = TRICH[kyTrich], t = tc[(j + bam(kyTrich)) % tc.length]; sung.push("trich#" + tc.indexOf(t)); nguon.add(t.nguon);
        if (t.loai === "cau") p1 += ` Sách chép: «${t.t}».`;
        else if (t.loai === "tho_thang") {
          const cau = THO_THU_TU[(d.am.thangTra || d.am.thang) - 1], tu = cau.toLowerCase().split(/\s+/);
          const con = (CON_CHI[chi] || []).find(w => tu.includes(w));
          tho.push({ sau: 1, t: [cau + "."], nguon: t.nguon, dan: lay("dan_tho_thang", MAU.dan_tho_thang, vk) });
          if (con) p2.push(ghi(hoa(lay("chu_tho", MAU.chu_tho, { con, chi }))));
        } else tho.push({ sau: 1, t: t.t, nguon: t.nguon, dan: lay("dan_tho_ky", MAU.dan_tho_ky, { ky: kyTrich }, ky.length > 1 ? x => /\{ky\}/.test(x) : null) });
      }
      ghi(p1); doan.push(don(p1));
      nguon.add("Ngọc Hạp Thông Thư, trang 9");
      const cx = bam(j + ":dk_nghich") % 2 ? cum(d.nghich, "nghich") : "", nt = cum(d.thuan, "thuan");
      if (!nt) p2.push(ghi(hoa(ky.length > 1 ? lay("khong_cuu_nhieu", MAU.khong_cuu_nhieu, vk, khacMo) : lay("khong_cuu", MAU.khong_cuu, vk, khacMo))));
      if (cx) p2.push(noiCau("cung_xau", cx));
      if (nt) p2.push(noiCau("nguoc_dai_ky", nt));
      doan.push(don(p2.join(" ")));
    } else {
      /* ═══ Các ngày khác: một đoạn — ý quyết định → cùng chiều → ngược chiều → gỡ ═══ */
      const cau = [];
      const xau = qd.chieu < 0;
      if (qd.loai === "kieng_dai_hung" || qd.loai === "kieng" || qd.loai === "sao_xau_hon") {
        const o = "qd_" + qd.loai;
        cau.push(ghi(c0m + ". " + hoa(lay(o, MAU[o], { ...v, ds: noi(qd.ten) }, sauMo))));
        if (qd.loai !== "sao_xau_hon") cau.push(satChu(qd.ten));
      } else if (qd.loai === "nhieu_dieu_tot") {
        const itTot = d.thuan.length < 3;
        cau.push(ghi(c0m + ". " + hoa(lay("qd_nhieu_dieu_tot", MAU.qd_nhieu_dieu_tot, { ds: cum(d.thuan, "thuan") }, t => sauMo(t) && !(itTot && /nhiều điều/.test(t))))));
        cau.push(ghi(lay("khong_pham", MAU.khong_pham, v, khacMo)));
      } else {
        cau.push(ghi(c0m + ". " + lay("qd_binh", MAU.qd_binh, v, sauMo)));
      }
      if (!xau && !d.go.length && !(d.viecTranh || []).length && !d.nghich.some(x => /^(sao_xau_viec|xau_nhe)/.test(x.loai))) cau.push(ghi(lay("khong_xau", MAU.khong_xau, v, khacMo)));
      /* Ý cùng chiều, rồi ý ngược chiều (nhượng bộ) */
      const kiengPhu = d.nghich.filter(x => /^kieng/.test(x.loai)).flatMap(x => x.ten);
      if (xau) {
        const cx = cum(d.nghich, "nghich"); if (cx) { cau.push(noiCau("cung_xau", cx)); cau.push(satChu(kiengPhu)); }
        const nt = cum(d.thuan, "thuan"); if (nt) cau.push(noiCau("nguoc_xau", nt));
      } else if (qd.loai === "nhieu_dieu_tot") {
        const nn = cum(d.nghich, "nghich"); if (nn) cau.push(noiCau("nguoc_tot", nn));
      } else {
        const ct = cum(d.thuan, "thuan"); if (ct) cau.push(noiCau("cung_binh", ct));
        const nn = cum(d.nghich, "nghich"); if (nn) cau.push(noiCau("nguoc_binh", nn));
      }
      /* Ý gỡ (không nói ở ngày Rất xấu: đã bỏ ngày thì gỡ cũng vô nghĩa) */
      if (bac >= 2) for (const g of d.go) {
        const ten = conLai(g); if (!ten.length) continue; ten.forEach(nhan);
        cau.push(ghi(hoa(lay(g.loai, MAU[g.loai], { ds: noi(ten) }, khacMo))));
      }
      doan.push(don(cau.join(" ")));
      /* Thơ của sao xấu nổi bật trong ngày (Cô thần, Quả tú, Thiên hoả) */
      const nhom = [...d.nghich.filter(x => /^(sao_xau_viec|xau_nhe)/.test(x.loai)), ...(bac >= 2 ? d.go.filter(x => x.loai === "xau_nhe_co_ganh") : [])];
      for (const x of nhom) {
        const s = x.ten.find(t => TRICH[t] && TRICH[t][0].loai === "tho" && !DAI_KY.includes(t));
        if (!s) continue;
        const t = TRICH[s][0];
        tho.push({ sau: doan.length, t: t.t, nguon: t.nguon, dan: lay("dan_tho", x.loai === "xau_nhe_co_ganh" ? MAU.dan_tho_sao_nhe : MAU.dan_tho_sao, { ds: s }) });
        nguon.add(t.nguon); break;
      }
    }

    /* ═══ Ngoại lệ theo việc (mức ≥ 2) + câu kết đúng mức ═══ */
    const k = [];
    const tranh = d.viecTranh || [], hop = (d.viecHop || []).map(x => TEN_VIEC[x]);
    const vs = noi(tranh.map(x => TEN_VIEC[x.viec]));
    /* Lý do: chỉ nêu tên chưa nói ở trên (mỗi tên một lần) */
    const lyMoi = [...new Set(tranh.flatMap(x => x.vi))].filter(t => !phan(t).every(p => daNoi.has(p)));
    const ly = noi(lyMoi.slice(0, 2));
    const nhieuTranh = tranh.length && tranh.length * 2 >= 4;
    const laDs = s => chung && !/^(ký kết|khai trương|xuất hành đi xa|động thổ, khởi công)$/.test(s);   // "đều" chỉ dùng cho danh sách
    let ngoaiLe = "";
    if (bac >= 2 && tranh.length) {
      if (bac >= 3 && nhieuTranh) k.push(ghi(hoa(ly ? lay("ngoai_le_nhieu", MAU.ngoai_le_nhieu, { vs, ly }, khacMo) : lay("ngoai_le_nhieu", MAU.ngoai_le_nhieu_trong, { vs }, khacMo))));
      else ngoaiLe = ghi(hoa(ly ? lay("ngoai_le", MAU.ngoai_le, { vs, ly }, khacMo) : lay("ngoai_le", MAU.ngoai_le_trong, { vs }, khacMo)));
    }
    /* Bài ngắn (dữ kiện ít) thì chọn cách kết đầy đủ hơn, không thêm ý */
    const daCo = doan.reduce((s, x) => s + demChu(x), 0) + k.reduce((s, x) => s + demChu(x), 0) + demChu(ngoaiLe);
    const du = t => khacMo(t) && demChu(t) + daCo >= 60;
    /* "đều", "trăm việc" chỉ hợp khi nói nhiều việc — điều kiện cứng; độ dài là điều kiện mềm */
    const ok0 = t => chung || !/đều|trăm việc/.test(t), dai0 = t => ok0(t) && du(t);
    if (bac === 0) k.push(lay("ket_0", MAU.ket_0, { viec: chung ? noi(SAU_VIEC.map(x => TEN_VIEC[x])) : TEN_VIEC[viec] }, MAU.ket_0.some(dai0) ? dai0 : ok0));
    else if (bac === 1) k.push(lay("ket_1", MAU.ket_1, { viec: chung ? "việc lớn" : TEN_VIEC[viec] }, du));
    else if (bac === 2) {
      const nT = d.thuan.length, nX = d.nghich.length + d.go.length;
      const loai = nT >= 2 && nX >= 2 ? "ket_2_lan" : nT >= 2 ? (tranh.length ? "ket_2_vuong" : "ket_2_chua") : nX >= 2 ? "ket_2_xau" : "ket_2_it";
      k.push(lay(loai, MAU[loai], v, du));
    }
    else if (nhieuTranh) k.push(hop.length ? lay("ket_tot_hep", MAU.ket_tot_hep, { viec: noi(hop) }, du) : lay("ket_tot_hep", MAU.ket_tot_hep_khong, {}));
    else {
      const vk = chung ? (hop.length >= 4 ? "các việc lớn" : hop.length ? noi(hop) : "việc lớn") : TEN_VIEC[viec];
      if (chung && !hop.length && tranh.length) { k.push(ngoaiLe); ngoaiLe = ""; k.push(bac === 4 ? "Ngoài việc ấy ra, ngày này rất tốt." : "Ngoài việc ấy ra, ngày này dùng được."); }
      else { const okT = t => laDs(vk) || !/đều/.test(t), daiT = t => okT(t) && du(t);
        k.push(lay("ket_" + bac, MAU["ket_" + bac], { viec: vk }, MAU["ket_" + bac].some(daiT) ? daiT : okT)); }
    }
    if (ngoaiLe) k.push(ngoaiLe);
    const ket = don(k.join(" "));
    nguon.add("Ngọc Hạp Thông Thư, trang 45–47 (hoàng đạo, hắc đạo)");
    nguon.add("Ngọc Hạp Thông Thư, trang 153 (trực)");
    const soChu = doan.reduce((s, x) => s + demChu(x), 0) + demChu(ket);
    return { j, ngay: jdToDate(j).join("/"), am: `${d.am.ngay}/${d.am.thang}${d.am.nhuan ? "N" : ""}`, ccNgay: d.ccNgay, bac, doan, tho, ket,
      nen: bac === 0 ? [] : hop, kieng: bac === 0 ? SAU_VIEC.map(x => TEN_VIEC[x]) : tranh.map(x => TEN_VIEC[x.viec]),
      nguon: [...nguon], chon: sung, danY: d, soChu };
  }

  /* ═════════ KIỂM CÂU BẰNG MÁY — trả mảng lỗi (rỗng là đạt) ═════════ */
  const NOI_BO = /CSDL|tư liệu|căn cứ|tham khảo|không chép|đối sách|việc chung/i;
  const CHU_NOI = new Set(["xét", "lại", "thêm", "song", "nhưng", "tuy", "dẫu", "huống", "may", "riêng", "duy", "còn", "ngặt", "vậy", "chỉ", "tiếc"]);
  const NHUONG = new Set(["tuy", "dẫu", "song", "nhưng", "tiếc", "chỉ"]);
  const PHU_DINH = new Set(["không", "chẳng", "chưa", "chớ"]);
  function kiemCau(bai) {
    const loi = [], d = bai.danY || {}, ket = String(bai.ket || "");
    const loiVan = [...(bai.doan || []), ket].join(" ");
    const thap = loiVan.toLowerCase();
    if (/\{[^}]*\}/.test(loiVan)) loi.push("còn chỗ trống {…}");
    const nb = loiVan.match(NOI_BO); if (nb) loi.push("từ nội bộ: " + nb[0]);
    if (/[·()[\]]/.test(loiVan)) loi.push("dấu · hoặc ngoặc lọt vào lời");
    /* Một tên sao / ngày kỵ / quy tắc nói hai lần (tên dài chứa tên ngắn thì trừ ra: Thiên đức hợp ⊃ Thiên đức) */
    if (d.qd) {
      const rieng = x => /^(truc_|tu_|hoang_dao|hac_dao)/.test(x.loai);
      /* tên ghép "Đại hao, Tử khí, Quan phù" tách thêm từng phần; lời trích «…» của sách không tính */
      const goc = [...d.qd.ten, ...[...d.thuan, ...d.nghich, ...d.go].filter(x => !rieng(x)).flatMap(x => x.ten),
        ...(d.viecTranh || []).flatMap(x => x.vi), d.than && d.than.ten].filter(Boolean).map(t => t.toLowerCase());
      const ten = [...new Set(goc.flatMap(t => [t, ...t.split(/,\s*/)]).map(t => t.trim()).filter(t => t.length > 2))];
      const vanDem = thap.replace(/«[^»]*»/g, " ");
      const dem = t => vanDem.split(t).length - 1;
      for (const t of ten) {
        const n = dem(t) - ten.filter(u => u !== t && u.includes(t) && !u.includes(",")).reduce((s, u) => s + dem(u), 0);
        if (n > 1) loi.push("tên nói hai lần: " + t);
      }
      /* Câu "không phạm/không mắc" khi dàn ý có ý kiêng */
      const coKieng = d.qd.chieu < 0 || d.nghich.some(x => /^kieng/.test(x.loai)) || (d.viecTranh || []).length > 0;
      for (const c of cauCua(loiVan)) {
        if (!/không (phạm|mắc)/i.test(c)) continue;
        if (d.qd.loai === "dai_ky") loi.push("nói 'không phạm' trong ngày đại kỵ: " + c);
        else if (coKieng && !/đại kỵ/.test(c)) loi.push("nói 'không phạm' khi có ý kiêng: " + c);
      }
    }
    /* Câu kết khớp mức */
    const tu = ket.toLowerCase().split(/[\s,;:.—]+/).filter(Boolean);
    if (bai.bac <= 1) tu.forEach((w, i) => { if (/^(tốt|cát|lợi)$/.test(w) && !PHU_DINH.has(tu[i - 1]) && !PHU_DINH.has(tu[i - 2])) loi.push("mức xấu mà câu kết có chữ '" + w + "'"); });
    if (bai.bac >= 3 && /nên tránh ngày này/i.test(ket)) loi.push("mức tốt mà câu kết bảo tránh ngày này");
    if (d.viec && d.viec !== "chung" && /đều (nên|hợp)|trăm việc/.test(ket)) loi.push("một việc mà câu kết nói 'đều'");
    /* Độ dài (không kể thơ) */
    const n = demChu(loiVan);
    if (n < 40 || n > 190) loi.push("độ dài " + n + " chữ, ngoài khoảng 40–190");
    /* Chữ nối giữa hai câu liền nhau */
    const cs = cauCua(loiVan);
    for (let i = 1; i < cs.length; i++) {
      const a = moNoi(cs[i - 1]), b = moNoi(cs[i]);
      if (a === b && CHU_NOI.has(b)) loi.push("hai câu liền nhau cùng mở bằng '" + b + "'");
      const truocNhuong = NHUONG.has(a) || /,\s*(song|nhưng)\s/i.test(cs[i - 1]);
      if (truocNhuong && b === "lại") loi.push("chữ 'lại' đứng sau ý ngược chiều: " + cs[i]);
    }
    return loi;
  }
  function chay(tu, den, viec = "chung") { const r = []; for (let j = tu; j <= den; j++) r.push(ghep(j, viec)); return r; }
  window.LUAN_VAN2 = { ghep, chay, kiemCau, MAU, TRICH, CUM, NOI, GOP, THO_THU_TU, CON_CHI, TEN_VIEC };
})();
