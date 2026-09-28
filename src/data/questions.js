// src/data/questions.js
// HCM202 - Tư tưởng Hồ Chí Minh: "ĐẤU TRƯỜNG ĐẠI ĐOÀN KẾT"
// CHỦ ĐỀ CHUYÊN BIỆT: MỤC 5.1.3 - ĐIỀU KIỆN XÂY DỰNG KHỐI ĐẠI ĐOÀN KẾT TOÀN DÂN TỘC
// Bao gồm đúng 3 điều kiện cốt lõi:
// 1. Phải kế thừa truyền thống yêu nước, nhân nghĩa, đoàn kết của dân tộc.
// 2. Phải có lòng khoan dung, độ lượng với con người.
// 3. Phải có niềm tin vào nhân dân.

export const FATE_TYPES = {
  LUCKY: {
    type: "LUCKY",
    name: "MAY MẮN",
    icon: "🍀",
    color: "#22C55E",
    desc: "+200 PTS trực tiếp vào quỹ điểm của đội."
  },
  JACKPOT: {
    type: "JACKPOT",
    name: "ĐẠI THẮNG",
    icon: "💎",
    color: "#38BDF8",
    desc: "Nhân đôi phần thưởng cược của câu vừa rồi (thưởng thêm đúng bằng số điểm cược)."
  },
  ALLY: {
    type: "ALLY",
    name: "ĐỒNG HÀNH",
    icon: "🤝",
    color: "#22D3EE",
    desc: "Đội hiện tại +100 PTS và chọn 1 đội bạn cùng nhận +100 PTS."
  },
  SHIELD: {
    type: "SHIELD",
    name: "BẢO HỘ",
    icon: "🛡️",
    color: "#A78BFA",
    desc: "Nhận 1 Lá Chắn Bảo Hộ (🛡 x1) giúp tự động vô hiệu hóa 1 Biến Cố xấu trong tương lai."
  },
  NEUTRAL: {
    type: "NEUTRAL",
    name: "BÌNH YÊN",
    icon: "😶",
    color: "#94A3B8",
    desc: "Một lượt bình yên. Không cộng, không trừ."
  },
  BAD_LUCK: {
    type: "BAD_LUCK",
    name: "BIẾN CỐ",
    icon: "🌪️",
    color: "#EF4444",
    desc: "-100 PTS (Nếu có Lá Chắn 🛡️ sẽ tự động kích hoạt chặn trừ điểm)."
  },
  MYSTERY_GIFT: {
    type: "MYSTERY_GIFT",
    name: "QUÀ BẤT NGỜ",
    icon: "🎁",
    color: "#FBBF24",
    desc: "Mở hộp quà bí ẩn ngẫu nhiên nhận +100, +200 hoặc +300 PTS."
  }
};

