
        const API_BASE_URL = 'https://prom-9305.onrender.com'; // ✅ Updated with your live backend URL
        
        let telegramVideos = []; 
        let filteredVideos = []; 
        let currentVideoData = null;

        // --- Core Functions ---

        async function loadVideos() {
            try {
                // Show loading state in both grids
                const loadingHtml = `
                    <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; padding: 4rem;">
                        <div class="loading"></div>
                        <p style="margin-top: 1rem; color: #aaa;">Fetching latest videos...</p>
                    </div>
                `;
                document.getElementById('homeVideoGrid').innerHTML = loadingHtml;
                
                const res = await fetch(`${API_BASE_URL}/api/videos`);
                const fetchedVideos = await res.json();
                
                // Add some mock metadata for YouTube feel
                telegramVideos = fetchedVideos.map(v => ({
                    ...v,
                    views: Math.floor(Math.random() * 900) + 100 + 'K views',
                    postedAt: Math.floor(Math.random() * 23) + 1 + ' hours ago',
                    channelName: 'Vortex Originals'
                }));
                
                filteredVideos = [...telegramVideos];
                renderVideos(filteredVideos, 'homeVideoGrid');
                renderVideos(filteredVideos, 'allVideosGrid');
                
            } catch (e) {
                const errorHtml = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                        <h3>⚠️ Connection Error</h3>
                        <p style="color: #aaa; margin: 1rem 0;">Could not reach the server at ${API_BASE_URL}</p>
                        <button onclick="loadVideos()" style="padding: 8px 16px; background: white; color: black; border: none; border-radius: 20px; cursor: pointer; font-weight: bold;">
                            Try Again
                        </button>
                    </div>
                `;
                document.getElementById('homeVideoGrid').innerHTML = errorHtml;
                console.error('Error loading videos:', e);
            }
        }

        function renderVideos(videos, containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            if (!videos || videos.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: #aaa;">
                        <p>No videos found. Try a different search term.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = '';
            videos.forEach(v => {
                const card = document.createElement('div');
                card.className = 'video-card';
                card.onclick = () => openVideoModal(v);
                
                card.innerHTML = `
                    <div class="video-thumbnail">
                        <video preload="metadata" muted onmouseover="this.play()" onmouseout="this.pause(); this.currentTime = 0;">
                            <source src="${API_BASE_URL}/api/video-file/${v.file_id}" type="video/mp4">
                        </video>
                        <div class="duration-tag">${v.video_length}s</div>
                    </div>
                    <div class="video-details">
                        <div class="channel-icon">${v.channelName[0]}</div>
                        <div class="video-meta">
                            <div class="video-title" title="${escapeHtml(v.title)}">${v.title}</div>
                            <div class="video-sub-meta">
                                <div>${v.channelName}</div>
                                <div>${v.views} • ${v.postedAt}</div>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        // --- Interaction Handlers ---

        function handleSearch() {
            const query = document.getElementById('searchInput').value.toLowerCase();
            filteredVideos = telegramVideos.filter(v => 
                v.title.toLowerCase().includes(query) || 
                (Array.isArray(v.tags) && v.tags.some(tag => tag.toLowerCase().includes(query))) ||
                (typeof v.tags === 'string' && v.tags.toLowerCase().includes(query))
            );
            
            renderVideos(filteredVideos, 'homeVideoGrid');
            renderVideos(filteredVideos, 'allVideosGrid');
        }

        function filterVideosByTag(tag) {
            // Update active state of chips
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            event.target.classList.add('active');

            if (tag === 'all') {
                filteredVideos = [...telegramVideos];
            } else if (tag === 'short') {
                filteredVideos = telegramVideos.filter(v => v.video_length < 60);
            } else {
                // Generic tag filter
                filteredVideos = telegramVideos.filter(v => 
                    (Array.isArray(v.tags) && v.tags.some(t => t.toLowerCase() === tag)) ||
                    (typeof v.tags === 'string' && v.tags.toLowerCase().includes(tag))
                );
            }
            
            renderVideos(filteredVideos, 'homeVideoGrid');
        }

        function showSection(sectionId) {
            document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');

            document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
            // Match sidebar item by text content
            document.querySelectorAll('.sidebar-item').forEach(item => {
                if (item.querySelector('.item-text').textContent.toLowerCase() === (sectionId === 'videos' ? 'shorts' : sectionId)) {
                    item.classList.add('active');
                }
            });
        }

        // --- Modal Logic ---

        function openVideoModal(video) {
            currentVideoData = video;
            const modal = document.getElementById('videoModal');
            modal.classList.add('active');
            
            modal.innerHTML = `
                <div class="modal-content">
                    <button class="close-btn" onclick="closeModal()">✕</button>
                    <div class="video-player-container">
                        <video controls autoplay>
                            <source src="${API_BASE_URL}/api/video-file/${video.file_id}" type="video/mp4">
                        </video>
                    </div>
                    <div class="modal-info">
                        <h2 class="modal-title">${video.title}</h2>
                        <div class="modal-actions">
                            <button class="action-btn" onclick="shareVideo()"><span>📤</span> Share</button>
                            <button class="action-btn" onclick="downloadVideo()"><span>⬇️</span> Download</button>
                        </div>
                        <div class="modal-description-box">
                            <strong>${video.views} • ${video.postedAt}</strong><br>
                            ${video.description || 'No description available.'}
                            <div style="margin-top: 10px; color: #3ea6ff;">
                                ${Array.isArray(video.tags) ? video.tags.map(t => '#' + t).join(' ') : '#' + video.tags}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function closeModal() {
            const modal = document.getElementById('videoModal');
            modal.classList.remove('active');
            modal.innerHTML = '';
            currentVideoData = null;
        }

        function shareVideo() {
            if (navigator.share && currentVideoData) {
                navigator.share({
                    title: currentVideoData.title,
                    text: currentVideoData.description,
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    alert('Link copied to clipboard!');
                });
            }
        }

        function downloadVideo() {
            if (!currentVideoData) return;
            const link = document.createElement('a');
            link.href = `${API_BASE_URL}/api/video-file/${currentVideoData.file_id}`;
            link.download = `${currentVideoData.title}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // --- Helpers ---

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        window.onload = loadVideos;

        // Modal dismissal
        window.onclick = (e) => {
            if (e.target.classList.contains('modal')) closeModal();
        };

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });