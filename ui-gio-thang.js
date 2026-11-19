/* Lịch Pháp © 2026 Lê Lệnh Bắc. Bảo lưu mọi quyền. Bản chính thức, miễn phí: https://lelenhbac1974hn-web.github.io/lich-phap/ — cấm đưa lên chợ ứng dụng, bán hay phát hành lại khi chưa được phép (xem LICENSE). */
/* GIAO DIỆN — PHÁN ĐỊNH, GIỜ, THÁNG: thẻ phán định (Cộng sao / Theo sách), dải tóm tắt, mặt đồng hồ 12 giờ, ba thẻ trực · thần · tú, lịch tháng.
   Giao diện chia nhiều tệp, nạp theo thứ tự trong index.html: ui-chung → ui-to-lich → ui-gio-thang → ui-sao → ui-nhac → ui-khoi-dong.
   Các tệp dùng chung tên khai báo ở mức ngoài cùng (hằng, hàm, trạng thái st); chỉ ui-khoi-dong.js gắn sự kiện chung và vẽ lần đầu. */
"use strict";

/* ── Phán định tốt xấu ── */
/* Bỏ ghi chú số trang "(TT tr.9)" khỏi câu hiện cho người dùng */
const boTrang = s => String(s).replace(/\s*\(TT tr\.[^)]*\)/g, "");
/* Nút chọn kiểu luận: Cộng sao (thang điểm) · Theo sách (quy tắc Ngọc Hạp Thông Thư) */
const nutKieu = () => `<div class="pd-kieu" role="tablist" aria-label="Kiểu luận">
    <button type="button" role="tab" data-kieu="sao" aria-selected="${st.kieu === "sao"}">Cộng sao</button>
    <button type="button" role="tab" data-kieu="sach" aria-selected="${st.kieu === "sach"}">Theo sách</button></div>`;
/* Hai kiểu lệch nhau từ 2 bậc thì ghi một dòng kiểu kia nói gì, để người xem không bị bất ngờ khi chuyển nút */
function dongKieuKhac(sach, cd, ls) {
  if (Math.abs(cd.bac - ls.bac) < 2) return "";
  const t = sach ? `Cộng sao chấm <b>${BAC_UI[cd.bac].t}</b> (${cd.diem > 0 ? "+" : ""}${cd.diem} điểm): thang điểm không xét các ngày kiêng sách ghi.`
    : `Theo sách: <b>${BAC_UI[ls.bac].t}</b> — ${esc(boTrang(ls.ket))}.`;
  return `<p class="pd-khac">${t}</p>`;
}
function vePhanDinh(x) {
  const sach = st.kieu === "sach", cd = x.cd, ls = x.ls, soBac = sach ? ls.bac : cd.bac, bac = BAC_UI[soBac];
  const viec = VIEC.find(v => v.id === st.viec) || VIEC[0];
  const thang = BAC_UI.map((b, i) => `<i class="${b.lop}${i === soBac ? " dang" : ""}" title="${b.t}"></i>`).join("");
  const li = (ds, lop) => ds.map(t => `<li class="${lop}">${esc(t)}</li>`).join("");
  /* Lý do luận theo sách hiện bằng lời thường; số trang sách chỉ giữ trong dữ liệu (luan-sach.js), không đưa lên màn hình */
  const liSach = (ds, lop) => ds.map(m => `<li class="${lop}">${esc(boTrang(m.t))}</li>`).join("");
  $("phan-dinh").className = `the the-phan-dinh ${bac.lop}`;
  $("phan-dinh").innerHTML = sach ? `
    <div class="pd-dau"><div class="pd-nhan">Luận theo sách · ${esc(viec.ten)}</div>${nutKieu()}</div>
    <div class="pd-chinh"><div class="pd-bac">${bac.t}</div></div>
    <div class="pd-ket">${esc(boTrang(ls.ket))}</div>
    <div class="pd-thang" role="img" aria-label="Bậc ${soBac + 1} trên 5">${thang}</div>
    ${oTuoi()}
    ${dongKieuKhac(true, cd, ls)}
    ${ls.khongCuu.length ? `<div class="pd-chan"><b>Ngày đại kỵ — sao tốt không cứu được</b><ul>${liSach(ls.khongCuu, "tru")}</ul></div>` : ""}
    <div class="pd-ly">
      <div><h4>Điều tốt</h4><ul>${liSach(ls.tot, "cong") || '<li class="rong">Không có</li>'}</ul></div>
      <div><h4>Điều kiêng</h4><ul>${liSach(ls.kieng, "tru") || '<li class="rong">Không phạm</li>'}</ul></div>
    </div>
    ${ls.nhac.length ? `<ul class="pd-nhac">${liSach(ls.nhac, "nhac")}</ul>` : ""}
    <p class="pd-nguon">Xét theo Ngọc Hạp Thông Thư: sáu ngày đại kỵ → ngày kiêng theo việc → hoàng đạo, trực, sao tốt xấu hợp việc. <button type="button" class="pd-lien" data-gioi-thieu="gt-luan">Cách luận ›</button></p>` : `
    <div class="pd-dau"><div class="pd-nhan">Phán định · ${esc(viec.ten)}</div>${nutKieu()}</div>
    <div class="pd-chinh">
      <div class="pd-bac">${bac.t}</div>
      <div class="pd-diem"><b>${cd.diem > 0 ? "+" : ""}${cd.diem}</b><span>điểm</span></div>
    </div>
    <div class="pd-thang" role="img" aria-label="Bậc ${soBac + 1} trên 5">${thang}</div>
    ${oTuoi()}
    ${dongKieuKhac(false, cd, ls)}
    ${cd.chan.length ? `<div class="pd-chan"><b>${cd.daiKy.length ? "Ngày đại kỵ — sao tốt không cứu được" : "Kỵ tuyệt đối cho việc này"}</b>${cd.chan.map(esc).join(" · ")}</div>` : ""}
    <div class="pd-ly">
      <div><h4>Điểm cộng</h4><ul>${li(cd.cong, "cong") || '<li class="rong">Không có</li>'}</ul></div>
      <div><h4>Điểm trừ</h4><ul>${li(cd.tru, "tru") || '<li class="rong">Không có</li>'}</ul></div>
    </div>`;
}