export const QUESTIONS = [
  // =========================================================================
  // ROUND 1: 12 THẺ BÀI (NHẬN BIẾT + HIỂU + TÌNH HUỐNG DỄ/VỪA)
  // Phân bố đáp án: 3 A, 3 B, 3 C, 3 D
  // =========================================================================
  {
    id: 1,
    round: 1,
    cardNum: "01",
    pillar: "Kế thừa truyền thống yêu nước, nhân nghĩa, đoàn kết",
    question: "Một nhóm sinh viên tổ chức chương trình hỗ trợ đồng bào bị ảnh hưởng bởi thiên tai. Cách làm nào thể hiện rõ nhất việc kế thừa truyền thống nhân nghĩa, đoàn kết của dân tộc?",
    options: [
      { key: "A", text: "Chỉ hỗ trợ những người quen biết với thành viên trong nhóm." },
      { key: "B", text: "Phối hợp, chia sẻ nguồn lực và hỗ trợ đúng những người đang thực sự cần giúp đỡ." },
      { key: "C", text: "Tổ chức riêng lẻ để mỗi nhóm có thành tích riêng." },
      { key: "D", text: "Chỉ tham gia nếu hoạt động được tính điểm rèn luyện." }
    ],
    correctAnswer: "B",
    explanation: "Tinh thần nhân nghĩa và đoàn kết được thể hiện qua sự tương trợ, chia sẻ và cùng hướng nguồn lực đến lợi ích chung của cộng đồng.",
    fate: { type: "LUCKY", value: 200 }
  },
  {
    id: 2,
    round: 1,
    cardNum: "02",
    pillar: "Có lòng khoan dung, độ lượng với con người",
    question: "Một thành viên trong nhóm từng mắc sai sót nhưng đã nhận lỗi và chủ động sửa chữa. Cách ứng xử nào phù hợp nhất với tinh thần khoan dung, độ lượng?",
    options: [
      { key: "A", text: "Góp ý thẳng thắn, tạo cơ hội sửa sai và cùng hỗ trợ để tiến bộ." },
      { key: "B", text: "Bỏ qua hoàn toàn sai sót và không cần rút kinh nghiệm." },
      { key: "C", text: "Loại thành viên đó khỏi mọi hoạt động của nhóm." },
      { key: "D", text: "Nhắc lại sai lầm đó mỗi khi có bất đồng." }
    ],
    correctAnswer: "A",
    explanation: "Khoan dung không có nghĩa là bỏ qua mọi sai sót, mà là không định kiến, biết nhìn nhận sự tiến bộ và tạo cơ hội để con người sửa chữa.",
    fate: { type: "SHIELD", value: 1 }
  },
  {
    id: 3,
    round: 1,
    cardNum: "03",
    pillar: "Có niềm tin vào nhân dân",
    question: "Khi xây dựng một hoạt động chung của lớp, cách làm nào thể hiện rõ nhất niềm tin vào tập thể?",
    options: [
      { key: "A", text: "Ban cán sự tự quyết định vì cho rằng các bạn khác không quan tâm." },
      { key: "B", text: "Chỉ hỏi ý kiến những sinh viên thường xuyên phát biểu." },
      { key: "C", text: "Giao toàn bộ quyền quyết định cho cán sự quản lý." },
      { key: "D", text: "Tạo nhiều cách để mọi thành viên đóng góp ý kiến và khuyến khích họ cùng tham gia." }
    ],
    correctAnswer: "D",
    explanation: "Tin vào nhân dân gắn với việc tôn trọng, lắng nghe và tạo điều kiện để mọi người phát huy vai trò chủ động của mình.",
    fate: { type: "ALLY", value: 100 }
  },
  {
    id: 4,
    round: 1,
    cardNum: "04",
    pillar: "Kế thừa truyền thống yêu nước, nhân nghĩa, đoàn kết",
    question: "Việc kế thừa truyền thống yêu nước, nhân nghĩa và đoàn kết nên được hiểu như thế nào?",
    options: [
      { key: "A", text: "Giữ nguyên mọi cách làm của quá khứ." },
      { key: "B", text: "Chỉ nhắc lại truyền thống trong các dịp kỷ niệm." },
      { key: "C", text: "Trân trọng những giá trị tốt đẹp và vận dụng phù hợp vào hoàn cảnh hiện tại." },
      { key: "D", text: "Thay thế hoàn toàn giá trị truyền thống bằng những xu hướng mới." }
    ],
    correctAnswer: "C",
    explanation: "Kế thừa truyền thống là phát huy những giá trị tích cực của dân tộc trong điều kiện mới, không đồng nghĩa với sao chép máy móc quá khứ.",
    fate: { type: "NEUTRAL", value: 0 }
  },
  {
    id: 5,
    round: 1,
    cardNum: "05",
    pillar: "Có lòng khoan dung, độ lượng với con người",
    question: "Trong một cuộc thảo luận, người từng bất đồng với bạn đưa ra một ý kiến hợp lý. Cách ứng xử nào phù hợp với tinh thần khoan dung?",
    options: [
      { key: "A", text: "Công nhận điểm hợp lý và tiếp tục trao đổi trên tinh thần xây dựng." },
      { key: "B", text: "Bác bỏ vì người đó từng mâu thuẫn với mình trong quá khứ." },
      { key: "C", text: "Không cho người đó tiếp tục phát biểu trong cuộc thảo luận." },
      { key: "D", text: "Chỉ đồng ý nếu người đó xin lỗi về mọi bất đồng trước đây." }
    ],
    correctAnswer: "A",
    explanation: "Khoan dung đòi hỏi hạn chế thành kiến cá nhân, tôn trọng điều đúng và tìm điểm chung để hợp tác.",
    fate: { type: "JACKPOT", value: 1 }
  },
  {
    id: 6,
    round: 1,
    cardNum: "06",
    pillar: "Có niềm tin vào nhân dân",
    question: "Nhận định nào phù hợp nhất với tư tưởng coi trọng sức mạnh của nhân dân?",
    options: [
      { key: "A", text: "Những việc khó chỉ có một nhóm nhỏ mới giải quyết được." },
      { key: "B", text: "Khi được tôn trọng và phát huy vai trò, nhân dân có thể tạo nên sức mạnh rất lớn." },
      { key: "C", text: "Nhân dân chỉ nên thực hiện quyết định đã có sẵn từ ban tổ chức." },
      { key: "D", text: "Ý kiến của số đông luôn đúng tuyệt đối trong mọi trường hợp." }
    ],
    correctAnswer: "B",
    explanation: "Niềm tin vào nhân dân là tin vào sức mạnh, khả năng và vai trò chủ thể của nhân dân, đồng thời cần tổ chức và phát huy sức mạnh ấy phù hợp.",
    fate: { type: "BAD_LUCK", value: -100 }
  },
  {
    id: 7,
    round: 1,
    cardNum: "07",
    pillar: "Kế thừa truyền thống yêu nước, nhân nghĩa, đoàn kết",
    question: "Trong hoạt động cộng đồng, hành động nào gần nhất với truyền thống “tương thân tương ái”?",
    options: [
      { key: "A", text: "Mỗi cá nhân chỉ quan tâm phần việc và quyền lợi của mình." },
      { key: "B", text: "Chỉ giúp đỡ người khác khi nhận lại lợi ích tương đương." },
      { key: "C", text: "Đứng ngoài quan sát và chờ người khác hành động trước." },
      { key: "D", text: "Hỗ trợ nhau khi khó khăn và cùng hướng đến lợi ích chung." }
    ],
    correctAnswer: "D",
    explanation: "Truyền thống tương thân tương ái thể hiện ở sự gắn kết, san sẻ khó khăn và cùng hành động vì lợi ích chung của cộng đồng.",
    fate: { type: "LUCKY", value: 200 }
  },
  {
    id: 8,
    round: 1,
    cardNum: "08",
    pillar: "Có lòng khoan dung, độ lượng với con người",
    question: "Khoan dung, độ lượng trong xây dựng đoàn kết KHÔNG có nghĩa là gì?",
    options: [
      { key: "A", text: "Tôn trọng những khác biệt chính đáng giữa các cá nhân." },
      { key: "B", text: "Tạo cơ hội cho người biết nhận lỗi và sửa chữa sai lầm." },
      { key: "C", text: "Bỏ qua mọi sai phạm và từ bỏ mọi nguyên tắc." },
      { key: "D", text: "Hạn chế định kiến cá nhân để tìm kiếm điểm chung hợp tác." }
    ],
    correctAnswer: "C",
    explanation: "Khoan dung không đồng nghĩa với dễ dãi hoặc bỏ nguyên tắc.",
    fate: { type: "ALLY", value: 100 }
  },
  {
    id: 9,
    round: 1,
    cardNum: "09",
    pillar: "Có niềm tin vào nhân dân",
    question: "Nếu người dân chưa tích cực tham gia một hoạt động chung, cách tiếp cận nào phù hợp nhất?",
    options: [
      { key: "A", text: "Tìm hiểu nguyên nhân, lắng nghe và tạo điều kiện để họ tham gia." },
      { key: "B", text: "Kết luận ngay rằng người dân không có ý thức trách nhiệm." },
      { key: "C", text: "Không cần tiếp tục lấy ý kiến hay đối thoại." },
      { key: "D", text: "Chỉ làm việc với những người đã đồng ý từ trước." }
    ],
    correctAnswer: "A",
    explanation: "Có niềm tin vào nhân dân đòi hỏi sự kiên trì lắng nghe tâm tư, tháo gỡ vướng mắc và tạo động lực để người dân phát huy vai trò chủ thể.",
    fate: { type: "SHIELD", value: 1 }
  },
  {
    id: 10,
    round: 1,
    cardNum: "10",
    pillar: "Kế thừa truyền thống yêu nước, nhân nghĩa, đoàn kết",
    question: "Điểm chung của các giá trị yêu nước, nhân nghĩa và đoàn kết trong xây dựng khối đại đoàn kết là gì?",
    options: [
      { key: "A", text: "Khuyến khích mỗi nhóm chỉ bảo vệ lợi ích cục bộ của riêng mình." },
      { key: "B", text: "Tạo nền tảng tinh thần giúp con người gắn bó và cùng hướng đến lợi ích chung." },
      { key: "C", text: "Xóa bỏ hoàn toàn mọi khác biệt về tính cách giữa các cá nhân." },
      { key: "D", text: "Chỉ phát huy ý nghĩa trong các giai đoạn đất nước có chiến tranh." }
    ],
    correctAnswer: "B",
    explanation: "Các giá trị truyền thống tốt đẹp tạo nên nền tảng tinh thần vững chắc, thôi thúc con người vượt qua khác biệt để cùng phấn đấu vì mục tiêu chung.",
    fate: { type: "NEUTRAL", value: 0 }
  },
  {
    id: 11,
    round: 1,
    cardNum: "11",
    pillar: "Có lòng khoan dung, độ lượng với con người",
    question: "Một tập thể có thành viên khác nhau về quê quán, hoàn cảnh và quan điểm. Điều gì giúp duy trì đoàn kết tốt hơn?",
    options: [
      { key: "A", text: "Yêu cầu mọi người phải suy nghĩ và hành động rập khuôn giống nhau." },
      { key: "B", text: "Chỉ giữ lại những người có quan điểm trùng khớp với số đông." },
      { key: "C", text: "Không cho phép thảo luận về những vấn đề có nảy sinh bất đồng." },
      { key: "D", text: "Tôn trọng khác biệt chính đáng và tìm điểm chung để hợp tác." }
    ],
    correctAnswer: "D",
    explanation: "Khoan dung là tôn trọng những nét riêng và sự đa dạng chính đáng, tìm mẫu số chung để quy tụ lực lượng.",
    fate: { type: "BAD_LUCK", value: -100 }
  },
  {
    id: 12,
    round: 1,
    cardNum: "12",
    pillar: "Vận dụng tổng hợp 3 điều kiện",
    question: "Một tập thể muốn xây dựng sự đoàn kết bền vững. Phương án nào đầy đủ nhất?",
    options: [
      { key: "A", text: "Chỉ nhấn mạnh truyền thống của tập thể trong các cuộc họp." },
      { key: "B", text: "Chỉ yêu cầu mọi thành viên tuân theo quyết định của ban điều hành." },
      { key: "C", text: "Phát huy tinh thần tương trợ, tôn trọng khác biệt và tạo điều kiện để mọi người cùng tham gia." },
      { key: "D", text: "Tránh mọi bất đồng bằng cách hạn chế các cuộc thảo luận mở." }
    ],
    correctAnswer: "C",
    explanation: "Phương án C kết hợp cả ba nội dung: truyền thống nhân nghĩa – đoàn kết, khoan dung với khác biệt và niềm tin vào vai trò của mọi thành viên.",
    fate: { type: "MYSTERY_GIFT", value: 1 }
  },

  // =========================================================================
  // ROUND 2: 12 THẺ BÀI (VỪA → KHÓ, PHÂN TÍCH TÌNH HUỐNG & KHÁI NIỆM)
  // Phân bố đáp án: 3 A, 3 B, 3 C, 3 D
  // =========================================================================
  {
    id: 13,
    round: 2,
    cardNum: "13",
    pillar: "Khoan dung + Niềm tin vào tập thể",
    question: "Một dự án sinh viên xảy ra tranh luận gay gắt giữa hai nhóm có cách làm khác nhau. Phương án nào phù hợp nhất để duy trì đoàn kết?",
    options: [
      { key: "A", text: "Chọn ngay quan điểm của nhóm đông người hơn để tiết kiệm thời gian." },
      { key: "B", text: "Dừng tranh luận và né tránh vấn đề để tránh làm mâu thuẫn gia tăng." },
      { key: "C", text: "Xác định mục tiêu chung, lắng nghe các khác biệt và kết hợp những đề xuất hợp lý." },
      { key: "D", text: "Chia dự án thành hai nhóm độc lập và không còn làm việc với nhau." }
    ],
    correctAnswer: "C",
    explanation: "Đoàn kết thực chất đòi hỏi thái độ khoan dung với các góc nhìn khác biệt, lắng nghe trên tinh thần xây dựng để chắt lọc giải pháp tối ưu cho mục tiêu chung.",
    fate: { type: "LUCKY", value: 200 }
  },
  {
    id: 14,
    round: 2,
    cardNum: "14",
    pillar: "Có lòng khoan dung, độ lượng với con người",
    question: "Một sinh viên cho rằng “đoàn kết nghĩa là mọi người phải đồng ý với nhau trong mọi việc”. Nhận định nào chính xác hơn?",
    options: [
      { key: "A", text: "Đúng, vì sự khác biệt quan điểm luôn luôn dẫn đến chia rẽ nội bộ." },
      { key: "B", text: "Không; đoàn kết vẫn có thể tồn tại khi có khác biệt nếu biết tôn trọng và cùng hướng đến điểm chung." },
      { key: "C", text: "Đúng, nhưng quy luật này chỉ áp dụng đối với các nhóm có quy mô nhỏ." },
      { key: "D", text: "Không, vì bản chất của đoàn kết không đòi hỏi phải có mục tiêu chung." }
    ],
    correctAnswer: "B",
    explanation: "Lòng khoan dung khẳng định đoàn kết không đồng nhất với đồng nhất tuyệt đối; đoàn kết là sự thống nhất trong đa dạng trên nền tảng mẫu số chung vì lợi ích cộng đồng.",
    fate: { type: "SHIELD", value: 1 }
  },
  {
    id: 15,
    round: 2,
    cardNum: "15",
    pillar: "Kế thừa truyền thống nhân nghĩa",
    question: "Trong chiến dịch quyên góp sau thiên tai, nhóm phát hiện nguồn lực có hạn. Cách phân bổ nào phù hợp nhất với tinh thần nhân nghĩa?",
    options: [
      { key: "A", text: "Ưu tiên theo mức độ cần thiết thực tế và công khai minh bạch cách phân bổ." },
      { key: "B", text: "Chia đều cào bằng tuyệt đối cho tất cả mọi người bất kể mức độ thiệt hại." },
      { key: "C", text: "Ưu tiên trước hết cho những người thân quen của ban tổ chức." },
      { key: "D", text: "Để mỗi thành viên trong ban vận động tự ý chọn người nhận theo cảm tính." }
    ],
    correctAnswer: "A",
    explanation: "Tinh thần nhân nghĩa của dân tộc ta là 'lá lành đùm lá rách', hướng lòng nhân ái đến đúng những hoàn cảnh ngặt nghèo nhất một cách công tâm và hiệu quả.",
    fate: { type: "ALLY", value: 100 }
  },
  {
    id: 16,
    round: 2,
    cardNum: "16",
    pillar: "Có lòng khoan dung, độ lượng với con người",
    question: "Một người trước đây từng không tham gia hoạt động tập thể nhưng nay chủ động muốn đóng góp. Tập thể nên ứng xử thế nào?",
    options: [
      { key: "A", text: "Từ chối vì thành kiến với thái độ thiếu tích cực của họ trong quá khứ." },
      { key: "B", text: "Chấp nhận ngay mọi yêu cầu cá nhân của người đó mà không cần theo dõi cam kết." },
      { key: "C", text: "Chỉ cho phép tham gia các công việc không quan trọng vì chưa đủ tin cậy." },
      { key: "D", text: "Ghi nhận thiện chí, tạo cơ hội tham gia phù hợp và cùng theo dõi trách nhiệm." }
    ],
    correctAnswer: "D",
    explanation: "Khoan dung là sẵn sàng dang rộng vòng tay đón nhận sự chuyển biến tích cực, không chấp nhặt quá khứ mà nhìn vào thiện chí hiện tại để thu hút thêm sức mạnh cho tập thể.",
    fate: { type: "NEUTRAL", value: 0 }
  },
  {
    id: 17,
    round: 2,
    cardNum: "17",
    pillar: "Có niềm tin vào nhân dân",
    question: "Điều nào thể hiện niềm tin sâu sắc vào nhân dân trong quản lý và tổ chức?",
    options: [
      { key: "A", text: "Người phụ trách bao biện làm thay mọi việc để bảo đảm tiến độ nhanh." },
      { key: "B", text: "Cung cấp thông tin, lắng nghe ý kiến và tạo điều kiện để người dân tham gia thực hiện." },
      { key: "C", text: "Quyết định xong xuôi mọi phương án trước rồi mới thông báo cho nhân dân." },
      { key: "D", text: "Chỉ tham khảo ý kiến chuyên gia mà không cần lắng nghe phản hồi từ quần chúng." }
    ],
    correctAnswer: "B",
    explanation: "Niềm tin vào nhân dân thể hiện ở việc tôn trọng quyền làm chủ, tin tưởng trí tuệ của nhân dân thông qua phương châm dân biết, dân bàn, dân làm, dân kiểm tra.",
    fate: { type: "JACKPOT", value: 1 }
  },
  {
    id: 18,
    round: 2,
    cardNum: "18",
    pillar: "Có lòng khoan dung, độ lượng với con người",
    question: "Một cộng đồng có nhiều nhóm khác nhau về tuổi tác, nghề nghiệp và quan điểm. Để xây dựng đoàn kết, bước nào phù hợp nhất?",
    options: [
      { key: "A", text: "Tìm những lợi ích và mục tiêu chung đồng thời tôn trọng khác biệt chính đáng." },
      { key: "B", text: "Dùng biện pháp hành chính cưỡng chế xóa bỏ hoàn toàn các khác biệt." },
      { key: "C", text: "Chỉ tập trung vận động nhóm chiếm đa số và bỏ qua ý kiến của nhóm thiểu số." },
      { key: "D", text: "Tránh thảo luận về những vấn đề có ý kiến trái chiều để giữ bình yên bề ngoài." }
    ],
    correctAnswer: "A",
    explanation: "Khoan dung, độ lượng giúp tìm ra mẫu số chung là mục tiêu phát triển và lợi ích cốt lõi của cộng đồng, đồng thời dung nạp sự phong phú của từng thành phần.",
    fate: { type: "BAD_LUCK", value: -100 }
  },
  {
    id: 19,
    round: 2,
    cardNum: "19",
    pillar: "Kế thừa truyền thống yêu nước, nhân nghĩa, đoàn kết",
    question: "Vì sao truyền thống yêu nước, nhân nghĩa, đoàn kết có ý nghĩa cốt lõi đối với việc xây dựng đại đoàn kết?",
    options: [
      { key: "A", text: "Vì giúp mọi người định hướng có cùng ngành nghề sản xuất trong xã hội." },
      { key: "B", text: "Vì có khả năng triệt tiêu ngay lập tức mọi mâu thuẫn về lợi ích kinh tế." },
      { key: "C", text: "Vì khiến cho mọi thành viên tự động có cùng suy nghĩ và quan điểm giống nhau." },
      { key: "D", text: "Vì tạo nền tảng tinh thần vững chắc và sự gắn bó tự nhiên trong cộng đồng." }
    ],
    correctAnswer: "D",
    explanation: "Truyền thống yêu nước, nhân nghĩa là cội nguồn tình cảm sâu nặng và ý thức cộng đồng đã tôi luyện qua hàng ngàn năm lịch sử, là điểm tựa tinh thần vững chãi nhất để quy tụ lòng dân.",
    fate: { type: "LUCKY", value: 200 }
  },
  {
    id: 20,
    round: 2,
    cardNum: "20",
    pillar: "Có niềm tin vào nhân dân",
    question: "Một lớp tổ chức hoạt động nhưng nhiều thành viên ít phát biểu. Ban tổ chức nên ứng xử ra sao?",
    options: [
      { key: "A", text: "Vội vàng cho rằng những thành viên đó thờ ơ, không quan tâm việc tập thể." },
      { key: "B", text: "Chỉ để nhóm năng động tự thảo luận và quyết định thay cho toàn thể lớp." },
      { key: "C", text: "Tạo nhiều kênh góp ý và khuyến khích mọi người tham gia theo khả năng." },
      { key: "D", text: "Hủy bỏ hoạt động vì cho rằng sự hưởng ứng của lớp không đạt kỳ vọng." }
    ],
    correctAnswer: "C",
    explanation: "Niềm tin vào tập thể đòi hỏi sự kiên nhẫn, tinh tế trong phương pháp vận động; thấu hiểu tính cách, hoàn cảnh của mỗi người để khích lệ họ tự tin tham gia.",
    fate: { type: "ALLY", value: 100 }
  },
  {
    id: 21,
    round: 2,
    cardNum: "21",
    pillar: "Có lòng khoan dung, độ lượng với con người",
    question: "Điểm khác biệt quan trọng giữa “khoan dung” và “dễ dãi” trong xây dựng đoàn kết là gì?",
    options: [
      { key: "A", text: "Không có bất kỳ sự khác biệt nào giữa hai thái độ này." },
      { key: "B", text: "Khoan dung tôn trọng và tạo cơ hội sửa đổi nhưng vẫn giữ nguyên tắc; dễ dãi có thể bỏ qua sai phạm." },
      { key: "C", text: "Khoan dung là tuyệt đối không bao giờ phê bình hay góp ý cho người khác." },
      { key: "D", text: "Dễ dãi và nhượng bộ vô điều kiện luôn là cách tốt hơn để giữ vững sự đoàn kết." }
    ],
    correctAnswer: "B",
    explanation: "Khoan dung không đồng nghĩa với dễ dãi hay bỏ qua nguyên tắc; khoan dung là nhân văn, bao dung nâng đỡ con người sửa sai nhưng vẫn giữ vững kỷ cương vì đại cục.",
    fate: { type: "SHIELD", value: 1 }
  },
  {
    id: 22,
    round: 2,
    cardNum: "22",
    pillar: "Khoan dung + Xây dựng đoàn kết",
    question: "Khi xảy ra bất đồng trong một nhóm, cách nào dễ tạo đoàn kết bền vững và thực chất nhất?",
    options: [
      { key: "A", text: "Làm rõ mục tiêu chung, trao đổi thẳng thắn và tôn trọng những khác biệt hợp lý." },
      { key: "B", text: "Ép buộc nhóm thiểu số phải phục tùng nhóm đa số ngay lập tức." },
      { key: "C", text: "Né tránh vấn đề và gác lại tranh luận để giữ hòa khí bằng mặt bề ngoài." },
      { key: "D", text: "Loại bỏ những người có quan điểm phản biện ra khỏi nhóm làm việc." }
    ],
    correctAnswer: "A",
    explanation: "Sự đồng thuận bền vững chỉ đạt được khi các bên được đối thoại cởi mở, tôn trọng sự khác biệt chính đáng và cùng hướng về lợi ích chung của tập thể.",
    fate: { type: "NEUTRAL", value: 0 }
  },
  {
    id: 23,
    round: 2,
    cardNum: "23",
    pillar: "Có niềm tin vào nhân dân",
    question: "Nếu chỉ kêu gọi đoàn kết nhưng không tạo điều kiện để mọi người tham gia thì đang thiếu điều kiện nào rõ nhất?",
    options: [
      { key: "A", text: "Kế thừa truyền thống yêu nước, nhân nghĩa." },
      { key: "B", text: "Có lòng khoan dung, độ lượng." },
      { key: "C", text: "Niềm tin vào nhân dân." },
      { key: "D", text: "Không thiếu điều kiện nào vì đã có lời kêu gọi." }
    ],
    correctAnswer: "C",
    explanation: "Niềm tin vào nhân dân không chỉ là lời khẳng định mà phải gắn với việc tôn trọng và phát huy vai trò chủ động, quyền làm chủ thực sự của mọi người.",
    fate: { type: "BAD_LUCK", value: -100 }
  },
  {
    id: 24,
    round: 2,
    cardNum: "24",
    pillar: "Vận dụng tổng hợp 3 điều kiện",
    question: "Tình huống nào thể hiện sự vận dụng đầy đủ nhất cả 3 điều kiện xây dựng khối đại đoàn kết?",
    options: [
      { key: "A", text: "Tổ chức hoạt động truyền thống nhưng ban tổ chức tự quyết định mọi việc mà không hỏi ý kiến ai." },
      { key: "B", text: "Cho mọi người tự do làm bất cứ điều gì mà không cần có mục tiêu chung hay nguyên tắc." },
      { key: "C", text: "Chỉ tập trung vận động và lắng nghe những người có cùng quan điểm với ban cán sự." },
      { key: "D", text: "Khơi dậy tinh thần tương trợ, tôn trọng khác biệt và để mọi thành viên cùng đóng góp vào mục tiêu chung." }
    ],
    correctAnswer: "D",
    explanation: "Phương án D kết tinh trọn vẹn cả ba điều kiện: nền tảng truyền thống nhân nghĩa, độ lượng tôn trọng khác biệt và lòng tin tuyệt đối vào sức mạnh của quần chúng nhân dân.",
    fate: { type: "MYSTERY_GIFT", value: 1 }
  }
];

