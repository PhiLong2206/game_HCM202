// src/data/questions.js
// HCM202 - Tư tưởng Hồ Chí Minh: "ĐẤU TRƯỜNG ĐẠI ĐOÀN KẾT"
// 8 câu hỏi chính theo lượt từng đội + 1 câu FINAL chung cho cả 4 đội

export const QUESTIONS = [
  // ==================== ROUND 1 (100 PTS) ====================
  // Thứ tự: Đội 1 → Đội 2 → Đội 3 → Đội 4
  {
    id: 1,
    round: 1,
    turnIndex: 1,
    assignedTeamId: 1, // Đội 1
    points: 100,
    tag: "ROUND 1 — CÂU 01 (100 PTS)",
    pillar: "Kế thừa truyền thống yêu nước, nhân nghĩa, đoàn kết",
    teamNameDefault: "ĐỘI 1",
    scenario: "Khi triển khai dự án bảo tồn di sản văn hóa phi vật thể tại làng nghề truyền thống, các bạn trẻ muốn số hóa và hiện đại hóa hoàn toàn quy trình, trong khi các nghệ nhân cao tuổi lo ngại đánh mất tính nguyên bản và cốt cách cha ông. Để kế thừa đúng đắn truyền thống dân tộc, cách tiếp cận nào là phù hợp nhất?",
    options: [
      { key: "A", text: "Giữ nguyên vẹn toàn bộ quy trình cổ xưa và tuyệt đối không áp dụng công nghệ mới." },
      { key: "B", text: "Tôn trọng giá trị cốt lõi từ nghệ nhân, kết hợp chọn lọc công nghệ để lan tỏa sâu rộng." },
      { key: "C", text: "Ưu tiên tối đa giải pháp công nghệ số để bắt kịp xu hướng thị hiếu của giới trẻ hiện nay." },
      { key: "D", text: "Tách dự án thành hai hướng độc lập để mỗi nhóm tự do thực hiện theo cách của mình." }
    ],
    correctAnswer: "B",
    explanation: "Kế thừa truyền thống không phải là bảo thủ khép kín hay sao chép thụ động, mà là trân trọng bản sắc nhân nghĩa, tinh hoa cốt cách cha ông, đồng thời tiếp thu có chọn lọc các tiến bộ mới để giá trị truyền thống trường tồn và phát huy mạnh mẽ."
  },
  {
    id: 2,
    round: 1,
    turnIndex: 2,
    assignedTeamId: 2, // Đội 2
    points: 100,
    tag: "ROUND 1 — CÂU 02 (100 PTS)",
    pillar: "Có lòng khoan dung, độ lượng với con người",
    teamNameDefault: "ĐỘI 2",
    scenario: "Một thành viên ban tổ chức sự kiện lớp mắc sai lầm nghiêm trọng trong phân bổ tài chính khiến kế hoạch bị chậm trễ, nhưng bạn ấy đã chân thành nhận khuyết điểm và chủ động đề xuất phương án khắc phục. Dựa trên tinh thần khoan dung, độ lượng vì khối đại đoàn kết, tập thể nên xử lý thế nào?",
    options: [
      { key: "A", text: "Khai trừ thành viên này ra khỏi ban tổ chức ngay lập tức để giữ nghiêm tính kỷ luật." },
      { key: "B", text: "Bỏ qua hoàn toàn sai lầm và không cần thiết phải rà soát lại quy trình quản lý tài chính." },
      { key: "C", text: "Nghiêm túc góp ý xây dựng, tạo cơ hội sửa sai và cùng nhau hỗ trợ khắc phục thiệt hại." },
      { key: "D", text: "Chuyển giao toàn bộ trách nhiệm bồi hoàn cá nhân cho trưởng ban tổ chức giải quyết." }
    ],
    correctAnswer: "C",
    explanation: "Khoan dung, độ lượng là nhìn nhận con người ở xu hướng tiến bộ, nghiêm khắc với cái sai nhưng bao dung đối với người chân thành nhận lỗi và biết sửa chữa; cùng chia sẻ, giúp đỡ nhau tiến bộ vì mục tiêu chung của tập thể."
  },
  {
    id: 3,
    round: 1,
    turnIndex: 3,
    assignedTeamId: 3, // Đội 3
    points: 100,
    tag: "ROUND 1 — CÂU 03 (100 PTS)",
    pillar: "Có niềm tin vào nhân dân",
    teamNameDefault: "ĐỘI 3",
    scenario: "Ban cán sự lớp muốn đổi mới quy chế sinh hoạt chung nhưng nhận thấy các bạn sinh viên có vẻ thờ ơ, ít phát biểu trong các buổi họp tập trung. Để thể hiện đúng tinh thần 'có niềm tin vào nhân dân', ban cán sự nên tiếp cận vấn đề như thế nào?",
    options: [
      { key: "A", text: "Tự quyết định ban hành quy chế mới vì cho rằng sinh viên không quan tâm việc chung." },
      { key: "B", text: "Áp dụng biện pháp điểm danh trừ điểm thật nặng để buộc mọi sinh viên phải có mặt." },
      { key: "C", text: "Đổi mới hình thức lấy ý kiến gần gũi, kiên nhẫn lắng nghe tâm tư nguyện vọng thực tế." },
      { key: "D", text: "Chỉ tham vấn ý kiến từ nhóm sinh viên tích cực và thường xuyên phát biểu trong lớp." }
    ],
    correctAnswer: "C",
    explanation: "Niềm tin vào nhân dân không phải là áp đặt chủ quan hay nản lòng khi thấy quần chúng chưa sôi nổi; mà là kiên trì lắng nghe, thấu hiểu tâm tư và tìm phương thức phù hợp để khơi dậy tinh thần chủ động, trách nhiệm của mỗi thành viên."
  },
  {
    id: 4,
    round: 1,
    turnIndex: 4,
    assignedTeamId: 4, // Đội 4
    points: 100,
    tag: "ROUND 1 — CÂU 04 (100 PTS)",
    pillar: "Kế thừa truyền thống yêu nước, nhân nghĩa, đoàn kết",
    teamNameDefault: "ĐỘI 4",
    scenario: "Trong chiến dịch tình nguyện mùa hè xanh, nhóm bạn trẻ muốn tổ chức phát thuốc và quà độc lập tại vùng sâu vùng xa để tạo dấu ấn riêng, trong khi một số bạn khác muốn phối hợp với trạm y tế và đoàn thanh niên địa phương. Phương án nào phản ánh đúng truyền thống tương thân tương ái?",
    options: [
      { key: "A", text: "Tổ chức hoạt động độc lập nhằm khẳng định rõ ràng năng lực và dấu ấn riêng của nhóm." },
      { key: "B", text: "Phối hợp đồng bộ với cơ sở địa phương để nguồn lực đến đúng đối tượng cần giúp đỡ nhất." },
      { key: "C", text: "Bàn giao toàn bộ quà tặng cho đơn vị trung gian để hạn chế trách nhiệm điều phối." },
      { key: "D", text: "Rút lui khỏi hoạt động vì cho rằng công tác y tế chỉ thuộc thẩm quyền bệnh viện lớn." }
    ],
    correctAnswer: "B",
    explanation: "Truyền thống đoàn kết, nhân nghĩa của dân tộc luôn gắn bó mật thiết với tính tổ chức, sự phối hợp đồng bộ và đặt lợi ích của đồng bào lên trên việc tìm kiếm thành tích hay dấu ấn cá nhân cục bộ."
  },

  // ==================== ROUND 2 (200 PTS) ====================
  // Đảo thứ tự: Đội 4 → Đội 3 → Đội 2 → Đội 1
  {
    id: 5,
    round: 2,
    turnIndex: 5,
    assignedTeamId: 4, // Đội 4
    points: 200,
    tag: "ROUND 2 — CÂU 05 (200 PTS)",
    pillar: "Có lòng khoan dung, độ lượng với con người",
    teamNameDefault: "ĐỘI 4",
    scenario: "Trong buổi tranh luận học thuật, một bạn từng có xích mích cá nhân với bạn lại bất ngờ đưa ra một ý kiến khoa học rất sáng tạo và có giá trị cao cho đề tài của nhóm. Cách ứng xử nào thể hiện đúng tinh thần 'khoan dung, độ lượng, gạt bỏ định kiến'?",
    options: [
      { key: "A", text: "Bác bỏ ý kiến ngay lập tức vì nghi ngờ động cơ cá nhân của người đưa ra luận điểm." },
      { key: "B", text: "Yêu cầu thành viên này phải công khai giải quyết chuyện hiềm khích cũ trước khi bàn việc." },
      { key: "C", text: "Khách quan công nhận ý kiến đúng đắn, cùng thảo luận chân thành để hoàn thiện đề tài." },
      { key: "D", text: "Giữ thái độ im lặng và chỉ xem xét ý kiến nếu được giảng viên hướng dẫn yêu cầu." }
    ],
    correctAnswer: "C",
    explanation: "Khoan dung, độ lượng là biết đặt lợi ích chung lên trên hết, không để cảm xúc hay hiềm khích cá nhân làm sai lệch đánh giá khách quan, sẵn sàng trân trọng và tôn vinh những đóng góp tích cực của bất kỳ ai."
  },
  {
    id: 6,
    round: 2,
    turnIndex: 6,
    assignedTeamId: 3, // Đội 3
    points: 200,
    tag: "ROUND 2 — CÂU 06 (200 PTS)",
    pillar: "Có niềm tin vào nhân dân",
    teamNameDefault: "ĐỘI 3",
    scenario: "Khi xây dựng nếp sống văn minh tại khu ký túc xá, ban tự quản nhận được ý kiến cho rằng việc vận động sinh viên tự phân loại rác rất khó thành công do ý thức chưa đồng đều. Luận điểm nào sau đây phản ánh đúng tinh thần 'tin tưởng vào khả năng tự giác của quần chúng'?",
    options: [
      { key: "A", text: "Ý thức chỉ hình thành khi áp dụng các chế tài xử phạt tiền thật nặng và camera giám sát." },
      { key: "B", text: "Quần chúng có tiềm năng tự giác to lớn nếu được tuyên truyền, hướng dẫn và tạo điều kiện." },
      { key: "C", text: "Cần thuê nhân công bên ngoài làm thay hoàn toàn vì sinh viên không thể tự giác bảo vệ môi trường." },
      { key: "D", text: "Chỉ những sinh viên từng tham gia câu lạc bộ môi trường mới có trách nhiệm thực hiện việc này." }
    ],
    correctAnswer: "B",
    explanation: "Tin vào nhân dân là tin tưởng vào khả năng giác ngộ và tính tự giác của quần chúng khi được giáo dục, tuyên truyền đúng đắn và tạo điều kiện thuận lợi; không hoài nghi hay thay thế vai trò chủ thể của nhân dân."
  },
  {
    id: 7,
    round: 2,
    turnIndex: 7,
    assignedTeamId: 2, // Đội 2
    points: 200,
    tag: "ROUND 2 — CÂU 07 (200 PTS)",
    pillar: "Kế thừa truyền thống yêu nước, nhân nghĩa, đoàn kết",
    teamNameDefault: "ĐỘI 2",
    scenario: "Khi bàn về truyền thống 'Nhiễu điều phủ lấy giá gương / Người trong một nước phải thương nhau cùng', có ý kiến cho rằng trong nền kinh tế thị trường hiện đại, tinh thần này đã lỗi thời vì cạnh tranh mới là động lực phát triển. Lập luận nào sau đây phản biện thuyết phục nhất?",
    options: [
      { key: "A", text: "Nhân nghĩa và đùm bọc là nền tảng giữ vững ổn định để mọi cá nhân cùng phát triển lành mạnh." },
      { key: "B", text: "Tinh thần nhân nghĩa chỉ phù hợp trong gia đình, còn ngoài xã hội chỉ cần quy luật cạnh tranh." },
      { key: "C", text: "Cạnh tranh triệt để là quy luật duy nhất chi phối và quyết định sự tiến bộ của mọi nền kinh tế." },
      { key: "D", text: "Đoàn kết tương thân chỉ là biện pháp tạm thời khi xã hội xảy ra thiên tai hoặc khủng hoảng." }
    ],
    correctAnswer: "A",
    explanation: "Truyền thống yêu nước, nhân nghĩa, đoàn kết của dân tộc Việt Nam là cội nguồn tạo nên sức mạnh nội sinh và sự gắn kết cộng đồng vững chắc, tạo môi trường hợp tác lành mạnh để kinh tế và từng cá nhân phát triển bền vững."
  },
  {
    id: 8,
    round: 2,
    turnIndex: 8,
    assignedTeamId: 1, // Đội 1
    points: 200,
    tag: "ROUND 2 — CÂU 08 (200 PTS)",
    pillar: "Có lòng khoan dung, độ lượng với con người",
    teamNameDefault: "ĐỘI 1",
    scenario: "Một cựu thành viên từng xin rút khỏi dự án nhóm vì bất đồng quan điểm cá nhân, nay nhận thấy dự án gặp khó khăn chuyên môn phức tạp nên ngỏ ý muốn quay lại cống hiến kinh nghiệm. Nhằm xây dựng tập thể đoàn kết bền vững, nhóm nên quyết định ra sao?",
    options: [
      { key: "A", text: "Từ chối dứt khoát vì cho rằng người từng rời bỏ tập thể thì không thể tiếp tục tin tưởng." },
      { key: "B", text: "Hoan nghênh trở lại trên tinh thần cầu thị, trao đổi thẳng thắn và cùng phát huy chuyên môn." },
      { key: "C", text: "Đồng ý nhận lại nhưng kèm điều kiện người này không được phép tham gia đóng góp ý kiến mới." },
      { key: "D", text: "Yêu cầu người này phải làm công tác hỗ trợ không lương trong suốt thời gian còn lại của dự án." }
    ],
    correctAnswer: "B",
    explanation: "Khoan dung, độ lượng là sẵn sàng mở rộng vòng tay, không thành kiến hay định kiến với quá khứ, biết trân trọng mọi tấm lòng và thiện chí muốn cống hiến cho sự nghiệp chung của tập thể."
  },

  // ==================== FINAL ROUND (300 PTS) ====================
  // Cả 4 đội cùng tham gia đồng thời
  {
    id: 9,
    round: 3,
    turnIndex: 9,
    assignedTeamId: null, // Chung cả 4 đội
    points: 300,
    isFinal: true,
    tag: "FINAL ROUND — CÂU HỎI QUYẾT ĐỊNH (300 PTS)",
    pillar: "Tổng hòa 3 điều kiện: Truyền thống - Khoan dung - Niềm tin nhân dân",
    teamNameDefault: "CẢ 4 ĐỘI",
    scenario: "Một cộng đồng dân cư đối mặt bài toán di dời giải phóng mặt bằng để xây dựng công trình y tế phúc lợi chung. Một bộ phận người dân chưa đồng thuận vì lo lắng sinh kế tương lai bị xáo trộn. Dựa trên sự kết hợp hài hòa giữa 'Truyền thống nghĩa tình', 'Lòng khoan dung độ lượng' và 'Niềm tin vào nhân dân', phương án giải quyết tối ưu nhất là gì?",
    options: [
      { key: "A", text: "Áp dụng cưỡng chế hành chính ngay lập tức nhằm bảo đảm tuyệt đối tiến độ công trình công cộng." },
      { key: "B", text: "Kiên trì đối thoại, lắng nghe trăn trở, điều chỉnh chính sách sinh kế hợp lý và để nhân dân giám sát." },
      { key: "C", text: "Hủy bỏ dự án phúc lợi công cộng để tránh làm nảy sinh mâu thuẫn hay khiếu nại trong nhân dân." },
      { key: "D", text: "Chỉ tập trung hỗ trợ kinh tế cho các hộ đồng ý trước để gây sức ép lên những hộ còn băn khoăn." }
    ],
    correctAnswer: "B",
    explanation: "Đại đoàn kết toàn dân tộc đòi hỏi kết hợp nhuần nhuyễn cả 3 điều kiện: Kế thừa truyền thống nghĩa tình để ứng xử nhân văn; Khoan dung, độ lượng để thấu hiểu những lo toan chính đáng của dân; và Có niềm tin vững chắc vào nhân dân để kiên trì thuyết phục, tạo cơ chế cho dân tham gia bàn bạc và giám sát."
  }
];

export const INITIAL_TEAMS = [
  { 
    id: 1, 
    name: "ĐỘI 1", 
    score: 0, 
    correctCount: 0, 
    rescueUsed: false, 
    starUsed: false 
  },
  { 
    id: 2, 
    name: "ĐỘI 2", 
    score: 0, 
    correctCount: 0, 
    rescueUsed: false, 
    starUsed: false 
  },
  { 
    id: 3, 
    name: "ĐỘI 3", 
    score: 0, 
    correctCount: 0, 
    rescueUsed: false, 
    starUsed: false 
  },
  { 
    id: 4, 
    name: "ĐỘI 4", 
    score: 0, 
    correctCount: 0, 
    rescueUsed: false, 
    starUsed: false 
  }
];
