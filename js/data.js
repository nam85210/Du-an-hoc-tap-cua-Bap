// =============================================================
//  DỮ LIỆU BÀI HỌC TIẾNG VIỆT
//  Bố mẹ có thể tự thêm / sửa từ ở file này.
//  Mỗi từ:  { w: "chữ", e: "emoji minh hoạ" }
// =============================================================

const VIET_LESSONS = {
  // ---------------- TỪ ĐƠN (1 tiếng) ----------------
  "don-1": {
    title: "Từ đơn – Cấp 1",
    sub: "Tiếng dễ: phụ âm + nguyên âm",
    type: "don",
    items: [
      { w: "ba", e: "👨" }, { w: "bà", e: "👵" }, { w: "bé", e: "👶" },
      { w: "bò", e: "🐄" }, { w: "cá", e: "🐟" }, { w: "cô", e: "👩‍🏫" },
      { w: "bơ", e: "🥑" }, { w: "gà", e: "🐔" }, { w: "hổ", e: "🐯" },
      { w: "mẹ", e: "👩" }, { w: "lá", e: "🍃" }, { w: "xe", e: "🚗" },
      { w: "cờ", e: "🚩" }, { w: "ô", e: "☂️" }, { w: "dê", e: "🐐" },
      { w: "đá", e: "🪨" }, { w: "nho", e: "🍇" }, { w: "thỏ", e: "🐇" },
    ],
  },
  "don-2": {
    title: "Từ đơn – Cấp 2",
    sub: "Tiếng có vần đơn giản",
    type: "don",
    items: [
      { w: "cam", e: "🍊" }, { w: "kem", e: "🍦" }, { w: "hoa", e: "🌸" },
      { w: "mèo", e: "🐈" }, { w: "táo", e: "🍎" }, { w: "cua", e: "🦀" },
      { w: "cú", e: "🦉" }, { w: "khỉ", e: "🐒" }, { w: "tai", e: "👂" },
      { w: "tay", e: "✋" }, { w: "mũ", e: "🧢" }, { w: "áo", e: "👕" },
      { w: "voi", e: "🐘" }, { w: "sao", e: "⭐" }, { w: "dưa", e: "🍉" },
      { w: "sữa", e: "🥛" }, { w: "nhà", e: "🏠" }, { w: "chó", e: "🐕" },
      { w: "mưa", e: "🌧️" }, { w: "tàu", e: "🚢" },
    ],
  },
  "don-3": {
    title: "Từ đơn – Cấp 3",
    sub: "Tiếng có vần khó hơn",
    type: "don",
    items: [
      { w: "chuối", e: "🍌" }, { w: "trăng", e: "🌙" }, { w: "nắng", e: "☀️" },
      { w: "bánh", e: "🍰" }, { w: "trứng", e: "🥚" }, { w: "gấu", e: "🐻" },
      { w: "rắn", e: "🐍" }, { w: "ếch", e: "🐸" }, { w: "ong", e: "🐝" },
      { w: "bướm", e: "🦋" }, { w: "chân", e: "🦶" }, { w: "mắt", e: "👁️" },
      { w: "mũi", e: "👃" }, { w: "răng", e: "🦷" }, { w: "giày", e: "👟" },
      { w: "đèn", e: "💡" }, { w: "vịt", e: "🦆" }, { w: "bút", e: "🖊️" },
      { w: "sách", e: "📕" }, { w: "ghế", e: "🪑" }, { w: "cây", e: "🌳" },
      { w: "ngựa", e: "🐴" }, { w: "quả", e: "🍑" }, { w: "nghé", e: "🐃" },
    ],
  },

  // ---------------- TỪ GHÉP (2 tiếng trở lên) ----------------
  "ghep-1": {
    title: "Từ ghép – Gia đình & Trường",
    sub: "Người thân, cô giáo, bạn bè",
    type: "ghep",
    items: [
      { w: "bố mẹ", e: "👨‍👩‍👧" }, { w: "ông bà", e: "👴👵" }, { w: "anh chị", e: "👫" },
      { w: "em bé", e: "👶" }, { w: "gia đình", e: "👨‍👩‍👧‍👦" }, { w: "cô giáo", e: "👩‍🏫" },
      { w: "bạn bè", e: "🧒👧" }, { w: "lớp học", e: "🏫" }, { w: "đi học", e: "🎒" },
      { w: "tập viết", e: "✍️" }, { w: "cặp sách", e: "🎒" }, { w: "bút chì", e: "✏️" },
    ],
  },
  "ghep-2": {
    title: "Từ ghép – Con vật",
    sub: "Các con vật quen thuộc",
    type: "ghep",
    items: [
      { w: "con gà", e: "🐔" }, { w: "con mèo", e: "🐈" }, { w: "con chó", e: "🐕" },
      { w: "con cá", e: "🐟" }, { w: "con voi", e: "🐘" }, { w: "con thỏ", e: "🐇" },
      { w: "con bướm", e: "🦋" }, { w: "con ong", e: "🐝" }, { w: "con rùa", e: "🐢" },
      { w: "con khỉ", e: "🐒" }, { w: "chim sẻ", e: "🐦" }, { w: "con lợn", e: "🐷" },
      { w: "con vịt", e: "🦆" }, { w: "con ngựa", e: "🐴" },
    ],
  },
  "ghep-3": {
    title: "Từ ghép – Hoa quả & Đồ ăn",
    sub: "Trái cây, món ăn",
    type: "ghep",
    items: [
      { w: "quả cam", e: "🍊" }, { w: "quả táo", e: "🍎" }, { w: "quả chuối", e: "🍌" },
      { w: "dưa hấu", e: "🍉" }, { w: "quả xoài", e: "🥭" }, { w: "quả dứa", e: "🍍" },
      { w: "quả nho", e: "🍇" }, { w: "quả dâu", e: "🍓" }, { w: "bánh mì", e: "🥖" },
      { w: "cơm trắng", e: "🍚" }, { w: "sữa chua", e: "🥛" }, { w: "kem que", e: "🍡" },
    ],
  },
  "ghep-4": {
    title: "Từ ghép – Đồ vật & Xe cộ",
    sub: "Đồ dùng, phương tiện",
    type: "ghep",
    items: [
      { w: "cái ghế", e: "🪑" }, { w: "đồng hồ", e: "⏰" }, { w: "cái ô", e: "☂️" },
      { w: "quả bóng", e: "⚽" }, { w: "gấu bông", e: "🧸" }, { w: "quyển sách", e: "📚" },
      { w: "xe đạp", e: "🚲" }, { w: "ô tô", e: "🚗" }, { w: "máy bay", e: "✈️" },
      { w: "tàu hỏa", e: "🚂" }, { w: "xe buýt", e: "🚌" }, { w: "tàu thủy", e: "🚢" },
    ],
  },
  "ghep-5": {
    title: "Từ ghép – Thiên nhiên & Việc làm",
    sub: "Bầu trời, cây cối, việc hằng ngày",
    type: "ghep",
    items: [
      { w: "mặt trời", e: "☀️" }, { w: "mặt trăng", e: "🌙" }, { w: "ngôi sao", e: "⭐" },
      { w: "cầu vồng", e: "🌈" }, { w: "bông hoa", e: "🌸" }, { w: "cây xanh", e: "🌳" },
      { w: "đám mây", e: "☁️" }, { w: "trời mưa", e: "🌧️" }, { w: "rửa tay", e: "🧼" },
      { w: "đánh răng", e: "🪥" }, { w: "ăn cơm", e: "🍚" }, { w: "đi ngủ", e: "😴" },
      { w: "quét nhà", e: "🧹" }, { w: "tưới cây", e: "🪴" },
    ],
  },

  // ---------------- CÂU NGẮN ----------------
  "cau-1": {
    title: "Câu ngắn",
    sub: "Đọc trơn cả câu",
    type: "cau",
    items: [
      { w: "Bé đi học.", e: "🎒" }, { w: "Mẹ mua cá.", e: "🐟" },
      { w: "Bố đi làm.", e: "💼" }, { w: "Bé ăn cơm.", e: "🍚" },
      { w: "Bà kể chuyện.", e: "📖" }, { w: "Quả cam chín vàng.", e: "🍊" },
      { w: "Con gà gáy ò ó o.", e: "🐓" }, { w: "Bé yêu bố mẹ.", e: "❤️" },
      { w: "Cô giáo dạy bé hát.", e: "🎵" }, { w: "Con mèo trèo cây cau.", e: "🐈" },
    ],
  },
};

