/* Lịch Pháp © 2026 Lê Lệnh Bắc. Bảo lưu mọi quyền. Bản chính thức, miễn phí: https://lelenhbac1974hn-web.github.io/lich-phap/ — cấm đưa lên chợ ứng dụng, bán hay phát hành lại khi chưa được phép (xem LICENSE). */
/* LỜI LUẬN NGÀY — hai tầng: (1) tầng luật: từ kết quả luận theo sách ra dàn ý có vai, có chiều (window.DAN_Y);
   (2) tầng lời: đọc dàn ý thành lời văn (window.LUAN_VAN2). Nạp sau luan-sach.js. Kiểm thử: nguon-csdl/cong-cu/hoi-quy-luan-van.js. */
(function () {
  "use strict";
  /* Tên quy tắc trong dữ liệu → tên đọc cho người dùng. Hai luật "Sát chủ" phụ đổi tên để khỏi lẫn với Sát chủ đại kỵ. */
  const TEN_DOC = { "Sát chủ hai tháng phạm một ngày": "Sát chủ hai tháng một lần", "Sát chủ về bốn mùa": "Sát chủ theo mùa",
    "Đại hao – Tử khí – Quan phù": "Đại hao, Tử khí, Quan phù", "Tạo ốc tốt": "ngày tốt làm nhà", "Kỵ làm nhà lớn": "ngày kỵ làm nhà lớn",
    "Tam tang sát hung / Không ma bốn mùa": "Tam tang", "Ngày con nước": "ngày con nước", "Dương công kỵ nhật": "Dương công kỵ",
    "Tam cường thiên ma": "Tam cường", "Không vong bốn mùa": "Không vong", "Tứ thời thu chủ sát thủ": "Tứ thời sát chủ", "Sát chủ": "Sát chủ" };
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
  window.DAN_Y = { lap, kiem, hoiQuy, goTen };
})();
(function () {
  "use strict";
  /* ═════════ KHO CÂU MẪU — xếp theo LOẠI Ý ═════════ */
  const MAU = {
    /* — Ý quyết định: sáu ngày đại kỵ — câu mở bắt đầu bằng "," thì nối liền sau dòng ngày tháng */
    qd_dai_ky: [", phạm {ky}, một trong sáu ngày đại kỵ.", "Ngày này phạm {ky}, là một trong sáu ngày đại kỵ.",
      "Trước hết phải nói: ngày này phạm {ky}, một trong sáu ngày đại kỵ.", ", nhằm ngày {ky} — một trong sáu ngày đại kỵ."],
    qd_dai_ky_am: ["Ngày {am_ngay} này phạm {ky}, một trong sáu ngày đại kỵ."],          // chỉ khi kỵ tính theo ngày âm
    qd_dai_ky_nhieu: [", phạm cùng lúc {n} ngày đại kỵ: {ky}.", "Ngày này phạm cùng lúc {ky} — đều là ngày đại kỵ.",
      "Một ngày mà phạm đến {n} ngày đại kỵ: {ky}.", "Trước hết phải nói: ngày này phạm một lượt {ky}, đều là ngày đại kỵ."],
    khong_cuu: ["Ngọc Hạp Thông Thư dạy gặp ngày ấy thì kiêng mọi việc, dẫu nhiều sao tốt cũng chẳng cứu được.",
      "Sách dạy gặp ngày như thế thì kiêng mọi việc; dẫu có sao tốt cũng không cứu được.",
      "Phạm ngày như thế thì sao tốt nào cũng không giải được — sách đã dặn rõ.",
      "Sáu ngày ấy, sách dạy phải kiêng mọi việc, sao tốt đến mấy cũng không giải được."],
    khong_cuu_nhieu: ["Một đại kỵ đã không cứu được, huống chi phạm đến {n}.", "Sách dạy gặp các ngày ấy thì kiêng mọi việc; dẫu có sao tốt cũng không cứu được.",
      "Phạm {n} đại kỵ một lượt; ấy là ngày phải tránh hẳn, sao tốt nào cũng không giải được."],
    dan_tho_ky: ["Sách có thơ rằng:", "Về {ky}, sách có thơ rằng:"],
    dan_tho_thang: ["Bài thơ Thụ tử – Sát chủ, câu nói về tháng này, rằng:", "Sách có bài thơ Thụ tử – Sát chủ; câu ứng với tháng này rằng:"],
    chu_tho: ["{con} tức ngày {chi}, chính là ngày hôm nay.", "Trong câu thơ, {con} tức ngày {chi}, chính là hôm nay."],
    /* — Ý quyết định: ngày kiêng theo việc — */
    qd_kieng_dai_hung: ["Không thuộc sáu ngày đại kỵ, ngày này vẫn phạm {ds}; sách dạy kiêng {viec}.",
      "Sách chép ngày này phạm {ds}; ấy là điều kỵ nặng, kiêng {viec}.", "Trước hết phải nói: ngày này phạm {ds}; sách dạy kiêng {viec}.",
      "Ngày này phạm {ds}, tuy không phải đại kỵ song cũng là điều kỵ nặng; sách dạy kiêng {viec}."],
    qd_kieng: ["Sách chép ngày này phạm {ds}, kỵ {viec}.", "Ngày này phạm {ds}; sách dạy kiêng {viec}.",
      "Theo sách thì ngày phạm {ds}, không lợi cho {viec}.", "Điều đáng ngại là ngày phạm {ds}; sách dạy kiêng {viec}."],
    satchu_khac: ["Đây là Sát chủ lối khác, không phải Sát chủ trong sáu ngày đại kỵ."],
    /* — Ý quyết định: sao xấu kỵ việc nhiều hơn sao tốt hợp việc — */
    qd_sao_xau_hon: ["Ngày có hung tinh {ds}, kỵ {viec}.", "Xét sao thì ngày có {ds} là sao xấu, kỵ {viec}.",
      "Hung tinh có {ds}, chủ điều chẳng lợi cho {viec}."],
    /* — Ý quyết định: nhiều điều tốt / bình — */
    qd_nhieu_dieu_tot: ["Ngày này nhiều điều tốt: {ds}.", "Xét ra ngày này {ds}.", "Ngày này được nhiều điều lành: {ds}.", "Nói về điều tốt thì ngày này {ds}."],
    qd_binh: ["Ngày này không phạm ngày đại kỵ nào.", "Xét sáu ngày đại kỵ thì ngày này không phạm.", "Sáu ngày đại kỵ, ngày này không phạm ngày nào."],
    khong_xau: ["Hung tinh đáng ngại cũng không gặp.", "Sao xấu đáng ngại thì ngày này không có."],   // chỉ khi dàn ý không có sao xấu nào
    khong_pham: ["Ngày không phạm ngày đại kỵ nào.", "Xét sáu ngày đại kỵ thì ngày này không phạm.", "Sáu ngày đại kỵ, ngày này không phạm ngày nào.",
      "Ngày này không phạm một ngày nào trong sáu ngày đại kỵ."],
    /* — Ý gỡ — */
    giai_than: ["May có Giải thần giải trừ được {ds}.", "{ds} vốn là hung tinh, may có Giải thần giải trừ.", "Có {ds}, song đã được Giải thần hoá giải.",
      "Tuy có {ds}, song Giải thần đã giải trừ."],
    xau_nhe_co_ganh: ["{ds} là sao xấu nhẹ; ngày có sao tốt đi cùng nên bớt xấu.", "Còn {ds} thuộc loại nhẹ, đã có sao tốt đỡ.",
      "Có {ds} là sao xấu nhẹ, nhờ cát tinh gánh đỡ nên không đáng ngại.", "{ds} tuy là hung tinh, song thuộc loại nhẹ, có sao tốt gánh đỡ."],
    dan_tho_sao: ["Về sao {ds}, sách có thơ rằng:", "Riêng sao {ds}, sách có thơ dặn:"],
    dan_tho_sao_nhe: ["Sao {ds} tuy nhẹ, sách vẫn có câu thơ để nhớ:", "Riêng sao {ds}, sách có thơ dặn:"],
    /* — Ngoại lệ theo việc (chỉ mức ≥ 2, việc chung) — */
    ngoai_le: ["Riêng {vs} thì nên tránh, vì gặp {ly}.", "{vs} chớ dùng ngày này, bởi {ly}.", "Riêng {vs} chưa nên dùng ngày này, bởi {ly}.",
      "Duy {vs} thì nên tránh, vì {ly}."],
    ngoai_le_trong: ["Riêng {vs} thì nên tránh.", "Riêng {vs} chưa nên dùng ngày này.", "Duy {vs} thì chớ dùng ngày này."],   // lý do đã nói ở trên
    ngoai_le_nhieu: ["Ngày tuy tốt, song không phải việc gì cũng hợp: {vs} nên tránh, vì gặp {ly}.", "Có điều ngày gặp {ly}; vì thế {vs} phải tránh.",
      "Song không phải việc gì cũng hợp: {vs} phải tránh, bởi {ly}."],
    ngoai_le_nhieu_trong: ["Ngày tuy tốt, song không phải việc gì cũng hợp: {vs} nên tránh.", "Song không phải việc gì cũng hợp: {vs} phải tránh."],
    /* — Câu kết theo mức; {viec} là danh sách việc (việc chung) hoặc tên việc đang xem — */
    ket_0: ["Ấy là ngày nên tránh; việc đã định xin chọn ngày khác.", "Vậy ngày này chẳng nên khởi sự việc lớn. Việc đã định nên dời sang ngày khác.",
      "Gặp ngày như vậy, việc trọng nên gác lại, đợi ngày lành hãy làm.", "Vậy trăm việc lớn nhỏ đều nên dời sang ngày khác.",
      "Việc trọng chớ dùng ngày này; nên lùi lại mà chọn ngày khác.", "Ấy là ngày phải kiêng. Việc lớn trong nhà xin để sang ngày khác.",
      "Vậy {viec} đều nên dời sang ngày khác.", "Ngày như thế thì chẳng nên động việc gì lớn; có định làm cũng nên hoãn."],
    ket_1: ["Xét chung, ngày này xấu; {viec} nên chọn ngày khác.", "Ngày này không lợi; {viec} chẳng nên dùng.", "Vậy {viec} nên tránh ngày này.",
      "Xét chung, ngày này không lợi cho {viec}; nên chọn ngày khác thì hơn."],
    ket_2: ["Xét chung là ngày bình: dùng được, song chẳng phải ngày đẹp.", "Ngày này bình thường, không xấu mà cũng chẳng tốt mấy.", "Tốt xấu đều ít, ấy là ngày bình.",
      "Điều lành tuy có, song chưa đủ để xếp vào ngày tốt; ấy là ngày bình, dùng được.", "Xét chung, ngày thuộc bậc bình: điều dữ không nặng, song điều lành cũng chưa nhiều."],
    ket_3: ["Xét chung, đây là ngày tốt; {viec} dùng được.", "Ngày này thuộc ngày cát; {viec} làm được.", "Xét chung, ngày này lợi cho {viec}.", "Đây là ngày cát, có thể dùng cho {viec}."],
    ket_4: ["Xét chung, ngày này rất tốt; {viec} đều hợp.", "Ấy là ngày đại cát cho {viec}.", "Ngày này rất tốt, dùng cho {viec} thì hợp."],
    ket_tot_hep: ["Vậy ngày này nên để dành cho {viec}.", "Xét chung, ngày này tốt cho {viec}, còn các việc kể trên thì không."],
    ket_tot_hep_khong: ["Xét chung là ngày tốt, trừ các việc kể trên."]
  };
  /* ═════════ CỤM Ý — vế câu cho từng loại điểm thuận / nghịch (không mang chữ nối) ═════════ */
  const CUM = {
    hoang_dao: ["được {ten} hoàng đạo chiếu", "gặp {ten} hoàng đạo trực nhật", "có {ten} hoàng đạo soi xuống"],
    truc_tot: ["gặp trực {ten} là trực tốt", "nhằm trực {ten} là trực lành"],
    sao_tot_hop: ["có {ds} phù trợ", "được {ds} giúp sức", "có {ds} hội về"],
    sao_tot_khac: ["có {ds}", "được {ds} soi tới"],
    quy_tac_cat: ["gặp {ds}", "lại gặp {ds}"],
    tu_cat: ["nhằm sao {ten} là cát tú", "gặp sao {ten} là tú lành"],
    hac_dao: ["gặp {ten} hắc đạo", "nhằm {ten} hắc đạo coi ngày"],
    truc_xau: ["gặp trực {ten} là trực xấu", "nhằm trực {ten} chẳng lành"],
    tu_hung: ["gặp sao {ten} là hung tú", "nhằm sao {ten}, chẳng phải tú lành"],
    kieng_dai_hung: ["phạm {ds} là điều kỵ nặng", "mắc {ds} cũng là điều kỵ nặng"],
    kieng: ["phạm {ds}", "mắc {ds}"],
    sao_xau_viec: ["có hung tinh {ds}", "vướng {ds} là sao xấu"],
    xau_nhe_khong_ganh: ["có {ds} là sao xấu nhẹ mà không có sao tốt đỡ"]
  };
  /* ═════════ CHỮ NỐI theo chiều hai ý liền nhau: {a} + cụm ý + {b} ═════════ */
  const NOI = {
    cung_xau: [{ a: "Ngày lại ", b: "." }, { a: "Thêm nữa, ngày còn ", b: "." }, { a: "Huống chi ngày còn ", b: "." }],       // sau ý quyết định xấu
    nguoc_dai_ky: [{ a: "Dẫu ngày ", b: ", cũng đành bỏ." }, { a: "Ngày tuy ", b: ", song đã phạm đại kỵ thì không dùng được." },
      { a: "Tiếc thay, ngày ", b: ", mà gặp đại kỵ cũng thành vô ích." },
      { a: "Ngày vốn ", b: ", tiếc rằng phạm đại kỵ nên không dùng được." }, { a: "Dẫu ngày ", b: ", gặp đại kỵ rồi thì cũng phải kiêng." }],
    nguoc_xau: [{ a: "Tuy ngày ", b: ", song tốt chẳng bù được xấu." }, { a: "Dẫu ngày ", b: ", cũng không gỡ được." }, { a: "Ngày tuy ", b: ", song cũng không đỡ nổi." }],
    nguoc_tot: [{ a: "Tuy ngày ", b: ", song điều lành vẫn nhiều hơn." }, { a: "Chỉ có điều ngày ", b: "; chừng ấy chưa đủ làm ngày kém đi." },
      { a: "Duy ngày ", b: ", song không đáng ngại." }],   // sau ý quyết định tốt
    cung_binh: [{ a: "Điều lành thì ngày ", b: "." }, { a: "Xét ra ngày này ", b: "." }],
    nguoc_binh: [{ a: "Song ngày ", b: "." }, { a: "Có điều ngày ", b: "." }, { a: "Nhưng ngày lại ", b: "." }]
  };
  /* ═════════ TRÍCH DẪN — gắn với ngày kỵ, sao; có sách và trang ═════════ */
  const THO_THU_TU = ["Một chó nằm kế rắn quấn ngang", "Hai con rồng ấp chuột lông vàng", "Ba lợn lái ngăn dê đực chạy", "Bốn con rắn trắng phủ mèo lang",
    "Năm chuột trèo cây xem khỉ tắm", "Sáu ngựa đi qua chó đón đàng", "Bảy trâu đực chọi cùng trâu cái", "Tám dê leo núi lợn xông quàng",
    "Chín hùm đuổi ngựa qua rừng vắng", "Mười khỉ tìm gà tiếng gáy vang", "Mười một mèo kêu hùm lại sợ", "Mười hai gà gáy chốn long sàng"];
  /* Con vật trong câu thơ ứng với chi ngày (sách tr.39 giải như vậy) — câu chú chỉ giải nghĩa này, không thêm điều kỵ */
  const CON_CHI = { "Tý": ["chuột"], "Sửu": ["trâu"], "Dần": ["hùm"], "Mão": ["mèo"], "Thìn": ["rồng", "long"], "Tỵ": ["rắn"],
    "Ngọ": ["ngựa"], "Mùi": ["dê"], "Thân": ["khỉ"], "Dậu": ["gà"], "Tuất": ["chó"], "Hợi": ["lợn"] };
  const TRICH = {
    "Tam nương sát": [
      { loai: "cau", t: "Tam nương sát, bách sự kỵ", nguon: "Ngọc Hạp Thông Thư, trang 39" },
      { loai: "tho", t: ["Khởi đầu vạn sự bất thường,", "Làm nhà, gả cưới tuyệt đường cháu con."], nguon: "Ngọc Hạp Thông Thư, trang 109" },
      { loai: "tho", t: ["Chăn nuôi gia súc hao mòn,", "Cửa nhà mất hết vàng son phai mờ."], nguon: "Ngọc Hạp Thông Thư, trang 109" }],
    "Nguyệt kỵ": [{ loai: "tho", t: ["Mùng năm, mười bốn, hai ba,", "Đi chơi còn nhỡ nữa là đi buôn."], nguon: "Ngọc Hạp Thông Thư, trang 40" }],
    "Thụ tử": [{ loai: "tho_thang", nguon: "Ngọc Hạp Thông Thư, trang 38–39 (bài thơ Thụ tử – Sát chủ)" }, { loai: "cau", t: "Thụ tử: kiêng kỵ mọi việc không làm", nguon: "Ngọc Hạp Thông Thư, trang 10" }],
    "Sát chủ": [{ loai: "tho_thang", nguon: "Ngọc Hạp Thông Thư, trang 38–39 (bài thơ Thụ tử – Sát chủ)" }],
    "Cô thần": [{ loai: "tho", t: ["Là ngày Quả tú – Cô thần,", "Khuyên ai giá thú, hôn nhân thì đừng."], nguon: "Ngọc Hạp Thông Thư, trang 39" }],
    "Quả tú": [{ loai: "tho", t: ["Là ngày Quả tú – Cô thần,", "Khuyên ai giá thú, hôn nhân thì đừng."], nguon: "Ngọc Hạp Thông Thư, trang 39" }],
    "Thiên hoả": [{ loai: "tho", t: ["Một năm hai sáu chuột già, hai sáu mười mèo ra.", "Ba bảy mười một ngựa, bốn tám mười hai gà", "Là những ngày Thiên Hoả dặn bảo chớ làm nhà."], nguon: "Ngọc Hạp Thông Thư, trang 39" }]
  };
  const DAI_KY_AM = ["Nguyệt kỵ", "Tam nương sát"];             // đại kỵ tính theo ngày âm: thơ khớp đúng ngày, được ưu tiên
  const DAI_KY = ["Thụ tử", "Sát chủ", "Tam nương sát", "Nguyệt kỵ", "Dương công kỵ", "ngày con nước"];
  /* "chung" không bao giờ in nguyên chữ: lời dùng "các việc thường" / "mọi việc" / danh sách việc */
  const TEN_VIEC = { chung: "việc lớn", dongtho: "động thổ, khởi công", kyket: "ký kết", khaitruong: "khai trương", xuathanh: "xuất hành đi xa", cuoihoi: "cưới hỏi", nhaptrach: "nhập trạch" };
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
    const cum = (ds, o) => { const ra = []; let w = "";
      for (const x of ds) { const ten = conLai(x); if (!ten.length) continue; ten.forEach(nhan);
        const s = lay(o + "_" + x.loai, CUM[x.loai], { ten: ten[0], ds: dsTen(ten, o === "nghich") }, t => dau(t) !== w && !(ten.length > 4 && /cùng chiếu/.test(t))); w = dau(s); ra.push(s); }
      return ra.join(", "); };
    /* Chữ nối: chọn theo chiều (kieu), tránh trùng chữ mở với câu trước */
    const noiCau = (kieu, noiDung) => { const k = layMau("noi_" + kieu, NOI[kieu], khacMo); return ghi(hoa(k.a + noiDung + k.b)); };
    const v = { viec: chung ? (bac === 0 ? "mọi việc" : "việc lớn") : TEN_VIEC[viec], am_ngay: SO[d.am.ngay] };
    const c0 = `Ngày ${d.ccNgay}, ${SO[d.am.ngay]} tháng ${THANG_AM[d.am.thang - 1]}${d.am.nhuan ? " nhuận" : ""}`;
    const chi = String(d.ccNgay).split(" ").pop();
    qd.ten.forEach(nhan);
    let daSatChu = false;
    const satChu = ds => { if (!daSatChu && ds.some(t => /Sát chủ/i.test(t) && t !== "Sát chủ")) { daSatChu = true; return ghi(lay("satchu_khac", MAU.satchu_khac, v, khacMo)); } return ""; };

    if (qd.loai === "dai_ky") {
      /* ═══ Đại kỵ: phạm gì (đoạn 1, kèm thơ/câu sách) → lời sách → ý cùng chiều → điều tốt "dẫu… cũng không cứu được" ═══ */
      const ky = qd.ten, vk = { ...v, ky: noi(ky), n: SO_DEM[ky.length] || String(ky.length) };
      const theoAm = ky.length === 1 && DAI_KY_AM.includes(ky[0]);
      const mo = ky.length > 1 ? lay("qd_dai_ky_nhieu", MAU.qd_dai_ky_nhieu, vk) : lay("qd_dai_ky", theoAm ? MAU.qd_dai_ky.concat(MAU.qd_dai_ky_am) : MAU.qd_dai_ky, vk);
      let p1 = mo.startsWith(",") ? c0 + mo : c0 + ". " + hoa(mo);
      const coTrich = ky.filter(k => TRICH[k]), kyTrich = coTrich.find(k => DAI_KY_AM.includes(k)) || coTrich[0];
      const p2 = [];
      if (kyTrich) {
        const tc = TRICH[kyTrich], t = chon(j, "trich", tc); sung.push("trich#" + tc.indexOf(t)); nguon.add(t.nguon);
        if (t.loai === "cau") p1 += ` Sách chép: «${t.t}».`;
        else if (t.loai === "tho_thang") {
          const cau = THO_THU_TU[(d.am.thangTra || d.am.thang) - 1], tu = cau.toLowerCase().split(/\s+/);
          const con = (CON_CHI[chi] || []).find(w => tu.includes(w));
          tho.push({ sau: 1, t: [cau + "."], nguon: t.nguon, dan: lay("dan_tho_thang", MAU.dan_tho_thang, vk) });
          if (con) p2.push(ghi(hoa(lay("chu_tho", MAU.chu_tho, { con, chi }))));
        } else tho.push({ sau: 1, t: t.t, nguon: t.nguon, dan: lay("dan_tho_ky", MAU.dan_tho_ky, { ky: kyTrich }, ky.length > 1 ? x => /\{ky\}/.test(x) : null) });
      }
      ghi(p1); doan.push(don(p1));
      p2.push(ghi(hoa(ky.length > 1 ? lay("khong_cuu_nhieu", MAU.khong_cuu_nhieu, vk, khacMo) : lay("khong_cuu", MAU.khong_cuu, vk, khacMo))));
      nguon.add("Ngọc Hạp Thông Thư, trang 9");
      const cx = bam(j + ":dk_nghich") % 2 ? cum(d.nghich, "nghich") : ""; if (cx) p2.push(noiCau("cung_xau", cx));
      const nt = cum(d.thuan, "thuan"); if (nt) p2.push(noiCau("nguoc_dai_ky", nt));
      doan.push(don(p2.join(" ")));
    } else {
      /* ═══ Các ngày khác: một đoạn — ý quyết định → cùng chiều → ngược chiều → gỡ ═══ */
      const cau = [];
      const xau = qd.chieu < 0;
      if (qd.loai === "kieng_dai_hung" || qd.loai === "kieng" || qd.loai === "sao_xau_hon") {
        const o = "qd_" + qd.loai;
        cau.push(ghi(c0 + ". " + hoa(lay(o, MAU[o], { ...v, ds: noi(qd.ten) }))));
        if (qd.loai !== "sao_xau_hon") cau.push(satChu(qd.ten));
      } else if (qd.loai === "nhieu_dieu_tot") {
        cau.push(ghi(c0 + ". " + hoa(lay("qd_nhieu_dieu_tot", MAU.qd_nhieu_dieu_tot, { ds: cum(d.thuan, "thuan") }))));
        cau.push(ghi(lay("khong_pham", MAU.khong_pham, v, khacMo)));
      } else {
        cau.push(ghi(c0 + ". " + lay("qd_binh", MAU.qd_binh, v)));
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
    if (bac === 0) k.push(lay("ket_0", MAU.ket_0, { viec: chung ? noi(SAU_VIEC.map(x => TEN_VIEC[x])) : TEN_VIEC[viec] }, du));
    else if (bac === 1) k.push(lay("ket_1", MAU.ket_1, { viec: chung ? "việc lớn" : TEN_VIEC[viec] }, du));
    else if (bac === 2) k.push(lay("ket_2", MAU.ket_2, v, t => du(t) && (d.nghich.length + d.go.length > 0 || !/chẳng tốt|đều ít/.test(t)) && (d.thuan.length > 0 || !/Điều lành tuy có/.test(t))));
    else if (nhieuTranh) k.push(hop.length ? lay("ket_tot_hep", MAU.ket_tot_hep, { viec: noi(hop) }, du) : lay("ket_tot_hep", MAU.ket_tot_hep_khong, {}));
    else {
      const vk = chung ? (hop.length >= 4 ? "các việc lớn" : hop.length ? noi(hop) : "việc lớn") : TEN_VIEC[viec];
      if (chung && !hop.length && tranh.length) { k.push(ngoaiLe); ngoaiLe = ""; k.push(bac === 4 ? "Ngoài việc ấy ra, ngày này rất tốt." : "Ngoài việc ấy ra, ngày này dùng được."); }
      else k.push(lay("ket_" + bac, MAU["ket_" + bac], { viec: vk }, t => du(t) && (laDs(vk) || !/đều/.test(t))));
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
  const CHU_NOI = new Set(["lại", "thêm", "song", "nhưng", "tuy", "dẫu", "huống", "may", "riêng", "duy", "còn", "ngặt", "vậy", "chỉ", "tiếc"]);
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
    /* Độ dài (không kể thơ) */
    const n = demChu(loiVan);
    if (n < 50 || n > 190) loi.push("độ dài " + n + " chữ, ngoài khoảng 50–190");
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
  window.LUAN_VAN2 = { ghep, chay, kiemCau, MAU, TRICH, CUM, NOI };
})();