/* Sáu ngày đại kỵ (Thụ tử, Sát chủ, Tam nương, Nguyệt kỵ, Dương công kỵ, con nước) ghi bằng chữ trong dòng phụ của dải tốt xấu — không thêm hàng,
   để dải luôn cao như nhau và tờ lịch không co giãn giữa các ngày */
const kyNgay = cd => cd.daiKy;

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
  const canNgay = (x.j + 9) % 10, chiNgay = (x.j + 1) % 12;
  $("mat-gio").innerHTML = `
    <div class="the-tieu-de"><h3>Giờ trong ngày</h3><span>Ngày ${x.ccNgay} · ${laHomNay ? "chạm từng giờ để xem" : `${tot.length} giờ hoàng đạo`}</span></div>
    <svg class="dia" viewBox="-6 -6 352 352" role="group" aria-label="Mười hai giờ can chi">
      ${vach}
      ${mang}
      ${kim}
      <circle cx="${C}" cy="${C}" r="${R0 - 7}" class="tam-gio"/>
      <circle cx="${C}" cy="${C}" r="${R0 - 11}" class="tam-vien"/>
      <text x="${C}" y="${C + (laHomNay ? 3 : 1)}" class="tam-so${laHomNay ? " nho" : ""}">${tamTren}</text>
      <text x="${C}" y="${C + 24}" class="tam-chu">${tamDuoi}</text>
    </svg>
    <div class="chu-gio"><span><i></i>Hoàng đạo</span><span class="hac"><i></i>Hắc đạo</span>${laHomNay ? '<span class="dang"><i></i>Đang diễn ra</span>' : ""}</div>
    <div class="gio-chi-tiet ${chon.hd ? "hd" : "hac"}">
      <div class="gct-dau">
        <div><b>Giờ ${chon.can} ${chon.chi}</b><span>${chon.khung} giờ${laHomNay && chon.i === gioNay ? " · đang diễn ra" : ""}</span></div>
        <em>${chon.hd ? "Hoàng đạo" : "Hắc đạo"}</em>
      </div>
      <p><strong>${chon.than}</strong> — ${Y_THAN[chon.than] || ""}</p>
      <p class="gct-xung">Giờ xung tuổi <b>${chon.xung}</b></p>
      ${laHomNay && chon.i !== gioNay ? `<button type="button" class="gct-bay" data-gio="${gioNay}">Bây giờ ${hai(bay.getHours())}:${hai(bay.getMinutes())} · giờ ${gio[gioNay].can} ${gio[gioNay].chi} · ${gio[gioNay].hd ? "hoàng đạo" : "hắc đạo"} ›</button>` : ""}
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
    if (thu === 0 || le.some(l => l.nghi)) lop.push("do");
    const amTxt = am.day === 1 ? `${am.day}/${am.month}${am.leap ? "n" : ""}` : am.day;
    const nh = nhacCuaNgay(j);
    const vh = viecCuaNgay(j);
    const ten = nh.map(n => n.ten).concat(vh.map(v => v.ten), le.length ? [le[0].ten] : []).join(" · ");
    if (nh.length) lop.push("co-nhac");
    o += `<button type="button" class="${lop.join(" ")}" data-jd="${j}" title="${esc(`${BAC_UI[bacNgay].t} · ${ccNgay(j)}${ten ? " · " + ten : ""}`)}">
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
  for (let i = 0; (lech + soNgay + i) % 7; i++) o += oNgoai(dau + soNgay + i);
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