// =========================================================================
// ROUND 3: 4 MẢNH GHÉP ĐẠI ĐOÀN KẾT
// Đội 1: Truyền thống • Đội 2: Khoan dung • Đội 3: Niềm tin nhân dân • Đội 4: Tổng hợp
// Phân bố đáp án: 1 A, 1 B, 1 C, 1 D (Đội 1: A, Đội 2: B, Đội 4: C, Đội 3: D)
// =========================================================================
export const COOP_TEAM_QUESTIONS = [
  {
    teamId: 1,
    pieceNum: 1,
    pillar: "MẢNH GHÉP 01: TRUYỀN THỐNG YÊU NƯỚC, NHÂN NGHĨA, ĐOÀN KẾT",
    question: "Trong một đợt thiên tai, nhiều cá nhân và tổ chức tự nguyện hỗ trợ người dân vùng bị ảnh hưởng. Hành động này thể hiện trực tiếp nhất điều kiện nào?",
    options: [
      { key: "A", text: "Kế thừa truyền thống yêu nước, nhân nghĩa, đoàn kết của dân tộc." },
      { key: "B", text: "Cưỡng chế xóa bỏ mọi sự khác biệt trong đời sống xã hội." },
      { key: "C", text: "Hành động nhằm thay thế hoàn toàn vai trò của các cơ quan quản lý." },
      { key: "D", text: "Chỉ phát huy trách nhiệm cá nhân nhằm tìm kiếm thành tích riêng." }
    ],
    correctAnswer: "A",
    explanation: "Nghĩa đồng bào 'thương người như thể thương thân' trong bão lũ chính là biểu hiện sinh động của việc kế thừa truyền thống nhân nghĩa, yêu nước, đoàn kết ngàn đời của dân tộc Việt Nam."
  },
  {
    teamId: 2,
    pieceNum: 2,
    pillar: "MẢNH GHÉP 02: LÒNG KHOAN DUNG, ĐỘ LƯỢNG VỚI CON NGƯỜI",
    question: "Một người từng có sai lầm nhưng đã nhận ra và mong muốn đóng góp cho tập thể. Cách ứng xử phù hợp nhất là:",
    options: [
      { key: "A", text: "Luôn giữ định kiến và khoảng cách vì những sai sót trong quá khứ của họ." },
      { key: "B", text: "Không định kiến, tạo cơ hội sửa chữa và ghi nhận đóng góp tích cực." },
      { key: "C", text: "Bỏ qua toàn bộ sai lầm mà không cần người đó phải nhận thức hay rút kinh nghiệm." },
      { key: "D", text: "Chỉ cho phép tham gia khi mọi người trong tập thể đều hoàn toàn tin tưởng tuyệt đối." }
    ],
    correctAnswer: "B",
    explanation: "Khoan dung, độ lượng là không định kiến, biết nhìn nhận con người ở xu hướng tiến bộ và tạo cơ hội chân thành để người có sai lầm sửa chữa, cùng hòa nhập đóng góp."
  },
  {
    teamId: 3,
    pieceNum: 3,
    pillar: "MẢNH GHÉP 03: NIỀM TIN VÀO NHÂN DÂN",
    question: "Biểu hiện rõ nhất của niềm tin vào nhân dân là:",
    options: [
      { key: "A", text: "Cán bộ làm thay toàn bộ cho nhân dân để tiết kiệm thời gian triển khai." },
      { key: "B", text: "Yêu cầu nhân dân thực hiện quyết định mà không cần thông tin hay giải thích." },
      { key: "C", text: "Chỉ chủ động vận động nhân dân khi phong trào gặp khó khăn, bế tắc." },
      { key: "D", text: "Tôn trọng, lắng nghe và phát huy khả năng tham gia của nhân dân." }
    ],
    correctAnswer: "D",
    explanation: "Tin vào nhân dân là tin vào sức mạnh và trí tuệ vô tận của nhân dân; luôn tôn trọng, lắng nghe và tạo điều kiện để nhân dân trực tiếp thực hiện quyền làm chủ của mình."
  },
  {
    teamId: 4,
    pieceNum: 4,
    pillar: "MẢNH GHÉP 04: VẬN DỤNG TỔNG HỢP 3 ĐIỀU KIỆN",
    question: "Một cộng đồng có nhiều nhóm khác nhau về hoàn cảnh và quan điểm. Phương án nào vận dụng đầy đủ nhất ba điều kiện xây dựng khối đại đoàn kết?",
    options: [
      { key: "A", text: "Yêu cầu tất cả các thành viên phải từ bỏ bản sắc riêng để có cùng một quan điểm rập khuôn." },
      { key: "B", text: "Chỉ vận động những người đã đồng ý và ủng hộ ngay từ ban đầu." },
      { key: "C", text: "Phát huy tinh thần tương trợ, tôn trọng khác biệt và tạo cơ hội để mọi người cùng tham gia vì mục tiêu chung." },
      { key: "D", text: "Tránh giải quyết các bất đồng cụ thể để cố gắng duy trì vẻ hòa khí bề ngoài." }
    ],
    correctAnswer: "C",
    explanation: "Phương án C thể hiện đồng thời cả ba điều kiện: (1) Truyền thống nhân nghĩa, đoàn kết; (2) Khoan dung, tôn trọng khác biệt; (3) Niềm tin và phát huy vai trò của mọi người."
  }
];