// Thứ tự hiển thị các nhóm trong menu Tiếng Việt
const VIET_MENU = [
  { group: "Từ đơn", icon: "🔤", keys: ["don-1", "don-2", "don-3"] },
  { group: "Từ ghép", icon: "🧩", keys: ["ghep-1", "ghep-2", "ghep-3", "ghep-4", "ghep-5"] },
  { group: "Câu", icon: "📖", keys: ["cau-1"] },
];

// Bảng chữ cái tiếng Việt (29 chữ) + cách đọc âm
const ALPHABET = [
  ["a", "a"], ["ă", "á"], ["â", "ớ"], ["b", "bờ"], ["c", "cờ"], ["d", "dờ"],
  ["đ", "đờ"], ["e", "e"], ["ê", "ê"], ["g", "gờ"], ["h", "hờ"], ["i", "i"],
  ["k", "ca"], ["l", "lờ"], ["m", "mờ"], ["n", "nờ"], ["o", "o"], ["ô", "ô"],
  ["ơ", "ơ"], ["p", "pờ"], ["q", "quờ"], ["r", "rờ"], ["s", "sờ"], ["t", "tờ"],
  ["u", "u"], ["ư", "ư"], ["v", "vờ"], ["x", "xờ"], ["y", "i"],
];

// Lời khen & lời nhắc (chọn ngẫu nhiên)
const PRAISES = [
  "Giỏi quá! Bé đọc đúng rồi!",
  "Tuyệt vời! Bé đọc hay lắm!",
  "Hoan hô! Đúng rồi!",
  "Bé giỏi quá, thưởng cho bé một ngôi sao!",
  "Chính xác! Bé thật là giỏi!",
];
const RETRY_MSGS = [
  "Chưa đúng rồi. Bé cùng đánh vần lại nhé!",
  "Gần được rồi! Mình đánh vần lại nào!",
  "Bé thử lại nhé, nghe cô đánh vần trước nha!",
];
const MATH_PRAISES = ["Đúng rồi! Giỏi quá!", "Tuyệt vời!", "Bé tính giỏi lắm!", "Chính xác!"];
const MATH_RETRY = ["Chưa đúng, bé thử lại nhé!", "Bé đếm lại xem nào!"];
