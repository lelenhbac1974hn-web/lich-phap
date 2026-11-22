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

/* Trong tờ Luận ngày các sao đã được kể ở lý do, nên danh sách sao thu lại thành một dòng; bấm mới mở (anh Bắc 22/11/2026) */
const KHOA_MO_SAO = "lichphap:mo-sao";
let saoMo = (() => { try { return localStorage.getItem(KHOA_MO_SAO) === "1"; } catch (e) { return false; } })(), saoX = null;
function veNgocHap(x) {
  saoX = x;
  const nh = x.cd.nh;
  const ds = (sao, lop) => sao.length
    ? sao.map(s => {
        const r = saoTheoTen.get(s[0]);
        return `<li class="${lop}"><button type="button" class="sao-nut" data-sao="${esc(s[0])}"><b>${esc(s[0])}${r && r.han ? `<small>${esc(r.han)}</small>` : ""}</b><span>${esc(s[1] || "")}</span></button></li>`;
      }).join("")
    : `<li class="rong">Không có sao nào chiếu.</li>`;
  /* Tờ thứ hai của Luận giải: hai cột Cát tinh · Hung tinh trên cùng một tờ; Tra cứu, Căn cứ là chữ màu chính ở đầu tờ */
  $("ngoc-hap").classList.toggle("thu", !saoMo);
  $("ngoc-hap").innerHTML = `
    <div class="tg-dau">
      <h3><button type="button" class="sao-mo" data-mo-sao aria-expanded="${saoMo}">Sao Ngọc Hạp${saoMo ? "" : `<span>${nh.tot.length} cát tinh · ${nh.xau.length} hung tinh</span>`}<i aria-hidden="true"></i></button></h3>
      ${saoMo && CSDL.sao.length ? `<button type="button" class="tg-lien" data-tra-sao>Tra cứu</button><button type="button" class="tg-lien" data-gioi-thieu="gt-can-cu">Căn cứ</button>` : ""}
    </div>` + (!saoMo ? "" : `
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
    </div>`);
}
document.addEventListener("click", e => {
  if (!e.target.closest("[data-mo-sao]") || !saoX) return;
  saoMo = !saoMo;
  try { if (saoMo) localStorage.setItem(KHOA_MO_SAO, "1"); else localStorage.removeItem(KHOA_MO_SAO); } catch (er) { /* chỉ giữ trong phiên */ }
  veNgocHap(saoX);
  if (saoMo) $("ngoc-hap").scrollIntoView({ block: "nearest", behavior: "smooth" });
});

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
    const k = e.target.closest("[data-ky-id]");
    if (k) { const q = window.LUAN_GIAI.quyTac.find(z => z.id === k.dataset.kyId); if (q) moTheKy(q, true, tamSao.querySelector(".tam-cuon").scrollTop); }
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
const PHIEN_BAN = "1.37.3";
/* Menu hệ thống (bấm logo 曆): danh sách mục, mỗi mục mở một trang con có nút quay lại.
   Thêm tùy chọn sau này: thêm một dòng vào MENU và nội dung trang trong trangMenu. */