// =========================================================================
// CÁC CÂU HỎI TƯƠNG TRỢ (RESCUE QUESTIONS)
// Hai đội cùng phối hợp thảo luận và giải cứu mảnh ghép
// Phân bố đáp án: 1 A, 1 B, 1 C, 1 D (Rescue 1: C, Rescue 2: B, Rescue 3: A, Rescue 4: D)
// =========================================================================
export const RESCUE_QUESTIONS = [
  {
    id: "rescue_1",
    pillar: "TƯƠNG TRỢ 01: KHOAN DUNG TRONG ĐOÀN KẾT",
    question: "Hai đội hãy thống nhất: Khoan dung trong xây dựng đoàn kết được hiểu đúng nhất là:",
    options: [
      { key: "A", text: "Chấp nhận mọi hành vi và dung túng các sai phạm bất kể hậu quả." },
      { key: "B", text: "Không bao giờ phê bình hay góp ý để tránh làm mất lòng nhau." },
      { key: "C", text: "Tôn trọng khác biệt chính đáng, hạn chế định kiến và tạo cơ hội cho người biết sửa chữa." },
      { key: "D", text: "Tránh làm việc với bất kỳ ai từng có sai sót trong quá khứ." }
    ],
    correctAnswer: "C",
    explanation: "Khoan dung là thái độ nhân văn, nhìn nhận con người ở sự hướng thiện và tạo điều kiện để cùng nhau đoàn kết tiến bộ trên nền tảng nguyên tắc vì lợi ích chung."
  },
  {
    id: "rescue_2",
    pillar: "TƯƠNG TRỢ 02: HÀNH ĐỘNG CỦA NIỀM TIN VÀO NHÂN DÂN",
    question: "Hai đội hãy thống nhất: Niềm tin vào nhân dân cần được thể hiện bằng hành động nào?",
    options: [
      { key: "A", text: "Tự quyết định thay cho nhân dân vì cho rằng họ thiếu kiến thức chuyên môn." },
      { key: "B", text: "Lắng nghe, tôn trọng và tạo điều kiện để nhân dân tham gia." },
      { key: "C", text: "Chỉ hỏi ý kiến nhân dân khi kế hoạch gặp phải sự phản đối gay gắt." },
      { key: "D", text: "Chỉ làm việc và đối thoại với những người luôn tích cực ủng hộ." }
    ],
    correctAnswer: "B",
    explanation: "Niềm tin vào nhân dân không phải khẩu hiệu trừu tượng mà phải được thể hiện qua hành động lắng nghe, tôn trọng và tạo cơ chế thực chất để nhân dân cùng bàn, cùng làm, cùng kiểm tra."
  },
  {
    id: "rescue_3",
    pillar: "TƯƠNG TRỢ 03: KẾ THỪA TRUYỀN THỐNG ĐÚNG ĐẮN",
    question: "Hai đội hãy thống nhất: Kế thừa truyền thống đoàn kết KHÔNG có nghĩa là:",
    options: [
      { key: "A", text: "Sao chép nguyên xi mọi cách làm trong quá khứ." },
      { key: "B", text: "Phát huy tinh thần tương thân tương ái khi cộng đồng gặp khó khăn." },
      { key: "C", text: "Trân trọng các giá trị nhân nghĩa truyền thống của cha ông." },
      { key: "D", text: "Vận dụng linh hoạt những giá trị tốt đẹp vào hoàn cảnh lịch sử mới." }
    ],
    correctAnswer: "A",
    explanation: "Kế thừa truyền thống là tiếp nối và phát huy các giá trị cốt lõi tích cực, hoàn toàn không đồng nghĩa với thái độ bảo thủ, sao chép rập khuôn những cách làm lỗi thời."
  },
  {
    id: "rescue_4",
    pillar: "TƯƠNG TRỢ 04: TÔN TRỌNG KHÁC BIỆT & HƯỚNG TỚI ĐIỂM CHUNG",
    question: "Hai đội hãy thống nhất: Để những người có quan điểm khác nhau vẫn có thể đoàn kết, yếu tố quan trọng nhất trong các phương án sau là:",
    options: [
      { key: "A", text: "Buộc tất cả mọi cá nhân phải từ bỏ quan điểm và sở thích riêng." },
      { key: "B", text: "Nghiêm cấm tranh luận để tránh làm lộ ra các bất đồng nội bộ." },
      { key: "C", text: "Chỉ hợp tác và làm việc với nhóm chiếm đa số áp đảo." },
      { key: "D", text: "Tìm điểm chung, tôn trọng khác biệt chính đáng và cùng hướng tới mục tiêu chung." }
    ],
    correctAnswer: "D",
    explanation: "Phương châm 'cầu đồng tồn dị' trong tư tưởng Hồ Chí Minh khẳng định: tôn trọng sự khác biệt hợp lý và lấy mục tiêu chung làm điểm tựa là chìa khóa then chốt để quy tụ muôn người thành một khối."
  }
];

