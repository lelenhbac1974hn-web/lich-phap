/* Lịch Pháp © 2026 Lê Lệnh Bắc. Bảo lưu mọi quyền. Bản chính thức, miễn phí: https://lelenhbac1974hn-web.github.io/lich-phap/ — cấm đưa lên chợ ứng dụng, bán hay phát hành lại khi chưa được phép (xem LICENSE). */
/* GIAO DIỆN — SAO NGỌC HẠP VÀ GIỚI THIỆU: danh sách sao của ngày, thẻ sao, tra cứu, trang Giới thiệu.
   Giao diện chia nhiều tệp, nạp theo thứ tự trong index.html: ui-chung → ui-to-lich → ui-gio-thang → ui-sao → ui-nhac → ui-khoi-dong.
   Các tệp dùng chung tên khai báo ở mức ngoài cùng (hằng, hàm, trạng thái st); chỉ ui-khoi-dong.js gắn sự kiện chung và vẽ lần đầu. */
"use strict";

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
  /* Tờ thứ hai của Luận giải: hai cột Cát tinh · Hung tinh trên cùng một tờ; Tra cứu, Căn cứ là chữ màu chính ở đầu tờ */
  $("ngoc-hap").innerHTML = `
    <div class="tg-dau">
      <h3>Sao Ngọc Hạp</h3>
      ${CSDL.sao.length ? `<button type="button" class="tg-lien" data-tra-sao>Tra cứu</button><button type="button" class="tg-lien" data-gioi-thieu="gt-can-cu">Căn cứ</button>` : ""}
    </div>
    <p class="tg-phu">Ngày ${x.ccNgay}, tháng ${THANG_AM[x.am.month - 1]} âm lịch · chạm tên sao để xem nghĩa</p>
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
/* Tấm trượt: nút đóng và phần đầu (dau, nếu có) đứng yên; chỉ thân cuộn khi nội dung dài hơn màn hình */
function moTam(html, lop, dau) {
  dongTam();
  tamSao = document.createElement("div");
  tamSao.className = `tam-lop ${lop || ""}`;
  tamSao.setAttribute("role", "dialog"); tamSao.setAttribute("aria-modal", "true");
  tamSao.innerHTML = `<div class="tam"><button type="button" class="tam-dong" aria-label="Đóng">✕</button>${dau ? `<div class="tam-dau">${dau}</div>` : ""}<div class="tam-cuon">${html}</div></div>`;
  document.body.appendChild(tamSao);
  requestAnimationFrame(() => tamSao && tamSao.classList.add("hien"));
  tamSao.addEventListener("click", e => {
    if (e.target === tamSao || e.target.closest(".tam-dong")) { dongTam(true); return; }
    const b = e.target.closest("[data-sao-id]");
    /* Mở một sao từ bảng tra cứu: nhớ chữ đang tìm và chỗ đang cuộn để đóng thẻ thì về đúng chỗ đó */
    if (b) { const s = CSDL.sao.find(z => z.id === b.dataset.saoId); if (s) moTheSao(s, true, tamSao.querySelector(".tam-cuon").scrollTop); }
    if (e.target.closest("[data-tra-lai]")) dongTam(true);
  });
  return tamSao;
}
/* nguoiDung: người dùng bấm ✕, chạm nền hoặc Esc. Thẻ sao mở từ bảng tra cứu thì đóng là quay về bảng tra cứu
   (giữ chữ tìm, bộ lọc, chỗ cuộn), không thoát hẳn ra ngoài. */
function dongTam(nguoiDung) {
  if (!tamSao) return;
  const t = tamSao; tamSao = null; t.classList.remove("hien"); setTimeout(() => t.remove(), 320);
  if (nguoiDung && t.dataset.veTra != null) moTraSao(t.dataset.tim || "", +t.dataset.veTra);
}
document.addEventListener("keydown", e => { if (e.key === "Escape") dongTam(true); });

/* ── Giới thiệu chương trình · căn cứ xem sao · tài liệu ── */
const PHIEN_BAN = "1.22.3";
/* Menu hệ thống (bấm logo 曆): danh sách mục, mỗi mục mở một trang con có nút quay lại.
   Thêm tùy chọn sau này: thêm một dòng vào MENU và nội dung trang trong trangMenu. */
const MENU = [
  { id: "giao-dien", bieu: "trang", ten: "Giao diện", phu: () => `${({ "tu-dong": "Theo máy", sang: "Sáng", toi: "Tối" })[layGiaoDien()]} · tờ lịch ${({ g: "dòng chân tờ", e: "triện", f: "thang 5 bậc", goc: "gốc" })[layToLich()]}` },
  { id: "huong-dan", bieu: "sach", ten: "Hướng dẫn sử dụng", phu: () => "Dùng nhanh, hướng dẫn từng bước" },
  { id: "ve", bieu: "lich", ten: "Về chương trình", phu: () => "Tính năng, hai kiểu luận ngày" },
  { id: "can-cu", bieu: "taiLieu", ten: "Căn cứ và tài liệu", phu: () => "Lịch pháp, sao Ngọc Hạp, sách tham khảo" },
  { id: "nang-cao", bieu: "khoa", ten: "Lớp nâng cao", phu: () => moKhoaNC() ? "Đã mở · cưới hỏi, nhập trạch theo tuổi" : "Mở bằng mã tác giả cấp" },
  { id: "ban-quyen", bieu: "hopDong", ten: "Bản quyền", phu: () => "Tặng miễn phí cho mọi người" }
];
function trangMenu(id) {
  const soDa = CSDL.sao.filter(s => s.tt === 1).length, soMot = CSDL.sao.filter(s => s.tt === 2).length;
  const g = layGiaoDien();
  const chonGD = (k, ten, mo) => `<button type="button" class="mn-chon${g === k ? " dang" : ""}" data-giao-dien="${k}" aria-pressed="${g === k}">
      <span class="mn-o" aria-hidden="true"></span><span><b>${ten}</b><small>${mo}</small></span></button>`;
  const to = layToLich();
  const chonTo = (k, ten, mo) => `<button type="button" class="mn-chon${to === k ? " dang" : ""}" data-to-lich="${k}" aria-pressed="${to === k}">
      <span class="mn-o" aria-hidden="true"></span><span><b>${ten}</b><small>${mo}</small></span></button>`;
  return {
    "giao-dien": `<section><h4>Sáng hay tối</h4>
        ${chonGD("tu-dong", "Theo máy", "Tự đổi theo cài đặt sáng/tối của điện thoại")}
        ${chonGD("sang", "Sáng", "Nền giấy kem, dễ đọc ban ngày")}
        ${chonGD("toi", "Tối", "Nền nâu sẫm, dịu mắt buổi tối")}</section>
      <section><h4>Tờ lịch</h4>
        ${chonTo("g", "Dòng tốt xấu ở chân tờ", "Mặc định · một hàng cuối vùng âm lịch: việc, kết quả và lý do rút gọn")}
        ${chonTo("e", "Triện tốt xấu", "Triện vuông màu theo bậc, giữa ngày âm và can chi")}
        ${chonTo("f", "Thang 5 bậc dưới tháng âm", "Kết quả kèm thang 5 bậc mảnh, ngay dưới tháng âm")}
        ${chonTo("goc", "Tờ lịch gốc", "Tờ lịch như cũ, tốt xấu ở một dải riêng bên dưới")}</section>`,
    "huong-dan": `<section><h4>Dùng nhanh</h4><ol>
        <li><b>Xem ngày:</b> thẻ Ngày, vuốt để đổi ngày; bấm “Hôm nay” để quay về; ô ngày trên cùng để nhảy tới ngày bất kỳ.</li>
        <li><b>Chọn ngày cho việc:</b> chọn việc ở dải trên cùng, chọn kiểu luận ở mục Luận giải, mở thẻ Tháng xem màu từng ngày, chạm ngày để đọc lý do.</li>
        <li><b>Đọc nghĩa sao:</b> chạm tên sao ở mục Luận giải, hoặc bấm “Tra cứu” để tìm theo tên.</li>
        <li><b>Thêm việc, ngày giỗ:</b> thẻ Nhắc → “＋ Thêm” → gõ một câu tự nhiên.</li></ol>
        <p><button type="button" class="nut nho" data-huong-dan>Xem hướng dẫn từng bước</button></p></section>`,
    ve: `<section><h4>Chương trình</h4>
        <p>Lịch Pháp là lịch vạn niên dành cho người Việt: mỗi ngày là một tờ lịch có âm lịch, can chi, tiết khí, trực, nhị thập bát tú, giờ hoàng đạo và các sao tốt xấu theo Ngọc Hạp. Ứng dụng chạy trên trình duyệt, cài được lên màn hình iPhone/Android như một ứng dụng, dùng được khi không có mạng; mọi dữ liệu nhắc việc chỉ lưu trong máy của bạn.</p></section>
      <section><h4>Tính năng chính</h4><ul>
        <li><b>Ngày</b> — tờ lịch lật: vuốt trái hoặc vuốt lên sang ngày sau, vuốt phải hoặc vuốt xuống về ngày trước; lễ tết hiện trên tờ lịch, <i>nhấn giữ</i> biểu tượng lễ để đọc phong tục.</li>
        <li><b>Giờ</b> — mặt đồng hồ 12 canh giờ, giờ hoàng đạo, hướng Hỷ thần, Tài thần.</li>
        <li><b>Tháng</b> — lịch tháng âm dương, đánh dấu ngày tốt xấu và ngày có nhắc.</li>
        <li><b>Luận giải</b> — xét ngày theo việc (động thổ, khởi công, ký kết hợp đồng, khai trương, bàn giao, xuất hành) bằng hai kiểu: <b>Cộng sao</b> (thang điểm) và <b>Theo sách</b> (theo quy tắc Ngọc Hạp Thông Thư), sao Ngọc Hạp của ngày, tra cứu ${CSDL.sao.length} sao.</li>
        <li><b>Nhắc</b> — Nhắc việc và Ngày lặp lại (giỗ âm lịch, sinh nhật, kỷ niệm). Gõ câu tự nhiên như “Họp giao ban 8h sáng mai”, “Giỗ bố 20/10 âm” — ứng dụng tự hiểu ngày, giờ.</li></ul></section>
      <section id="gt-luan"><h4>Hai kiểu luận ngày</h4>
        <p>Ở mục <b>Luận giải</b> có nút chuyển <b>Cộng sao · Theo sách</b>; mặc định là <b>Theo sách</b>. Lịch tháng tô màu theo kiểu đang chọn; ứng dụng nhớ lựa chọn của bạn. Khi hai kiểu chênh nhau từ hai mức trở lên, thẻ phán định ghi thêm một dòng kiểu kia nói gì.</p>
        <p><b>Cộng sao</b> — cách chấm điểm nhanh: cộng điểm cho hoàng đạo, trực tốt, nhị thập bát tú tốt, sao tốt; trừ điểm cho hắc đạo, sao xấu, Tam nương, Nguyệt kỵ, Dương công kỵ. Tổng điểm quy ra 5 mức từ Rất xấu tới Rất tốt. Sáu ngày đại kỵ của sách (dưới đây) luôn là <b>Rất xấu</b>, điểm cao mấy cũng vậy.</p>
        <p><b>Theo sách</b> — xét đúng thứ tự Ngọc Hạp Thông Thư dạy, mỗi lý do nói rõ bằng lời:</p>
        <ol>
          <li><b>Sáu ngày đại kỵ</b>: Thụ tử, Sát chủ, Tam nương, Nguyệt kỵ, Dương công kỵ, ngày con nước. Sách dạy sao tốt không cứu được → <b>Rất xấu</b>.</li>
          <li><b>Ngày kiêng</b>: ngày sách ghi kiêng mọi việc (Thiên cương, Đại hao, Tiểu hồng sa, Tứ ly, Tứ tuyệt…) và ngày kiêng riêng của việc đang chọn (động thổ thì xét Vãng vong, Thổ cấm, Thiên hoả, Nguyệt phá…) → <b>Xấu</b> hoặc <b>Rất xấu</b>.</li>
          <li>Không phạm kiêng thì xét <b>điều tốt</b>: ngày hoàng đạo, trực tốt (Kiến, Mãn, Bình, Định, Chấp, Thành), sao tốt hợp việc, quy tắc tốt theo việc (Tạo ốc, Lộc mã, Thiên thành…). Có Giải thần thì giải được sao xấu; sao xấu nhẹ được nhiều sao tốt gánh đỡ.</li>
        </ol>
        <p>Theo sách thì rất khắt khe: khoảng sáu phần mười số ngày trong năm là ngày kiêng cho việc chung — đúng như lời sách. Riêng ba mức không phạm kiêng (Bình thường, Tốt, Rất tốt) là cách chia của chương trình dựa trên các điều tốt sách nêu. Các quy tắc theo tuổi người, theo giờ, cưới hỏi, an táng đã có trong cơ sở tri thức nhưng chưa đưa vào luận ngày.</p></section>`,
    "can-cu": `<section id="gt-can-cu"><h4>Căn cứ lịch pháp</h4>
        <p>Âm lịch tính theo thuật toán thiên văn của Hồ Ngọc Đức, múi giờ Việt Nam (GMT+7): sóc, trung khí, tháng nhuận, tháng đủ thiếu, can chi năm tháng ngày giờ, 24 tiết khí. Đã kiểm thử 510 ngày ngẫu nhiên (10 ngày mỗi năm, 1990–2040) với các trang lịch phổ biến: âm lịch, can chi, tiết khí, trực khớp 100%.</p></section>
      <section><h4>Căn cứ xem sao</h4>
        <p>Sao tốt xấu an theo bảng 12 tháng trong sách <b>Ngọc Hạp Thông Thư</b> (bản dịch Việt), không trộn với các hệ khác. Mỗi sao ghi rõ: nghĩa, việc nên làm, việc kiêng, cách an theo tháng. Trong ${CSDL.sao.length} sao, ${soDa} sao <b>đã đối chiếu</b> từ hai sách trở lên (khi các sách khác nhau thì theo đa số), ${soMot} sao chỉ có Thông Thư ghi. Sao không có bảng an hay quy tắc tính trong sách đã được loại khỏi chương trình.</p>
        <p>Bảng an sao đối chiếu thêm với hai bản gốc: bản khắc chữ Hán <b>Tăng bổ tuyển trạch thông thư quảng Ngọc hạp ký</b> và bản Hán Nôm <b>Ngọc hạp toản yếu thông dụng</b> (1926). Ô nào bản dịch in thiếu hoặc vỡ bảng được bổ sung, sửa theo bản gốc.</p>
        <p><b>Tháng an sao</b>: sao và thần ngày tra theo tháng âm; trực, Tứ ly, Tứ tuyệt theo tiết khí. Tháng nhuận: 15 ngày đầu theo tháng trước, từ ngày 16 theo tháng sau (Ngọc Hạp Chánh Tông). Dương công kỵ và Thập ác đại bại theo bản chữ Hán và Chánh Tông, nơi bản dịch Thông Thư in lệch.</p></section>
      <section><h4>Tài liệu tham khảo</h4><ul>
        <li>Ngọc Hạp Thông Thư — bảng an sao 12 tháng, sao tốt, sao xấu, ngày kỵ.</li>
        <li>Tăng bổ tuyển trạch thông thư quảng Ngọc hạp ký (bản khắc chữ Hán) — bảng sao tốt, sao xấu 12 tháng.</li>
        <li>Ngọc Hạp Chánh Tông (Viên Tài Hà Tấn Phát) — cưới gả, làm nhà, quy tắc tháng nhuận.</li>
        <li>Ngọc hạp toản yếu thông dụng (Hán Nôm, 1926) — bảng an sao, tên sao chữ Hán.</li>
        <li>Hồ Ngọc Đức, “Thuật toán tính âm lịch” — phần lịch pháp.</li>
        <li>Ca dao, tục ngữ Việt Nam — câu in trên tờ lịch.</li></ul></section>`,
    "nang-cao": trangNangCao(),
    "ban-quyen": `<section><h4>Bản quyền</h4>
        <p>Lịch Pháp được tặng <b>miễn phí</b> cho mọi người. Bản chính thức duy nhất ở địa chỉ <b>lelenhbac1974hn-web.github.io/lich-phap</b>. Nếu bạn phải trả tiền, hoặc thấy ứng dụng này trên chợ ứng dụng (App Store, Google Play…), đó là bản sao trái phép.</p>
        <p>Mọi người được dùng, chia sẻ đường dẫn và xem mã để học hỏi. Không được đưa lên chợ ứng dụng, bán, gắn quảng cáo hay phát hành lại dưới tên khác khi chưa có đồng ý của tác giả.</p></section>
      <p class="gt-cuoi">Phiên bản ${PHIEN_BAN} · © 2026 Lê Lệnh Bắc · Bảo lưu mọi quyền<br>Xem ngày là tham khảo văn hoá truyền thống, không thay cho quyết định của bạn.</p>`
  }[id] || "";
}
/* muc: id trang con ("can-cu", "ve"…) hoặc id một đoạn trong trang con ("gt-luan", "gt-can-cu") — mở thẳng tới đó */
function moGioiThieu(muc) {
  /* Đầu menu (tên app + thanh "‹ Menu" của trang con) đứng yên; chỉ phần dưới cuộn */
  const el = moTam(`<div class="mn-vung"></div>`, "lop-gt", `
    <header class="gt-dau"><div class="gt-an" aria-hidden="true">曆</div>
      <h3>Lịch Pháp</h3><p>Lịch âm dương · xem ngày theo Ngọc Hạp · nhắc việc</p></header>
    <div class="mn-thanh"></div>`);
  const vung = el.querySelector(".mn-vung"), thanh = el.querySelector(".mn-thanh");
  const truot = tu => { if (tu && !giamDong.matches) vung.animate([{ transform: `translateX(${tu}px)`, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 300, easing: "cubic-bezier(.22,1,.36,1)" }); };
  const veMenu = tu => {
    vung.innerHTML = `<ul class="mn-ds">${MENU.map(m => `<li><button type="button" class="mn-muc" data-mn="${m.id}">
        <span class="mn-bieu">${ic(m.bieu)}</span><span class="mn-chu"><b>${m.ten}</b><small>${m.phu()}</small></span><span class="mn-toi" aria-hidden="true">›</span></button></li>`).join("")}</ul>
      <p class="gt-cuoi">Phiên bản ${PHIEN_BAN} · © 2026 Lê Lệnh Bắc</p>`;
    thanh.innerHTML = "";
    truot(tu);
  };
  const veTrang = (id, tu) => {
    const m = MENU.find(x => x.id === id);
    thanh.innerHTML = `<div class="mn-dau"><button type="button" class="mn-lui" data-mn-lui>‹ Menu</button><h4>${m.ten}</h4></div>`;
    vung.innerHTML = `<div class="gt-than">${trangMenu(id)}</div>`;
    truot(tu);
    el.querySelector(".tam-cuon").scrollTop = 0;
  };
  el.querySelector(".tam").addEventListener("click", e => {
    const m = e.target.closest("[data-mn]"), lui = e.target.closest("[data-mn-lui]"), gd = e.target.closest("[data-giao-dien]");
    if (m) veTrang(m.dataset.mn, 40);
    else if (lui) veMenu(-40);
    else if (gd) { datGiaoDien(gd.dataset.giaoDien); veTrang("giao-dien"); }
    else if (e.target.closest("[data-to-lich]")) { datToLich(e.target.closest("[data-to-lich]").dataset.toLich); veTrang("giao-dien"); requestAnimationFrame(xepNhan); }
  });
  const trangCua = { "gt-luan": "ve", "gt-can-cu": "can-cu" };
  if (muc && (MENU.some(x => x.id === muc) || trangCua[muc])) {
    veTrang(trangCua[muc] || muc);
    const doan = el.querySelector("#" + muc);
    if (doan) setTimeout(() => doan.scrollIntoView({ block: "start" }), 60);
  } else veMenu();
}

document.addEventListener("click", e => { const b = e.target.closest("[data-gioi-thieu]"); if (b) { e.preventDefault(); moGioiThieu(b.dataset.gioiThieu); } });

/* ── Hướng dẫn lần mở đầu: 5 bước ngắn, tự hiện một lần; mở lại từ trang Giới thiệu ── */
const KHOA_HD = "lichphap:da-xem-huong-dan";
const HUONG_DAN = [
  ["lich", "Tờ lịch mỗi ngày", "Vuốt trái hoặc vuốt lên để sang ngày sau, vuốt phải hoặc vuốt xuống để về ngày trước. Chạm ô ngày trên cùng để chọn ngày bất kỳ, bấm “Hôm nay” để quay về."],
  ["co", "Chọn việc định làm", "Hàng nút trên cùng: Việc chung, Động thổ, Ký kết, Khai trương, Xuất hành. Ngày tốt hay xấu được xét theo việc bạn chọn."],
  ["sao", "Ngày tốt hay xấu", "Dải màu dưới tờ lịch cho biết mức tốt xấu, chạm vào để đọc lý do. Mục Luận giải có hai kiểu: Cộng sao (chấm điểm) và Theo sách (theo Ngọc Hạp Thông Thư)."],
  ["dongHo", "Giờ và tháng", "Thẻ Giờ: giờ hoàng đạo màu xanh, hắc đạo màu đỏ, chạm ô giờ để xem. Thẻ Tháng: vạch màu dưới mỗi ngày cho biết tốt xấu, tiện chọn ngày cho việc lớn."],
  ["nen", "Nhắc việc, ngày giỗ", "Thẻ Nhắc → “+ Thêm”, gõ một câu như “Giỗ bố 20/10 âm” hay “Họp giao ban 8h sáng mai”. Dữ liệu chỉ lưu trong máy của bạn."]
];
function moHuongDan() {
  let i = 0;
  const el = moTam(`<div class="hd-khung"></div>`, "lop-hd");
  const ve = () => {
    const [bieu, tieuDe, noiDung] = HUONG_DAN[i], cuoi = i === HUONG_DAN.length - 1;
    el.querySelector(".hd-khung").innerHTML = `
      <div class="hd-bieu">${ic(bieu)}</div>
      <p class="hd-buoc">Bước ${i + 1}/${HUONG_DAN.length}</p>
      <h3>${tieuDe}</h3>
      <p class="hd-nd">${noiDung}</p>
      <div class="hd-cham" aria-hidden="true">${HUONG_DAN.map((_, k) => `<i${k === i ? ' class="dang"' : ""}></i>`).join("")}</div>
      <div class="hd-nut">${cuoi ? "" : '<button type="button" class="nut nho" data-hd="bo">Bỏ qua</button>'}
        <button type="button" class="nut nut-chinh" data-hd="tiep">${cuoi ? "Bắt đầu dùng" : "Tiếp ›"}</button></div>`;
  };
  el.addEventListener("click", e => {
    const b = e.target.closest("[data-hd]");
    if (!b) return;
    if (b.dataset.hd === "tiep" && i < HUONG_DAN.length - 1) { i++; ve(); } else dongTam();
  });
  ve();
  try { localStorage.setItem(KHOA_HD, "1"); } catch (er) { /* trình duyệt chặn lưu: lần sau hiện lại */ }
}
document.addEventListener("click", e => { if (e.target.closest("[data-huong-dan]")) { e.preventDefault(); moHuongDan(); } });
function hienHuongDanLanDau() {
  let da = true;
  try { da = localStorage.getItem(KHOA_HD) === "1"; } catch (er) { /* không đọc được: không làm phiền */ }
  if (!da) setTimeout(moHuongDan, 700);
}

/* Bỏ ghi chú nghiên cứu (số trang, nhóm xếp trong sách) khỏi lời giải nghĩa, chỉ giữ ý nghĩa */
function moTheSao(s, tuTra, cuonTra) {
  const thangNay = thangAnSao(ttNgay(st.jd).am); // tháng nhuận chia đôi như khi an sao
  const an = s.an && s.an.thang ? Array.from({ length: 12 }, (_, i) => {
    const v = (s.an.thang[String(i + 1)] || []).join(", ") || "—";
    return `<div class="${i + 1 === thangNay ? "nay" : ""}"><span>T${i + 1}</span><b>${esc(v)}</b></div>`;
  }).join("") : "";
  const ds = (tieu, arr, lop) => arr && arr.length ? `<div class="ts-viec ${lop}"><h4>${tieu}</h4><p>${arr.map(esc).join(" · ")}</p></div>` : "";
  const cu = tamSao && tamSao.dataset.tim;
  const el = moTam(`<div class="ts-than">
      ${s.nghia ? `<p class="ts-nghia">${esc(s.nghia)}</p>` : `<p class="ts-nghia rong">Sách không ghi nghĩa riêng cho sao này.</p>`}
      ${ds("Nên", s.nen, "nen")}${ds("Kỵ", s.ky, "ky")}
      ${an ? `<h4 class="ts-an-tieu">An sao theo tháng âm${s.an.theo === "can" ? " (theo can ngày)" : s.an.theo === "ngayam" ? " (theo ngày âm)" : ""}</h4><div class="ts-an">${an}</div>` : ""}
      <p class="ts-nguon"><span class="${s.tt ? "da" : "chua"}">${s.tt === 1 ? "✓ Đã đối chiếu Ngọc Hạp" : s.tt === 2 ? "✓ Theo Ngọc Hạp Thông Thư (một nguồn)" : "◔ Đang đối chiếu Ngọc Hạp"}</span></p>
    </div>`, "lop-sao", `
    <header class="ts-dau ${s.loai}">
      ${s.han ? `<div class="ts-han" aria-hidden="true">${esc(s.han)}</div>` : ""}
      <span class="ts-loai">${s.loai === "tot" ? "Cát tinh · sao tốt" : "Hung tinh · sao xấu"}</span>
      <h3>${esc(s.ten)}</h3>
      ${s.han ? `<p class="ts-han-nho">${esc(s.han)}</p>` : ""}
    </header>
    ${tuTra ? `<div class="mn-dau"><button type="button" class="mn-lui" data-tra-lai>‹ Danh sách sao</button></div>` : ""}`);
  if (cu) el.dataset.tim = cu;
  if (tuTra) el.dataset.veTra = cuonTra || 0;
}

/* Tra cứu: danh sách trên trang sổ (cùng khuôn dòng thẻ Nhắc — luật 6), ô tìm là một dòng gạch chân,
   ba tab gạch chân Tất cả · Cát tinh · Hung tinh (luật 3). Bộ lọc nhớ trong lúc tấm còn mở. */
let locSao = "tat";
function moTraSao(tim, cuon) {
  const el = moTam(`<ul class="tra-ds"></ul>`, "lop-tra", `
    <header class="tra-dau"><h3>Tra cứu sao Ngọc Hạp</h3><p>${CSDL.sao.length} sao · theo Ngọc Hạp Thông Thư</p>
      <label class="tra-tim">${ic("tim")}<input type="search" class="tra-o" placeholder="Gõ tên sao, ví dụ: thiên đức" aria-label="Tìm sao" value="${esc(tim || "")}" /></label>
      <div class="tra-loc" role="tablist" aria-label="Lọc sao"></div></header>`);
  const o = el.querySelector(".tra-o"), ul = el.querySelector(".tra-ds"), loc = el.querySelector(".tra-loc");
  const bo = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();
  const ve2 = () => {
    const q = bo(o.value.trim()); el.dataset.tim = o.value;
    const hop = CSDL.sao.filter(s => !q || bo(s.ten).includes(q) || (s.han || "").includes(o.value.trim()));
    const dem = { tat: hop.length, tot: hop.filter(s => s.loai === "tot").length, xau: hop.filter(s => s.loai === "xau").length };
    loc.innerHTML = Object.entries({ tat: "Tất cả", tot: "Cát tinh", xau: "Hung tinh" }).map(([k, t]) =>
      `<button type="button" role="tab" data-loc-sao="${k}" aria-selected="${locSao === k}">${t} <em>${dem[k]}</em></button>`).join("");
    const ds = hop.filter(s => locSao === "tat" || s.loai === locSao).sort((a, b) => a.ten.localeCompare(b.ten, "vi"));
    ul.innerHTML = ds.map(s => `<li><button type="button" data-sao-id="${esc(s.id)}" class="${s.loai}"><span class="td-dau"><i></i></span>
      <span class="td-nd"><b>${esc(s.ten)}${s.han ? `<small>${esc(s.han)}</small>` : ""}</b>${s.nghia ? `<em>${esc(s.nghia)}</em>` : ""}</span><span class="td-mui">›</span></button></li>`).join("")
      || `<li class="rong">Không tìm thấy sao nào.</li>`;
  };
  loc.addEventListener("click", e => { const b = e.target.closest("[data-loc-sao]"); if (b) { locSao = b.dataset.locSao; ve2(); } });
  o.addEventListener("input", ve2); ve2();
  if (cuon) el.querySelector(".tam-cuon").scrollTop = cuon;
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-sao]");
  if (b) { const s = saoTheoTen.get(b.dataset.sao); if (s) moTheSao(s); else baoTam("Chưa có dữ liệu sách cho sao này."); return; }
  if (e.target.closest("[data-tra-sao]")) moTraSao("");
});

