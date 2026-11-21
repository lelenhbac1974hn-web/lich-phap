/* THỜI TIẾT tại vị trí của máy — dòng nhỏ dưới tháng âm trên tờ lịch hôm nay (mẫu B, anh Bắc duyệt 21/11/2026).
   Bật/tắt ở Menu → Giao diện; bật là bắt buộc chia sẻ vị trí, không chọn tỉnh thành bằng tay.
   Nguồn: Open-Meteo (miễn phí cho ứng dụng không thu tiền, không quảng cáo; dữ liệu CC BY 4.0 — ghi nguồn ở Menu).
   Riêng tư: tọa độ làm tròn 0,1° (khoảng 10 km) rồi mới gửi; chỉ lưu trong máy.
   © 2026 Lê Lệnh Bắc */
(function () {
  "use strict";
  const KHOA = "lichphap:thoi-tiet", KHOA_SL = "lichphap:thoi-tiet-so-lieu";
  const LAU_SO_LIEU = 30 * 60e3, LAU_VI_TRI = 6 * 3600e3, CU_QUA = 3 * 3600e3;
  const doc = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const ghi = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* chặn lưu: chỉ giữ trong phiên */ } };
  let dangLay = false;

  /* Mã thời tiết WMO → lời Việt và hình (nét mảnh cùng bộ biểu tượng của app) */
  const LOI = c => c === 0 ? "Trời quang" : c === 1 ? "Ít mây" : c === 2 ? "Mây rải rác" : c === 3 ? "Nhiều mây"
    : c === 45 || c === 48 ? "Sương mù" : c >= 51 && c <= 57 ? "Mưa phùn" : c >= 61 && c <= 67 ? "Mưa"
    : c >= 71 && c <= 77 || c === 85 || c === 86 ? "Tuyết" : c >= 80 && c <= 82 ? "Mưa rào" : c >= 95 ? "Dông" : "Thời tiết";
  const MAY = '<path d="M8.5 19.5h9a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.2A2.9 2.9 0 0 0 8.5 19.5z"/>';
  const HINH = {
    nang: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
    trang: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
    nangMay: '<circle cx="8" cy="8" r="3.2"/><path d="M8 2.2v1.3M2.2 8h1.3M3.9 3.9l.9.9M12.1 3.9l-.9.9"/>' + MAY,
    may: '<path d="M7 18.5h10.5a4.2 4.2 0 0 0 .4-8.4A6 6 0 0 0 6.3 11.7 3.4 3.4 0 0 0 7 18.5z"/>',
    suong: '<path d="M4 9h16M6 13h12M4 17h16"/>',
    mua: '<path d="M8 15.5h9a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.2A2.9 2.9 0 0 0 8 15.5z"/><path d="M9 18l-1 2.5M13 18l-1 2.5M17 18l-1 2.5"/>',
    tuyet: '<path d="M8 15.5h9a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.2A2.9 2.9 0 0 0 8 15.5z"/><path d="M9 19.5h.01M13 19.5h.01M17 19.5h.01"/>',
    dong: '<path d="M8 15.5h9a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.2A2.9 2.9 0 0 0 8 15.5z"/><path d="M13 16l-2 3h3l-2 3"/>'
  };
  const hinhCua = (c, ngay) => c <= 1 ? (ngay ? HINH.nang : HINH.trang) : c === 2 ? HINH.nangMay : c === 3 ? HINH.may
    : c === 45 || c === 48 ? HINH.suong : c >= 95 ? HINH.dong : c >= 71 && c <= 77 || c === 85 || c === 86 ? HINH.tuyet : HINH.mua;
  const svg = (c, ngay) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${hinhCua(c, ngay)}</svg>`;

  const dangBat = () => doc(KHOA) === 1;
  const ngayNay = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const soLieu = () => { const s = doc(KHOA_SL); return s && s.ngay === ngayNay() && Date.now() - s.luc < CU_QUA ? s : null; };

  function viTri() {
    const cu = doc(KHOA_SL);
    if (cu && cu.lat != null && Date.now() - (cu.lucViTri || 0) < LAU_VI_TRI) return Promise.resolve({ lat: cu.lat, lon: cu.lon, lucViTri: cu.lucViTri });
    return new Promise((ok, loi) => {
      if (!navigator.geolocation) return loi(new Error("khong-ho-tro"));
      navigator.geolocation.getCurrentPosition(
        p => ok({ lat: Math.round(p.coords.latitude * 10) / 10, lon: Math.round(p.coords.longitude * 10) / 10, lucViTri: Date.now() }),
        e => loi(e), { enableHighAccuracy: false, maximumAge: LAU_VI_TRI, timeout: 15000 });
    });
  }
  async function capNhat(ep) {
    if (!dangBat() || dangLay) return;
    const cu = doc(KHOA_SL);
    if (!ep && cu && cu.ngay === ngayNay() && Date.now() - cu.luc < LAU_SO_LIEU) return;
    dangLay = true;
    try {
      const v = await viTri();
      const u = `https://api.open-meteo.com/v1/forecast?latitude=${v.lat}&longitude=${v.lon}&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
      const r = await fetch(u, { cache: "no-store" });
      if (!r.ok) throw new Error("http " + r.status);
      const d = await r.json();
      ghi(KHOA_SL, { ngay: ngayNay(), luc: Date.now(), lat: v.lat, lon: v.lon, lucViTri: v.lucViTri,
        nd: Math.round(d.current.temperature_2m), ma: d.current.weather_code, ngayDem: d.current.is_day === 1,
        cao: Math.round(d.daily.temperature_2m_max[0]), thap: Math.round(d.daily.temperature_2m_min[0]) });
      if (typeof ve === "function") ve();
    } catch (e) {
      /* Bị từ chối vị trí: tắt hẳn (không có vị trí thì không có thời tiết); lỗi mạng: giữ số liệu cũ nếu còn hạn */
      if (e && e.code === 1) { tat(); if (typeof baoTam === "function") baoTam("Chưa cho phép dùng vị trí nên đã tắt thời tiết"); }
    } finally { dangLay = false; }
  }
  function bat() {
    ghi(KHOA, 1);
    return capNhat(true);
  }
  function tat() { ghi(KHOA, null); ghi(KHOA_SL, null); if (typeof ve === "function") ve(); }

  /* Dòng trên tờ lịch: chỉ tờ hôm nay, chỉ khi có số liệu trong 3 giờ gần đây */
  function dong(j) {
    if (!dangBat() || typeof jdHomNay !== "function" || j !== jdHomNay()) return "";
    const s = soLieu();
    if (!s) return "";
    return `<div class="tl-troi" role="img" aria-label="${LOI(s.ma)}, ${s.nd} độ, trong ngày ${s.thap} đến ${s.cao} độ" title="${LOI(s.ma)} · nguồn Open-Meteo.com">${svg(s.ma, s.ngayDem)}<b>${s.nd}°</b><span>${s.thap}–${s.cao}°</span></div>`;
  }
  /* Dòng tình trạng ở Menu → Giao diện */
  function moTa() {
    const s = doc(KHOA_SL);
    if (!dangBat()) return "Tắt";
    if (!s || s.nd == null) return "Đang lấy vị trí và thời tiết…";
    const d = new Date(s.luc);
    return `${LOI(s.ma)} ${s.nd}° · cập nhật ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  document.addEventListener("visibilitychange", () => { if (!document.hidden) capNhat(); });
  setTimeout(() => capNhat(), 1500);
  /* Cho cảnh trên tờ lịch: mã trời và ngày/đêm hiện tại (null nếu tắt hoặc số liệu cũ) */
  const hienTai = () => { if (!dangBat()) return null; const s = soLieu(); return s ? { ma: s.ma, ngayDem: s.ngayDem } : null; };
  window.ThoiTiet = { bat, tat, dangBat, dong, moTa, capNhat, hienTai };
})();