// =========================================================================
// THỬ THÁCH HỢP LỰC (GROUP RESCUE - CẢ 4 ĐỘI CÙNG GIẢI CỨU)
// Phân bố đáp án: 1 C, 1 A
// =========================================================================
export const GROUP_RESCUE_QUESTIONS = [
  {
    id: "group_1",
    pillar: "THỬ THÁCH HỢP LỰC 01: BÀI HỌC VỀ NIỀM TIN VÀO NHÂN DÂN",
    question: "Một hoạt động cộng đồng thất bại vì ban tổ chức tự quyết định mọi việc dù thường xuyên kêu gọi “đoàn kết”. Điều kiện nào đang bị xem nhẹ rõ nhất?",
    options: [
      { key: "A", text: "Truyền thống yêu nước của dân tộc." },
      { key: "B", text: "Lòng khoan dung, độ lượng với con người." },
      { key: "C", text: "Niềm tin vào nhân dân." },
      { key: "D", text: "Tinh thần thi đua trong tập thể." }
    ],
    correctAnswer: "C",
    explanation: "Kêu gọi đoàn kết nhưng lại áp đặt, không tin tưởng và không trao quyền cho nhân dân tham gia chính là xem nhẹ điều kiện 'phải có niềm tin vào nhân dân', khiến phong trào trở nên hình thức và thất bại."
  },
  {
    id: "group_2",
    pillar: "THỬ THÁCH HỢP LỰC 02: TINH THẦN TỔNG HỢP 3 ĐIỀU KIỆN",
    question: "Cả 4 đội hãy chọn phương án phản ánh đầy đủ nhất tinh thần của 3 điều kiện:",
    options: [
      { key: "A", text: "Phát huy giá trị nhân nghĩa – đoàn kết, tôn trọng khác biệt chính đáng và tạo điều kiện để mọi người cùng tham gia." },
      { key: "B", text: "Giữ truyền thống và yêu cầu tất cả mọi người tuân theo một quan điểm cứng nhắc." },
      { key: "C", text: "Tôn trọng mọi khác biệt một cách dễ dãi kể cả khi gây hại cho lợi ích chung." },
      { key: "D", text: "Chỉ cần tin tưởng mọi người mà không cần tổ chức, định hướng hay phối hợp." }
    ],
    correctAnswer: "A",
    explanation: "Phương án A thể hiện sự vận dụng nhuần nhuyễn, trọn vẹn cả ba điều kiện cốt lõi: kế thừa truyền thống nhân nghĩa, độ lượng tôn trọng đa dạng và niềm tin phát huy sức mạnh làm chủ của nhân dân."
  }
];

// =========================================================================
// THỬ THÁCH ĐỒNG LÒNG (UNITY FINAL QUESTION - CẢ 4 ĐỘI CHỌN 1 ĐÁP ÁN)
// Tình huống thực tiễn tổng hợp cả 3 điều kiện
// =========================================================================
export const UNITY_FINAL_QUESTION = {
  id: "unity_final",
  pillar: "🌟 THỬ THÁCH ĐẠI ĐOÀN KẾT: 4 ĐỘI • 1 MỤC TIÊU • 1 ĐÁP ÁN",
  question: "Một địa phương triển khai một công trình phục vụ lợi ích cộng đồng. Một số người dân đồng tình, nhưng một số hộ còn băn khoăn vì sinh kế và quyền lợi có thể bị ảnh hưởng. Trong các cách tiếp cận sau, phương án nào thể hiện đầy đủ nhất việc vận dụng ba điều kiện xây dựng khối đại đoàn kết toàn dân tộc mà nhóm đã trình bày?",
  options: [
    { key: "A", text: "Chỉ nhấn mạnh lợi ích chung và yêu cầu các hộ còn băn khoăn nhanh chóng chấp hành mệnh lệnh." },
    { key: "B", text: "Tạm dừng toàn bộ kế hoạch cho đến khi tất cả mọi người có quan điểm hoàn toàn giống nhau." },
    { key: "C", text: "Phát huy tinh thần tương trợ, kiên trì đối thoại và tôn trọng những băn khoăn chính đáng, đồng thời tạo điều kiện để người dân tham gia đóng góp ý kiến và cùng tìm giải pháp phù hợp với lợi ích chung." },
    { key: "D", text: "Chỉ trao đổi với những hộ đã đồng thuận để tránh phát sinh thêm các bất đồng phức tạp." }
  ],
  correctAnswer: "C",
  explanation: "Phương án C vận dụng đồng thời ba điều kiện:\n1. Truyền thống nhân nghĩa, đoàn kết: quan tâm và hỗ trợ nhau vì lợi ích chung.\n2. Khoan dung, độ lượng: tôn trọng khác biệt và những băn khoăn chính đáng, không định kiến hay loại trừ.\n3. Niềm tin vào nhân dân: lắng nghe và tạo điều kiện để người dân tham gia vào quá trình tìm giải pháp."
};

export const INITIAL_TEAMS = [
  { id: 1, name: "ĐỘI 1", score: 1000, correctCount: 0, shield: 0 },
  { id: 2, name: "ĐỘI 2", score: 1000, correctCount: 0, shield: 0 },
  { id: 3, name: "ĐỘI 3", score: 1000, correctCount: 0, shield: 0 },
  { id: 4, name: "ĐỘI 4", score: 1000, correctCount: 0, shield: 0 }
];
