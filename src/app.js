// app.js - central script used by all pages

/* ---------- UTIL ---------- */
function getJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch(e){ return fallback; }
}
function saveJSON(key, obj){ localStorage.setItem(key, JSON.stringify(obj)); }

/* ---------- INDEX (plan + login) ---------- */
function choosePlan(plan){
  localStorage.setItem('selectedPlan', plan);
  const msg = document.getElementById('subscriptionMessage');
  if(!msg) return;

  if(plan==='Free'){ msg.textContent = 'Free plan selected — you may login.'; msg.style.color='green'; }
  else { msg.textContent = 'Premium selected — opening details...'; msg.style.color='blue'; window.location.href='premium-details.html'; }
}

const loginForm = document.getElementById('loginForm');
if(loginForm){
  loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const plan = localStorage.getItem('selectedPlan');

    const loginMsg = document.getElementById('loginMessage');
    if(!plan){ loginMsg.textContent='Please select Free or Premium plan'; loginMsg.style.color='red'; return; }
    if(plan==='Premium' && !localStorage.getItem('premiumActivated')){
      loginMsg.textContent='Complete premium activation first'; loginMsg.style.color='red'; return;
    }
    localStorage.setItem('userEmail', email);
    // clear prev subject selections
    localStorage.removeItem('selectedSubjects');
    loginMsg.textContent='Login successful';
    loginMsg.style.color='green';
    setTimeout(()=> window.location.href='role.html',700);
  });
}

/* ---------- ROLE PAGE ---------- */
function selectRole(role){
  localStorage.setItem('userRole', role);
  window.location.href = 'subjects.html';
}

/* ---------- SUBJECTS PAGE ---------- */
const ALL_SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','Computer Science','History','English','Economics'];

function renderSubjectsGrid(){
  const grid = document.getElementById('subjectsGrid');
  if(!grid) return;
  grid.innerHTML = '';
  const chosen = getJSON('selectedSubjects', []);
  ALL_SUBJECTS.forEach(sub => {
    const div = document.createElement('div');
    div.className = 'subject-card' + (chosen.includes(sub)?' selected':'');
    div.textContent = sub;
    div.onclick = ()=> toggleSubject(sub, div);
    grid.appendChild(div);
  });
}

function toggleSubject(sub, el){
  let chosen = getJSON('selectedSubjects', []);
  if(chosen.includes(sub)){ chosen = chosen.filter(s=>s!==sub); el.classList.remove('selected'); }
  else { chosen.push(sub); el.classList.add('selected'); }
  saveJSON('selectedSubjects', chosen);
}

function confirmSubjects(){
  const chosen = getJSON('selectedSubjects', []);
  const msg = document.getElementById('subMsg');
  if(!chosen || chosen.length===0){ msg.textContent='Please select at least one subject'; msg.style.color='red'; return; }
  msg.textContent = 'Subjects saved';
  msg.style.color='green';
  // route based on role
  const role = localStorage.getItem('userRole');
  if(role==='student') window.location.href='student_materials.html';
  else window.location.href='teacher_materials.html';
}

if(document.getElementById('subjectsGrid')) renderSubjectsGrid();

/* ---------- STUDENT PAGE (recommendations + search + camera) ---------- */

function makeRecommendations(){
  const list = document.getElementById('recommendations');
  if(!list) return;
  list.innerHTML = '';
  const chosen = getJSON('selectedSubjects', []);
  // simple recommendation logic: one recommended item per subject
  const recs = [];
  chosen.forEach(s=>{
    recs.push({title:`Intro to ${s}`, desc:`Basic resources for ${s}`});
    recs.push({title:`Advanced ${s} - Video`, desc:`Video lecture for ${s}`});
  });
  // show top 6
  recs.slice(0,6).forEach(r=>{
    const li = document.createElement('li');
    li.className = 'material-item';
    li.innerHTML = `<div class="meta"><strong>${r.title}</strong><span class="small">${r.desc}</span></div>
                    <div><button class="primary-btn" onclick='openMaterialPreview("${r.title}")'>Open</button></div>`;
    list.appendChild(li);
  });
}

function openMaterialPreview(title){
  alert('Preview: ' + title + '\n(placeholder page)');
}

/* SEARCH used by student and standalone search.html */
function searchFile(){
  const queryInput = document.getElementById('searchInput');
  const q = (queryInput? queryInput.value : document.getElementById('searchQuery')?.value) || '';
  const ql = q.trim().toLowerCase();
  const resultsEl = document.getElementById('resultContainer') || document.getElementById('searchResults') || document.getElementById('searchResultsMain');
  if(!resultsEl) return;
  resultsEl.innerHTML = '';

  const files = getJSON('uploadedFiles', []);
  const matched = files.filter(f => f.title.toLowerCase().includes(ql) || f.name.toLowerCase().includes(ql));
  if(matched.length===0){
    resultsEl.innerHTML = "<p>No results found.</p>";
    return;
  }
  matched.forEach(f=>{
    const card = document.createElement('div');
    card.className = 'card material-item';
    card.innerHTML = `<div class="meta"><strong>${f.title}</strong><span class="small">${f.name} - ${f.subject || ''}</span></div>
                      <div>
                        <a class="primary-btn" href="${f.content}" target="_blank">View</a>
                      </div>`;
    resultsEl.appendChild(card);
  });
}

