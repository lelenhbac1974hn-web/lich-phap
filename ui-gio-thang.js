/* Lịch Pháp © 2026 Lê Lệnh Bắc. Bảo lưu mọi quyền. Bản chính thức, miễn phí: https://lelenhbac1974hn-web.github.io/lich-phap/ — cấm đưa lên chợ ứng dụng, bán hay phát hành lại khi chưa được phép (xem LICENSE). */
/* GIAO DIỆN — PHÁN ĐỊNH, GIỜ, THÁNG: thẻ phán định (Cộng sao / Theo sách), dải tóm tắt, mặt đồng hồ 12 giờ, ba thẻ trực · thần · tú, lịch tháng.
   Giao diện chia nhiều tệp, nạp theo thứ tự trong index.html: ui-chung → ui-to-lich → ui-gio-thang → ui-sao → ui-nhac → ui-khoi-dong.
   Các tệp dùng chung tên khai báo ở mức ngoài cùng (hằng, hàm, trạng thái st); chỉ ui-khoi-dong.js gắn sự kiện chung và vẽ lần đầu. */
"use strict";

/* ── Phán định tốt xấu ── */
/* Bỏ ghi chú số trang "(TT tr.9)" khỏi câu hiện cho người dùng */
const boTrang = s => String(s).replace(/\s*\(TT tr\.[^)]*\)/g, "");
/* Nút chọn kiểu luận: Cộng sao (thang điểm) · Theo sách (quy tắc Ngọc Hạp Thông Thư) — tab gạch chân trên đầu tờ */
const nutKieu = () => `<div class="pd-kieu" role="tablist" aria-label="Kiểu luận">
    <button type="button" role="tab" data-kieu="sao" aria-selected="${st.kieu === "sao"}">Cộng sao</button>
    <button type="button" role="tab" data-kieu="sach" aria-selected="${st.kieu === "sach"}">Theo sách</button></div>`;
