// =================================================================
// DÁN MÃ CẤU HÌNH FIREBASE CỦA BẠN VÀO ĐÂY
// =================================================================
// Import the functions you need from the SDKs you need
const firebaseConfig = {
  apiKey: "AIzaSyCy1nZAKExo3D57iBi4z3WX8qRkIZFKvfE",
  authDomain: "fir-c5e3b.firebaseapp.com",
  projectId: "fir-c5e3b",
  storageBucket: "fir-c5e3b.appspot.com", // Tôi đã sửa lại cho bạn
  messagingSenderId: "877821543377",
  appId: "1:877821543377:web:285176b9c418ca340056f0",
  measurementId: "G-67ZCEH1R2Y"
};

// =================================================================

// --- Khởi tạo Firebase ---
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- Lấy các phần tử HTML ---
const loginGate = document.getElementById('login-gate');
const contentWrapper = document.getElementById('content-wrapper');
// ... (các dòng lấy phần tử khác giữ nguyên như cũ) ...

// --- BƯỚC QUAN TRỌNG: CẬP NHẬT DANH SÁCH VIDEO VỚI ĐƯỜNG DẪN LOCAL ---
function initializeVideoPlayer() {
    // THAY THẾ BẰNG TÊN FILE VIDEO VÀ ẢNH CỦA BẠN TRONG THƯ MỤC 'assets'
    const videoData = [
        { 
            id: 'vid01', 
            title: 'Video Kỷ Niệm 1', 
            // Đường dẫn trỏ tới file trong thư mục assets
            src: 'assets/demo1', 
            thumbnail: 'assets/ten_file_anh_1.jpg'
        },
        { 
            id: 'vid02', 
            title: 'Video Vui Vẻ 2', 
            src: 'assets/ten_file_video_2.mp4', 
            thumbnail: 'assets/ten_file_anh_2.png'
        },
        // Thêm các video khác nếu có
    ];

    // --- PHẦN CÒN LẠI CỦA HÀM NÀY GIỮ NGUYÊN ---
    // (Bao gồm code populatePlaylist, addEventListener, ...)
    const mainVideo = document.getElementById('main-video');
    const mainVideoTitle = document.querySelector('.main-video-title');
    const videoListContainer = document.querySelector('.video-list');

    function populatePlaylist() {
        videoListContainer.innerHTML = '';
        videoData.forEach(video => {
            const videoItem = document.createElement('div');
            videoItem.classList.add('video-item');
            videoItem.dataset.id = video.id;
            videoItem.innerHTML = `<img src="${video.thumbnail}" alt="${video.title}"><h4 class="video-item-title">${video.title}</h4>`;
            videoListContainer.appendChild(videoItem);
        });
    }

    videoListContainer.addEventListener('click', (event) => {
        const clickedItem = event.target.closest('.video-item');
        if (!clickedItem) return;
        const videoId = clickedItem.dataset.id;
        const selectedVideo = videoData.find(v => v.id === videoId);
        if (selectedVideo) {
            mainVideo.src = selectedVideo.src;
            mainVideoTitle.textContent = selectedVideo.title;
            mainVideo.play();
            document.querySelectorAll('.video-item').forEach(item => item.classList.remove('active'));
            clickedItem.classList.add('active');
        }
    });

    populatePlaylist();

    if (videoData.length > 0) {
        mainVideo.src = videoData[0].src;
        mainVideoTitle.textContent = videoData[0].title;
        document.querySelector('.video-item')?.classList.add('active');
    }

    document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 's') { event.preventDefault(); } });
}

// --- PHẦN LOGIC XÁC THỰC MÃ CODE GIỮ NGUYÊN NHƯ CŨ ---
codeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // ... code xác thực mã giữ nguyên ...
});

function showContent() {
    loginGate.classList.add('hidden');
    contentWrapper.classList.remove('hidden');
    initializeVideoPlayer();
}

// (Dán toàn bộ phần code xác thực mã từ câu trả lời trước vào đây)
codeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userCode = codeInput.value.trim().toUpperCase();
    errorMessage.textContent = '';
    const submitButton = codeForm.querySelector('button');
    submitButton.disabled = true;
    submitButton.textContent = 'Đang kiểm tra...';

    if (!userCode) {
        errorMessage.textContent = 'Vui lòng nhập mã.';
        submitButton.disabled = false;
        submitButton.textContent = 'Xác Nhận';
        return;
    }

    try {
        const querySnapshot = await db.collection('accessCodes').where('code', '==', userCode).limit(1).get();

        if (querySnapshot.empty) {
            errorMessage.textContent = 'Mã không hợp lệ.';
        } else {
            const doc = querySnapshot.docs[0];
            const codeData = doc.data();

            if (codeData.isUsed) {
                errorMessage.textContent = 'Mã này đã được sử dụng.';
            } else {
                await db.collection('accessCodes').doc(doc.id).update({ isUsed: true });
                showContent();
                return;
            }
        }
    } catch (error) {
        console.error("Lỗi khi xác thực mã:", error);
        errorMessage.textContent = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
    }

    submitButton.disabled = false;
    submitButton.textContent = 'Xác Nhận';
});