/* Camera functionality (basic) */
let streamRef = null;
async function startCamera(){
  const vid = document.getElementById('video');
  if(!vid) return;
  try {
    streamRef = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    vid.srcObject = streamRef;
  } catch(e){
    document.getElementById('cameraMsg').textContent = 'Camera access denied or not available.';
  }
}
function stopCamera(){
  if(streamRef){
    streamRef.getTracks().forEach(t=>t.stop());
    streamRef = null;
    const vid = document.getElementById('video'); if(vid) vid.srcObject = null;
    document.getElementById('cameraMsg').textContent = 'Camera stopped.';
  }
}
function capturePhoto(){
  const vid = document.getElementById('video');
  if(!vid || !streamRef){ document.getElementById('cameraMsg').textContent = 'Camera not started.'; return; }
  const canvas = document.getElementById('snapshot');
  canvas.width = vid.videoWidth; canvas.height = vid.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/png');
  // placeholder "search by image" action: we just notify and pretend to search
  document.getElementById('cameraMsg').textContent = 'Captured — (mock) searching materials by image...';
  setTimeout(()=> {
    alert('Image-based search completed — no real image search implemented (placeholder).');
  }, 800);
}

/* ---------- TEACHER PAGE (upload/read/delete) ---------- */
function populateFileSubject(){
  const sel = document.getElementById('fileSubject');
  if(!sel) return;
  sel.innerHTML = '';
  ALL_SUBJECTS.forEach(s=>{
    const opt = document.createElement('option'); opt.value = s; opt.textContent = s; sel.appendChild(opt);
  });
}
if(document.getElementById('fileSubject')) populateFileSubject();

function uploadMaterial(){
  const fileEl = document.getElementById('fileInput');
  const title = document.getElementById('fileTitle').value.trim();
  const subj = document.getElementById('fileSubject').value;
  const msg = document.getElementById('uploadMsg');
  if(!fileEl.files.length){ msg.textContent='Choose a file'; msg.style.color='red'; return; }
  if(!title){ msg.textContent='Enter title'; msg.style.color='red'; return; }

  const file = fileEl.files[0];
  const reader = new FileReader();
  reader.onload = function(e){
    const files = getJSON('uploadedFiles', []);
    files.push({ title, name: file.name, type: file.type, content: e.target.result, subject: subj, uploadedAt: Date.now() });
    saveJSON('uploadedFiles', files);
    msg.textContent = 'Uploaded';
    msg.style.color = 'green';
    fileEl.value = ''; document.getElementById('fileTitle').value = '';
    renderTeacherMaterials();
  };
  reader.readAsDataURL(file);
}

function renderTeacherMaterials(){
  const list = document.getElementById('materialsList');
  if(!list) return;
  const files = getJSON('uploadedFiles', []);
  list.innerHTML = '';
  if(files.length===0){ list.innerHTML = '<li>No uploads yet</li>'; return; }
  files.forEach((f, idx)=>{
    const li = document.createElement('li');
    li.className = 'material-item';
    li.innerHTML = `<div class="meta"><strong>${f.title}</strong><span class="small">${f.name} • ${f.subject}</span></div>
                    <div>
                      <a class="primary-btn" href="${f.content}" target="_blank">Open</a>
                      <button class="secondary-btn" onclick="deleteMaterial(${idx})">Delete</button>
                    </div>`;
    list.appendChild(li);
  });
}
if(document.getElementById('materialsList')) renderTeacherMaterials();

function deleteMaterial(index){
  const files = getJSON('uploadedFiles', []);
  files.splice(index,1);
  saveJSON('uploadedFiles', files);
  renderTeacherMaterials();
}

/* ---------- SETTINGS ---------- */
function setTheme(t){
  if(t==='dark') document.documentElement.setAttribute('data-theme','dark');
  else document.documentElement.removeAttribute('data-theme');
  localStorage.setItem('uiTheme', t);
}
function loadSettings(){
  const name = localStorage.getItem('displayName'); if(name) document.getElementById('displayName').value = name;
  const theme = localStorage.getItem('uiTheme') || 'light'; setTheme(theme);
}
if(document.getElementById('displayName')) loadSettings();

function saveSettings(){
  const name = document.getElementById('displayName').value.trim();
  const fb = document.getElementById('feedback').value.trim();
  if(name) localStorage.setItem('displayName', name);
  if(fb) {
    const history = getJSON('feedbackList', []);
    history.push({ text: fb, at: Date.now() });
    saveJSON('feedbackList', history);
    document.getElementById('feedback').value = '';
  }
  document.getElementById('settingsMsg').textContent = 'Settings saved';
  document.getElementById('settingsMsg').style.color = 'green';
}

/* ---------- AUTO actions for pages on load ---------- */
window.addEventListener('load', ()=>{
  // If on student page, show recommendations and start camera permission prompt
  if(window.location.pathname.endsWith('student_materials.html')){
    makeRecommendations();
    startCamera().catch(()=>{}); // ignore errors
  }
  // If on teacher page, populate materials
  if(window.location.pathname.endsWith('teacher_materials.html')){
    populateFileSubject();
    renderTeacherMaterials();
  }
  // If on subjects page ensure grid rendered
  if(window.location.pathname.endsWith('subjects.html')){
    renderSubjectsGrid();
  }
  // Apply saved theme
  const t = localStorage.getItem('uiTheme') || 'light';
  setTheme(t);
});