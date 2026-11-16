/**
 * MD. JABER HOSAIN — PORTFOLIO ADMIN CONSOLE (`admin.js`)
 * Features:
 * 1. Stores all editable content in Firestore: `siteSettings` ('draft' & 'published'), `works` (V1 & G1 timeline tiles), & `projects`
 * 2. Live Split-Screen Preview: broadcasts instant draft updates to `#live-preview-iframe`
 * 3. Controls: Color pickers, Font dropdowns, Editable text for Hero name/role/tagline/buttons/links,
 *    Drag-and-drop section reordering + Up/Down + Show/Hide toggles, Firebase Storage upload or link fields,
 *    Add/Edit/Delete/Reorder V1 & G1 timeline tiles and case-study projects
 * 4. Draft & Publish workflow + Undo stack + Restore Previous Version (keeps the last 10 versions in `siteVersions`)
 * 5. Firebase Authentication restricted strictly to `sbmc.3925@gmail.com`
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js';
import {
  FIREBASE_CONFIG,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_WORKS,
  DEFAULT_PROJECTS
} from './script.js';

// <!-- EDIT HERE: Owner Email Address allowed to access the Admin Panel -->
const ALLOWED_OWNER_EMAIL = 'sbmc.3925@gmail.com';

const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app, FIREBASE_CONFIG.firestoreDatabaseId);
const storage = getStorage(app);

// State
let draftSettings = structuredClone(DEFAULT_SITE_SETTINGS);
let draftWorks = structuredClone(DEFAULT_WORKS);
let draftProjects = structuredClone(DEFAULT_PROJECTS);
let undoStack = [];
let versionHistory = [];

const SECTION_LABELS = {
  hero: 'Hero Banner & Selected Work Timeline',
  stats: 'Trust Statistics Row',
  works: 'Case-Study Works & Filters',
  about: 'About Me & Skills Toolkit',
  trust: 'Client Testimonials',
  contact: 'Contact & Let’s Work Together'
};

function mergeSiteSettings(incoming) {
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...(incoming || {}),
    colors: { ...DEFAULT_SITE_SETTINGS.colors, ...(incoming?.colors || {}) },
    fonts: { ...DEFAULT_SITE_SETTINGS.fonts, ...(incoming?.fonts || {}) },
    sectionVisibility: { ...DEFAULT_SITE_SETTINGS.sectionVisibility, ...(incoming?.sectionVisibility || {}) },
    texts: { ...DEFAULT_SITE_SETTINGS.texts, ...(incoming?.texts || {}) }
  };
}

function setStatusBadge(text, isWarning = false) {
  const badge = document.getElementById('sync-status-badge');
  if (!badge) return;
  badge.textContent = text;
  badge.style.color = isWarning ? '#fbbf24' : '#34d399';
}

function pushUndoState() {
  undoStack.push({
    siteSettings: structuredClone(draftSettings),
    works: structuredClone(draftWorks),
    projects: structuredClone(draftProjects)
  });
  if (undoStack.length > 30) undoStack.shift();
  const undoBtn = document.getElementById('btn-undo');
  if (undoBtn) undoBtn.disabled = undoStack.length === 0;
  setStatusBadge('Unsaved draft edits', true);
}

function broadcastToLivePreview() {
  const iframe = document.getElementById('live-preview-iframe');
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(
      {
        type: 'ADMIN_LIVE_PREVIEW_UPDATE',
        siteSettings: draftSettings,
        works: draftWorks,
        projects: draftProjects
      },
      '*'
    );
  }
}

// Populate all Admin Controls from current `draftSettings`, `draftWorks`, & `draftProjects`
function syncControlsFromState() {
  // Colors
  const c = draftSettings.colors || DEFAULT_SITE_SETTINGS.colors;
  setInputValue('color-bg-deep', c.bgDeep);
  setInputValue('color-bg-primary', c.bgPrimary);
  setInputValue('color-bg-elevated', c.bgElevated);
  setInputValue('color-accent', c.accent);
  setInputValue('color-text-primary', c.textPrimary);
  setInputValue('color-text-muted', c.textMuted);

  // Fonts
  const f = draftSettings.fonts || DEFAULT_SITE_SETTINGS.fonts;
  setInputValue('font-display', f.display);
  setInputValue('font-sans', f.sans);
  setInputValue('font-serif', f.serif);

  // Texts & Links
  const texts = draftSettings.texts || DEFAULT_SITE_SETTINGS.texts;
  document.querySelectorAll('[data-text-key]').forEach((input) => {
    const key = input.getAttribute('data-text-key');
    if (key && texts[key] !== undefined) {
      input.value = texts[key];
    }
  });

  renderSortableSectionsList();
  renderAdminWorksList();
  renderAdminProjectsList();
  broadcastToLivePreview();
}

function setInputValue(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.value = val;
}

// Drag-and-Drop Section Ordering + Show/Hide Toggles
function renderSortableSectionsList() {
  const listEl = document.getElementById('section-order-list');
  if (!listEl) return;

  const order = Array.isArray(draftSettings.sectionOrder)
    ? draftSettings.sectionOrder
    : DEFAULT_SITE_SETTINGS.sectionOrder;

  listEl.innerHTML = order
    .map((secId, index) => {
      const visible = draftSettings.sectionVisibility?.[secId] !== false;
      return `
        <li class="sortable-section-item" draggable="true" data-sec-id="${secId}" data-index="${index}">
          <div class="section-item-left">
            <span aria-hidden="true">☰</span>
            <span>${SECTION_LABELS[secId] || secId}</span>
          </div>
          <div class="section-item-actions">
            <button type="button" class="btn-tool btn-sec-up" data-index="${index}" ${index === 0 ? 'disabled' : ''} title="Move Up">↑</button>
            <button type="button" class="btn-tool btn-sec-down" data-index="${index}" ${index === order.length - 1 ? 'disabled' : ''} title="Move Down">↓</button>
            <label style="display:inline-flex;align-items:center;gap:4px;font-size:0.75rem;cursor:pointer;">
              <input type="checkbox" class="toggle-sec-vis" data-sec-id="${secId}" ${visible ? 'checked' : ''} />
              <span>${visible ? 'Visible' : 'Hidden'}</span>
            </label>
          </div>
        </li>
      `;
    })
    .join('');

  listEl.querySelectorAll('.btn-sec-up').forEach((btn) => {
    btn.onclick = () => {
      const idx = Number(btn.getAttribute('data-index'));
      if (idx > 0) {
        pushUndoState();
        const arr = [...draftSettings.sectionOrder];
        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
        draftSettings.sectionOrder = arr;
        syncControlsFromState();
      }
    };
  });

  listEl.querySelectorAll('.btn-sec-down').forEach((btn) => {
    btn.onclick = () => {
      const idx = Number(btn.getAttribute('data-index'));
      const arr = [...draftSettings.sectionOrder];
      if (idx < arr.length - 1) {
        pushUndoState();
        [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
        draftSettings.sectionOrder = arr;
        syncControlsFromState();
      }
    };
  });

  listEl.querySelectorAll('.toggle-sec-vis').forEach((chk) => {
    chk.onchange = () => {
      const secId = chk.getAttribute('data-sec-id');
      if (!secId) return;
      pushUndoState();
      draftSettings.sectionVisibility[secId] = chk.checked;
      syncControlsFromState();
    };
  });

  let draggedIdx = null;
  listEl.querySelectorAll('.sortable-section-item').forEach((item) => {
    item.addEventListener('dragstart', () => {
      draggedIdx = Number(item.getAttribute('data-index'));
      item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
    });
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetIdx = Number(item.getAttribute('data-index'));
      if (draggedIdx === null || draggedIdx === targetIdx) return;
      pushUndoState();
      const arr = [...draftSettings.sectionOrder];
      const [moved] = arr.splice(draggedIdx, 1);
      arr.splice(targetIdx, 0, moved);
      draftSettings.sectionOrder = arr;
      syncControlsFromState();
    });
  });
}

// Render Selected Work Timeline Strip (V1 & G1 Tiles) Manager
function renderAdminWorksList() {
  const container = document.getElementById('admin-works-list');
  if (!container) return;

  draftWorks.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  container.innerHTML = draftWorks
    .map(
      (tile, idx) => `
      <div class="admin-project-card" data-work-id="${escapeAttr(tile.id)}">
        <div class="admin-project-header">
          <strong>${escapeAttr(tile.track || 'V1')} · ${escapeAttr(tile.label)}</strong>
          <div class="section-item-actions">
            <button type="button" class="btn-tool work-up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="btn-tool work-down" data-idx="${idx}" ${idx === draftWorks.length - 1 ? 'disabled' : ''}>↓</button>
            <label style="font-size:0.75rem;display:inline-flex;align-items:center;gap:4px;">
              <input type="checkbox" class="work-vis" data-idx="${idx}" ${tile.visible !== false ? 'checked' : ''} />
              <span>Show</span>
            </label>
            <button type="button" class="btn-tool work-del" data-idx="${idx}" style="color:#ff8a96;">Delete</button>
          </div>
        </div>

        <div class="form-grid-2">
          <label class="field-label">
            <span>Track</span>
            <select class="field-input work-field" data-idx="${idx}" data-key="track">
              <option value="V1" ${tile.track === 'V1' ? 'selected' : ''}>V1 · Video (16:9)</option>
              <option value="G1" ${tile.track === 'G1' ? 'selected' : ''}>G1 · Graphic Design (1:1)</option>
            </select>
          </label>
          <label class="field-label">
            <span>Duration Badge (V1 only)</span>
            <input type="text" class="field-input work-field" data-idx="${idx}" data-key="duration" placeholder="e.g. 01:20" value="${escapeAttr(tile.duration || '')}" />
          </label>
        </div>

        <label class="field-label">
          <span>Tile Label</span>
          <input type="text" class="field-input work-field" data-idx="${idx}" data-key="label" value="${escapeAttr(tile.label || '')}" />
        </label>

        <label class="field-label">
          <span>Thumbnail Image URL or Upload File</span>
          <div class="upload-row">
            <input type="text" class="field-input work-field" data-idx="${idx}" data-key="thumbnailUrl" value="${escapeAttr(tile.thumbnailUrl || '')}" />
            <input type="file" accept="image/*" class="file-input-compact work-upload-thumb" data-idx="${idx}" />
          </div>
        </label>

        <label class="field-label">
          <span>${tile.track === 'V1' ? 'Lightbox Video URL or Upload Video' : 'Lightbox Full Image URL or Upload Image'}</span>
          <div class="upload-row">
            <input type="text" class="field-input work-field" data-idx="${idx}" data-key="mediaUrl" value="${escapeAttr(tile.mediaUrl || '')}" />
            <input type="file" accept="${tile.track === 'V1' ? 'video/*' : 'image/*'}" class="file-input-compact work-upload-media" data-idx="${idx}" />
          </div>
        </label>
      </div>
    `
    )
    .join('');

  container.querySelectorAll('.work-field').forEach((input) => {
    input.addEventListener('input', () => {
      const idx = Number(input.getAttribute('data-idx'));
      const key = input.getAttribute('data-key');
      if (!draftWorks[idx] || !key) return;
      pushUndoState();
      draftWorks[idx][key] = input.value;
      if (key === 'track') {
        syncControlsFromState();
      } else {
        broadcastToLivePreview();
      }
    });
  });

  container.querySelectorAll('.work-vis').forEach((chk) => {
    chk.addEventListener('change', () => {
      const idx = Number(chk.getAttribute('data-idx'));
      if (!draftWorks[idx]) return;
      pushUndoState();
      draftWorks[idx].visible = chk.checked;
      broadcastToLivePreview();
    });
  });

  container.querySelectorAll('.work-up').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-idx'));
      if (idx > 0) {
        pushUndoState();
        [draftWorks[idx - 1], draftWorks[idx]] = [draftWorks[idx], draftWorks[idx - 1]];
        draftWorks.forEach((w, i) => (w.order = i + 1));
        syncControlsFromState();
      }
    });
  });

  container.querySelectorAll('.work-down').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-idx'));
      if (idx < draftWorks.length - 1) {
        pushUndoState();
        [draftWorks[idx + 1], draftWorks[idx]] = [draftWorks[idx], draftWorks[idx + 1]];
        draftWorks.forEach((w, i) => (w.order = i + 1));
        syncControlsFromState();
      }
    });
  });

  container.querySelectorAll('.work-del').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-idx'));
      if (!draftWorks[idx]) return;
      pushUndoState();
      draftWorks.splice(idx, 1);
      draftWorks.forEach((w, i) => (w.order = i + 1));
      syncControlsFromState();
    });
  });

  container.querySelectorAll('.work-upload-thumb').forEach((fileInput) => {
    fileInput.addEventListener('change', async () => {
      const idx = Number(fileInput.getAttribute('data-idx'));
      const file = fileInput.files?.[0];
      if (!file || !draftWorks[idx]) return;
      try {
        setStatusBadge('Uploading tile thumbnail...', true);
        const url = await uploadMediaFile(file, `portfolio_uploads/works/${draftWorks[idx].id}_thumb_${Date.now()}_${file.name}`);
        pushUndoState();
        draftWorks[idx].thumbnailUrl = url;
        syncControlsFromState();
        setStatusBadge('Tile thumbnail uploaded');
      } catch (err) {
        setStatusBadge('Upload failed: ' + err.message, true);
      }
    });
  });

  container.querySelectorAll('.work-upload-media').forEach((fileInput) => {
    fileInput.addEventListener('change', async () => {
      const idx = Number(fileInput.getAttribute('data-idx'));
      const file = fileInput.files?.[0];
      if (!file || !draftWorks[idx]) return;
      try {
        setStatusBadge('Uploading tile media...', true);
        const url = await uploadMediaFile(file, `portfolio_uploads/works/${draftWorks[idx].id}_media_${Date.now()}_${file.name}`);
        pushUndoState();
        draftWorks[idx].mediaUrl = url;
        syncControlsFromState();
        setStatusBadge('Tile media uploaded');
      } catch (err) {
        setStatusBadge('Media upload failed: ' + err.message, true);
      }
    });
  });
}

// Render Add/Edit/Delete/Reorder Projects Manager
function renderAdminProjectsList() {
  const container = document.getElementById('admin-projects-list');
  if (!container) return;

  draftProjects.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  container.innerHTML = draftProjects
    .map(
      (proj, idx) => `
      <div class="admin-project-card" data-proj-id="${proj.id}">
        <div class="admin-project-header">
          <strong>#${idx + 1} · ${escapeAttr(proj.title)}</strong>
          <div class="section-item-actions">
            <button type="button" class="btn-tool proj-up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="btn-tool proj-down" data-idx="${idx}" ${idx === draftProjects.length - 1 ? 'disabled' : ''}>↓</button>
            <label style="font-size:0.75rem;display:inline-flex;align-items:center;gap:4px;">
              <input type="checkbox" class="proj-vis" data-idx="${idx}" ${proj.visible !== false ? 'checked' : ''} />
              <span>Show</span>
            </label>
            <button type="button" class="btn-tool proj-del" data-idx="${idx}" style="color:#ff8a96;">Delete</button>
          </div>
        </div>

        <div class="form-grid-2">
          <label class="field-label">
            <span>Project Title</span>
            <input type="text" class="field-input proj-field" data-idx="${idx}" data-key="title" value="${escapeAttr(proj.title)}" />
          </label>
          <label class="field-label">
            <span>Category</span>
            <select class="field-input proj-field" data-idx="${idx}" data-key="category">
              <option value="video-editing" ${proj.category === 'video-editing' ? 'selected' : ''}>Video Editing</option>
              <option value="graphic-design" ${proj.category === 'graphic-design' ? 'selected' : ''}>Graphic Design</option>
              <option value="motion-graphics" ${proj.category === 'motion-graphics' ? 'selected' : ''}>Motion Graphics</option>
            </select>
          </label>
        </div>

        <label class="field-label">
          <span>Thumbnail Image URL or Upload File</span>
          <div class="upload-row">
            <input type="text" class="field-input proj-field" data-idx="${idx}" data-key="thumbnailUrl" value="${escapeAttr(proj.thumbnailUrl || '')}" />
            <input type="file" accept="image/*" class="file-input-compact proj-upload-thumb" data-idx="${idx}" />
          </div>
        </label>

        <div class="form-grid-2">
          <label class="field-label">
            <span>Video Lightbox URL or Upload MP4/WebM</span>
            <div class="upload-row">
              <input type="text" class="field-input proj-field" data-idx="${idx}" data-key="videoUrl" value="${escapeAttr(proj.videoUrl || '')}" />
              <input type="file" accept="video/*" class="file-input-compact proj-upload-video" data-idx="${idx}" />
            </div>
          </label>
          <label class="field-label">
            <span>Behance / External Link</span>
            <input type="text" class="field-input proj-field" data-idx="${idx}" data-key="behanceUrl" value="${escapeAttr(proj.behanceUrl || '')}" />
          </label>
        </div>

        <label class="field-label">
          <span>Problem (Line 1)</span>
          <input type="text" class="field-input proj-field" data-idx="${idx}" data-key="problem" value="${escapeAttr(proj.problem || '')}" />
        </label>
        <label class="field-label">
          <span>My Process (Line 2)</span>
          <input type="text" class="field-input proj-field" data-idx="${idx}" data-key="process" value="${escapeAttr(proj.process || '')}" />
        </label>
        <label class="field-label">
          <span>Result (Line 3)</span>
          <input type="text" class="field-input proj-field" data-idx="${idx}" data-key="result" value="${escapeAttr(proj.result || '')}" />
        </label>
      </div>
    `
    )
    .join('');

  container.querySelectorAll('.proj-field').forEach((input) => {
    input.addEventListener('input', () => {
      const idx = Number(input.getAttribute('data-idx'));
      const key = input.getAttribute('data-key');
      if (!draftProjects[idx] || !key) return;
      pushUndoState();
      draftProjects[idx][key] = input.value;
      broadcastToLivePreview();
    });
  });

  container.querySelectorAll('.proj-vis').forEach((chk) => {
    chk.addEventListener('change', () => {
      const idx = Number(chk.getAttribute('data-idx'));
      if (!draftProjects[idx]) return;
      pushUndoState();
      draftProjects[idx].visible = chk.checked;
      broadcastToLivePreview();
    });
  });

  container.querySelectorAll('.proj-up').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-idx'));
      if (idx > 0) {
        pushUndoState();
        [draftProjects[idx - 1], draftProjects[idx]] = [draftProjects[idx], draftProjects[idx - 1]];
        draftProjects.forEach((p, i) => (p.order = i + 1));
        syncControlsFromState();
      }
    });
  });

  container.querySelectorAll('.proj-down').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-idx'));
      if (idx < draftProjects.length - 1) {
        pushUndoState();
        [draftProjects[idx + 1], draftProjects[idx]] = [draftProjects[idx], draftProjects[idx + 1]];
        draftProjects.forEach((p, i) => (p.order = i + 1));
        syncControlsFromState();
      }
    });
  });

  container.querySelectorAll('.proj-del').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-idx'));
      const target = draftProjects[idx];
      if (!target) return;
      pushUndoState();
      draftProjects.splice(idx, 1);
      draftProjects.forEach((p, i) => (p.order = i + 1));
      syncControlsFromState();
    });
  });

  container.querySelectorAll('.proj-upload-thumb').forEach((fileInput) => {
    fileInput.addEventListener('change', async () => {
      const idx = Number(fileInput.getAttribute('data-idx'));
      const file = fileInput.files?.[0];
      if (!file || !draftProjects[idx]) return;
      try {
        setStatusBadge('Uploading thumbnail...', true);
        const url = await uploadMediaFile(file, `portfolio_uploads/projects/${draftProjects[idx].id}_${Date.now()}_${file.name}`);
        pushUndoState();
        draftProjects[idx].thumbnailUrl = url;
        syncControlsFromState();
        setStatusBadge('Thumbnail uploaded');
      } catch (err) {
        setStatusBadge('Upload failed: ' + err.message, true);
      }
    });
  });

  container.querySelectorAll('.proj-upload-video').forEach((fileInput) => {
    fileInput.addEventListener('change', async () => {
      const idx = Number(fileInput.getAttribute('data-idx'));
      const file = fileInput.files?.[0];
      if (!file || !draftProjects[idx]) return;
      try {
        setStatusBadge('Uploading video...', true);
        const url = await uploadMediaFile(file, `portfolio_uploads/videos/${draftProjects[idx].id}_${Date.now()}_${file.name}`);
        pushUndoState();
        draftProjects[idx].videoUrl = url;
        syncControlsFromState();
        setStatusBadge('Video uploaded');
      } catch (err) {
        setStatusBadge('Video upload failed: ' + err.message, true);
      }
    });
  });
}

function escapeAttr(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function uploadMediaFile(file, path) {
  const fileRef = storageRef(storage, path);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}

// Save Snapshot to `siteVersions` (Keep only the last 10 versions)
async function recordVersionSnapshot(label) {
  const versionId = `ver_${Date.now()}`;
  const snapshotDoc = {
    label: `${label} (${new Date().toLocaleTimeString()})`,
    createdAt: new Date().toISOString(),
    siteSettings: structuredClone(draftSettings),
    works: structuredClone(draftWorks),
    projects: structuredClone(draftProjects)
  };

  await setDoc(doc(db, 'siteVersions', versionId), snapshotDoc);
  await loadVersionHistory();
}

async function loadVersionHistory() {
  const selectEl = document.getElementById('select-version-restore');
  if (!selectEl) return;

  try {
    const q = query(collection(db, 'siteVersions'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Keep only the newest 10 versions in Firestore
    if (docs.length > 10) {
      const older = docs.slice(10);
      for (const oldVer of older) {
        await deleteDoc(doc(db, 'siteVersions', oldVer.id));
      }
    }

    versionHistory = docs.slice(0, 10);
    selectEl.innerHTML =
      `<option value="">Restore Version (${versionHistory.length}/10 saved)...</option>` +
      versionHistory
        .map((v, i) => `<option value="${i}">${escapeAttr(v.label)}</option>`)
        .join('');
  } catch (err) {
    console.warn('Could not load version history:', err.message);
  }
}

// Save Draft to Firestore (`siteSettings/draft`)
async function handleSaveDraft() {
  try {
    setStatusBadge('Saving draft...', true);
    const payload = {
      ...draftSettings,
      status: 'draft',
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'siteSettings', 'draft'), payload);
    await recordVersionSnapshot('Draft Saved');
    setStatusBadge('Draft saved to Firestore');
  } catch (err) {
    setStatusBadge('Draft save error: ' + err.message, true);
  }
}

// Publish to Live (`siteSettings/published` + `works` + `projects` collections)
async function handlePublishLive() {
  try {
    setStatusBadge('Publishing live...', true);
    const now = new Date().toISOString();

    const publishedSettings = {
      ...draftSettings,
      status: 'published',
      updatedAt: now
    };

    await setDoc(doc(db, 'siteSettings', 'published'), publishedSettings);
    await setDoc(doc(db, 'siteSettings', 'draft'), { ...publishedSettings, status: 'draft' });

    // Sync `works` timeline strip collection
    const existingWorksSnap = await getDocs(collection(db, 'works'));
    const currentWorkIds = new Set(draftWorks.map((w) => w.id));

    for (const d of existingWorksSnap.docs) {
      if (!currentWorkIds.has(d.id)) {
        await deleteDoc(doc(db, 'works', d.id));
      }
    }

    for (let i = 0; i < draftWorks.length; i++) {
      const w = draftWorks[i];
      const workId = (w.id || `work_${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      await setDoc(doc(db, 'works', workId), {
        track: w.track === 'G1' ? 'G1' : 'V1',
        label: String(w.label || 'Untitled Tile').slice(0, 120),
        duration: String(w.duration || '').slice(0, 32),
        thumbnailUrl: String(w.thumbnailUrl || '').slice(0, 2000),
        mediaUrl: String(w.mediaUrl || '').slice(0, 2000),
        order: i + 1,
        visible: w.visible !== false,
        status: 'published',
        updatedAt: now
      });
    }

    // Sync `projects` collection
    const existingSnap = await getDocs(collection(db, 'projects'));
    const currentIds = new Set(draftProjects.map((p) => p.id));

    for (const d of existingSnap.docs) {
      if (!currentIds.has(d.id)) {
        await deleteDoc(doc(db, 'projects', d.id));
      }
    }

    for (let i = 0; i < draftProjects.length; i++) {
      const p = draftProjects[i];
      const projId = (p.id || `proj_${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      await setDoc(doc(db, 'projects', projId), {
        title: String(p.title || 'Untitled Project').slice(0, 200),
        category: ['video-editing', 'graphic-design', 'motion-graphics'].includes(p.category)
          ? p.category
          : 'video-editing',
        thumbnailUrl: String(p.thumbnailUrl || '').slice(0, 2000),
        videoUrl: String(p.videoUrl || '').slice(0, 2000),
        behanceUrl: String(p.behanceUrl || '').slice(0, 2000),
        problem: String(p.problem || '').slice(0, 1000),
        process: String(p.process || '').slice(0, 1000),
        result: String(p.result || '').slice(0, 1000),
        order: i + 1,
        visible: p.visible !== false,
        status: 'published',
        updatedAt: now
      });
    }

    await recordVersionSnapshot('Published Live');
    setStatusBadge('Published live to public site!');
  } catch (err) {
    setStatusBadge('Publish failed: ' + err.message, true);
  }
}

// Load initial Draft/Published state from Firestore
async function loadAdminDataFromFirestore() {
  try {
    setStatusBadge('Loading Firestore data...', true);
    const draftSnap = await getDoc(doc(db, 'siteSettings', 'draft'));
    const pubSnap = await getDoc(doc(db, 'siteSettings', 'published'));

    if (draftSnap.exists()) {
      draftSettings = mergeSiteSettings(draftSnap.data());
    } else if (pubSnap.exists()) {
      draftSettings = mergeSiteSettings(pubSnap.data());
    }

    const worksSnap = await getDocs(collection(db, 'works'));
    if (!worksSnap.empty) {
      draftWorks = worksSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    }

    const projSnap = await getDocs(collection(db, 'projects'));
    if (!projSnap.empty) {
      draftProjects = projSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    }

    await loadVersionHistory();
    syncControlsFromState();
    setStatusBadge('Loaded from Firestore');
  } catch (err) {
    console.warn('Using default fallback in admin:', err);
    syncControlsFromState();
    setStatusBadge('Loaded safe default data');
  }
}

// Wire Admin Event Listeners
function initAdminConsole() {
  const authGate = document.getElementById('admin-auth-gate');
  const workspace = document.getElementById('admin-workspace');
  const errorBox = document.getElementById('auth-error-box');

  const showAuthError = (msg) => {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.removeAttribute('hidden');
  };

  // Auth State Listener (Strictly restricted to sbmc.3925@gmail.com)
  onAuthStateChanged(auth, async (user) => {
    if (user && user.email && user.email.toLowerCase() === ALLOWED_OWNER_EMAIL.toLowerCase()) {
      authGate?.setAttribute('hidden', '');
      workspace?.removeAttribute('hidden');
      await loadAdminDataFromFirestore();
    } else {
      if (user) {
        await signOut(auth);
        showAuthError(`Access denied for ${user.email}. Only ${ALLOWED_OWNER_EMAIL} is authorized.`);
      }
      workspace?.setAttribute('hidden', '');
      authGate?.removeAttribute('hidden');
    }
  });

  // Google Login
  document.getElementById('btn-google-login')?.addEventListener('click', async () => {
    try {
      errorBox?.setAttribute('hidden', '');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      showAuthError(err.message);
    }
  });

  // Email Login
  document.getElementById('form-email-login')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      errorBox?.setAttribute('hidden', '');
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      showAuthError(err.message);
    }
  });

  // Sign Out
  document.getElementById('btn-logout')?.addEventListener('click', () => signOut(auth));

  // Admin Sidebar Tabs
  const tabs = document.querySelectorAll('.admin-tab');
  const panels = document.querySelectorAll('.admin-tab-panel');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      panels.forEach((p) => {
        if (p.id === targetId) p.removeAttribute('hidden');
        else p.setAttribute('hidden', '');
      });
    });
  });

  // Mobile Controls vs Live Preview Switcher
  const splitContainer = document.getElementById('admin-split-container');
  const btnMobControls = document.getElementById('btn-mobile-controls');
  const btnMobPreview = document.getElementById('btn-mobile-preview');
  btnMobControls?.addEventListener('click', () => {
    splitContainer?.classList.remove('show-preview');
    btnMobControls.classList.add('active');
    btnMobPreview?.classList.remove('active');
  });
  btnMobPreview?.addEventListener('click', () => {
    splitContainer?.classList.add('show-preview');
    btnMobPreview.classList.add('active');
    btnMobControls?.classList.remove('active');
    broadcastToLivePreview();
  });

  // Color Pickers
  const colorMap = {
    'color-bg-deep': 'bgDeep',
    'color-bg-primary': 'bgPrimary',
    'color-bg-elevated': 'bgElevated',
    'color-accent': 'accent',
    'color-text-primary': 'textPrimary',
    'color-text-muted': 'textMuted'
  };
  Object.entries(colorMap).forEach(([inputId, colorKey]) => {
    document.getElementById(inputId)?.addEventListener('input', (e) => {
      pushUndoState();
      draftSettings.colors[colorKey] = e.target.value;
      broadcastToLivePreview();
    });
  });

  // Font Dropdowns
  const fontMap = {
    'font-display': 'display',
    'font-sans': 'sans',
    'font-serif': 'serif'
  };
  Object.entries(fontMap).forEach(([selectId, fontKey]) => {
    document.getElementById(selectId)?.addEventListener('change', (e) => {
      pushUndoState();
      draftSettings.fonts[fontKey] = e.target.value;
      broadcastToLivePreview();
    });
  });

  // Editable Text & Link Inputs
  document.querySelectorAll('[data-text-key]').forEach((input) => {
    input.addEventListener('input', () => {
      const key = input.getAttribute('data-text-key');
      if (!key) return;
      pushUndoState();
      draftSettings.texts[key] = input.value;
      broadcastToLivePreview();
    });
  });

  // Hero & About Image File Uploads
  document.getElementById('upload-hero-portrait')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setStatusBadge('Uploading hero image...', true);
      const url = await uploadMediaFile(file, `portfolio_uploads/profile/hero_${Date.now()}_${file.name}`);
      pushUndoState();
      draftSettings.texts.heroPortraitUrl = url;
      syncControlsFromState();
      setStatusBadge('Hero image uploaded');
    } catch (err) {
      setStatusBadge('Upload failed: ' + err.message, true);
    }
  });

  document.getElementById('upload-about-photo')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setStatusBadge('Uploading about photo...', true);
      const url = await uploadMediaFile(file, `portfolio_uploads/profile/about_${Date.now()}_${file.name}`);
      pushUndoState();
      draftSettings.texts.aboutPhotoUrl = url;
      syncControlsFromState();
      setStatusBadge('About photo uploaded');
    } catch (err) {
      setStatusBadge('Upload failed: ' + err.message, true);
    }
  });

  // Add V1 Video Tile & G1 Graphic Tile Buttons
  document.getElementById('btn-add-work-v1')?.addEventListener('click', () => {
    pushUndoState();
    draftWorks.push({
      id: `work_v1_${Date.now()}`,
      track: 'V1',
      label: 'New Video Edit',
      duration: '01:00',
      thumbnailUrl: './assets/jaber_hero.png',
      mediaUrl: 'https://www.facebook.com/share/p/1DNfXJTmTK/',
      order: draftWorks.length + 1,
      visible: true,
      status: 'draft'
    });
    syncControlsFromState();
  });

  document.getElementById('btn-add-work-g1')?.addEventListener('click', () => {
    pushUndoState();
    draftWorks.push({
      id: `work_g1_${Date.now()}`,
      track: 'G1',
      label: 'New Design Tile',
      duration: '',
      thumbnailUrl: './assets/jaber_about.png',
      mediaUrl: './assets/jaber_about.png',
      order: draftWorks.length + 1,
      visible: true,
      status: 'draft'
    });
    syncControlsFromState();
  });

  // Add Project Button
  document.getElementById('btn-add-project')?.addEventListener('click', () => {
    pushUndoState();
    draftProjects.push({
      id: `proj_${Date.now()}`,
      title: 'New Case-Study Project',
      category: 'video-editing',
      thumbnailUrl: './assets/jaber_hero.png',
      videoUrl: '',
      behanceUrl: 'https://www.behance.net/jaberhosain',
      problem: 'Describe the client challenge or problem here.',
      process: 'Describe the tools and creative process used.',
      result: 'Describe the measurable result delivered.',
      order: draftProjects.length + 1,
      visible: true,
      status: 'draft'
    });
    syncControlsFromState();
  });

  // Undo Button
  document.getElementById('btn-undo')?.addEventListener('click', () => {
    if (undoStack.length === 0) return;
    const prev = undoStack.pop();
    draftSettings = prev.siteSettings;
    draftWorks = prev.works || structuredClone(DEFAULT_WORKS);
    draftProjects = prev.projects;
    document.getElementById('btn-undo').disabled = undoStack.length === 0;
    syncControlsFromState();
    setStatusBadge('Undid last change');
  });

  // Restore Previous Version Dropdown (Last 10 versions)
  document.getElementById('select-version-restore')?.addEventListener('change', (e) => {
    const idx = e.target.value;
    if (idx === '') return;
    const chosen = versionHistory[Number(idx)];
    if (chosen) {
      pushUndoState();
      draftSettings = mergeSiteSettings(structuredClone(chosen.siteSettings));
      draftWorks = Array.isArray(chosen.works)
        ? structuredClone(chosen.works)
        : structuredClone(DEFAULT_WORKS);
      draftProjects = structuredClone(chosen.projects);
      syncControlsFromState();
      setStatusBadge(`Restored: ${chosen.label}`, true);
    }
    e.target.value = '';
  });

  // Save Draft & Publish Buttons
  document.getElementById('btn-save-draft')?.addEventListener('click', handleSaveDraft);
  document.getElementById('btn-publish-live')?.addEventListener('click', handlePublishLive);

  // Sync preview iframe once it finishes loading
  document.getElementById('live-preview-iframe')?.addEventListener('load', () => {
    broadcastToLivePreview();
  });
}

initAdminConsole();
