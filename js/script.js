// =================================================================
// CẤU HÌNH FIREBASE CỦA BẠN (GIỮ NGUYÊN)
// =================================================================
const firebaseConfig = {
  apiKey: "AIzaSyCy1nZAKExo3D57iBi4z3WX8qRkIZFKvfE",
  authDomain: "fir-c5e3b.firebaseapp.com",
  projectId: "fir-c5e3b",
  storageBucket: "fir-c5e3b.appspot.com",
  messagingSenderId: "877821543377",
  appId: "1:877821543377:web:285176b9c418ca340056f0",
  measurementId: "G-67ZCEH1R2Y"
};

// --- Khởi tạo Firebase ---
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- Lấy các phần tử HTML ---
const loginGate = document.getElementById('login-gate');
const contentWrapper = document.getElementById('content-wrapper');
const codeForm = document.getElementById('code-form');
const codeInput = document.getElementById('code-input');
const errorMessage = document.getElementById('error-message');

// --- Hàm hiển thị nội dung ---
function showContent() {
    loginGate.classList.add('hidden');
    contentWrapper.classList.remove('hidden');
    initializeVideoPlayer();
}

// --- Hàm khởi tạo trình phát video (ĐÃ CẬP NHẬT HOÀN TOÀN CHO HLS) ---
function initializeVideoPlayer() {
    // =========================================================
    // SỬA LẠI ĐƯỜNG DẪN VIDEO HLS (.m3u8) VÀ ẢNH CHO ĐÚNG
    // =========================================================
    const videoData = [
        { 
            id: 'vid01', 
            title: 'Video Kỷ Niệm 1', 
            // ĐÃ SỬA: Đường dẫn tới file .m3u8 của video 1
            src: 'assets/vid1/video1.m3u8', 
            thumbnail: 'assets/nen.jpg' // THAY BẰNG TÊN ẢNH THẬT CỦA BẠN
        },
        { 
            id: 'vid02', 
            title: 'Video Vui Vẻ 2', 
            // ĐÃ SỬA: Đường dẫn tới file .m3u8 của video 2
            src: 'assets/vid2/video2.m3u8', // THAY BẰNG TÊN FILE .m3u8 THẬT
            thumbnail: 'assets/ten_file_anh_2.png' // THAY BẰNG TÊN ẢNH THẬT
        },
    ];
    // =========================================================

    const mainVideo = document.getElementById('main-video');
    const mainVideoTitle = document.querySelector('.main-video-title');
    const videoListContainer = document.querySelector('.video-list');
    let hls = new Hls();

    // Hàm chuyên để tải và phát video HLS
    function loadVideo(videoInfo) {
        if (Hls.isSupported()) {
            hls.loadSource(videoInfo.src);
            hls.attachMedia(mainVideo);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                mainVideo.play();
            });
        } else if (mainVideo.canPlayType('application/vnd.apple.mpegurl')) {
            // Dành cho các thiết bị Apple (Safari) hỗ trợ HLS gốc
            mainVideo.src = videoInfo.src;
            mainVideo.addEventListener('loadedmetadata', function() {
                mainVideo.play();
            });
        }
        mainVideoTitle.textContent = videoInfo.title;
    }

    // Tạo danh sách phát
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

    // Xử lý khi click vào một video trong danh sách
    videoListContainer.addEventListener('click', (event) => {
        const clickedItem = event.target.closest('.video-item');
        if (!clickedItem) return;

        const videoId = clickedItem.dataset.id;
        const selectedVideo = videoData.find(v => v.id === videoId);

        if (selectedVideo) {
            loadVideo(selectedVideo); // Gọi hàm tải video mới
            document.querySelectorAll('.video-item').forEach(item => item.classList.remove('active'));
            clickedItem.classList.add('active');
        }
    });

    // Khởi tạo
    populatePlaylist();
    if (videoData.length > 0) {
        // Tải video đầu tiên khi trang được mở
        loadVideo(videoData[0]);
        document.querySelector('.video-item')?.classList.add('active');
    }

    // Chống lưu trang bằng Ctrl+S (giữ nguyên)
    document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 's') { event.preventDefault(); } });
}


// --- Logic xác thực mã code (GIỮ NGUYÊN) ---
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