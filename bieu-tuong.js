/* BỘ BIỂU TƯỢNG LỊCH PHÁP — vẽ nét (24×24), cùng một phong cách, tô bằng màu chữ hiện hành.
   Dùng cho Nhắc việc và Ngày lặp lại. © 2026 Lê Lệnh Bắc */
(function () {
  "use strict";
  const BT = {
    khoa: { ten: "Khóa", ve: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/><path d="M12 14.5v2.5" class="dac"/>' },
    nen: { ten: "Nến · giỗ", ve: '<path d="M7 21h10M9.5 21V10.5h5V21"/><path d="M12 10.5V7.8"/><path d="M12 3c1.5 1.6 1.8 2.9 0 4.3-1.8-1.4-1.5-2.7 0-4.3z" class="dac"/>' },
    banh: { ten: "Bánh sinh nhật", ve: '<path d="M4 20.5h16M5 20.5V14h14v6.5"/><path d="M5 16.2c2.3 1.3 3.9 1.3 5.4 0s3-1.3 4.6 0 2.7 1.3 4-.2"/><path d="M8 14v-3M12 14v-3M16 14v-3"/><path d="M8 7.3c.9.8.9 1.7 0 2.3-.9-.6-.9-1.5 0-2.3zM12 7.3c.9.8.9 1.7 0 2.3-.9-.6-.9-1.5 0-2.3zM16 7.3c.9.8.9 1.7 0 2.3-.9-.6-.9-1.5 0-2.3z" class="dac"/>' },
    dao: { ten: "Quả đào · mừng thọ", ve: '<path d="M12 7.5C8 4.3 3.5 7.3 4.6 12.6 5.6 17 8.8 20.5 12 20.5s6.4-3.5 7.4-7.9C20.5 7.3 16 4.3 12 7.5z"/><path d="M12 7.5c-.6 4.3-.6 8.6 0 13"/><path d="M12 7.5c.6-2.3 2.3-3.8 5-3.8-.6 2.3-2.4 3.6-5 3.8z" class="dac"/>' },
    nhan: { ten: "Nhẫn cưới", ve: '<circle cx="9" cy="14.5" r="5"/><circle cx="15" cy="14.5" r="5"/><path d="M10.4 6.2L12 4l1.6 2.2L12 7.8z" class="dac"/>' },
    toaNha: { ten: "Công ty", ve: '<path d="M4 21V5.2L12 3v18M12 21V9l8 2.2V21M3 21h18"/><path d="M7 8h2M7 12h2M7 16h2M15 13.5h2M15 17.5h2"/>' },
    sen: { ten: "Hoa sen · lễ, chùa", ve: '<path d="M12 19c-3.6 0-7-2.1-8-6.2 3.1 0 5.6 1.6 8 6.2zM12 19c3.6 0 7-2.1 8-6.2-3.1 0-5.6 1.6-8 6.2z"/><path d="M12 19c-2.1-2.6-2.6-6.8 0-11.4 2.6 4.6 2.1 8.8 0 11.4z"/><path d="M5 21h14"/>' },
    liXi: { ten: "Bao lì xì · Tết", ve: '<rect x="5" y="3" width="14" height="18" rx="1.2"/><path d="M5 8l7 4.2L19 8"/><circle cx="12" cy="12.3" r="1.9" class="dac"/>' },
    denLong: { ten: "Đèn lồng", ve: '<path d="M12 2v2.2M9.2 4.2h5.6"/><path d="M8 6.2h8c1.5 1.9 2 3.9 2 5.9s-.5 4-2 5.9H8c-1.5-1.9-2-3.9-2-5.9s.5-4 2-5.9z"/><path d="M12 6.2V18M9.2 20h5.6M12 20v2"/>' },
    ca: { ten: "Cá chép", ve: '<path d="M3 12c3-4.6 9.2-6.1 14.2-2L21 7v10l-3.8-3c-5 4.1-11.2 2.6-14.2-2z"/><circle cx="8" cy="11.2" r="1" class="dac"/>' },
    hop: { ten: "Họp · gặp", ve: '<circle cx="9" cy="8" r="3.1"/><path d="M3.3 20c0-3.3 2.5-5.6 5.7-5.6s5.7 2.3 5.7 5.6"/><circle cx="17.2" cy="9" r="2.4"/><path d="M15.6 14.2c3 .2 5.1 2.1 5.1 5.2"/>' },
    dienThoai: { ten: "Gọi điện", ve: '<path d="M5.2 3.8h3.6l2 5.1-2.5 1.6a11.3 11.3 0 0 0 5.2 5.2l1.6-2.5 5.1 2v3.6a1.6 1.6 0 0 1-1.7 1.6C10.2 19.9 4.1 13.8 3.6 5.5a1.6 1.6 0 0 1 1.6-1.7z"/>' },
    thu: { ten: "Thư · nhắn tin", ve: '<rect x="3" y="5" width="18" height="14" rx="1.4"/><path d="M3.6 6.2L12 13l8.4-6.8"/>' },
    hopDong: { ten: "Ký hợp đồng", ve: '<path d="M6 3h8l4 4v6"/><path d="M14 3v4h4"/><path d="M6 3v18h6"/><path d="M8.5 10h6M8.5 13.5h4"/><path d="M14 21l1-3.2 4.6-4.6a1.6 1.6 0 0 1 2.2 2.2L17.2 20z"/>' },
    taiLieu: { ten: "Hồ sơ · báo cáo", ve: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/><path d="M9 12.5h7M9 16.5h7"/>' },
    muBaoHo: { ten: "Công trường", ve: '<path d="M2.5 18h19"/><path d="M4.5 18v-2.6a7.5 7.5 0 0 1 15 0V18"/><path d="M10 8.3v5M14 8.3v5M10 8.3a7.3 7.3 0 0 1 4 0"/>' },
    cau: { ten: "Cọc · dầm · cầu", ve: '<path d="M2.5 9.5h19"/><path d="M4 9.5c2.3 0 3.6 2.4 3.6 5.2M20 9.5c-2.3 0-3.6 2.4-3.6 5.2"/><path d="M7.6 14.7V21M16.4 14.7V21M12 9.5V21"/><path d="M2.5 21h19"/>' },
    tien: { ten: "Thanh toán · công nợ", ve: '<circle cx="12" cy="12" r="8.6"/><path d="M14.6 9.3c-.6-.8-1.6-1.3-2.7-1.3-1.5 0-2.7.8-2.7 2s1.2 1.7 2.8 2c1.6.3 2.9.9 2.9 2.1S13.7 16.2 12 16.2c-1.3 0-2.3-.5-2.9-1.3M12 6.4V8M12 16.2v1.4"/>' },
    nganHang: { ten: "Ngân hàng", ve: '<path d="M3 9l9-5.2L21 9z"/><path d="M5 10.3v7.8M9.5 10.3v7.8M14.5 10.3v7.8M19 10.3v7.8M3 20.3h18"/>' },
    gioHang: { ten: "Mua sắm", ve: '<path d="M3 4h2.6l2.2 11h10.6L20.6 7H7"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>' },
    mayBay: { ten: "Chuyến bay", ve: '<path d="M10.5 3.6c0-.8.7-1.6 1.5-1.6s1.5.8 1.5 1.6V9l8 4.6V16l-8-2.5V18l2.5 2v1.5L12 20.6l-4 .9V20l2.5-2v-4.5L2.5 16v-2.4l8-4.6z"/>' },
    xe: { ten: "Xe · đăng kiểm", ve: '<path d="M4 16.2V12l2-5h12l2 5v4.2z"/><path d="M4 12h16"/><circle cx="7.6" cy="16.6" r="1.9"/><circle cx="16.4" cy="16.6" r="1.9"/>' },
    vali: { ten: "Công tác · đi xa", ve: '<rect x="4" y="7" width="16" height="13" rx="1.4"/><path d="M9 7V4.4h6V7M9 11v5.2M15 11v5.2"/>' },
    yTe: { ten: "Khám · thuốc", ve: '<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="2.6"/><path d="M12 7.6v8.8M7.6 12h8.8"/>' },
    sach: { ten: "Học · thi", ve: '<path d="M4 5c3-1.5 5.5-1.5 8 0v15c-2.5-1.5-5-1.5-8 0z"/><path d="M20 5c-3-1.5-5.5-1.5-8 0v15c2.5-1.5 5-1.5 8 0z"/>' },
    coLe: { ten: "Sửa chữa", ve: '<path d="M14.6 4.4a4.6 4.6 0 0 0-4.3 6.1L4 16.8 7.2 20l6.3-6.3a4.6 4.6 0 0 0 6.1-4.3l-2.8 2.8-3-.8-.8-3z"/>' },
    nha: { ten: "Việc nhà", ve: '<path d="M3 11.2l9-7.2 9 7.2"/><path d="M5 10v10h14V10"/><path d="M10 20v-5.6h4V20"/>' },
    batCom: { ten: "Ăn uống · tiệc", ve: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 20.2h8"/><path d="M14.2 3.8l-3 6.2M18.2 3.8l-4 6.2"/>' },
    caPhe: { ten: "Cà phê", ve: '<path d="M4 9h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3c-1 1.5 1 2 0 3.5M12 3c-1 1.5 1 2 0 3.5"/>' },
    theThao: { ten: "Thể thao", ve: '<circle cx="14" cy="4.6" r="2"/><path d="M8 21l3-6 3 3v3.6M5.6 12l3.4-4 4 1 2 4 3 1M11 15l1-5"/>' },
    co: { ten: "Lễ · kỷ niệm", ve: '<path d="M5 21V3.5"/><path d="M5 4h12l-2.5 4L17 12H5" class="dac-nhat"/>' },
    lich: { ten: "Việc chung", ve: '<rect x="3.6" y="5" width="16.8" height="15.6" rx="1.4"/><path d="M3.6 10h16.8M8 3v4M16 3v4"/><path d="M8 13.6h3v3H8z" class="dac"/>' },
    ghim: { ten: "Sự kiện", ve: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>' },
    trang: { ten: "Sự kiện âm lịch", ve: '<path d="M19 15.4A8 8 0 0 1 8.6 5 8 8 0 1 0 19 15.4z"/>' }
  };
  /* Tự chọn biểu tượng theo nội dung (thứ tự ưu tiên từ trên xuống) */
  const LUAT = [
    [/giỗ|gio |kỵ|ky nhat|húy|huý|tang lễ|mộ |mo phan|tảo mộ/, "nen"],
    [/sinh nhật|sinh nhat|thôi nôi|đầy tháng/, "banh"],
    [/mừng thọ|mung tho|thượng thọ/, "dao"],
    [/cưới|cuoi |ăn hỏi|dạm ngõ|đính hôn/, "nhan"],
    [/thành lập|thanh lap|công ty|cong ty/, "toaNha"],
    [/trung thu|đèn lồng|nguyên tiêu/, "denLong"],
    [/ông táo|ong tao|cá chép/, "ca"],
    [/tết|tet |lì xì|li xi/, "liXi"],
    [/vu lan|rằm|ram |mồng một|mùng 1|chùa|chua |phật|thắp hương|thap huong|cúng|cung |lễ /, "sen"],
    [/kỷ niệm|kỉ niệm|ky niem|quốc khánh|ngày lễ/, "co"],
    [/họp|hop |giao ban|hội nghị|hoi nghi|gặp|gap /, "hop"],
    [/gọi|goi |điện thoại|dien thoai/, "dienThoai"],
    [/email|thư |mail|zalo|nhắn/, "thu"],
    [/hợp đồng|hop dong|ký |chữ ký/, "hopDong"],
    [/nghiệm thu|nghiem thu|cọc|coc |dầm|dam |cầu |cau |bê tông|be tong|móng|mong /, "cau"],
    [/công trường|cong truong|thi công|thi cong|hiện trường|an toàn lao động/, "muBaoHo"],
    [/nộp|nop |hồ sơ|ho so|báo cáo|bao cao|văn bản|giấy tờ|tờ trình|bản vẽ/, "taiLieu"],
    [/thanh toán|thanh toan|công nợ|cong no|chuyển khoản|tiền|tien |lương|luong|thuế|thue|hoá đơn|hóa đơn/, "tien"],
    [/ngân hàng|ngan hang|vay |tiết kiệm/, "nganHang"],
    [/máy bay|may bay|sân bay|chuyến bay/, "mayBay"],
    [/xe |đăng kiểm|dang kiem|bảo dưỡng|thay dầu/, "xe"],
    [/đi |xuất hành|công tác|cong tac|về quê|ve que/, "vali"],
    [/mua|chợ|siêu thị|sieu thi/, "gioHang"],
    [/khám|kham|bác sĩ|bac si|bệnh viện|benh vien|thuốc|thuoc|tiêm/, "yTe"],
    [/học|hoc |thi |lớp|lop |trường|truong/, "sach"],
    [/sửa|sua |thợ|điện nước|dien nuoc/, "coLe"],
    [/dọn|don |nhà cửa|giặt/, "nha"],
    [/cà phê|cafe|ca phe/, "caPhe"],
    [/ăn|cơm|com |nhậu|tiệc|tiec/, "batCom"],
    [/tập|chạy bộ|thể dục|gym|bóng/, "theThao"]
  ];
  function chon(ten, loai, daChon) {
    if (daChon && BT[daChon]) return daChon;
    const s = " " + String(ten || "").toLowerCase() + " ";
    for (const [re, k] of LUAT) if (re.test(s)) return k;
    return { gio: "nen", sinhnhat: "banh", sukien: "ghim", sukienam: "trang" }[loai] || "lich";
  }
  /* Biểu tượng nhỏ đi kèm chữ (giờ, ghi chú, lễ) — không có trong bảng chọn biểu tượng */
  const NET = {
    dongHo: { ve: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4.3l2.8 1.7M5 4.5 3 6.5M19 4.5l2 2"/>' },
    ghiChu: { ve: '<path d="M5 3.5h10l4 4V20.5H5z"/><path d="M15 3.5v4h4M8.5 12h7M8.5 15.5h7M8.5 8.5h3"/>' },
    sao: { ve: '<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z" class="dac"/><path d="M18.5 16v4M16.5 18h4"/>' },
    /* Nút thao tác dữ liệu (luật giao diện 4): mỗi việc một biểu tượng, dùng giống nhau ở mọi màn */
    them: { ve: '<path d="M12 5v14M5 12h14"/>' },
    xong: { ve: '<path d="M5 12.5l4.5 4.5L19 7.5"/>' },
    sua: { ve: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M14 8l3 3"/>' },
    xoa: { ve: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/>' },
    moLai: { ve: '<path d="M5 12a7 7 0 1 0 2-5"/><path d="M5 4v4h4"/>' },
    luu: { ve: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>' },
    huy: { ve: '<path d="M6 6l12 12M18 6L6 18"/>' },
    tim: { ve: '<circle cx="11" cy="11" r="6"/><path d="M15.5 15.5L20 20"/>' },
    xuat: { ve: '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 13v6h14v-6"/>' },
    nhap: { ve: '<path d="M12 4v11M8 11l4 4 4-4"/><path d="M5 13v6h14v-6"/>' },
    homNay: { ve: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/><circle cx="12" cy="15" r="1.6" class="dac"/>' },
    /* Dải chọn việc (1.38.0): Khai trương — cửa hàng có mái che; Động thổ — xẻng cắm đất */
    micro: { ve: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/>' }, // nói thay gõ (1.41.0)
    luan: { ve: '<path d="M12 3.5l2.5 5.3 5.8.7-4.3 4 1.1 5.8L12 16.5 6.9 19.3 8 13.5l-4.3-4 5.8-.7z"/>' }, // như thẻ Luận giải ở thanh đáy
    cuaHang: { ve: '<path d="M4.5 11.5V20h15v-8.5"/><path d="M3 9.5l1.8-5h14.4l1.8 5"/><path d="M3 9.5a3 2.6 0 0 0 6 0 3 2.6 0 0 0 6 0 3 2.6 0 0 0 6 0"/><path d="M10 20v-4.5h4V20"/>' },
    xeng: { ve: '<path d="M12.4 11.6L19 5"/><path d="M17.2 3.2l3.6 3.6"/><path d="M10.6 9.8l3.6 3.6-4.6 4.6c-1.6 1-3.6 1.4-5.6 1.4 0-2 .4-4 1.4-5.6z"/><path d="M3 21.5h6" class="dac-nhat"/>' }
  };
  /* Mười hai con giáp theo thứ tự địa chi Tý…Hợi (1.44.0) — cùng nét 24×24; dùng ở chân tờ lịch và dải 12 giờ */
  const CON_GIAP_VE = [
    '<circle cx="6.8" cy="7.3" r="3.3"/><circle cx="17.2" cy="7.3" r="3.3"/><path d="M6.4 10.4c-.9 4.6 2 9.6 5.6 9.6s6.5-5 5.6-9.6"/><path d="M9.6 13.2v.1M14.4 13.2v.1"/><path d="M11.2 17.2h1.6L12 18.3z" class="dac"/><path d="M8.6 17.4l-3.4-.9M8.8 18.6l-3 .9M15.4 17.4l3.4-.9M15.2 18.6l3 .9"/>',
    '<path d="M7.6 8.6C4.4 8.4 2.6 6 3.4 3.2M16.4 8.6c3.2-.2 5-2.6 4.2-5.4"/><path d="M7.4 8.4c1.4-.9 3-1.3 4.6-1.3s3.2.4 4.6 1.3c.8 3 .4 6.4-1 9.1-.7 1.5-1.9 2.5-3.6 2.5s-2.9-1-3.6-2.5c-1.4-2.7-1.8-6.1-1-9.100z"/><path d="M7.2 10.300l-3 1.3 3.2.9M16.8 10.300l3 1.3-3.2.9"/><path d="M9.7 12.300v.1M14.3 12.300v.1M10.8 17.400v.1M13.2 17.400v.1"/><path d="M9 15.600c2 .7 4 .7 6 0"/>',
    '<circle cx="6.3" cy="6.8" r="2.5"/><circle cx="17.7" cy="6.8" r="2.5"/><path d="M12 5.200c4.5 0 7.8 3.2 7.8 7.400S16.3 20.5 12 20.500s-7.8-3.7-7.8-7.900S7.5 5.2 12 5.200z"/><path d="M12 5.400v2.800M9.6 5.900l.6 2M14.4 5.900l-.6 2M4.6 12.200l2.4.5M4.9 15l2.3-.4M19.4 12.200l-2.4.5M19.1 15l-2.3-.4"/><path d="M9.3 12.200v.1M14.7 12.200v.1"/><path d="M11 15.200h2l-1 1.200z" class="dac"/><path d="M12 16.400c-.3 1.2-1.3 1.7-2.3 1.300M12 16.400c.3 1.2 1.3 1.7 2.3 1.3"/>',
    '<path d="M5 12.500V4.200l4.6 3.300M19 12.500V4.200l-4.6 3.3"/><path d="M9.6 7.500c1.5-.5 3.3-.5 4.8 0M5 12.500c0 4.3 3 7.8 7 7.800s7-3.5 7-7.8"/><path d="M9.3 12.600v.1M14.7 12.600v.1"/><path d="M11.2 15.400h1.600l-.8 1z" class="dac"/><path d="M12 16.400v1.200M8 15.800l-4.2-.6M8 17.200l-3.8 1M16 15.800l4.2-.6M16 17.200l3.8 1"/>',
    '<path d="M3.4 10.8c2-2.4 4.6-3.7 7.8-3.9 2.7-.2 5 .9 6.3 2.9.9 1.4 1.3 3.1 1.3 5.200v5.5"/><path d="M3.4 10.800l.9 2 6.2 1.1"/><path d="M10.5 13.900l-5.3 1.900c1.6 1.5 3.6 2 5.8 1.5 1 1 1.5 2.2 1.5 3.7"/><path d="M12.6 7l2.6-4.200M14 4.800l3.2-.6M16 7.900l3.1-2.3"/><path d="M4.2 12.700c-1.7.6-2.5 2-2.2 3.900M5.4 9c-1.6-1.4-1.8-3-.6-4.6"/><path d="M18.4 10.800l2.3-.9M18.8 13.900l2.6-.2M18.8 17l2.4.8"/><path d="M10.8 10.400v.1"/>',
    '<path d="M12 12.200c1.5 0 2.6 1 2.6 2.300S13.4 17 11.8 17c-2.8 0-4.8-2-4.8-4.700C7 9.3 9.4 7 12.4 7c3.7 0 6.6 2.9 6.6 6.7 0 2.3-1 4.3-2.7 5.7"/><path d="M16.3 19.400c-1.8 1.4-4.6 1.5-7 .9-2.6-.6-4.5-.2-5.8 1.2"/><path d="M12 12.200c-1.1 0-2 .6-2.3 1.5"/><path d="M9.7 13.700l-1.7.8M8 14.500l-.9-.2M8 14.500l-.5.8"/><path d="M11.9 9.400v.1"/>',
    '<path d="M14.2 3.200l-1 3.200c-2.4 1.6-4.7 4.6-6.7 9l-.9 2c-.4 1 .2 2.1 1.3 2.300l1.3.2c.8.1 1.5-.3 1.9-1l1.3-2.600c1.7.3 3.3-.2 4.8-1.6"/><path d="M13.2 6.400l3.1-2.6.4 3.500c1.9 2.2 2.8 5.5 2.6 9.800l-.3 3.7"/><path d="M16.7 7.300c1.6.3 3 1.3 4 3M18.4 10.600c1.3.5 2.3 1.5 2.9 3M19.2 14c1 .6 1.7 1.5 2 2.7"/><path d="M12.2 9.800v.1M6.8 17.300v.1"/>',
    '<path d="M8.8 8C8 4.6 5.6 3 3 4.400c-1.5 1-1.5 3.2 0 4.2 1 .6 2.2.3 2.7-.6M15.2 8c.8-3.4 3.2-5 5.8-3.6 1.5 1 1.5 3.2 0 4.2-1 .6-2.2.3-2.7-.6"/><path d="M8.6 7.800c2.2-.8 4.6-.8 6.8 0 .6 2.6.4 5.2-.6 7.700l-1 2.300c-.7 1.5-2.9 1.5-3.6 0l-1-2.300c-1-2.5-1.2-5.1-.6-7.700z"/><path d="M8.3 10.300l-3.5 1.5 3.8.8M15.7 10.300l3.5 1.5-3.8.8"/><path d="M10 11.800v.1M14 11.800v.1M11 16h2"/><path d="M12 19v2.400M10.6 19.200l-.5 1.700M13.4 19.200l.5 1.7"/>',
    '<circle cx="4.7" cy="12" r="2.3"/><circle cx="19.3" cy="12" r="2.3"/><path d="M12 4.200c4 0 7 3.3 7 7.700s-3 8.3-7 8.3-7-3.9-7-8.3 3-7.7 7-7.700z"/><path d="M12 9c-1-1.5-2.3-2-3.5-1.600C7 7.9 6.4 9.6 7 11.400c-1.3 1.3-1.6 3-.8 4.6 1 2 3.2 3.2 5.8 3.200s4.8-1.2 5.8-3.200c.8-1.6.5-3.3-.8-4.6.6-1.8 0-3.5-1.5-4C14.3 7 13 7.5 12 9z"/><path d="M9.6 11.400v.1M14.4 11.400v.1M11.3 13.700v.1M12.7 13.700v.1"/><path d="M9.6 16.100c1.5 1 3.3 1 4.8 0"/>',
    '<path d="M9.2 6.400C8.4 4.2 9.6 2.8 11 3.600c.3-1.6 2.3-1.8 2.8-.2 1.4-.8 2.7.5 2 2.2"/><path d="M8.8 6.500c2.3-1.2 5.2-.9 7 .9 1.5 1.5 2 3.6 1.6 5.800l-1.2 7.3"/><path d="M8.8 6.500c-1.3 1-2 2.4-2 4L3.2 12l3.8 1.300c.2 2.6.9 5 2 7.2"/><path d="M7 13.400c-.3 1.6.3 2.8 1.5 3.2 1-.7 1.3-1.9.8-3.2"/><path d="M11.3 9.800v.1"/><path d="M12.4 16.500c1 .8 2.2.8 3.3 0"/>',
    '<path d="M7.6 6.200C5.4 5 3.4 6 3.2 8.600c-.2 2.6.4 5 1.8 7 .9-.9 1.5-2 1.8-3.300M16.4 6.200C18.6 5 20.6 6 20.8 8.600c.2 2.6-.4 5-1.8 7-.9-.9-1.5-2-1.8-3.3"/><path d="M7.6 6.200c2.8-1.3 6-1.3 8.8 0 .9 2.7 1 5.4.4 8.2-.6 3.2-2.4 5.8-4.8 5.800s-4.2-2.6-4.8-5.800c-.6-2.8-.5-5.5.4-8.200z"/><path d="M9.7 11.200v.1M14.3 11.200v.1"/><path d="M10.6 14.300h2.800L12 16z" class="dac"/><path d="M12 16v1.300M10 18.200c.7-.5 1.3-.8 2-.9.7.1 1.3.4 2 .9"/>',
    '<path d="M6.4 8.200L4.6 3.800l5 2M17.6 8.200l1.8-4.4-5 2"/><path d="M12 5.200c4.4 0 7.8 3.3 7.8 7.600s-3.4 7.7-7.8 7.7-7.8-3.4-7.8-7.700S7.6 5.2 12 5.200z"/><ellipse cx="12" cy="14.8" rx="3.6" ry="2.6"/><path d="M10.7 14.300v1M13.3 14.300v1M8.7 10.400v.1M15.3 10.400v.1"/>'
  ];
  const conGiap = i => `<svg class="cg" viewBox="0 0 24 24" aria-hidden="true">${CON_GIAP_VE[((i % 12) + 12) % 12]}</svg>`;
  const svg = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${(BT[k] || NET[k] || BT.lich).ve}</svg>`;
  window.BieuTuong = { BT, chon, svg, conGiap, ds: Object.keys(BT) };
})();
