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
        <p style="font-size: 0.875rem; margin-top: 0.5rem; opacity: 0.7;">Supports up to 9 concurrent streams.</p>
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
    removeBtn.title = 'Remove';
    removeBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
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

  if (streams.length >= 9) {
    alert('Maximum 9 streams allowed');
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
      if (streams.length >= 9) return;
      const id = getYouTubeID(url);
      if (id && !streams.includes(id)) {
        streams.push(id);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      render();
    } else if (streams.length >= 9) {
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

function castScreen() {
  if (streams.length === 0) {
    showToast('No streams to cast.');
    return;
  }

  // Show video picker overlay
  let overlay = document.getElementById('cast-overlay');
  if (overlay) {
    overlay.remove();
    return;
  }

  overlay = document.createElement('div');
  overlay.id = 'cast-overlay';

  const title = document.createElement('p');
  title.className = 'cast-title';
  title.textContent = 'Select a stream to cast:';
  overlay.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'cast-grid';

  streams.forEach((id, index) => {
    const item = document.createElement('div');
    item.className = 'cast-item';
    item.onclick = () => castVideo(id);

    const thumb = document.createElement('img');
    thumb.src = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    thumb.alt = `Stream ${index + 1}`;

    const label = document.createElement('span');
    label.textContent = `Stream ${index + 1}`;

    item.appendChild(thumb);
    item.appendChild(label);
    grid.appendChild(item);
  });

  overlay.appendChild(grid);

  // Close on click outside
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
}

function castVideo(videoId) {
  // Remove picker
  const overlay = document.getElementById('cast-overlay');
  if (overlay) overlay.remove();

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  if ('PresentationRequest' in window) {
    const request = new PresentationRequest([url]);
    request.start()
      .then(conn => console.log('Casting to:', conn.id))
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Cast error:', err);
          showToast('Cast failed. Try right-click > "Cast..."');
        }
      });
  } else {
    showToast('Cast not supported in this browser.');
  }
}

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 5000);
}

addBtn.addEventListener('click', addStream);
document.getElementById('favBtn').addEventListener('click', loadFavorites);
document.getElementById('castBtn').addEventListener('click', castScreen);
document.getElementById('quitBtn').addEventListener('click', quitApp);

urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addStream();
});

// Initial Render
render();
