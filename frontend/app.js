
        let telegramVideos = []; 
        let filteredVideos = []; 
        let currentVideoData = null;

        
        async function loadVideos() {
            try {
                // Show loading state
                document.getElementById('homeVideoGrid').innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                        <div class="loading"></div>
                        <p style="margin-top: 1rem; color: white;">Loading videos...</p>
                    </div>
                `;
                
                const res = await fetch('http://localhost:5000/api/videos');
                const fetchedVideos = await res.json();
                telegramVideos = fetchedVideos;
                filteredVideos = fetchedVideos;
                
            
                renderHomeVideos(fetchedVideos);
                
               
                renderAllVideos(fetchedVideos);
                
            } catch (e) {
                const errorHtml = `
                    <div class="error-message" style="grid-column: 1 / -1;">
                        <h3>⚠️ Could not load videos</h3>
                        <p>Please check that your backend server is running on http://localhost:5000</p>
                        <button onclick="loadVideos()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 5px; cursor: pointer;">
                            🔄 Try Again
                        </button>
                    </div>
                `;
                document.getElementById('homeVideoGrid').innerHTML = errorHtml;
                document.getElementById('videos').innerHTML = errorHtml;
                console.error('Error loading videos:', e);
            }
        }

        
        function renderHomeVideos(videos) {
            const container = document.getElementById('homeVideoGrid');
            if (!videos || videos.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; opacity: 0.7;">
                        <p>No videos available yet.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = '';
            videos.forEach(v => {
                const card = document.createElement('div');
                card.className = 'video-card';
                card.innerHTML = `
                    <div class="video-thumbnail">
                        <video preload="metadata">
                            <source src="http://localhost:5000/api/video-file/${v.file_id}" type="video/mp4">
                        </video>
                        <div class="play-overlay" onclick="openTelegramVideoModal('${v.file_id}', '${escapeHtml(v.title)}', '${escapeHtml(v.description)}', '${Array.isArray(v.tags) ? v.tags.join(', ') : v.tags}', '${v.video_length}')">
                            <button class="play-btn">▶</button>
                        </div>
                    </div>
                    <div class="video-info">
                        <div class="video-title">${v.title}</div>
                        <div class="video-stats">
                            <span>⏱️ ${v.video_length}s</span>
                            <span>📹 Video</span>
                        </div>
                        <div class="video-description">
                            ${v.description}
                        </div>
                        <div class="video-tags">
                            ${Array.isArray(v.tags) ? v.tags.map(tag => `<span class="tag">#${tag}</span>`).join('') : `<span class="tag">#${v.tags}</span>`}
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }

       
        function renderAllVideos(videos) {
            const container = document.getElementById('videos');
            if (!videos || videos.length === 0) {
                container.innerHTML = `
                    <div class="error-message">
                        <h3>No videos available</h3>
                        <p>Videos will appear here once loaded from your backend.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = '';
            videos.forEach(v => {
                const card = document.createElement('div');
                card.className = 'video-card';
                card.innerHTML = `
                    <div class="video-thumbnail">
                        <video preload="metadata">
                            <source src="http://localhost:5000/api/video-file/${v.file_id}" type="video/mp4">
                        </video>
                        <div class="play-overlay" onclick="openTelegramVideoModal('${v.file_id}', '${escapeHtml(v.title)}', '${escapeHtml(v.description)}', '${Array.isArray(v.tags) ? v.tags.join(', ') : v.tags}', '${v.video_length}')">
                            <button class="play-btn">▶</button>
                        </div>
                    </div>
                    <div class="video-info">
                        <div class="video-title">${v.title}</div>
                        <div class="video-stats">
                            <span>⏱️ ${v.video_length}s</span>
                            <span>📹 Video</span>
                        </div>
                        <div class="video-description">
                            ${v.description}
                        </div>
                        <div class="video-tags">
                            ${Array.isArray(v.tags) ? v.tags.map(tag => `<span class="tag">#${tag}</span>`).join('') : `<span class="tag">#${v.tags}</span>`}
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }

     
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        
        function openTelegramVideoModal(fileId, title, description, tags, duration) {
            currentVideoData = {
                id: fileId,
                title: title,
                description: description,
                tags: tags.split(', '),
                duration: duration + 's',
                url: `http://localhost:5000/api/video-file/${fileId}`
            };
            
            document.getElementById('videoModal').classList.add('active');
            document.getElementById('videoPlayer').innerHTML =
                `<video width="100%" height="100%" controls autoplay>
                    <source src="http://localhost:5000/api/video-file/${fileId}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>`;
            document.getElementById('modalTitle').textContent = title;
            document.getElementById('modalDescription').textContent = description;
            document.getElementById('modalTags').innerHTML = tags.split(', ').map(tag => `<span class="tag">#${tag}</span>`).join(' ');
        }

       
        window.onload = function () {
            loadVideos(); 
        };

      
        function showSection(sectionId) {
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionId).classList.add('active');

            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.nav-btn').forEach(btn => {
                if (btn.textContent.toLowerCase().includes(sectionId === 'videos' ? 'all videos' : sectionId)) {
                    btn.classList.add('active');
                }
            });
        }

      
        function filterHomeVideos(type) {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            let filtered = telegramVideos;
            if (type === 'short') {
                filtered = telegramVideos.filter(v => v.video_length < 60);
            } else if (type === 'long') {
                filtered = telegramVideos.filter(v => v.video_length >= 60);
            } else if (type === 'recent') {
                filtered = [...telegramVideos].reverse(); 
            }
            
            renderHomeVideos(filtered);
        }

        
        function filterVideos(type) {
            document.querySelectorAll('#videos').closest('section').querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            let filtered = telegramVideos;
            if (type === 'short') {
                filtered = telegramVideos.filter(v => v.video_length < 60);
            } else if (type === 'long') {
                filtered = telegramVideos.filter(v => v.video_length >= 60);
            } else if (type === 'recent') {
                filtered = [...telegramVideos].reverse();
            }
            
            renderAllVideos(filtered);
        }

        // Modal Functions
        function closeModal() {
            document.getElementById('videoModal').classList.remove('active');
            document.getElementById('videoPlayer').innerHTML = '';
            currentVideoData = null;
        }

        function playVideo() {
            const video = document.querySelector('#videoPlayer video');
            if (video) video.play();
        }

        function shareVideo() {
            if (navigator.share && currentVideoData) {
                navigator.share({
                    title: currentVideoData.title,
                    text: currentVideoData.description,
                    url: window.location.href
                });
            } else {
                const shareText = currentVideoData ? 
                    `Check out this video: ${currentVideoData.title}\n${window.location.href}` :
                    `Check out ViralKand!\n${window.location.href}`;
                navigator.clipboard.writeText(shareText).then(() => {
                    alert('Video link copied to clipboard!');
                }).catch(() => {
                    alert('Share feature not available. Copy the URL manually.');
                });
            }
        }

        function downloadVideo() {
            if (!currentVideoData) return;
            const link = document.createElement('a');
            link.href = currentVideoData.url;
            link.download = `${currentVideoData.title}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

       
        document.getElementById('videoModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });

       
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });