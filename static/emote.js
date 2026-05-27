function isImageEmote(value) {
  return typeof value === 'string' &&
    (value.startsWith('http://') ||
     value.startsWith('https://') ||
     value.startsWith('data:image/'));
}

function sameEmoteList(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function getSizeClass(count) {
  if (count <= 1) return 'count-1';
  if (count === 2) return 'count-2';
  if (count === 3) return 'count-3';
  if (count === 4) return 'count-4';
  return 'count-5';
}

function buildEmoteNode(value, count, index) {
  const wrapper = document.createElement('div');
  wrapper.className = `emote-item ${getSizeClass(count)}`;
  wrapper.style.setProperty('--item-index', index);

  if (isImageEmote(value)) {
    const img = document.createElement('img');
    img.src = value;
    img.alt = 'emote';
    img.loading = 'eager';
    img.decoding = 'async';
    img.className = 'emote-media';
    wrapper.appendChild(img);
  } else {
    const span = document.createElement('span');
    span.className = 'emote-text';
    span.textContent = value;
    wrapper.appendChild(span);
  }

  return wrapper;
}

function renderEmotes(container, emoteList) {
  container.innerHTML = '';
  container.className = `emote-stage ${getSizeClass(emoteList.length)}`;

  for (let i = 0; i < emoteList.length; i++) {
    container.appendChild(buildEmoteNode(emoteList[i], emoteList.length, i));
  }
}

let lastRenderedEmotes = [];
let updateInFlight = false;

async function refresh() {
  if (updateInFlight) {
    return;
  }

  try {
    updateInFlight = true;

    const res = await fetch(window.location.pathname + '/raw?_=' + Date.now(), {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const nextEmotes = Array.isArray(data.emotes) ? data.emotes.filter(Boolean).slice(0, 5) : [];
    const stage = document.getElementById('emote');

    if (sameEmoteList(lastRenderedEmotes, nextEmotes)) {
      return;
    }

    stage.classList.add('fade-out');

    setTimeout(() => {
      renderEmotes(stage, nextEmotes);
      lastRenderedEmotes = [...nextEmotes];

      requestAnimationFrame(() => {
        stage.classList.remove('fade-out');
        stage.classList.add('fade-in');

        setTimeout(() => {
          stage.classList.remove('fade-in');
        }, 350);
      });
    }, 220);
  } catch (e) {
    console.error('refresh failed', e);
  } finally {
    updateInFlight = false;
  }
}

refresh();
setInterval(refresh, 1000);