/* Ba thông số của ngày (trực · hoàng đạo · nhị thập bát tú): chữ in trên tờ Luận ngày, không phải thẻ */
function thongSoNgay(x) {
  const { truc, than, saoTen, saoTot } = x.cd;
  const o = (nhan, ten, lop, tag, mo) => `<div><small>${nhan}</small><b>${ten}</b><em class="${lop}">${tag}</em><span>${mo}</span></div>`;
  return `<div class="pd-ba">` +
    o("Thập nhị trực", `Trực ${truc.t}`, truc.g > 0 ? "tot" : truc.g < 0 ? "xau" : "vua",
      truc.g > 0 ? "Trực tốt" : truc.g < 0 ? "Trực xấu" : "Trực vừa", esc(truc.v)) +
    o("Hoàng đạo", than.t, than.hd ? "tot" : "xau", than.hd ? "Hoàng đạo" : "Hắc đạo",
      than.hd ? "Thần hoàng đạo chủ trì — thuận cho việc khởi sự." : "Thần hắc đạo chủ trì — nên tránh việc lớn.") +
    o("Nhị thập bát tú", `Sao ${saoTen}`, saoTot ? "tot" : "xau", saoTot ? "Cát tú" : "Hung tú",
      `Năm ${x.ccNam} · tuổi ${x.conGiap}. Tiết ${x.tiet}.`) + `</div>`;
}
/* Hai kiểu lệch nhau từ 2 bậc thì ghi một dòng kiểu kia nói gì, để người xem không bị bất ngờ khi chuyển nút */
function dongKieuKhac(sach, cd, ls) {
  if (Math.abs(cd.bac - ls.bac) < 2) return "";
  const t = sach ? `Cộng sao chấm <b>${BAC_UI[cd.bac].t}</b> (${cd.diem > 0 ? "+" : ""}${cd.diem} điểm): thang điểm không xét các ngày kiêng sách ghi.`
    : `Theo sách: <b>${BAC_UI[ls.bac].t}</b> — ${esc(boTrang(ls.ket))}.`;
  return `<p class="pd-khac">${t}</p>`;
}
/* Lời luận thành văn (luan-van.js): chỉ cho năm việc thường; lỗi thì bỏ qua, các mục bên dưới vẫn đủ */
function loiLuan(x) {
  if (!window.LUAN_VAN2 || !["chung", "dongtho", "kyket", "khaitruong", "xuathanh"].includes(st.viec)) return "";
  let b; try { b = LUAN_VAN2.ghep(x.j, st.viec); } catch (e) { return ""; }
  const tho = k => b.tho.filter(t => t.sau === k + 1).map(t => `${t.dan ? `<p>${esc(t.dan)}</p>` : ""}
    <blockquote class="pd-tho">${t.t.map(x => "<span>" + esc(x) + "</span>").join("")}<small>${esc(t.nguon.replace(/\s*\(.*\)$/, ""))}</small></blockquote>`).join("");
  return `<div class="pd-loi"><h4>Lời luận</h4>${b.doan.map((d, k) => `<p>${esc(d)}</p>${tho(k)}`).join("")}<p class="pd-loi-ket">${esc(b.ket)}</p></div>`;
}
function vePhanDinh(x) {
  const sach = st.kieu === "sach", cd = x.cd, ls = x.ls, soBac = sach ? ls.bac : cd.bac, bac = BAC_UI[soBac];
  const viec = VIEC.find(v => v.id === st.viec) || VIEC[0];
  const li = (ds, lop) => ds.map(t => `<li class="${lop}">${esc(t)}</li>`).join("");
  /* Lý do luận theo sách hiện bằng lời thường; số trang sách chỉ giữ trong dữ liệu (luan-sach.js), không đưa lên màn hình */
  /* Tên sao, tên ngày kỵ trong lý do chạm được: mở thẻ giải thích (review 1.30.0 — "chỗ tra không ra") */
  const tenSao = new Map((typeof CSDL !== "undefined" ? CSDL.sao : []).map(s => [s.ten, s])), tenKy = new Map(window.LUAN_GIAI.quyTac.filter(q => q.nd && !q.nguon && /hung/.test(q.muc)).map(q => [q.ten, q.id]));
  const noi = t => {
    if (tenKy.has(t)) return `<button type="button" class="pd-tra" data-ky-id="${tenKy.get(t)}">${esc(t)}</button>`;
    const m = /^(Sao tốt hợp việc|Sao xấu kỵ việc này|Sao xấu nhẹ|Có Giải thần giải trừ sao xấu): (.+?)( — .*)?$/.exec(t);
    if (!m) return esc(t);
    return esc(m[1]) + ": " + m[2].split(", ").map(n => tenSao.has(n) && tenSao.get(n).id ? `<button type="button" class="pd-tra" data-sao-id="${esc(tenSao.get(n).id)}">${esc(n)}</button>` : esc(n)).join(", ") + esc(m[3] || "");
  };
  const liSach = (ds, lop) => ds.map(m => `<li class="${lop}">${noi(boTrang(m.t))}</li>`).join("");
  const khongThem = ls.khongCuu.length ? '<li class="rong">Ngoài ngày đại kỵ nêu trên, không phạm thêm</li>' : '<li class="rong">Không phạm</li>';
  /* Ngày lễ, Tết mà mức xấu: một câu cho người xem khỏi hoảng (review 1.30.0, L10) */
  const leLon = sach && soBac <= 1 && x.le.some(l => l.nghi) ? `<p class="pd-le">Hôm nay là ngày lễ. Mức trên chỉ để cân nhắc khi chọn ngày làm việc lớn; còn sum họp, vui lễ vẫn như thường.</p>` : "";
  $("phan-dinh").className = `the to-giay the-phan-dinh ${bac.lop}`;
  const dau = `<div class="tg-dau pd-dau"><h3 class="pd-nhan">Luận ngày<span> · ${esc(viec.ten)}</span></h3>${nutKieu()}</div>`;
  /* Trên điện thoại, kiểu luận nằm ở thanh Luận giải ngoài vùng cuộn (đứng yên); trong tờ thì ẩn bằng CSS */
  $("lt-kieu").innerHTML = `<span>Kiểu luận · ${esc(viec.ten)}</span>${nutKieu()}`;
  /* Ngày đang luận ghi ngay trên tờ (cùng cách viết với tờ Giờ), người xem khỏi nhìn lên ô ngày ở đầu màn */
  const ngayLuan = `<p class="tg-phu">${nhanNgay(x.j, true)} · ${nhanAm(x.j)} · ngày ${ccNgay(x.j)}</p>`;
  $("phan-dinh").innerHTML = dau + ngayLuan + `<div class="tg-than">` + (sach ? `
    <div class="pd-chinh"><div class="pd-bac">${bac.t}</div></div>
    <div class="pd-ket">${esc(boTrang(ls.ket))}</div>
    ${leLon}
    <hr class="pd-ke">
    ${oTuoi()}
    ${dongKieuKhac(true, cd, ls)}
    ${loiLuan(x)}
    ${ls.khongCuu.length ? `<div class="pd-chan"><b>Ngày đại kỵ — sao tốt không cứu được</b><ul>${liSach(ls.khongCuu, "tru")}</ul></div>` : ""}
    <div class="pd-ly">
      <div><h4>Điều tốt</h4><ul>${liSach(ls.tot, "cong") || '<li class="rong">Không có</li>'}</ul></div>
      ${ls.kyNho ? `<div><h4>Kỵ lớn — nên tránh</h4><ul>${liSach(ls.kyLon, "tru") || khongThem}</ul>
        <h4>Kỵ nhỏ — gia chủ cân nhắc</h4><ul>${liSach(ls.kyNho, "nhac") || '<li class="rong">Không có</li>'}</ul></div>`
        : `<div><h4>Điều kiêng</h4><ul>${liSach(ls.kieng, "tru") || khongThem}</ul></div>`}
    </div>
    ${ls.thamKhao && ls.thamKhao.length ? `<div class="pd-tk"><h4>Sách tham khảo</h4><ul>${ls.thamKhao.map(m => `<li class="${/cat/.test(m.muc) ? "cong" : "tru"}">${esc(m.t)} <small>· ${esc(m.nguon)}</small></li>`).join("")}</ul></div>` : ""}
    ${ls.nhac.length ? `<ul class="pd-nhac">${liSach(ls.nhac, "nhac")}</ul>` : ""}
    ${thongSoNgay(x)}
    <p class="pd-nguon">${ls.kyNho ? "Sách chính: Ngọc Hạp Thông Thư; Chánh Tông, bản chữ Hán chỉ để tham khảo. " : ""}Xét theo Ngọc Hạp Thông Thư: sáu ngày đại kỵ → ngày kiêng theo việc → hoàng đạo, trực, sao tốt xấu hợp việc. <button type="button" class="pd-lien" data-gioi-thieu="gt-luan">Cách luận ›</button></p>` : `
    <div class="pd-chinh">
      <div class="pd-bac">${bac.t}</div>
      <div class="pd-diem"><b>${cd.diem > 0 ? "+" : ""}${cd.diem}</b><span>điểm</span></div>
    </div>
    <hr class="pd-ke">
    ${oTuoi()}
    ${dongKieuKhac(false, cd, ls)}
    ${cd.chan.length ? `<div class="pd-chan"><b>${cd.daiKy.length ? "Ngày đại kỵ — sao tốt không cứu được" : "Kỵ tuyệt đối cho việc này"}</b>${cd.chan.map(esc).join(" · ")}</div>` : ""}
    <div class="pd-ly">
      <div><h4>Điểm cộng</h4><ul>${li(cd.cong, "cong") || '<li class="rong">Không có</li>'}</ul></div>
      <div><h4>Điểm trừ</h4><ul>${li(cd.tru, "tru") || '<li class="rong">Không có</li>'}</ul></div>
    </div>
    ${thongSoNgay(x)}
    <p class="pd-nguon">Cộng điểm hoàng đạo, trực tốt, cát tú, sao tốt; trừ điểm hắc đạo, sao xấu. <button type="button" class="pd-lien" data-gioi-thieu="gt-luan">Cách luận ›</button></p>`) + `</div>`;
}

