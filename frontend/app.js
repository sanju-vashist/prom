async function loadVideos() {
  const res = await fetch('http://localhost:5000/api/videos'); // adjust if deployed
  const data = await res.json();
  const videoDiv = document.getElementById('videos');
  videoDiv.innerHTML = '';
  data.forEach(v => {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
      <h3>${v.title}</h3>
      <video controls src="http://localhost:5000/api/video-file/${v.file_id}"></video>
      <p>${v.description}</p>
      <p><b>Tags:</b> ${v.tags.join(', ')}</p>
      <p><b>Length:</b> ${v.video_length}s</p>
    `;
    videoDiv.appendChild(card);
  });
}
window.onload = loadVideos;
