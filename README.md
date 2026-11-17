# Lịch Pháp

Lịch vạn niên âm dương cho người Việt: mỗi ngày là một tờ lịch có âm lịch, can chi, tiết khí, trực,
nhị thập bát tú, giờ hoàng đạo và sao tốt xấu theo **Ngọc Hạp Thông Thư**, kèm Nhắc việc và Ngày lặp lại.

**Mở ứng dụng:** https://lelenhbac1974hn-web.github.io/lich-phap/

Ứng dụng web tĩnh, không cần máy chủ, cài được lên màn hình điện thoại và chạy được khi mất mạng
sau lần mở đầu tiên. Dữ liệu nhắc việc chỉ lưu trong máy người dùng.

## Tính năng

| Thẻ | Nội dung |
|---|---|
| **Ngày** | Tờ lịch lật: vuốt trái hoặc lên sang ngày sau, vuốt phải hoặc xuống về ngày trước, mỗi hướng một kiểu lật. Lễ tết hiện trên tờ lịch; nhấn giữ biểu tượng lễ để đọc phong tục, món ăn, ca dao. Câu ca dao, tục ngữ mỗi ngày. |
| **Giờ** | Mặt đồng hồ 12 canh giờ, giờ hoàng đạo / hắc đạo, hướng Hỷ thần, Tài thần. |
| **Tháng** | Lịch tháng âm dương, tô màu ngày tốt xấu theo việc đang xem, đánh dấu lễ tết, ngày có nhắc. |
| **Luận giải** | Xét ngày theo việc (việc chung, động thổ · khởi công, ký kết hợp đồng, khai trương · bàn giao, xuất hành) bằng hai kiểu: **Cộng sao** (thang điểm) và **Theo sách** (quy tắc Ngọc Hạp Thông Thư: sáu ngày đại kỵ không sao nào cứu, ngày kiêng theo việc, hoàng đạo, trực, sao tốt xấu hợp việc — mỗi lý do ghi số trang), trực, sao Ngọc Hạp của ngày, tra cứu 155 sao (nghĩa, nên, kỵ, cách an theo tháng). |
| **Nhắc** | *Nhắc việc*: gõ câu tự nhiên ("Họp giao ban 8h sáng mai", "Đi lễ chùa rằm tháng tới") — tự hiểu ngày, giờ, lặp lại, ưu tiên; xác nhận trước khi đánh dấu xong việc chưa tới hẹn. *Ngày lặp lại*: giỗ theo âm lịch, sinh nhật, kỷ niệm theo dương lịch ("Giỗ bố 20/10 âm, năm mất 2021"). Mỗi mục có biểu tượng vẽ sẵn (tự chọn theo nội dung hoặc chọn tay), sắp gần nhất lên đầu, chạm để xem ghi chú. |

Bấm logo 曆 ở góc trên để mở phần **Giới thiệu** ngay trong ứng dụng.

## Căn cứ lịch pháp

- Âm lịch tính theo thuật toán thiên văn của **Hồ Ngọc Đức**, múi giờ Việt Nam (GMT+7): điểm sóc,
  trung khí, tháng nhuận, tháng đủ / thiếu, can chi năm – tháng – ngày – giờ, 24 tiết khí, trực.
- Kiểm thử 510 ngày ngẫu nhiên (10 ngày mỗi năm, 1990–2040) so với các trang lịch phổ biến:
  âm lịch, can chi, tiết khí, trực khớp 100%.

## Căn cứ xem sao

- Sao tốt xấu an theo bảng 12 tháng trong sách **Ngọc Hạp Thông Thư** (bản dịch Việt); không trộn
  với hệ xem ngày khác. Mỗi sao trong ứng dụng ghi trạng thái *Đã đối chiếu Ngọc Hạp* hoặc
  *Đang đối chiếu Ngọc Hạp* (bản in còn thiếu hoặc chưa nhất quán).
- Bảng an sao đối chiếu thêm với hai bản gốc: bản khắc chữ Hán **Tăng bổ tuyển trạch thông thư quảng Ngọc hạp ký** và bản Hán Nôm **"Ngọc hạp toản yếu thông dụng"** (1926); ô nào bản dịch in thiếu hoặc vỡ bảng được bổ sung, sửa theo bản gốc.

## Tài liệu tham khảo

1. *Ngọc Hạp Thông Thư* — bảng an sao 12 tháng, sao tốt, sao xấu, ngày kỵ.
2. *Tăng bổ tuyển trạch thông thư quảng Ngọc hạp ký* (bản khắc chữ Hán) — bảng sao 12 tháng.
3. *Ngọc Hạp Chánh Tông* — tài liệu đối chiếu bổ sung.
4. *Ngọc hạp toản yếu thông dụng* (Hán Nôm, 1926) — bảng an sao, tên sao chữ Hán.
5. Hồ Ngọc Đức, *Thuật toán tính âm lịch* — phần lịch pháp.
6. Ca dao, tục ngữ Việt Nam — câu in trên tờ lịch.

## Cài lên điện thoại

- **iPhone (Safari):** mở địa chỉ trên → nút Chia sẻ → *Thêm vào MH chính*.
- **Android (Chrome):** mở địa chỉ trên → menu ⋮ → *Thêm vào màn hình chính* / *Cài đặt ứng dụng*.

## Cấu trúc

| Tệp | Vai trò |
|---|---|
| `index.html`, `style.css` | Giao diện |
| `lich-phap.js` | Lõi lịch pháp, danh sách sao dùng để luận ngày, lễ tết, ca dao |
| `ngoc-hap.js` | Cơ sở dữ liệu 155 sao Ngọc Hạp (nghĩa, nên, kỵ, bảng an 12 tháng) — nguồn duy nhất của bảng an sao |
| `luan-giai.js` | 40 quy tắc luận ngày rút từ chương luận giải Ngọc Hạp Thông Thư (sinh tự động) |
| `luan-sach.js` | Bộ máy "Luận theo sách" |
| `le-tet.js` | Thiệp lễ tết (phong tục, món ăn, hiệu ứng) |
| `bieu-tuong.js` | Bộ biểu tượng vẽ nét cho Nhắc việc và Ngày lặp lại |
| `ui.js` | Điều khiển giao diện, nhắc việc, phân tích câu tự nhiên |
| `sw.js`, `manifest.json` | Chạy ngoại tuyến, cài như ứng dụng |

Xem ngày là tham khảo văn hoá truyền thống, không thay cho quyết định của người dùng.

## Bản quyền

© 2026 Lê Lệnh Bắc. Bảo lưu mọi quyền — xem tệp [LICENSE](LICENSE).

Lịch Pháp được tặng **miễn phí** cho mọi người. Bản chính thức duy nhất:
https://lelenhbac1974hn-web.github.io/lich-phap/ — nếu bạn phải trả tiền cho ứng dụng này, đó là bản sao trái phép.

- **Được:** dùng ứng dụng, cài lên điện thoại, chia sẻ đường dẫn, xem mã nguồn để học hỏi.
- **Không được** (khi chưa có đồng ý bằng văn bản của tác giả): đưa lên App Store, Google Play hay bất kỳ
  chợ ứng dụng nào; bán, thu phí, gắn quảng cáo; phát hành lại dưới tên hoặc địa chỉ khác; dùng mã,
  cơ sở dữ liệu sao, hình ảnh trong sản phẩm khác.

Phông chữ Be Vietnam Pro và Bodoni Moda theo giấy phép SIL OFL 1.1.

*This repository is source-available, not open source. Publishing this app or any derivative on any
app store, or any commercial use, is prohibited without the author's written permission. See LICENSE.*