/* Sáu ngày đại kỵ (Thụ tử, Sát chủ, Tam nương, Nguyệt kỵ, Dương công kỵ, con nước) ghi bằng chữ trong dòng phụ của dải tốt xấu — không thêm hàng,
   để dải luôn cao như nhau và tờ lịch không co giãn giữa các ngày */
const kyNgay = cd => cd.daiKy;

/* Lý do rút gọn cho hàng tốt xấu ở chân tờ lịch: điều nặng nhất trước (đại kỵ → kiêng → điều tốt), bỏ ghi chú trong ngoặc */
function lyDoNgan(x) {
  if (st.kieu !== "sach") { const cd = x.cd, ky = kyNgay(cd); return (ky.length ? ky.join(" · ") + " · " : "") + `Trực ${cd.truc.t} · ${cd.than.t}`; }
  const ls = x.ls, gon = (m, ky) => boTrang(m.t).replace(/\s*\([^)]*\)/g, "").replace(/^Sao tốt hợp việc:\s*/, "").replace(/^Sao xấu kỵ việc này:\s*/, ky);
  const noi = t => t.map((s, i) => i ? chuThuong(s) : s).join(" · ");
  /* Ngày Tốt, Rất tốt (anh Bắc giao 24/11/2026): nêu điều tốt trước, điều kiêng theo sau — không để ngày tốt chỉ hiện một điều kiêng */
  if (!ls.khongCuu.length && ls.bac >= 3 && ls.tot.length) {
    const t = noi(ls.tot.map(m => gon(m, "")));
    return ls.kieng.length ? `${t} · có điều kiêng: ${ls.kieng.map(m => gon(m, "")).join(", ")}` : t;
  }
  const ds = ls.khongCuu.length ? ls.khongCuu : ls.kieng.length ? ls.kieng : ls.tot;
  const t = ds.map(m => gon(m, "Kỵ: "));
  return t.length ? noi(t) : boTrang(ls.ket);
}

