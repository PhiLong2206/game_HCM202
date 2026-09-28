# HỆ THỐNG ÂM THANH — ĐẤU TRƯỜNG ĐẠI ĐOÀN KẾT (HCM202)
## Classroom Game Show Sound Design

Thư mục này chứa các file âm thanh `.mp3` chất lượng cao cho Game Show lớp học HCM202.
Hệ thống **AudioManager** được trang bị cơ chế **Fallback tự động bằng Web Audio API**: Nếu chưa có các file `.mp3` thực tế, game sẽ tự động tổng hợp âm thanh bằng code toán học âm thanh (formant vocal cheering "Wooo!", realistic crowd applause, plunger mute comedic trombone "Téo tèo teo...", fanfare vô địch hoành tráng) mà không bao giờ bị gián đoạn hay phát sinh lỗi!

### DANH SÁCH 6 FILE ÂM THANH YÊU CẦU:

| Tên File | Thời điểm phát | Phong cách âm thanh | Thời lượng | Volume |
| :--- | :--- | :--- | :--- | :--- |
| **`correct-cheer.mp3`** | Trả lời ĐÚNG câu hỏi | Nhiều người vỗ tay + tiếng hò reo "Wooo!" sôi nổi của khán giả lớp học. Không giọng đọc dài, không beep. | ~2–3s | **0.55** |
| **`wrong-sad.mp3`** | Trả lời SAI câu hỏi | Gameshow comedy fail "TÉO TÈO TEO..." / "wah-wah-waaaah" hài hước, hụt hẫng nhẹ nhàng, không gây khó chịu. | ~1–2s | **0.55** |
| **`timeout.mp3`** | HẾT GIỜ (15s/10s) | Tiếng tích tắc đồng hồ dứt khoát -> "téo" hụt hẫng (Chỉ phát 1 sound, không trùng với wrong-sad). | ~1s | **0.55** |
| **`team-cheer.mp3`** | Round 3: TƯƠNG TRỢ THÀNH CÔNG | Tiếng vỗ tay ngắn + crowd cheer nhẹ nhàng khích lệ tinh thần đồng đội. | ~1.5–2s | **0.55** |
| **`unity-success.mp3`** | Round 3: ĐẠI ĐOÀN KẾT THÀNH CÔNG | Tiếng crowd cheer lớn + applause + khúc khải hoàn đoàn kết (+300 PTS tất cả đội). | ~3–4s | **0.60** |
| **`victory-crowd.mp3`** | Công bố ĐỘI VÔ ĐỊCH TOP 1 | **ÂM THANH HOÀNH TRÁNG NHẤT GAME**: Victory Fanfare đỉnh cao + tiếng hò reo vang dội + vỗ tay rền vang của cả hội trường. | ~4–5s | **0.65** |

*(Ghi chú: Khi chuẩn bị các file mp3 thực tế chất lượng cao, bạn chỉ cần copy trực tiếp vào thư mục `public/sounds/` này, hệ thống sẽ tự động phát hiện và ưu tiên phát file mp3 thay vì synth fallback).*
