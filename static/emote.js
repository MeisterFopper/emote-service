async function refresh() {
  try {
    const res = await fetch(window.location.pathname + '/raw?_=' + Date.now());
    const data = await res.json();
    const emote = data.emote || "";
    const div = document.getElementById('emote');
    const current = div.firstElementChild;
    let needsUpdate = false;

    if (emote) {
      if (current) {
        if (current.tagName === 'IMG' && current.src !== emote) needsUpdate = true;
        if (current.tagName === 'SPAN' && current.textContent !== emote) needsUpdate = true;
        if (current.tagName !== 'IMG' && current.tagName !== 'SPAN') needsUpdate = true;
      } else {
        needsUpdate = true;
      }
    } else {
      if (current) needsUpdate = true;
    }

    if (needsUpdate) {
      div.style.opacity = 0;
      setTimeout(() => {
        div.innerHTML = "";
        if (emote) {
          if (emote.startsWith("http") || emote.startsWith("data:image/")) {
            const img = document.createElement('img');
            img.src = emote;
            img.style.maxHeight = "90vh";
            img.style.maxWidth = "90vw";
            img.style.objectFit = "contain";
            div.appendChild(img);
          } else {
            const span = document.createElement('span');
            span.style.fontSize = "6rem";
            span.textContent = emote;
            div.appendChild(span);
          }
        }
        div.style.opacity = 1;
      }, 300);
    }
  } catch (e) {
    console.error('refresh failed', e);
  }
}

setInterval(refresh, 1000);