/* ── Dải tóm tắt dưới tờ lịch (màn hình hẹp): chạm để sang mục Luận giải ── */
function veTomTat(x) {
  const sach = st.kieu === "sach", cd = x.cd, soBac = sach ? x.ls.bac : cd.bac, bac = BAC_UI[soBac];
  const viec = VIEC.find(v => v.id === st.viec) || VIEC[0];
  const el = $("tom-tat");
  el.className = `tom-tat ${bac.lop}`;
  const ky = kyNgay(cd);
  const phu = sach ? boTrang((x.ls.khongCuu[0] || x.ls.kieng[0] || { t: x.ls.ket }).t)
    : (ky.length ? ky.join(" · ") + " · " : "") + `Trực ${cd.truc.t} · ${cd.than.t} · Sao ${cd.saoTen}`;
  el.innerHTML = `
    <span class="tt-nhan">${sach ? "Theo sách" : "Phán định"} · ${esc(viec.ten)}</span>
    <b class="tt-diem">${sach ? "" : (cd.diem > 0 ? "+" : "") + cd.diem}</b>
    <strong class="tt-bac">${bac.t}</strong>
    <span class="tt-phu">${esc(phu)} <em>›</em></span>
    <span class="pd-thang">${BAC_UI.map((b, i) => `<i class="${b.lop}${i === soBac ? " dang" : ""}"></i>`).join("")}</span>`;
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

/* Đón giờ đi — Thông Thư tr.117–119 ("Lục nhâm đại độn"); cùng phép với 李淳風六壬時課 (HN01 q.5 tờ 86–87).
   Từ Đại an khởi tháng giêng, trên tháng khởi mồng một, trên ngày khởi giờ Tý; mỗi bước một cung.
   Sách không nói tháng nhuận: anh Bắc chốt 21/11/2026 lấy số tháng của tháng trước nó (a.month).
   Ngày tính từ đầu giờ Tý (23 giờ) như can chi — Thông Thư tr.159. Lời quẻ: lục bát Thông Thư tr.117–119. */
const LUC_NHAM = [
  { t: "Đại an", tot: 1, y: ["Đại an gặp được quý nhân", "Có cơm có rượu có tiền tiễn đưa", "Chẳng thời cũng được đại an", "Bình an vô sự tâm thân thanh nhàn"] },
  { t: "Lưu liên", tot: 0, y: ["Lưu liên là chuyện bất thường", "Tìm bạn chẳng thấy nửa đường phân ly", "Không thì lưu lạc một khi", "Nhiều đường trắc trở nhiều khi nhọc nhằn"] },
  { t: "Tốc hỷ", tot: 1, y: ["Tốc hỷ là bạn trùng phùng", "Gặp trùng gặp bạn vợ chồng sánh đôi", "Có tài có lộc hẳn hoi", "Cầu gì cũng được mừng vui thỏa lòng"] },
  { t: "Xích khẩu", tot: 0, y: ["Xích khẩu là quá bần cùng", "Sinh ra khẩu thiệt bạn cùng thị phi", "Chẳng thời mất của có khi", "Không thì chó cắn phân ly vợ chồng"] },
  { t: "Tiểu cát", tot: 1, y: ["Tiểu cát gặp hội thanh long", "Cầu tài cầu lộc ở trong quẻ này", "Cầu gì toại ý vui vầy", "Bình an vô sự gặp thầy, gặp quen"] },
  { t: "Không vong", tot: 0, y: ["Không vong gặp quẻ khẩn cần", "Bệnh tật khẩu thiệt chẳng làm được chi", "Không thì ốm tiểu thê nhi", "Không thì trộm cắp phân ly bất thường"] }
];
const lucNham = (a, gio) => LUC_NHAM[(a.month - 1 + a.day - 1 + gio) % 6];

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
  const jG = jdCanChi(x.j);   // từ 23 giờ hôm nay: mười hai giờ, hướng thần theo ngày can chi mới
  const gio = gioChiTiet(jG);
  const laHomNay = x.j === jdLich();
  const bay = new Date(), gioNay = gioHienTai();
  if (st.gioChon == null) st.gioChon = laHomNay ? gioNay : gio.find(g => g.hd).i;
  const chon = gio[st.gioChon];
  let mang = "";
  gio.forEach(g => {
    const a0 = g.i * 30 - 15, a1 = g.i * 30 + 15;
    const [x0, y0] = cuc(R1, a0), [x1, y1] = cuc(R1, a1);
    const [x2, y2] = cuc(R0, a1), [x3, y3] = cuc(R0, a0);
    const d = `M${x0.toFixed(1)} ${y0.toFixed(1)} A${R1} ${R1} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} A${R0} ${R0} 0 0 0 ${x3.toFixed(1)} ${y3.toFixed(1)} Z`;
    const [tx, ty] = cuc(112, g.i * 30);
    const lop = ["mui", g.hd ? "hd" : "hac"];
    if (laHomNay && g.i === gioNay) lop.push("dang");
    if (g.i === st.gioChon) lop.push("chon");
    mang += `<g class="${lop.join(" ")}" data-gio="${g.i}" role="button" tabindex="0" aria-label="Giờ ${g.can} ${g.chi}, ${g.khung} giờ, ${g.than}, ${g.hd ? "hoàng đạo" : "hắc đạo"}">
      <path d="${d}"/>
      <text x="${tx.toFixed(1)}" y="${(ty - 2).toFixed(1)}" class="chi">${g.chi}</text>
      <text x="${tx.toFixed(1)}" y="${(ty + 16).toFixed(1)}" class="khung">${g.khung}</text>
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
  const canNgay = (jG + 9) % 10, chiNgay = (jG + 1) % 12;
  const aG = amCuaJd(jG), donChon = lucNham(aG, chon.i);
  const donTot = [0, 1, 2, 3, 4, 5].filter(i => lucNham(aG, i).tot)
    .map(i => `<div><small>${lucNham(aG, i).t}</small><b>${CHI[i]} · ${CHI[i + 6]}</b></div>`).join("");
  /* Một tờ giấy: mặt giờ ở trên (đứng yên), dưới là hướng của ngày (cố định) rồi chi tiết giờ đang chọn (dài ngắn tuỳ giờ) */
  $("mat-gio").innerHTML = `
    <div class="tg-dau"><h3>Giờ trong ngày</h3><span class="tg-dau-phu">${nhanNgay(x.j, true)} · ${nhanAm(x.j)} · ${jG !== x.j ? "từ 23 giờ sang ngày" : "ngày"} ${ccNgay(jG)} · ${laHomNay ? "chạm từng giờ để xem" : `${tot.length} giờ hoàng đạo`}</span></div>
    <div class="tg-than">
    <svg class="dia" viewBox="-6 -6 352 352" role="group" aria-label="Mười hai giờ can chi">
      ${vach}
      ${mang}
      ${kim}
      <circle cx="${C}" cy="${C}" r="${R0 - 7}" class="tam-gio"/>
      <circle cx="${C}" cy="${C}" r="${R0 - 11}" class="tam-vien"/>
      <text x="${C}" y="${C + (laHomNay ? 3 : 1)}" class="tam-so${laHomNay ? " nho" : ""}">${tamTren}</text>
      <text x="${C}" y="${C + 24}" class="tam-chu">${tamDuoi}</text>
    </svg>
    <div class="chu-gio"><span><i></i>Hoàng đạo</span><span class="hac"><i></i>Hắc đạo</span>${laHomNay ? '<span class="dang' + (gio[gioNay].hd ? "" : " hac") + '"><i></i>Đang diễn ra</span>' : ""}</div>
    <div class="pd-ba huong">
      <div><small>Hỷ thần</small><b>${HY_THAN[canNgay]}</b></div>
      <div><small>Tài thần</small><b>${TAI_THAN[canNgay]}</b></div>
      <div><small>Ngày xung</small><b>${CHI[(chiNgay + 6) % 12]}</b></div>
    </div>
    <p class="gio-khoi"><span>Khởi giờ</span><b>${CAN[(canNgay * 2) % 10]} Tý</b><em>ngày ${CAN[canNgay % 5]}, ${CAN[canNgay % 5 + 5]} khởi giờ ${CAN[(canNgay * 2) % 10]} Tý</em></p>
    <p class="gio-khoi gio-don"><span>Đón giờ đi</span><em>giờ tốt để xuất hành, ngày ${aG.day}/${aG.month} âm</em><small>Chỉ dùng khi chọn giờ lên đường; xét riêng, không liên quan giờ hoàng đạo – hắc đạo.</small></p>
    <div class="pd-ba huong don">${donTot}</div>
    <div class="gio-chi-tiet ${chon.hd ? "hd" : "hac"}">
      <div class="gct-dau">
        <b>Giờ ${chon.can} ${chon.chi}</b><em>${chon.hd ? "Hoàng đạo" : "Hắc đạo"}</em>
        <span>${chon.khung} giờ${laHomNay && chon.i === gioNay ? " · đang diễn ra" : ""}</span>
      </div>
      <p><strong>${chon.than}</strong> — ${Y_THAN[chon.than] || ""}</p>
      <p class="gct-xung">Giờ xung tuổi <b>${chon.xung}</b></p>
      <div class="gct-don ${donChon.tot ? "tot" : "kem"}">
        <p><span>Đón giờ đi</span><strong>${donChon.t}</strong><em>${donChon.tot ? "Giờ tốt" : "Giờ kém"}</em></p>
        <p class="tho">${donChon.y[0]},<br>${donChon.y[1]}.<br>${donChon.y[2]},<br>${donChon.y[3]}.</p>
      </div>
      ${laHomNay && chon.i !== gioNay ? `<button type="button" class="gct-bay" data-gio="${gioNay}">${ic("dongHo")}Về giờ hiện tại · ${hai(bay.getHours())}:${hai(bay.getMinutes())} giờ ${gio[gioNay].chi}</button>` : ""}
    </div>
    </div>`;
}

/* Khởi giờ (giờ Tý đầu ngày) theo can ngày — Thông Thư tr.82 "Định can giờ":
   Giáp Kỷ khởi Giáp Tý · Ất Canh khởi Bính Tý · Bính Tân khởi Mậu Tý · Đinh Nhâm khởi Canh Tý · Mậu Quý khởi Nhâm Tý
   (cùng công thức can giờ trong gioChiTiet: CAN[(canNgay*2 + i) % 10]). */

/* ── Tìm ngày tốt (thẻ Tìm ngày, anh Bắc duyệt mẫu 21/11/2026) ──
   Từ hôm nay, trong khoảng chọn; mức theo kiểu luận đang chọn (Theo sách / Cộng sao) và việc đang chọn ở dải trên cùng. */
const KHOANG_TIM = [[31, "1 tháng"], [92, "3 tháng"], [183, "6 tháng"], [365, "1 năm"]];
function locNgayTot(tu, soNgay, viec, muc) {
  const r = [];
  for (let j = tu; j < tu + soNgay; j++) { const a = amCuaJd(j), b = bacTheoKieu(j, a, viec); if (b >= muc) r.push({ j, a, b }); }
  return r;
}
const gonLy = s => boTrang(s).replace(/\s*\([^)]*\)/g, "").replace(/^Sao tốt hợp việc:\s*/, "").trim();
/* Điều tốt chính và lưu ý (điều kiêng còn lại) của một ngày đạt mức */
function lyDoTim(j, a, viec) {
  if (st.kieu === "sach") {
    const ls = luanTheoSach(j, a, viec);
    const luu = ls.kieng.map(m => m.sao ? gonLy(m.t).replace(/^Sao xấu kỵ việc này:\s*/, "sao ") + " kỵ việc này" : gonLy(m.t));
    return { tot: [...new Set(ls.tot.map(m => gonLy(m.t)))].join(" · "), luu: [...new Set(luu)].join(" · ") };
  }
  const cd = chamDiem(j, a, viec);
  return { tot: [...new Set(cd.cong)].join(" · "), luu: [...new Set(cd.tru)].join(" · ") };
}
function veTimNgay() {
  const el = $("tim-ngay");
  if (!el) return;
  const viec = VIEC.find(v => v.id === st.viec) || VIEC[0], hom = jdHomNay();
  const kh = st.timKhoang || 92, muc = st.timMuc || 3;
  const ds = locNgayTot(hom, kh, viec.id, muc);
  const ngayVN = j => { const [d, m, y] = jdToDate(j); return `${hai(d)}/${hai(m)}/${y}`; };
  const chip = (attr, gt, hien, chu) => `<button type="button" class="c${gt === hien ? " chon" : ""}" ${attr}="${gt}">${chu}</button>`;
  /* Ít hơn 3 ngày: gợi ý khoảng dài hơn kế tiếp có thêm ngày */
  let goiY = "";
  if (ds.length < 3) {
    const sau = KHOANG_TIM.find(([n]) => n > kh);
    if (sau) { const so = locNgayTot(hom, sau[0], viec.id, muc).length; if (so > ds.length) goiY = `<button type="button" class="tn-goi" data-tim-khoang="${sau[0]}">${esc(viec.ten)} ít ngày hợp. <u>Xem ${sau[1]} tới: ${so} ngày ›</u></button>`; }
  }
  /* Chạm dòng chỉ đánh dấu; chạm ô ngày đầu dòng mới mở tờ lịch ngày đó (cùng cơ chế với biểu tượng ở thẻ Nhắc — anh Bắc 22/11/2026) */
  const chonTim = st.timChon || st.jd;
  let thangTruoc = "", dong = "";
  ds.forEach(({ j, a, b }) => {
    const [d, m, y] = jdToDate(j), k = j - hom, thu = thuCuaJd(j), ld = lyDoTim(j, a, viec.id);
    if (`${m}/${y}` !== thangTruoc) { thangTruoc = `${m}/${y}`; dong += `<li class="tn-td">Tháng ${m} · ${y}</li>`; }
    dong += `<li class="tn-dong${j === chonTim ? " sang" : ""}" data-tim-chon="${j}" tabindex="0">
      <button type="button" class="tn-so${thu === 0 ? " cn" : ""}" data-jd="${j}" aria-label="Mở tờ lịch ngày ${ngayVN(j)}"><b>${d}</b><small>${THU_NGAN[thu]}</small></button>
      <span class="tn-nd"><b>${k === 0 ? "Hôm nay · " : k === 1 ? "Ngày mai · " : ""}${a.day}/${a.month}${a.leap ? " nhuận" : ""} âm</b>${ld.tot ? `<span>${esc(ld.tot)}</span>` : ""}${ld.luu ? `<em>Lưu ý: ${esc(ld.luu)}</em>` : ""}</span>
      <span class="tn-muc ${BAC_UI[b].lop}">${BAC_UI[b].t}<i></i></span></li>`;
  });
  el.innerHTML = `
    <div class="tg-dau pd-dau"><h3 class="tn-ten">Tìm ngày tốt</h3>${nutKieu()}</div>
    <div class="tn-loc">
      <span>Trong</span><div class="sx-chip">${KHOANG_TIM.map(([n, t]) => chip("data-tim-khoang", n, kh, t)).join("")}</div>
      <span>Mức</span><div class="sx-chip">${chip("data-tim-muc", 3, muc, "Tốt trở lên")}${chip("data-tim-muc", 4, muc, "Chỉ Rất tốt")}</div>
    </div>
    <p class="tn-tom"><b>${ds.length} ngày</b> hợp ${esc(viec.ten)} từ ${ngayVN(hom)} đến ${ngayVN(hom + kh - 1)}</p>
    ${goiY}
    ${ds.length ? `<ul class="tn-ds">${dong}</ul>` : `<p class="tn-rong">Không có ngày nào đạt mức này trong khoảng đã chọn.</p>`}`;
  /* Quay lại thẻ: dòng đang đánh dấu nằm giữa vùng nhìn, khỏi cuộn tìm */
  const khung = el.querySelector(".tn-ds"), sang = el.querySelector(".tn-dong.sang");
  if (khung && sang) khung.scrollTop = Math.max(0, sang.offsetTop - (khung.clientHeight - sang.offsetHeight) / 2);
}

/* ── Lịch tháng ── */
function veLichThang(x) {
  const dau = jdFromDate(1, x.mm, x.yy);
  const soNgay = jdFromDate(1, x.mm === 12 ? 1 : x.mm + 1, x.mm === 12 ? x.yy + 1 : x.yy) - dau;
  const lech = (thuCuaJd(dau) + 6) % 7; // tuần bắt đầu Thứ Hai
  const hom = jdLich();
  let o = "";
  /* Ngày của tháng trước / tháng sau lấp chỗ trống đầu và cuối lưới, tô nhạt */
  const oNgoai = j => {
    const am = amCuaJd(j), d = jdToDate(j)[0];
    return `<button type="button" class="o ngoai${thuCuaJd(j) === 0 ? " do" : ""}" data-jd="${j}" title="${esc(ccNgay(j))}">
      <span class="o-duong">${d}</span><span class="o-am">${am.day === 1 ? `${am.day}/${am.month}${am.leap ? "n" : ""}` : am.day}</span></button>`;
  };
  for (let i = lech; i > 0; i--) o += oNgoai(dau - i);
  for (let n = 0; n < soNgay; n++) {
    const j = dau + n, am = amCuaJd(j), bacNgay = bacTheoKieu(j, am, st.viec);
    const le = leCuaNgay(j), thu = thuCuaJd(j);
    const lop = ["o", BAC_UI[bacNgay].lop];
    if (j === st.jd) lop.push("chon");
    if (j === hom) lop.push("hom-nay");
    else if (j < hom) lop.push("qua"); // ngày đã qua: số nhạt đi, vạch tốt xấu giữ nguyên (người tìm ngày khỏi chọn nhầm)
    if (thu === 0 || le.some(l => l.nghi)) lop.push("do");
    const amTxt = am.day === 1 ? `${am.day}/${am.month}${am.leap ? "n" : ""}` : am.day;
    const nh = nhacCuaNgay(j);
    const vh = viecCuaNgay(j);
    const ten = nh.map(n => n.ten).concat(vh.map(v => v.ten), le.length ? [le[0].ten] : []).join(" · ");
    /* Đọc màn hình: đọc đủ ngày, ngày âm, mức tốt xấu (review L7) */
    const nhanO = `${nhanNgay(j, true)} · ${nhanAm(j)} · ${BAC_UI[bacNgay].t}${ten ? " · " + ten : ""}`;
    /* Luật giao diện 9: tối đa 3 dấu, không dấu nào đè số — vạch tốt xấu ở đáy; góc phải trên tối đa hai chấm:
       vàng = lễ tết, xanh dương = việc hoặc ngày nhắc người dùng ghi. Biểu tượng lễ lớn chỉ hiện trên tờ lịch ngày đó. */
    const cham = (le.length ? '<i class="c-le"></i>' : "") + (nh.length || vh.length ? '<i class="c-ta"></i>' : "");
    o += `<button type="button" class="${lop.join(" ")}" data-jd="${j}" aria-label="${esc(nhanO)}" title="${esc(`${BAC_UI[bacNgay].t} · ${ccNgay(j)}${ten ? " · " + ten : ""}`)}">
      ${cham ? `<span class="o-goc" aria-hidden="true">${cham}</span>` : ""}
      <span class="o-duong">${n + 1}</span>
      <span class="o-am${am.day === 1 || am.day === 15 ? " moc" : ""}">${amTxt}</span>
      <span class="o-cham"></span>
    </button>`;
  }
  /* Luôn đủ 6 tuần (42 ô) để tờ lịch tháng cao như nhau, không nhảy khi tháng có 5 hay 6 tuần */
  for (let i = 0; lech + soNgay + i < 42; i++) o += oNgoai(dau + soNgay + i);
  const amDau = amCuaJd(dau), amCuoi = amCuaJd(dau + soNgay - 1);
  /* Chú thích đủ mọi dấu trong ô */
  const chuThich = `<div>${BAC_UI.map(b => `<span class="${b.lop}"><i></i>${b.t}</span>`).join("")}</div>
    <div><span class="ct-le"><i></i>Lễ tết</span><span class="ct-ta"><i></i>Việc, ngày nhắc của bạn</span><span class="ct-hn"><i></i>Hôm nay</span><span class="ct-chon"><i></i>Ngày đang xem</span><span class="ct-qua"><b>9</b>Ngày đã qua</span></div>`;
  /* Tóm tắt ngày đang chọn ngay dưới lưới (anh Bắc duyệt mẫu 24/11/2026): chạm ô chỉ chọn ngày, ở lại lịch tháng;
     mở tờ lịch bằng nút hoặc chạm lần nữa vào ô đang chọn */
  const xb = BAC_UI[st.kieu === "sach" ? x.ls.bac : x.cd.bac], xd = jdToDate(x.j)[0];
  const xle = leCuaNgay(x.j), xnh = nhacCuaNgay(x.j), xvh = viecCuaNgay(x.j);
  const xghi = xle.map(l => `<span class="nc-le">${esc(l.ten)}</span>`)
    .concat(xnh.map(n => `<span class="nc-ta">${esc(n.ten)}</span>`), xvh.map(v => `<span class="nc-ta">${esc(v.ten)}</span>`)).join("");
  const ngayChon = `<div class="ngay-chon" aria-live="polite">
    <div class="nc ${xb.lop}${thuCuaJd(x.j) === 0 || xle.some(l => l.nghi) ? " do" : ""}">
      <div class="nc-so" aria-hidden="true">${xd}</div>
      <div class="nc-giua">
        <div class="nc-ngay">${esc(nhanNgay(x.j, true))} · <span>${esc(nhanAm(x.j))}</span></div>
        <div class="nc-muc"><b>${xb.t}</b><span>${esc(ccNgay(x.j))}</span></div>
        <button type="button" class="nc-ly" data-tab="luan" title="Đọc lý do ở Luận giải"><span>${esc(lyDoNgan(x))}</span><i aria-hidden="true">›</i></button>
        ${xghi ? `<div class="nc-ghi">${xghi}</div>` : ""}
      </div>
    </div>
    <div class="nc-lien"><button type="button" data-mo-to>${ic("lich")}Mở tờ lịch</button><button type="button" data-tab="luan">Luận giải ›</button></div>
  </div>`;
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
    ${ngayChon}
    <div class="chu-thich">${chuThich}</div>`;
}

