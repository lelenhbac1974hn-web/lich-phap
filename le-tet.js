/* LỄ TẾT — dữ liệu mô tả và "thiệp" hiện khi nhấn giữ ngày lễ trên tờ lịch.
   Khoá: "am:ngày-tháng" (âm lịch), "duong:ngày-tháng" (dương lịch), "dac:..." (ngày đặc biệt).
   © 2026 Lê Lệnh Bắc */
(function () {
  "use strict";

  /* Lời theo "Lời giới thiệu lễ Tết — bản chính" anh Bắc duyệt 21/11/2026.
     tomTat: lời giới thiệu (hiện đầu thiệp, sau này cũng là lời đọc) · gocTich · phongTuc[] · monAn[] (monNhan: tên mục)
     ca: câu trích (\n xuống dòng) · caNhan: loại (Câu ca, Câu thơ…) · caNguon: tác giả/nguồn */
  const LE_TET = {
    "dac:giaothua": {
      ten: "Giao thừa — Tất niên", han: "除夕", nghi: true, bieu: "🎆", hat: ["✨", "🌸", "🎇"], kieu: "bay", phao: true,
      nen: ["#2A0F3A", "#7A0F0A"],
      tomTat: "Hôm nay là ngày cuối cùng của năm cũ. Buổi chiều, nhà nhà dâng mâm cơm tất niên mời tổ tiên về ăn Tết cùng con cháu. Đúng nửa đêm, khắc giao thừa, năm cũ trao lại cho năm mới: người ta thắp hương, đón những phút đầu tiên của mùa xuân.",
      gocTich: "“Giao thừa” nghĩa là cũ giao lại, mới đón lấy. Theo tín ngưỡng dân gian, đêm này các vị Hành khiển coi việc nhân gian bàn giao cho nhau, nên có lễ cúng ngoài trời tiễn quan cũ, đón quan mới.",
      phongTuc: ["Cúng tất niên chiều 30 (hoặc 29 năm thiếu)", "Cúng giao thừa ngoài trời rồi cúng trong nhà", "Đón giao thừa, xem pháo hoa; đi lễ đền chùa, hái lộc đầu năm", "Kiêng quét nhà, đổ rác từ sau giao thừa"],
      monAn: ["Gà luộc ngậm hoa, xôi gấc", "Bánh chưng, bánh tét, giò lụa", "Canh măng, mâm ngũ quả"]
    },
    "am:1-1": {
      ten: "Tết Nguyên Đán", han: "元旦", nghi: true, bieu: "🧧", hat: ["🌸", "🌸", "🌼", "🧧"], kieu: "roi", phao: true,
      nen: ["#C8261C", "#7A0F0A"],
      tomTat: "Chúc mừng năm mới! Tết Nguyên Đán là lễ lớn nhất trong năm của người Việt, lúc cả nhà sum họp, nhớ ơn tổ tiên và gửi cho nhau lời chúc đầu xuân. Người xưa tin rằng những ngày đầu năm vẹn tròn thì cả năm bình an, nên ai cũng giữ lời ăn tiếng nói, để niềm vui đầy nhà.",
      gocTich: "“Tết” là đọc trại chữ “tiết” 節; “Nguyên” là bắt đầu, “Đán” là buổi sớm. Nguyên Đán là buổi sớm đầu tiên của năm. Người lao động được nghỉ Tết âm lịch 5 ngày.",
      phongTuc: ["Xông đất: người đầu tiên bước vào nhà sau giao thừa mang may mắn cả năm", "Chúc Tết, mừng tuổi, lì xì cho trẻ nhỏ và người già", "“Mùng Một Tết cha, mùng Hai Tết mẹ, mùng Ba Tết thầy”", "Khai bút, xin chữ đầu năm; đi lễ chùa cầu an"],
      monAn: ["Bánh chưng (miền Bắc), bánh tét (miền Nam)", "Dưa hành, thịt đông, giò lụa", "Thịt kho trứng, canh khổ qua (miền Nam)", "Mứt Tết, mâm ngũ quả"],
      ca: "Thịt mỡ, dưa hành, câu đối đỏ\nCây nêu, tràng pháo, bánh chưng xanh", caNhan: "Câu đối"
    },
    "am:2-1": { cung: "am:1-1", ten: "Mùng Hai Tết" },
    "am:3-1": { cung: "am:1-1", ten: "Mùng Ba Tết" },
    "am:4-1": {
      ten: "Mùng Bốn Tết — Hóa vàng", han: "", bieu: "🕯️", hat: ["✨", "🌸"], kieu: "bay",
      nen: ["#A3472A", "#3E150A"],
      tomTat: "Sau ba ngày Tết chính, nhiều gia đình làm lễ hóa vàng, tiễn ông bà tổ tiên về lại cõi âm sau những ngày sum vầy cùng con cháu. Nhịp sống chậm dần trở lại, người ta chuẩn bị cho một năm làm ăn mới.",
      gocTich: "Lễ hóa vàng (tạ năm mới) thường làm trong khoảng mùng Ba đến mùng Bảy, tùy nếp từng nhà, từng vùng.",
      phongTuc: ["Cúng tạ, tiễn ông bà", "Đốt vàng mã dâng dịp Tết", "Thu dọn bàn thờ ngày Tết"],
      monAn: ["Mâm cơm cúng tạ: xôi, gà, bánh chưng"]
    },
    "am:7-1": {
      ten: "Khai hạ — Hạ cây nêu", han: "開賀", bieu: "🎋", hat: ["🎋", "🌸"], kieu: "roi",
      nen: ["#2E7D4F", "#14452B"],
      tomTat: "Mùng Bảy, cây nêu dựng từ hôm ông Táo về trời được hạ xuống. Những ngày Tết khép lại, mọi người trở về với công việc, mang theo lời cầu chúc cho một năm làm ăn thuận lợi.",
      gocTich: "Cây nêu là cây tre cao cắm trước sân, theo tích dân gian để đánh dấu đất của người, giữ yên nhà cửa trong dịp Tết. “Khai hạ” là mở đầu việc mừng, bắt đầu năm làm ăn mới.",
      phongTuc: ["Hạ cây nêu, làm lễ tạ tổ tiên", "Cầu một năm làm ăn thuận lợi", "Nhiều nơi đã bỏ việc dựng nêu, chỉ còn lễ cúng khai hạ"],
      monAn: ["Mâm cơm cúng tạ, thường có xôi, gà"]
    },
    "am:15-1": {
      ten: "Tết Nguyên Tiêu — Rằm tháng Giêng", han: "元宵", bieu: "🏮", hat: ["🏮", "✨", "🏮"], kieu: "bay", trang: true,
      nen: ["#B3261E", "#3A0C2E"],
      tomTat: "Đêm nay là đêm rằm đầu tiên của năm mới, trăng tròn và sáng. Dân gian có câu: “Lễ Phật quanh năm không bằng rằm tháng Giêng”. Nhiều gia đình đi chùa cầu an, thắp đèn, ngắm trăng và đọc thơ.",
      gocTich: "“Nguyên” là đầu, “tiêu” là đêm: đêm rằm đầu năm. Còn gọi là Tết Thượng Nguyên, một trong ba rằm lớn (Thượng Nguyên tháng Giêng, Trung Nguyên tháng Bảy, Hạ Nguyên tháng Mười). Ngày Thơ Việt Nam cũng tổ chức vào dịp này.",
      phongTuc: ["Đi chùa lễ Phật, cầu an đầu năm", "Cúng gia tiên", "Thắp đèn lồng, thả hoa đăng", "Ngắm trăng, ngâm thơ"],
      monAn: ["Cỗ chay hoặc cỗ mặn cúng gia tiên", "Xôi, chè"]
    },
    "am:3-3": {
      ten: "Tết Hàn thực", han: "寒食", bieu: "🍡", hat: ["⚪", "🍡", "⚪"], kieu: "bay",
      nen: ["#C77B3B", "#5A2F12"],
      tomTat: "Mùng Ba tháng Ba là ngày bánh trôi, bánh chay. Những viên bánh tròn trắng, nhân đường phên, được nặn từ sáng sớm để dâng lên bàn thờ, nhắc con cháu nhớ nguồn cội.",
      gocTich: "“Hàn thực” là ăn đồ nguội, gắn với tích Giới Tử Thôi đời Xuân Thu bên Trung Hoa: ông chết cháy trong rừng, vua Tấn Văn công thương xót, cấm đốt lửa nấu ăn vài ngày. Sang Việt Nam, ngày này thành dịp cúng bánh trôi, bánh chay tưởng nhớ tổ tiên.",
      phongTuc: ["Nặn bánh trôi, bánh chay cúng gia tiên", "Cả nhà cùng làm bánh"],
      monAn: ["Bánh trôi nước nhân đường phên", "Bánh chay nhân đậu xanh, chan nước đường, rắc vừng"],
      ca: "Thân em vừa trắng lại vừa tròn\nBảy nổi ba chìm với nước non", caNhan: "Câu thơ", caNguon: "Hồ Xuân Hương, Bánh trôi nước"
    },
    "dac:thanhminh": {
      ten: "Tiết Thanh minh — Tảo mộ", han: "清明", bieu: "🌿", hat: ["🌿", "🌸", "🍃"], kieu: "roi",
      nen: ["#4F8F6A", "#1B3A2A"],
      tomTat: "Tiết Thanh minh trời trong, gió mát. Con cháu rủ nhau ra thăm mộ ông bà, nhổ cỏ, đắp đất, thắp nén hương: một dịp để cả họ hàng gặp nhau và nhớ về nguồn cội.",
      gocTich: "Thanh minh là một trong 24 tiết khí, không theo ngày âm cố định mà rơi vào khoảng 4 hoặc 5 tháng Tư dương lịch. “Thanh minh” là trong sáng.",
      phongTuc: ["Tảo mộ: sửa sang, làm sạch phần mộ", "Thắp hương tưởng nhớ tổ tiên", "Cúng gia tiên khi về nhà"],
      monAn: ["Mâm cơm cúng gia tiên", "Hoa, quả, hương mang ra mộ"],
      ca: "Thanh minh trong tiết tháng ba\nLễ là tảo mộ, hội là đạp thanh", caNhan: "Câu thơ", caNguon: "Nguyễn Du, Truyện Kiều"
    },
    "am:10-3": {
      ten: "Giỗ Tổ Hùng Vương", han: "雄王", nghi: true, bieu: "🥁", hat: ["🌾", "🥁", "🌾"], kieu: "roi",
      nen: ["#8A5A12", "#3D2405"],
      tomTat: "Hôm nay là ngày Giỗ Tổ, ngày cả nước tưởng nhớ các Vua Hùng đã có công dựng nước. Dù ở đâu, người Việt cũng hướng về Đền Hùng, nhớ rằng mình chung một cội nguồn, là con Rồng cháu Tiên.",
      gocTich: "Lễ chính tổ chức tại Đền Hùng trên núi Nghĩa Lĩnh, tỉnh Phú Thọ. Năm 2012, UNESCO ghi danh Tín ngưỡng thờ cúng Hùng Vương ở Phú Thọ là di sản văn hóa phi vật thể đại diện của nhân loại. Người lao động được nghỉ một ngày.",
      phongTuc: ["Dâng hương tại Đền Hùng và các đền thờ Vua Hùng khắp nơi", "Rước kiệu, đánh trống đồng, hát Xoan"],
      monAn: ["Bánh chưng, bánh giầy — tích Lang Liêu dâng vua cha: bánh chưng vuông tượng đất, bánh giầy tròn tượng trời"],
      ca: "Dù ai đi ngược về xuôi\nNhớ ngày giỗ Tổ mùng mười tháng ba", caNhan: "Câu ca", caNguon: "Ca dao"
    },
    "am:15-4": {
      ten: "Lễ Phật Đản", han: "佛誕", bieu: "🪷", hat: ["🪷", "✨", "🪷"], kieu: "bay",
      nen: ["#C97A9B", "#4A1F3A"],
      tomTat: "Rằm tháng Tư là ngày kỷ niệm Đức Phật Thích Ca đản sinh. Chùa chiền treo cờ năm sắc, thắp đèn hoa sen; người đi lễ cầu bình an, làm việc thiện, sống chậm lại để nghe lời dạy về từ bi.",
      gocTich: "Theo kinh sách, Đức Phật sinh tại vườn Lâm Tỳ Ni (nay thuộc Nepal). Năm 1999, Liên Hợp Quốc công nhận Đại lễ Vesak là ngày lễ văn hóa, tôn giáo quốc tế.",
      phongTuc: ["Đi chùa, tắm Phật", "Thả hoa đăng, phóng sinh", "Ăn chay, làm việc thiện"],
      monAn: ["Cỗ chay, hoa sen, trái cây"]
    },
    "am:5-5": {
      ten: "Tết Đoan Ngọ", han: "端午", bieu: "🍑", hat: ["🍃", "🍑", "🌿"], kieu: "roi",
      nen: ["#3F8F5B", "#163A24"],
      tomTat: "Mùng Năm tháng Năm, Tết giết sâu bọ. Sáng sớm, trước khi ăn gì khác, cả nhà ăn một bát rượu nếp, vài quả mận chua để trừ sâu bệnh giữa mùa hè nóng.",
      gocTich: "“Đoan” là mở đầu, “Ngọ” là giữa trưa: giờ Ngọ ngày này là lúc dương khí thịnh nhất. Người Việt gắn ngày này với việc diệt sâu hại mùa màng và bệnh tật trong người.",
      phongTuc: ["“Giết sâu bọ” ngay khi ngủ dậy", "Hái lá thuốc vào giờ Ngọ", "Nhuộm móng tay, đeo chỉ ngũ sắc cho trẻ"],
      monAn: ["Rượu nếp cái hoa vàng", "Mận, vải, dưa hấu", "Bánh tro (miền Trung, miền Nam)"]
    },
    "am:15-7": {
      ten: "Lễ Vu Lan — Rằm tháng Bảy", han: "盂蘭", bieu: "🌹", hat: ["🌹", "🕯️", "🌸"], kieu: "roi",
      nen: ["#9E1D3D", "#2E0B1A"],
      tomTat: "Rằm tháng Bảy là mùa Vu Lan báo hiếu. Ai còn cha mẹ hãy về thăm, nói một lời cảm ơn; ai đã mất cha mẹ thì thắp nén hương tưởng nhớ. Cũng là ngày xá tội vong nhân, người ta cúng cháo, cúng gạo cho những linh hồn không nơi nương tựa.",
      gocTich: "Theo kinh Vu Lan, tôn giả Mục Kiền Liên thấy mẹ chịu khổ nơi địa ngục, được Đức Phật dạy sắm lễ cúng dường chư tăng ngày rằm tháng Bảy để cứu mẹ. Rằm tháng Bảy còn là Tết Trung Nguyên.",
      phongTuc: ["Cài hoa hồng lên áo: hồng đỏ còn mẹ, hồng trắng đã mất mẹ", "Đi chùa cầu siêu, cầu an cho cha mẹ", "Cúng chúng sinh: cháo trắng, gạo, muối, bỏng ngô; thả hoa đăng"],
      monAn: ["Cỗ chay cúng Phật, mâm cơm cúng gia tiên", "Mâm cúng chúng sinh đặt ngoài trời"],
      ca: "Công cha như núi Thái Sơn\nNghĩa mẹ như nước trong nguồn chảy ra", caNhan: "Câu ca", caNguon: "Ca dao"
    },
    "am:15-8": {
      ten: "Tết Trung Thu", han: "中秋", bieu: "🏮", hat: ["🏮", "⭐", "🏮"], kieu: "bay", trang: true,
      nen: ["#C9771F", "#2A1B4A"],
      tomTat: "Rằm tháng Tám, trăng tròn và sáng nhất năm. Đây là Tết của thiếu nhi: đèn ông sao, đèn kéo quân, tiếng trống múa lân rộn ràng; người lớn quây quần bên ấm trà, miếng bánh, kể chuyện chú Cuội, chị Hằng cho con trẻ nghe.",
      gocTich: "“Trung thu” là giữa mùa thu. Rằm tháng Tám trời trong, trăng sáng, mùa màng vừa xong, nên người xưa bày cỗ ngắm trăng, vui với con trẻ.",
      phongTuc: ["Rước đèn ông sao, đèn kéo quân", "Múa lân", "Bày cỗ, phá cỗ trông trăng"],
      monAn: ["Bánh nướng, bánh dẻo", "Bưởi, hồng, cốm", "Con giống bột, mâm ngũ quả tạo hình"],
      ca: "Thằng Cuội ngồi gốc cây đa\nĐể trâu ăn lúa gọi cha ời ời", caNhan: "Đồng dao"
    },
    "am:9-9": {
      ten: "Tết Trùng Cửu", han: "重九", bieu: "🌼", hat: ["🌼", "🍂"], kieu: "roi",
      nen: ["#C9A227", "#5A4208"],
      tomTat: "Mùng Chín tháng Chín, hai số chín gặp nhau. Người xưa chọn ngày này để lên cao ngắm cảnh thu, thưởng hoa cúc, chúc nhau sống lâu. Ngày nay ít nơi còn giữ tục, nhưng vẫn là một nét đẹp của mùa thu.",
      gocTich: "Theo thuyết âm dương, số lẻ là số dương; chín là số dương lớn nhất, nên ngày này còn gọi là Trùng Dương.",
      phongTuc: ["Lên cao, ngắm cảnh", "Thưởng hoa cúc", "Mừng thọ người già"],
      monAn: ["Rượu hoa cúc, trà hoa cúc"]
    },
    "am:10-10": {
      ten: "Tết Trùng Thập — Tết Cơm mới", han: "重十", bieu: "🍚", hat: ["🌾", "🍚", "🌾"], kieu: "roi",
      nen: ["#B5862A", "#4A3410"],
      tomTat: "Mùng Mười tháng Mười, lúa mùa vừa gặt xong. Bát cơm gạo mới thơm dẻo được dâng lên tổ tiên trước khi cả nhà cùng ăn, để tạ ơn trời đất và ông bà đã phù hộ một vụ bội thu.",
      gocTich: "“Trùng thập” là hai số mười gặp nhau, đúng vào lúc xong vụ gặt mùa ở miền Bắc.",
      phongTuc: ["Cúng cơm mới gia tiên", "Biếu ông bà, cha mẹ chén cơm gạo đầu mùa"],
      monAn: ["Cơm gạo mới", "Xôi, chè, bánh giầy"]
    },
    "am:15-10": {
      ten: "Tết Hạ Nguyên — Rằm tháng Mười", han: "下元", bieu: "🌕", hat: ["✨", "🕯️"], kieu: "bay", trang: true,
      nen: ["#5A4A8A", "#1C1638"],
      tomTat: "Rằm tháng Mười là rằm lớn cuối cùng trong năm. Người ta đi chùa, cúng gia tiên, cảm ơn một mùa làm ăn đã qua và cầu cho những tháng cuối năm được yên ổn.",
      gocTich: "Hạ Nguyên là rằm thứ ba trong “tam nguyên”: Thượng Nguyên (rằm tháng Giêng), Trung Nguyên (rằm tháng Bảy), Hạ Nguyên (rằm tháng Mười).",
      phongTuc: ["Đi chùa lễ Phật", "Cúng gia tiên", "Nhiều nơi làm lễ mừng lúa mới"],
      monAn: ["Xôi, chè, mâm cơm gạo mới"]
    },
    "am:23-12": {
      ten: "Ông Công Ông Táo chầu trời", han: "灶君", bieu: "🐟", hat: ["🐟", "✨", "🐟"], kieu: "bay",
      nen: ["#C25A1F", "#4A1A06"],
      tomTat: "Hôm nay nhà nhà tiễn ông Táo về trời. Theo dân gian, ông Táo cưỡi cá chép lên báo với Ngọc Hoàng mọi việc trong nhà suốt một năm. Từ hôm nay, không khí Tết đã về đến từng căn bếp.",
      gocTich: "Táo quân gồm ba vị, hai ông một bà, coi sóc bếp lửa và việc nhà. Cá chép vượt vũ môn hóa rồng, làm phương tiện đưa ông Táo lên trời.",
      phongTuc: ["Cúng ông Công ông Táo, thường trước giờ Ngọ (12 giờ trưa)", "Thả cá chép ra sông, hồ", "Dọn dẹp nhà cửa, lau bàn thờ; dựng cây nêu"],
      monAn: ["Mâm cỗ cúng", "Mũ ông Công, áo, hia bằng giấy; cá chép sống", "Miền Nam có nơi cúng kẹo mè, chè trôi nước"]
    },
    "dac:mot": {
      ten: "Mồng Một — ngày Sóc", han: "朔", bieu: "🌑", hat: ["✨", "⭐"], kieu: "bay",
      nen: ["#2B2F4A", "#0D0F1C"],
      tomTat: "Hôm nay là mồng Một, ngày đầu tháng âm lịch, trăng non chưa ló. Nhiều gia đình thắp nén hương, mong một tháng mới bình an, thuận lợi.",
      gocTich: "“Sóc” là lúc mặt trăng nằm giữa trái đất và mặt trời, ta không nhìn thấy trăng. Âm lịch lấy ngày sóc làm ngày đầu tháng.",
      phongTuc: ["Thắp hương gia tiên, thần tài, thổ địa", "Ăn chay, đi chùa", "Kiêng cãi cọ, giữ hòa khí đầu tháng"],
      monAn: ["Hoa tươi, quả, nước sạch; có nhà cúng thêm xôi, chè"]
    },
    "dac:ram": {
      ten: "Ngày Rằm — ngày Vọng", han: "望", bieu: "🌕", hat: ["✨", "⭐"], kieu: "bay", trang: true,
      nen: ["#3A3F8A", "#121533"],
      tomTat: "Hôm nay là ngày Rằm, trăng tròn đầy. Nhiều gia đình thắp hương gia tiên, đi chùa, ăn chay, để lòng nhẹ nhàng giữa tháng.",
      gocTich: "“Vọng” là lúc mặt trăng ở đối diện mặt trời, sáng tròn trọn vẹn. Dân gian lấy ngày 15 âm lịch làm ngày Rằm.",
      phongTuc: ["Thắp hương gia tiên, thần tài", "Đi chùa lễ Phật", "Ăn chay, làm việc thiện"],
      monAn: ["Hoa tươi, quả, nước sạch; có nhà cúng thêm xôi, chè"],
      ca: "Mười lăm trăng quết, mười sáu trăng treo", caNhan: "Tục ngữ"
    },
    "duong:1-1": {
      ten: "Tết Dương lịch", han: "", nghi: true, bieu: "🎆", hat: ["✨", "🎉"], kieu: "bay", phao: true,
      nen: ["#1E4F7A", "#0B1A2E"],
      tomTat: "Chào năm mới dương lịch! Ngày đầu tiên của năm là dịp nhìn lại năm cũ, đặt mục tiêu mới và gửi lời chúc sức khỏe, bình an đến người thân.",
      gocTich: "Lịch dương (lịch Gregory) được dùng chính thức trong hành chính ở Việt Nam. Người lao động được nghỉ một ngày.",
      phongTuc: ["Đếm ngược, xem pháo hoa đêm 31/12", "Gặp gỡ, du xuân cùng gia đình"]
    },
    "duong:8-3": {
      ten: "Ngày Quốc tế Phụ nữ", han: "", bieu: "💐", hat: ["🌷", "🌸", "💐"], kieu: "roi",
      nen: ["#C2466E", "#4A1028"],
      tomTat: "Hôm nay là ngày của mẹ, của vợ, của chị em gái và những người phụ nữ quanh ta. Một bó hoa, một bữa cơm do người nhà nấu, một lời cảm ơn giản dị cũng đủ làm ngày này ấm áp.",
      gocTich: "Năm 1910, tại Hội nghị phụ nữ quốc tế ở Copenhagen, bà Clara Zetkin đề nghị lấy một ngày trong năm làm ngày đấu tranh cho quyền của phụ nữ. Liên Hợp Quốc chính thức kỷ niệm ngày 8/3 từ năm 1975.",
      phongTuc: ["Tặng hoa, quà", "Nam giới làm việc nhà thay phụ nữ", "Cơ quan tổ chức gặp mặt chị em"]
    },
    "duong:30-4": {
      ten: "Ngày Giải phóng miền Nam, thống nhất đất nước", han: "", nghi: true, bieu: "🇻🇳", hat: ["🇻🇳", "🕊️", "✨"], kieu: "bay", phao: true,
      nen: ["#C8261C", "#5A0A06"],
      tomTat: "Ngày 30 tháng 4 năm 1975, chiến dịch Hồ Chí Minh toàn thắng, Bắc Nam sum họp một nhà. Mỗi năm đến ngày này, cờ đỏ sao vàng tung bay khắp phố phường, nhắc nhớ cái giá của hòa bình.",
      gocTich: "Trưa 30/4/1975, lá cờ cách mạng cắm trên nóc Dinh Độc Lập, kết thúc chiến tranh. Người lao động được nghỉ một ngày.",
      phongTuc: ["Treo cờ Tổ quốc", "Mít tinh, diễu binh vào các năm chẵn"]
    },
    "duong:1-5": {
      ten: "Ngày Quốc tế Lao động", han: "", nghi: true, bieu: "🛠️", hat: ["🌷", "✨"], kieu: "bay",
      nen: ["#B5402A", "#4A140A"],
      tomTat: "Ngày tôn vinh người lao động khắp thế giới. Ở Việt Nam, ngày này liền với 30/4 thành kỳ nghỉ dài, dịp để mọi người nghỉ ngơi và đoàn tụ bên gia đình.",
      gocTich: "Bắt nguồn từ cuộc đình công đòi ngày làm tám giờ của công nhân Chicago (Mỹ) ngày 1/5/1886. Người lao động được nghỉ một ngày.",
      phongTuc: ["Treo cờ", "Nghỉ ngơi, du lịch cùng gia đình"]
    },
    "duong:2-9": {
      ten: "Quốc khánh nước CHXHCN Việt Nam", han: "", nghi: true, bieu: "🇻🇳", hat: ["🇻🇳", "⭐", "✨"], kieu: "bay", phao: true,
      nen: ["#D0281D", "#6B0F0A"],
      tomTat: "Ngày 2 tháng 9 năm 1945, tại Quảng trường Ba Đình, Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập, khai sinh nước Việt Nam Dân chủ Cộng hòa. Hôm nay là ngày sinh nhật của Tổ quốc.",
      gocTich: "Người lao động được nghỉ hai ngày: 2/9 và một ngày liền kề trước hoặc sau.",
      phongTuc: ["Treo cờ Tổ quốc", "Mít tinh, diễu binh, bắn pháo hoa"],
      ca: "“Nước Việt Nam có quyền hưởng tự do và độc lập”", caNhan: "Trích", caNguon: "Tuyên ngôn Độc lập, 1945"
    },
    "duong:20-10": {
      ten: "Ngày Phụ nữ Việt Nam", han: "", bieu: "🌹", hat: ["🌹", "🌸", "✨"], kieu: "roi",
      nen: ["#B23A5A", "#3E0F22"],
      tomTat: "Hôm nay là Ngày Phụ nữ Việt Nam. Từ Bà Trưng, Bà Triệu đến những người mẹ tần tảo hôm nay, phụ nữ Việt luôn là chỗ dựa của gia đình và xóm làng. Một lời chúc, một món quà nhỏ là cách để nói lời cảm ơn.",
      gocTich: "Ngày 20/10/1930, Hội Phụ nữ phản đế Việt Nam ra đời, tiền thân của Hội Liên hiệp Phụ nữ Việt Nam ngày nay.",
      phongTuc: ["Tặng hoa, quà cho mẹ, vợ, chị em gái, cô giáo, đồng nghiệp nữ", "Cơ quan, đoàn thể tổ chức gặp mặt"],
      ca: "Giặc đến nhà, đàn bà cũng đánh", caNhan: "Tục ngữ"
    },
    "duong:20-11": {
      ten: "Ngày Nhà giáo Việt Nam", han: "", bieu: "📖", hat: ["💐", "📖", "✨"], kieu: "bay",
      nen: ["#2C6E8A", "#0E2A38"],
      tomTat: "Hôm nay là ngày tri ân thầy cô. Ai cũng có một người thầy đã dạy mình con chữ đầu tiên, một câu nói theo mình suốt đời. Ngày này là dịp quay về thăm trường cũ, gửi lời cảm ơn đến người đã dìu dắt mình.",
      gocTich: "Từ năm 1982, ngày 20 tháng 11 được chọn là Ngày Nhà giáo Việt Nam.",
      phongTuc: ["Học trò tặng hoa, thiếp chúc thầy cô", "Thăm thầy giáo cũ", "Nhà trường tổ chức lễ kỷ niệm, văn nghệ"],
      ca: "Muốn sang thì bắc cầu kiều\nMuốn con hay chữ thì yêu lấy thầy", caNhan: "Câu ca", caNguon: "Ca dao"
    },
    "duong:24-11": {
      ten: "Ngày Văn hóa Việt Nam", han: "", nghi: true, bieu: "🎭", hat: ["🎭", "📜", "🪕"], kieu: "bay",
      nen: ["#8A1B15", "#2E0A07"],
      tomTat: "Ngày tôn vinh văn hóa Việt Nam, từ tiếng nói, lời ru, lễ hội đến nếp nhà. Đây là dịp để mỗi người tìm hiểu và giữ gìn những giá trị ông cha để lại.",
      gocTich: "Ngày 24/11/1946, Chủ tịch Hồ Chí Minh dự và phát biểu tại Hội nghị Văn hóa toàn quốc lần thứ nhất. Quốc hội đã quy định ngày này là Ngày Văn hóa Việt Nam; người lao động được nghỉ một ngày.",
      phongTuc: ["Hoạt động văn hóa, nghệ thuật", "Tham quan bảo tàng, di tích"],
      ca: "“Văn hóa phải soi đường cho quốc dân đi”", caNhan: "Trích lời Bác Hồ", caNguon: "Hội nghị Văn hóa toàn quốc, 1946"
    },
    "duong:22-12": {
      ten: "Ngày thành lập Quân đội Nhân dân Việt Nam", han: "", bieu: "⭐", hat: ["⭐", "🇻🇳", "✨"], kieu: "bay",
      nen: ["#3E6B2E", "#14260F"],
      tomTat: "Hôm nay là ngày của những người lính Cụ Hồ. Từ 34 chiến sĩ đầu tiên nơi núi rừng Cao Bằng, Quân đội Nhân dân Việt Nam đã cùng dân tộc đi qua những cuộc chiến để giữ yên bờ cõi.",
      gocTich: "Ngày 22/12/1944, Đội Việt Nam Tuyên truyền Giải phóng quân thành lập tại khu rừng Trần Hưng Đạo (Cao Bằng), do đồng chí Võ Nguyên Giáp chỉ huy. Từ năm 1989, ngày này còn là Ngày hội Quốc phòng toàn dân.",
      phongTuc: ["Thăm hỏi bộ đội, cựu chiến binh, gia đình chính sách", "Tặng hoa người thân đang hoặc đã từng tại ngũ"]
    },
    "duong:24-12": {
      ten: "Đêm Giáng sinh", han: "", bieu: "🎄", hat: ["❄️", "⭐", "🎄"], kieu: "roi",
      nen: ["#1F5A3A", "#5A0F14"],
      tomTat: "Đêm nay là đêm Vọng Giáng sinh. Nhà thờ sáng đèn, cây thông lấp lánh, phố phường đông vui. Người Công giáo dự lễ mừng Chúa ra đời; nhiều gia đình khác cũng xem đây là dịp đi chơi, tặng quà cuối năm.",
      gocTich: "Lễ Giáng sinh ngày 25/12 kỷ niệm ngày Chúa Giê-su ra đời; đêm 24 là đêm canh thức chờ đón.",
      phongTuc: ["Dự lễ đêm tại nhà thờ", "Trang trí cây thông, hang đá", "Tặng quà, ông già Noel cho trẻ nhỏ"],
      monAn: ["Bánh khúc cây, gà tây hoặc gà quay", "Bữa tối sum họp"], monNhan: "Món ăn"
    }
  };

  /* Ngày lễ của một ngày → danh sách khoá thiệp */
  /* Khoá thiệp của một mục lễ (null nếu không có thiệp) */
  function khoaCuaLe(l, am, dd, mm) {
    if (l.loai === "am") {
      if (/^Giao thừa/.test(l.ten)) return "dac:giaothua";
      return !am.leap && LE_TET[`am:${am.day}-${am.month}`] ? `am:${am.day}-${am.month}` : null;
    }
    if (l.loai === "duong") return LE_TET[`duong:${dd}-${mm}`] ? `duong:${dd}-${mm}` : null;
    if (l.loai === "ram") return am.day === 15 ? "dac:ram" : "dac:mot";    return null;
  }
  const laLeLon = k => k && k !== "dac:ram" && k !== "dac:mot";
  const layThiep = khoa => { const d = LE_TET[khoa]; return d && d.cung ? { ...LE_TET[d.cung], ten: d.ten, khoaGoc: d.cung } : d; };

  /* ── Thiệp hiện khi nhấn giữ ── */
  let lop = null, ve = null, henHat = 0;
  const giam = window.matchMedia("(prefers-reduced-motion: reduce)");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function moThiep(khoa, dongNgay) {
    const d = layThiep(khoa);
    if (!d) return;
    dongThiep(true);
    lop = document.createElement("div");
    lop.className = "thiep-lop";
    lop.setAttribute("role", "dialog");
    lop.setAttribute("aria-modal", "true");
    lop.setAttribute("aria-label", d.ten);
    lop.style.setProperty("--n1", d.nen[0]); lop.style.setProperty("--n2", d.nen[1]);
    const ds = (tieu, arr) => arr && arr.length ? `<section><h4>${tieu}</h4><ul>${arr.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>` : "";
    lop.innerHTML = `
      <canvas class="thiep-hat" aria-hidden="true"></canvas>
      <article class="thiep${d.trang ? " co-trang" : ""}">
        <button type="button" class="thiep-dong" aria-label="Đóng">✕</button>
        <div class="thiep-cuon">
        <div class="thiep-dau">
          ${d.trang ? '<div class="thiep-trang" aria-hidden="true"></div>' : ""}
          ${d.han ? `<div class="thiep-han" aria-hidden="true">${esc(d.han)}</div>` : ""}
          <div class="thiep-bieu" aria-hidden="true">${d.bieu}</div>
          <h3>${esc(d.ten)}</h3>
          <p class="thiep-ngay">${esc(dongNgay || "")}${d.nghi ? ' <span class="thiep-nghi">Ngày nghỉ</span>' : ""}</p>
        </div>
        <div class="thiep-than">
          <p class="thiep-tom">${esc(d.tomTat)}</p>
          ${d.gocTich ? `<section><h4>Gốc tích</h4><p class="thiep-goc">${esc(d.gocTich)}</p></section>` : ""}
          ${ds("Phong tục", d.phongTuc)}
          ${ds(d.monNhan || "Mâm cỗ", d.monAn)}
          ${d.ca ? `<blockquote class="thiep-ca">${d.caNhan ? `<small>${esc(d.caNhan)}</small>` : ""}${esc(d.ca).replace(/\n/g, "<br>")}${d.caNguon ? `<cite>— ${esc(d.caNguon)}</cite>` : ""}</blockquote>` : ""}
        </div>
        </div>
      </article>`;
    document.body.appendChild(lop);
    requestAnimationFrame(() => lop.classList.add("hien"));
    lop.addEventListener("click", e => { if (e.target === lop || e.target.closest(".thiep-dong")) dongThiep(); });
    let y0 = null;
    lop.addEventListener("touchstart", e => { y0 = e.touches[0].clientY; }, { passive: true });
    lop.addEventListener("touchend", e => { if (y0 != null && e.changedTouches[0].clientY - y0 > 90 && lop.querySelector(".thiep-cuon").scrollTop <= 0) dongThiep(); y0 = null; }, { passive: true });
    document.addEventListener("keydown", phimDong);
    if (navigator.vibrate) navigator.vibrate(12);
    if (!giam.matches) chayHat(lop.querySelector(".thiep-hat"), d);
  }
  function phimDong(e) { if (e.key === "Escape") dongThiep(); }
  function dongThiep(ngay) {
    document.removeEventListener("keydown", phimDong);
    if (ve) { cancelAnimationFrame(ve); ve = null; }
    clearTimeout(henHat);
    const l = lop; lop = null;
    if (!l) return;
    if (ngay) { l.remove(); return; }
    l.classList.remove("hien"); l.classList.add("dong");
    setTimeout(() => l.remove(), 380);
  }

  /* Hạt bay theo chủ đề (emoji) + pháo hoa */
  function chayHat(cv, d) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const kich = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
    kich();
    const c = cv.getContext("2d");
    const W = () => cv.width / dpr, H = () => cv.height / dpr;
    const ngau = (a, b) => a + Math.random() * (b - a);
    const bay = d.kieu === "bay";
    const hat = Array.from({ length: 22 }, (_, i) => taoHat(true));
    function taoHat(dau) {
      return { x: ngau(0, W()), y: dau ? ngau(0, H()) : (bay ? H() + 30 : -30), r: ngau(16, 30), vy: bay ? ngau(-46, -22) : ngau(28, 60),
        vx: ngau(-10, 10), goc: ngau(-0.5, 0.5), vg: ngau(-0.6, 0.6), pha: ngau(0, 6.28), e: d.hat[Math.floor(Math.random() * d.hat.length)], a: ngau(0.55, 0.95) };
    }
    const phao = [];
    function banPhao() {
      const x = ngau(W() * 0.15, W() * 0.85), y = ngau(H() * 0.12, H() * 0.38);
      const mau = ["#FFD36B", "#FF7A6B", "#FFFFFF", "#9FE3B6", "#FFB3D1"][Math.floor(Math.random() * 5)];
      for (let i = 0; i < 46; i++) { const g = (i / 46) * 6.283, v = ngau(70, 150); phao.push({ x, y, vx: Math.cos(g) * v, vy: Math.sin(g) * v, t: 0, song: ngau(1.1, 1.7), mau }); }
      henHat = setTimeout(banPhao, ngau(700, 1400));
    }
    if (d.phao) henHat = setTimeout(banPhao, 350);
    let truoc = performance.now();
    function khung(bay2) {
      ve = requestAnimationFrame(khung);
      if (cv.width !== innerWidth * dpr) kich();
      const dt = Math.min(0.05, (bay2 - truoc) / 1000); truoc = bay2;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W(), H());
      c.textAlign = "center"; c.textBaseline = "middle";
      for (let i = 0; i < hat.length; i++) {
        const p = hat[i];
        p.x += (p.vx + Math.sin(bay2 / 900 + p.pha) * 14) * dt; p.y += p.vy * dt; p.goc += p.vg * dt;
        if (p.y < -40 || p.y > H() + 40) hat[i] = taoHat(false);
        c.save(); c.globalAlpha = p.a; c.translate(p.x, p.y); c.rotate(p.goc);
        c.font = `${p.r}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
        c.fillText(p.e, 0, 0); c.restore();
      }
      for (let i = phao.length - 1; i >= 0; i--) {
        const p = phao[i]; p.t += dt;
        if (p.t > p.song) { phao.splice(i, 1); continue; }
        p.vy += 60 * dt; p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt;
        c.globalAlpha = 1 - p.t / p.song; c.fillStyle = p.mau;
        c.beginPath(); c.arc(p.x, p.y, 2.2, 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
    }
    ve = requestAnimationFrame(khung);
  }

  window.LE_TET = LE_TET;
  window.ThiepLe = { mo: moThiep, dong: dongThiep, khoaCuaLe, laLeLon, layThiep };
})();
