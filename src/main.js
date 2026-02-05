import './style.css'

const urlInput = document.getElementById('urlInput');
const addBtn = document.getElementById('addBtn');
const videoGrid = document.getElementById('videoGrid');

let streams = []; // Array of video IDs

// Helper to extract YouTube ID
function getYouTubeID(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function render() {
  // Update grid class
  videoGrid.className = '';
  if (streams.length === 0) {
    videoGrid.classList.add('grid-empty');
    videoGrid.innerHTML = `
      <div class="empty-state">
        <p>No streams active. Add a YouTube URL above to start watching.</p>
        <p style="font-size: 0.875rem; margin-top: 0.5rem; opacity: 0.7;">Supports up to 5 concurrent streams.</p>
      </div>
    `;
    return;
  }

  videoGrid.classList.add(`grid-${streams.length}`);
  videoGrid.innerHTML = '';

  streams.forEach((id, index) => {
    const container = document.createElement('div');
    container.className = 'video-container';

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1`; // Muted autoplay handling
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    // Controls
    const controls = document.createElement('div');
    controls.className = 'video-controls';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => removeStream(index);

    controls.appendChild(removeBtn);
    container.appendChild(iframe);
    container.appendChild(controls);

    videoGrid.appendChild(container);
  });
}

function addStream() {
  const url = urlInput.value.trim();
  if (!url) return;

  const id = getYouTubeID(url);
  if (!id) {
    alert('Invalid YouTube URL');
    return;
  }

  if (streams.length >= 5) {
    alert('Maximum 5 streams allowed');
    return;
  }

  if (streams.includes(id)) {
    alert('Stream already added');
    return;
  }

  streams.push(id);
  urlInput.value = '';
  render();
}

function removeStream(index) {
  streams.splice(index, 1);
  render();
}

async function loadFavorites() {
  try {
    const response = await fetch('/favorites.txt');
    if (!response.ok) throw new Error('Failed to load favorites');

    const text = await response.text();
    const specificUrls = text.split('\n').map(line => line.trim()).filter(line => line);

    let addedCount = 0;

    specificUrls.forEach(url => {
      if (streams.length >= 5) return;
      const id = getYouTubeID(url);
      if (id && !streams.includes(id)) {
        streams.push(id);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      render();
    } else if (streams.length >= 5) {
      alert('Maximum streams reached, cannot add favorites.');
    } else {
      alert('No new valid streams found in favorites.');
    }

  } catch (error) {
    console.error(error);
    alert('Error loading favorites.txt');
  }
}

async function quitApp() {
  if (!confirm('Are you sure you want to quit MultiTube?')) return;

  try {
    const response = await fetch('/api/shutdown', { method: 'POST' });
    if (response.ok) {
      document.body.innerHTML = `
            <div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#0f172a;color:#fff;font-family:sans-serif;">
                <h1>App Closed. You can close this tab.</h1>
            </div>
        `;
      window.close(); // Try to close tab if allowed
    }
  } catch (error) {
    console.error('Error shutting down:', error);
  }
}

addBtn.addEventListener('click', addStream);
document.getElementById('favBtn').addEventListener('click', loadFavorites);
document.getElementById('quitBtn').addEventListener('click', quitApp);

urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addStream();
});

// Initial Render
render();