const MENU = [
  { id: "giao-dien", bieu: "trang", ten: "Giao diện", phu: () => `${({ "co-dien": "Cổ điển", tre: "Trẻ trung", "trung-nien": "Trung niên", "hien-dai": "Hiện đại" })[layAo()]} · ${AO_TOI.includes(layAo()) ? "Tối" : ({ "tu-dong": "Theo máy", sang: "Sáng", toi: "Tối" })[layGiaoDien()]} ${layCo() === "vua" ? "" : ` · chữ ${layCo() === "lon" ? "lớn" : "rất lớn"}`} · thông tin ngày: ${({ g: "dòng", e: "triện", f: "thang", goc: "gốc" })[layToLich()]}${window.ThoiTiet && ThoiTiet.dangBat() ? " · thời tiết" : ""}` },
  { id: "huong-dan", bieu: "sach", ten: "Hướng dẫn sử dụng", phu: () => "Dùng nhanh, hướng dẫn từng bước" },
  { id: "ve", bieu: "lich", ten: "Về chương trình", phu: () => "Tính năng, hai kiểu luận ngày" },
  { id: "nguyen-tac", bieu: "sao", ten: "Nguyên tắc xem ngày", phu: () => "Dòng sách, thứ tự xem, điều cần biết" },
  { id: "can-cu", bieu: "taiLieu", ten: "Căn cứ và tài liệu", phu: () => "Lịch pháp, sao Ngọc Hạp, sách tham khảo" },
  { id: "nang-cao", bieu: "khoa", ten: "Lớp nâng cao", phu: () => moKhoaNC() ? "Đã mở · cưới hỏi, nhập trạch theo tuổi" : "Mở bằng mã tác giả cấp" },
  { id: "ban-quyen", bieu: "hopDong", ten: "Bản quyền", phu: () => "Tặng miễn phí cho mọi người · miễn trừ trách nhiệm" }
];
function trangMenu(id) {
  const soDa = CSDL.sao.filter(s => s.tt === 1).length, soMot = CSDL.sao.filter(s => s.tt === 2).length;
  const co = layCo(), CO = [["vua", "Vừa", "Cỡ chữ thường"], ["lon", "Lớn", "Chữ và nút to hơn một bậc"], ["rat-lon", "Rất lớn", "Chữ và nút to hơn hai bậc, dễ đọc cho người lớn tuổi"]];
  const g = layGiaoDien(), ao = layAo(), to = layToLich(), hu = layHieuUng(), coTroi = !!(window.ThoiTiet && ThoiTiet.dangBat());
  /* Trang Giao diện gọn (anh Bắc 21/11/2026): mỗi mục một dải chip viền + một dòng mô tả lựa chọn đang dùng, ít cuộn */
  const chip = (thuoc, k, ten, dang, them = "") => `<button type="button" class="mn-chip${dang ? " dang" : ""}" ${thuoc}="${k}" aria-pressed="${dang}">${them}${ten}</button>`;
  const muc = (tieu, chips, mota) => `<section class="mn-nhom"><h4>${tieu}</h4><div class="mn-chips">${chips}</div>${mota ? `<p class="mn-mota">${mota}</p>` : ""}</section>`;
  const AO = [["co-dien", "Cổ điển", "Giấy kem, gáy đỏ son · mặc định", ["#F3ECDD", "#A61E17", "#E19279"]], ["tre", "Trẻ trung", "Xanh bạc hà, kem nhạt, chữ tròn", ["#E4F1EE", "#5DB3A5", "#F2B48C"]], ["trung-nien", "Trung niên", "Xanh da trời dịu, chữ xanh đen, dịu mắt", ["#AFC8E8", "#3F6FB8", "#F4F8FD"]], ["hien-dai", "Hiện đại", "Xanh thẫm, tím, vàng · luôn tối", ["#0E1726", "#7C6CF0", "#F2C14E"]]];
  const GD = [["tu-dong", "Theo máy", "Tự đổi theo cài đặt sáng/tối của điện thoại"], ["sang", "Sáng", "Nền giấy kem, dễ đọc ban ngày"], ["toi", "Tối", "Nền nâu sẫm, dịu mắt buổi tối"]];
  const TO = [["e", "Triện", "Con dấu vuông ghi mức tốt xấu, giữa ngày âm và can chi"], ["g", "Dòng", "Mặc định · một dòng ở chân tờ lịch: việc, mức tốt xấu và lý do rút gọn"], ["f", "Thang", "Mức tốt xấu kèm thang năm bậc, ngay dưới tháng âm"], ["goc", "Gốc", "Tờ lịch như cũ, tốt xấu ở một dải riêng bên dưới"]];
  const HU = [["mua", "Cảnh theo mùa"], ["troi", "Theo thời tiết"], ["le", "Ngày lễ, trăng rằm"], ["anh", "Ánh sáng theo giờ"]];
  const huBat = HU.filter(([k]) => hu[k]);
  const moTaHU = huBat.length ? `Đang bật: ${huBat.map(([, t]) => t.toLowerCase()).join(", ")}.${hu.troi && !coTroi ? " Cảnh theo thời tiết cần bật Thời tiết bên trên." : ""} Ngày lễ vẽ chồng lên thời tiết; không có thời tiết thì theo mùa.` : "Tờ lịch tĩnh, không hiệu ứng.";
  const tim = (ds, k) => (ds.find(x => x[0] === k) || ds[0])[2];
  return {
    "giao-dien": muc("Bộ áo", AO.map(([k, t, , mau]) => chip("data-bo-ao", k, t, ao === k, `<span class="mn-mau" aria-hidden="true">${mau.map(m => `<i style="background:${m}"></i>`).join("")}</span>`)).join(""), tim(AO, ao))
      + muc("Sáng hay tối", GD.map(([k, t]) => chip("data-giao-dien", k, t, g === k)).join(""), AO_TOI.includes(ao) ? "Bộ áo này luôn tối; lựa chọn này dùng khi đổi về bộ áo khác." : tim(GD, g))
      + muc("Cỡ chữ", CO.map(([k, t]) => chip("data-co-chu", k, t, co === k)).join(""), CO.find(z => z[0] === co)[2])
      + muc("Thông tin nhanh ngày", TO.map(([k, t]) => chip("data-to-lich", k, t, to === k)).join(""), tim(TO, to))
      + muc("Thời tiết", chip("data-thoi-tiet", "0", "Tắt", !coTroi) + chip("data-thoi-tiet", "1", "Theo vị trí của máy", coTroi),
        `${coTroi ? ThoiTiet.moTa() + ". " : ""}Bật là cho phép dùng vị trí; vị trí làm tròn khoảng 10 km rồi gửi tới Open-Meteo. Dữ liệu: <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo.com</a> (<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>).`)
      + muc("Hiệu ứng", HU.map(([k, t]) => chip("data-hieu-ung", k, t, hu[k])).join(""), moTaHU),
    "huong-dan": `<section><h4>Dùng nhanh</h4><ol>
        <li><b>Xem ngày:</b> thẻ Ngày, vuốt để đổi ngày; bấm “Hôm nay” để quay về; ô ngày trên cùng để nhảy tới ngày bất kỳ.</li>
        <li><b>Chọn ngày cho việc:</b> chọn việc ở dải trên cùng rồi mở thẻ Tìm ngày; hoặc mở thẻ Tháng xem màu từng ngày, chạm ngày để đọc lý do.</li>
        <li><b>Đọc nghĩa sao:</b> chạm tên sao ở mục Luận giải, hoặc bấm “Tra cứu” để tìm theo tên.</li>
        <li><b>Thêm việc, ngày giỗ:</b> thẻ Nhắc → “＋ Thêm” → gõ một câu tự nhiên.</li></ol>
        <p><button type="button" class="nut nho" data-huong-dan>Xem hướng dẫn từng bước</button></p></section>`,
    ve: `<section><h4>Chương trình</h4>
        <p>Lịch Pháp là lịch vạn niên dành cho người Việt: mỗi ngày là một tờ lịch có âm lịch, can chi, tiết khí, trực, nhị thập bát tú, giờ hoàng đạo và các sao tốt xấu theo Ngọc Hạp. Ứng dụng chạy trên trình duyệt, cài được lên màn hình iPhone/Android như một ứng dụng, dùng được khi không có mạng; mọi dữ liệu nhắc việc chỉ lưu trong máy của bạn. Nếu bạn bật thời tiết (Menu → Giao diện), ứng dụng gửi vị trí đã làm tròn khoảng 10 km tới Open-Meteo để lấy nhiệt độ hôm nay.</p></section>
      <section><h4>Tính năng chính</h4><ul>
        <li><b>Ngày</b> — tờ lịch lật: vuốt trái hoặc vuốt lên sang ngày sau, vuốt phải hoặc vuốt xuống về ngày trước; lễ tết hiện trên tờ lịch kèm biểu tượng riêng, <i>chạm</i> tên lễ để đọc gốc tích, phong tục.</li>
        <li><b>Tìm ngày</b> — chọn việc ở dải trên cùng, chọn khoảng (1 tháng đến 1 năm) và mức; ứng dụng liệt kê các ngày hợp việc kèm điều tốt chính và lưu ý; chạm một ngày để mở tờ lịch.</li>
        <li><b>Tháng</b> — lịch tháng âm dương, đánh dấu ngày tốt xấu và ngày có nhắc.</li>
        <li><b>Luận giải</b> — hai trang: <i>Luận ngày</i> và <i>Giờ và xuất hành</i> (mặt đồng hồ 12 canh giờ, giờ hoàng đạo, hướng Hỷ thần, Tài thần, khởi giờ). Luận ngày xét theo việc (động thổ, khởi công, ký kết hợp đồng, khai trương, bàn giao, xuất hành) bằng hai kiểu: <b>Cộng sao</b> (thang điểm) và <b>Theo sách</b> (theo quy tắc Ngọc Hạp Thông Thư), sao Ngọc Hạp của ngày, tra cứu ${CSDL.sao.length} sao.</li>
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
    /* Tổng hợp từ báo cáo nghiên cứu trạch nhật 21/11/2026 (tai-lieu/nghien-cuu-trach-nhat/BAO-CAO.md) */
    "nguyen-tac": `<section><h4>Chương trình theo dòng sách nào</h4>
        <p>Lịch Pháp theo dòng <b>Ngọc hạp</b>, dòng sách xem ngày quen dùng nhất ở Việt Nam: bảng sao tốt xấu theo tháng, mười hai trực, hoàng đạo hắc đạo và các ngày kỵ tính theo ngày âm. Chương trình giữ một dòng, không trộn sao của hệ khác.</p>
        <p>Các sách xem ngày xưa nay vốn không thống nhất. Sử ký chép đời Hán bảy nhà cùng xem một ngày cưới mà ra bảy kết quả. Sách lịch của triều Thanh, Hiệp kỷ biện phương thư (1739), còn bác một số phép của dòng Ngọc hạp như Dương công kỵ, tháng đại lợi cưới gả. Vì vậy cùng một ngày, lịch khác có thể ghi khác; đó là khác dòng sách, không hẳn là bên nào tính sai.</p></section>
      <section><h4>Thứ tự xem một ngày</h4><ol>
        <li><b>Việc gì, của ai.</b> Mỗi việc có sao nên, sao kỵ riêng; tuổi người chủ sự cũng cần biết.</li>
        <li><b>Xét năm theo tuổi</b> với việc lớn: làm nhà xét Kim lâu, Hoang ốc, Tam tai; cưới xét tháng đại lợi. Đây là hỏi “năm ấy có nên làm không”, khác với chọn ngày.</li>
        <li><b>Bỏ ngày đại kỵ:</b> Thụ tử, Sát chủ, Tam nương, Nguyệt kỵ, Dương công kỵ, ngày con nước. Sách dạy sao tốt không cứu được.</li>
        <li><b>Bỏ ngày xung tuổi</b> người chủ sự.</li>
        <li><b>Xét trực và sao theo việc.</b> Sao xấu nhẹ có nhiều sao tốt cùng ngày thì vẫn dùng được.</li>
        <li><b>Chọn giờ.</b> Giờ hoàng đạo; đi xa xem thêm giờ đón đi và hướng Hỷ thần, Tài thần.</li></ol>
        <p>Hai bước đầu chương trình không tự biết thay bạn; từ bước ba trở đi là phần chương trình tính ở các thẻ Luận giải và Tìm ngày. Xét theo tuổi có ở Lớp nâng cao.</p></section>
      <section><h4>Mấy nguyên lý</h4><ul>
        <li><b>Hai cách tính tháng.</b> Sao và thần ngày tra theo tháng âm; trực, Tứ ly, Tứ tuyệt theo tiết khí. Đầu và cuối tháng âm vì thế có ngày lịch khác ghi sao khác.</li>
        <li><b>Ngày kỵ theo ngày âm</b> (Nguyệt kỵ mồng 5, 14, 23; Tam nương; Dương công kỵ) đếm theo số ngày trong tháng, không theo can chi.</li>
        <li><b>Năm không bằng tháng, tháng không bằng ngày, ngày không bằng giờ.</b> Ngày chưa thật đẹp thì chọn giờ tốt để bù.</li>
        <li><b>Âm lịch Việt Nam</b> tính theo giờ Việt Nam nên có năm lệch lịch Trung Quốc: Tết Ất Sửu 1985 hai nước cách nhau một tháng. Lịch dịch thẳng từ sách Trung Quốc có thể sai ngày.</li></ul></section>
      <section><h4>Điều cần biết</h4>
        <p>Xem ngày là nếp văn hoá để người làm việc lớn được yên tâm, không phải phép bảo đảm thành bại. Phan Kế Bính viết trong Việt Nam phong tục (1915) rằng việc thành hay bại “cốt do ở người”. Nhà Phật cũng dạy không có ngày tự nó tốt hay xấu. Chương trình nêu lý do của từng ngày bằng lời để bạn tự cân nhắc.</p></section>`,
    "can-cu": `<section id="gt-can-cu"><h4>Căn cứ lịch pháp</h4>
        <p>Âm lịch tính theo thuật toán thiên văn của Hồ Ngọc Đức, múi giờ Việt Nam (GMT+7): sóc, trung khí, tháng nhuận, tháng đủ thiếu, can chi năm tháng ngày giờ, 24 tiết khí.</p></section>
      <section><h4>Căn cứ xem sao</h4>
        <p>Sao tốt xấu an theo bảng 12 tháng trong sách <b>Ngọc Hạp Thông Thư</b> (bản dịch Việt), không trộn với các hệ khác. Mỗi sao ghi rõ: nghĩa, việc nên làm, việc kiêng, cách an theo tháng. Trong ${CSDL.sao.length} sao, ${soDa} sao <b>đã đối chiếu</b> từ hai sách trở lên (khi các sách khác nhau thì theo đa số), ${soMot} sao chỉ có Thông Thư ghi. Sao không có bảng an hay quy tắc tính trong sách đã được loại khỏi chương trình.</p>
        <p>Bảng an sao đối chiếu thêm với hai bản gốc: bản khắc chữ Hán <b>Tăng bổ tuyển trạch thông thư quảng Ngọc hạp ký</b> và bản Hán Nôm <b>Ngọc hạp toản yếu thông dụng</b> (1926). Ô nào bản dịch in thiếu hoặc vỡ bảng được bổ sung, sửa theo bản gốc.</p>
        <p><b>Tháng an sao</b>: sao và thần ngày tra theo tháng âm; trực, Tứ ly, Tứ tuyệt theo tiết khí. Tháng nhuận: 15 ngày đầu theo tháng trước, từ ngày 16 theo tháng sau (Ngọc Hạp Chánh Tông). Dương công kỵ và Thập ác đại bại theo bản chữ Hán và Chánh Tông, nơi bản dịch Thông Thư in lệch.</p></section>
      <section><h4>Tài liệu tham khảo</h4><ul>
        <li><b>Ngọc Hạp Thông Thư</b> <span class="ck-han">玉匣通書</span> (bản dịch Việt) — sách chính: bảng an sao 12 tháng, sao tốt, sao xấu, ngày kỵ, giờ, đón giờ đi.</li>
        <li><b>Tân tuyên Hứa Chân Quân Ngọc hạp ký tăng bổ chư gia tuyển trạch nhật dụng thông thư</b> <span class="ck-han">新鐫許真君玉匣記增補諸家選擇日用通書</span> (bản khắc chữ Hán, 6 quyển) — đối chiếu bảng sao 12 tháng; phép đón giờ đi <span class="ck-han">李淳風六壬時課</span> ở quyển 5.</li>
        <li><b>Ngọc hạp toản yếu thông dụng</b> <span class="ck-han">玉匣纂要通用</span> (Phúc Văn Đường khắc năm Bảo Đại nguyên niên, 1926) — đối chiếu bảng an sao, tên sao chữ Hán.</li>
        <li><b>Ngọc Hạp Chánh Tông</b> <span class="ck-han">玉匣正宗</span> (Viên Tài Hà Tấn Phát) — cưới gả, làm nhà, quy tắc tháng nhuận.</li>
        <li><b>Ngọc hạp ký</b> <span class="ck-han">玉匣記</span> (bản trong Tục Đạo tạng) — đối chiếu Dương công kỵ, Chu đường, Lục nhâm.</li>
        <li><b>Khâm định Hiệp kỷ biện phương thư</b> <span class="ck-han">欽定協紀辨方書</span> (1739) và <b>Sử ký</b> <span class="ck-han">史記</span>, quyển 127 <span class="ck-han">日者列傳</span> — đọc để hiểu các dòng sách xem ngày; không dùng để an sao.</li>
        <li>Phan Kế Bính, <b>Việt Nam phong tục</b> (1915) — thực hành xem ngày của người Việt đầu thế kỷ XX.</li>
        <li>Hồ Ngọc Đức, “Thuật toán tính âm lịch” — phần lịch pháp.</li>
        <li>Ca dao, tục ngữ Việt Nam — câu in trên tờ lịch.</li></ul></section>
      <section><h4>Trích dẫn nguyên văn</h4><ul>
        <li><b>Đón giờ đi</b> — <span class="ck-han">「每從大安上起正月，月上起日，日上起時」</span>: từ cung Đại an khởi tháng Giêng, trên cung tháng khởi ngày mồng một, trên cung ngày khởi giờ Tý. (<span class="ck-han">李淳風六壬時課</span>, bản khắc quyển 5; Thông Thư tr.117–119.)</li>
        <li><b>Dương công kỵ</b> — <span class="ck-han">「正月十三，二月十一，以至七月初一、二十九，而終于十二月十九」</span>: tháng Giêng ngày 13, tháng Hai ngày 11… tháng Bảy ngày 1 và 29, tháng Chạp ngày 19. (<span class="ck-han">協紀辨方書</span>, quyển 36; khớp <span class="ck-han">玉匣記</span>, nơi bản dịch Thông Thư in lệch.)</li>
        <li><b>Tứ ly, Tứ tuyệt theo tiết</b> — <span class="ck-han">「四離四絶以節氣取義」</span>: Tứ ly, Tứ tuyệt lấy nghĩa theo tiết khí. (<span class="ck-han">協紀辨方書</span>, quyển 10.)</li>
        <li><b>Chu đường cưới gả</b> — <span class="ck-han">「只論月分大小，不問節氣」</span>: chỉ xét tháng đủ thiếu, không hỏi tiết khí. (<span class="ck-han">玉匣記</span>; Thông Thư tr.87.)</li>
        <li><b>Việc nào sao nấy</b> — <span class="ck-han">「以神為目，以事為綱」</span>: lấy việc làm cương, lấy thần sát làm mục. (<span class="ck-han">協紀辨方書</span>, quyển 11.)</li>
        <li><b>Tháng nhuận</b> — “Những tháng Nhuần thì 15 ngày trên thuộc về Địa Chi của tháng trước, còn 15 ngày dưới thuộc về Địa Chi của tháng sau.” (Ngọc Hạp Chánh Tông tr.90.)</li></ul></section>`,
    "nang-cao": trangNangCao(),
    "ban-quyen": `<section><h4>Bản quyền</h4>
        <p>Lịch Pháp được tặng <b>miễn phí</b> cho mọi người. Bản chính thức duy nhất ở địa chỉ <b>lelenhbac1974hn-web.github.io/lich-phap</b>. Nếu bạn phải trả tiền, hoặc thấy ứng dụng này trên chợ ứng dụng (App Store, Google Play…), đó là bản sao trái phép.</p>
        <p>Mọi người được dùng, chia sẻ đường dẫn và xem mã để học hỏi. Không được đưa lên chợ ứng dụng, bán, gắn quảng cáo hay phát hành lại dưới tên khác khi chưa có đồng ý của tác giả.</p></section>
      <section id="gt-mien-tru"><h4>Miễn trừ trách nhiệm</h4><ol>
        <li><b>Nội dung xem ngày để tham khảo.</b> Sao tốt xấu, luận ngày, giờ tốt, hướng xuất hành được tổng hợp từ sách xem ngày cổ truyền (Ngọc Hạp Thông Thư và các sách ghi ở mục Căn cứ và tài liệu). Đây là tri thức văn hoá dân gian, không phải kết luận khoa học, và không thay cho ý kiến của người có chuyên môn về pháp lý, tài chính, sức khoẻ, xây dựng hay bất kỳ lĩnh vực nào.</li>
        <li><b>Quyết định là của bạn.</b> Tác giả không chịu trách nhiệm về quyết định bạn đưa ra, cũng như mọi thiệt hại, tổn thất trực tiếp hay gián tiếp phát sinh từ việc dùng hoặc tin theo nội dung của chương trình.</li>
        <li><b>Âm lịch tính bằng thuật toán.</b> Âm lịch, can chi, tiết khí tính theo thuật toán thiên văn, không bảo đảm tuyệt đối đúng ở mọi ngày. Với ngày lễ, ngày giỗ, ngày hệ trọng, nên đối chiếu thêm lịch do cơ quan có thẩm quyền ban hành.</li>
        <li><b>Thời tiết để tham khảo.</b> Nhiệt độ và tình trạng trời lấy từ Open-Meteo theo vị trí gần đúng của máy, có thể khác thực tế nơi bạn đứng. Khi cần quyết định theo thời tiết, hãy xem bản tin của cơ quan khí tượng.</li>
        <li><b>Nhắc việc có giới hạn.</b> Chương trình chỉ báo đúng giờ khi đang mở; khi tắt, báo tuỳ vào trình duyệt và điện thoại. Đừng dùng thay báo thức hay lịch hẹn quan trọng. Dữ liệu nhắc việc chỉ lưu trong máy của bạn và có thể mất khi xoá dữ liệu trình duyệt, đổi máy hay cài lại; nên dùng “Xuất ra tệp” ở thẻ Nhắc để sao lưu. Tác giả không chịu trách nhiệm khi bị lỡ việc hay mất dữ liệu.</li>
        <li><b>Cung cấp nguyên trạng.</b> Chương trình được tặng miễn phí, như hiện có, không kèm bảo hành nào. Tác giả có thể sửa, đổi hay ngừng chương trình mà không báo trước.</li></ol>
        <p>Dùng chương trình nghĩa là bạn đồng ý với các điều trên.</p></section>
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
  /* Dải chọn ở trang Giao diện gạt ngang, không xuống dòng: đưa lựa chọn đang dùng vào vùng nhìn */
  /* Chỉ gạt khi lựa chọn đang dùng nằm ngoài vùng nhìn (lúc mới mở trang); đổi lựa chọn thì dải đứng yên chỗ người dùng đang gạt */
  const canChip = () => el.querySelectorAll(".mn-chips").forEach(r => { const d = r.querySelector(".dang"); if (!d) return; const x = d.offsetLeft - r.offsetLeft; if (x < r.scrollLeft || x + d.offsetWidth > r.scrollLeft + r.clientWidth) r.scrollLeft = Math.max(0, x - (r.clientWidth - d.offsetWidth) / 2); });
  el.querySelector(".tam").addEventListener("click", e => {
    const m = e.target.closest("[data-mn]"), lui = e.target.closest("[data-mn-lui]");
    if (m) { veTrang(m.dataset.mn, 40); canChip(); return; }
    if (lui) return veMenu(-40);
    /* Lựa chọn ở trang Giao diện: đổi xong vẽ lại trang, giữ nguyên chỗ đang cuộn */
    const c = e.target.closest("[data-giao-dien],[data-bo-ao],[data-to-lich],[data-thoi-tiet],[data-hieu-ung],[data-co-chu]");
    if (!c) return;
    const y = el.querySelector(".tam-cuon").scrollTop, gat = [...el.querySelectorAll(".mn-chips")].map(r => r.scrollLeft), giu = () => { veTrang("giao-dien"); el.querySelector(".tam-cuon").scrollTop = y; el.querySelectorAll(".mn-chips").forEach((r, i) => { r.scrollLeft = gat[i] || 0; }); requestAnimationFrame(xepNhan); };
    const d = c.dataset;
    if (d.giaoDien) datGiaoDien(d.giaoDien);
    else if (d.boAo) datAo(d.boAo);
    else if (d.coChu) datCo(d.coChu);
    else if (d.toLich) datToLich(d.toLich);
    else if (d.hieuUng) doiHieuUng(d.hieuUng);
    else if (d.thoiTiet && window.ThoiTiet) { if (d.thoiTiet === "1") ThoiTiet.bat().then(giu); else ThoiTiet.tat(); }
    giu();
  });
  const trangCua = { "gt-luan": "ve", "gt-can-cu": "can-cu" };
  if (muc && (MENU.some(x => x.id === muc) || trangCua[muc])) {
    veTrang(trangCua[muc] || muc);
    canChip();
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
      <div class="hd-nut">${cuoi ? "" : '<button type="button" class="hd-bo" data-hd="bo">Bỏ qua</button>'}
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
/* Bài viết kỹ về sao (sao-bai.json, sinh từ CSDL bằng csdl.py): tải một lần, bộ đệm giữ để dùng không mạng.
   Chưa tải xong thì thẻ hiện bản ngắn, tải xong thì thay bằng bài đầy đủ nếu thẻ vẫn đang mở. */
let baiSao = null, dangTaiBai = null;
function taiBaiSao() {
  if (baiSao) return Promise.resolve(baiSao);
  if (!dangTaiBai) dangTaiBai = fetch("sao-bai.json").then(r => r.json()).then(d => (baiSao = d)).catch(() => { dangTaiBai = null; return null; });
  return dangTaiBai;
}
const hanTrich = t => esc(t).replace(/「([^」]+)」/g, '<span class="ts-han-trich">「$1」</span>');
function thanBaiSao(s, b, an) {
  const doan = t => t ? `<p>${hanTrich(t)}</p>` : "";
  /* Sách không ghi điều nên/kỵ riêng thì ô không tô màu, để khỏi tưởng là có điều kỵ */
  const o = (lop, tieu, t) => t ? `<div class="ts-viec ${/^Sách không ghi/.test(t) ? "trong" : lop}"><h4>${tieu}</h4><p>${hanTrich(t)}</p></div>` : "";
  return `<p class="ts-chu">${hanTrich(b.chu_ve)}</p>
    ${o("nen", "Nên", b.nen)}${o("ky", "Kỵ", b.ky)}
    ${b.vi_sao || b.giai_nghia ? `<div class="ts-muc"><h4>Vì sao</h4>${doan(b.vi_sao)}${b.giai_nghia ? `<p class="ts-giai">${hanTrich(b.giai_nghia)}</p>` : ""}</div>` : ""}
    ${b.gap_nhau ? `<div class="ts-muc"><h4>${s.loai === "tot" ? "Gặp ngày xấu" : "Sao tốt có cứu được không"}</h4>${doan(b.gap_nhau)}</div>` : ""}
    ${an ? `<div class="ts-muc">${an}</div>` : ""}
    ${b.nguon && b.nguon.length ? `<details class="ts-cc"><summary>Nguồn sách · ${b.nguon.length}</summary><ul>${b.nguon.map(c => `<li>${hanTrich(c)}</li>`).join("")}</ul></details>` : ""}`;
}
function moTheSao(s, tuTra, cuonTra) {
  const thangNay = thangAnSao(ttNgay(st.jd).am); // tháng nhuận chia đôi như khi an sao
  const luoi = s.an && s.an.thang ? Array.from({ length: 12 }, (_, i) => {
    const v = (s.an.thang[String(i + 1)] || []).join(", ") || "—";
    return `<div class="${i + 1 === thangNay ? "nay" : ""}"><span>T${i + 1}</span><b>${esc(v)}</b></div>`;
  }).join("") : "";
  const an = luoi ? `<h4 class="ts-an-tieu">An sao theo tháng âm${s.an.theo === "can" ? " (theo can ngày)" : s.an.theo === "ngayam" ? " (theo ngày âm)" : ""}</h4><div class="ts-an">${luoi}</div>` : "";
  const ds = (tieu, arr, lop) => arr && arr.length ? `<div class="ts-viec ${lop}"><h4>${tieu}</h4><p>${arr.map(esc).join(" · ")}</p></div>` : "";
  const cu = tamSao && tamSao.dataset.tim;
  const ngan = `${s.nghia ? `<p class="ts-nghia">${esc(s.nghia)}</p>` : `<p class="ts-nghia rong">Sách không ghi nghĩa riêng cho sao này.</p>`}
      ${ds("Nên", s.nen, "nen")}${ds("Kỵ", s.ky, "ky")}${an}`;
  const b = baiSao && baiSao[s.id];
  const el = moTam(`<div class="ts-than">${b ? thanBaiSao(s, b, an) : ngan}
      <p class="ts-nguon">${s.tt === 1 ? "Theo Ngọc Hạp Thông Thư, đã đối chiếu bản chữ Hán" : "Theo Ngọc Hạp Thông Thư"}</p>
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
  if (!b) taiBaiSao().then(d => {
    const than = el.querySelector(".ts-than");
    if (d && d[s.id] && tamSao === el && than) than.innerHTML = `${thanBaiSao(s, d[s.id], an)}<p class="ts-nguon">${s.tt === 1 ? "Theo Ngọc Hạp Thông Thư, đã đối chiếu bản chữ Hán" : "Theo Ngọc Hạp Thông Thư"}</p>`;
  });
}

/* Tra cứu: danh sách trên trang sổ (cùng khuôn dòng thẻ Nhắc — luật 6), ô tìm là một dòng gạch chân,
   ba tab gạch chân Tất cả · Cát tinh · Hung tinh (luật 3). Bộ lọc nhớ trong lúc tấm còn mở. */
/* Chạm tên sao, tên ngày kỵ trong lý do ở tờ Luận ngày: mở thẻ giải thích */
document.addEventListener("click", e => {
  const b = e.target.closest(".pd-tra"); if (!b) return;
  if (b.dataset.saoId) { const s = CSDL.sao.find(z => z.id === b.dataset.saoId); if (s) moTheSao(s); }
  else if (b.dataset.kyId) { const q = window.LUAN_GIAI.quyTac.find(z => z.id === b.dataset.kyId); if (q) moTheKy(q); }
});
let locSao = "tat";
/* Ngày kỵ trong sách (Thụ tử, Tam nương sát, Nguyệt kỵ…): tra được như sao, lời lấy nguyên từ chương luận giải của Thông Thư.
   Chỉ gồm ngày kỵ của năm việc thường; ngày kỵ riêng của lớp nâng cao không đưa ra đây. */
const VIEC_THUONG = ["chung", "dongtho", "kyket", "khaitruong", "xuathanh"];
const dsNgayKy = () => (window.LUAN_GIAI ? window.LUAN_GIAI.quyTac : []).filter(q => /hung/.test(q.muc) && !q.nguon && q.nd && q.viec.some(v => VIEC_THUONG.includes(v)));
function moTheKy(q, tuTra, cuonTra) {
  const cu = tamSao && tamSao.dataset.tim;
  const dk = window.LUAN_GIAI.khongCuu.ds.includes(q.id);
  const el = moTam(`<div class="ts-than"><p class="ts-nghia">${esc(q.nd)}</p>
      ${dk ? `<p class="ts-nghia">Đây là một trong sáu ngày đại kỵ: gặp ngày này thì sao tốt không cứu được, nên kiêng mọi việc lớn.</p>` : ""}
      <p class="ts-nguon">Theo Ngọc Hạp Thông Thư</p></div>`, "lop-sao", `
    <header class="ts-dau xau"><span class="ts-loai">${dk ? "Ngày đại kỵ" : "Ngày kỵ"}</span><h3>${esc(q.ten)}</h3></header>
    ${tuTra ? `<div class="mn-dau"><button type="button" class="mn-lui" data-tra-lai>‹ Danh sách sao</button></div>` : ""}`);
  if (cu) el.dataset.tim = cu;
  if (tuTra) el.dataset.veTra = cuonTra || 0;
}
function moTraSao(tim, cuon) {
  const el = moTam(`<ul class="tra-ds"></ul>`, "lop-tra", `
    <header class="tra-dau"><h3>Tra cứu sao Ngọc Hạp</h3><p>${CSDL.sao.length} sao · ${dsNgayKy().length} ngày kỵ · theo Ngọc Hạp Thông Thư</p>
      <label class="tra-tim">${ic("tim")}<input type="search" class="tra-o" placeholder="Gõ tên sao, ngày kỵ — ví dụ: thiên đức, tam nương" aria-label="Tìm sao" value="${esc(tim || "")}" /></label>
      <div class="tra-loc" role="tablist" aria-label="Lọc sao"></div></header>`);
  const o = el.querySelector(".tra-o"), ul = el.querySelector(".tra-ds"), loc = el.querySelector(".tra-loc");
  const bo = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();
  const ve2 = () => {
    const q = bo(o.value.trim()); el.dataset.tim = o.value;
    const hop = CSDL.sao.filter(s => !q || bo(s.ten).includes(q) || (s.han || "").includes(o.value.trim()));
    const ky = dsNgayKy().filter(k => !q || bo(k.ten).includes(q));
    const dem = { tat: hop.length + ky.length, tot: hop.filter(s => s.loai === "tot").length, xau: hop.filter(s => s.loai === "xau").length, ky: ky.length };
    loc.innerHTML = Object.entries({ tat: "Tất cả", tot: "Cát tinh", xau: "Hung tinh", ky: "Ngày kỵ" }).map(([k, t]) =>
      `<button type="button" role="tab" data-loc-sao="${k}" aria-selected="${locSao === k}">${t} <em>${dem[k]}</em></button>`).join("");
    const ds = hop.filter(s => locSao === "tat" || s.loai === locSao).sort((a, b) => a.ten.localeCompare(b.ten, "vi"));
    ul.innerHTML = ds.map(s => `<li><button type="button" data-sao-id="${esc(s.id)}" class="${s.loai}"><span class="td-dau"><i></i></span>
      <span class="td-nd"><b>${esc(s.ten)}${s.han ? `<small>${esc(s.han)}</small>` : ""}</b>${s.nghia ? `<em>${esc(s.nghia)}</em>` : ""}</span><span class="td-mui">›</span></button></li>`).join("")
      + (locSao === "tat" || locSao === "ky" ? ky.sort((a, b) => a.ten.localeCompare(b.ten, "vi")).map(k => `<li><button type="button" data-ky-id="${esc(k.id)}" class="xau"><span class="td-dau"><i></i></span>
      <span class="td-nd"><b>${esc(k.ten)}<small class="td-ky">ngày kỵ</small></b><em>${esc(k.nd.split(/[.:;]/)[0])}</em></span><span class="td-mui">›</span></button></li>`).join("") : "")
      || `<li class="rong">Không tìm thấy sao hay ngày kỵ nào.</li>`;
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

