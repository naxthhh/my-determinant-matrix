(function App() {
  const bg = document.getElementById('math-bg');
  const symbols = ['+', '-', '×', '=', '∑', 'π', '√', 'Δ', '∞', 'X', 'Y', '%', '∫', 'd/dx'];
  for(let i=0; i<35; i++){
    let el = document.createElement('div'); el.className = 'sym';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = `${Math.random() * 100}%`; el.style.fontSize = `${Math.random() * 20 + 20}px`;
    el.style.animationDuration = `${Math.random() * 20 + 25}s`;
    el.style.animationDelay = `${Math.random() * -45}s`;
    bg.appendChild(el);
  }

  let state = { A: { r: 3, c: 3 }, B: { r: 3, c: 3 } };

  const UI = {
    gridA: document.getElementById('grid-a'), gridB: document.getElementById('grid-b'),
    secMatrix: document.getElementById('matrix-section'), secResult: document.getElementById('result-section'),
    errMsg: document.getElementById('err-msg'), toast: document.getElementById('toast'),
    resTitle: document.getElementById('res-title'), resContent: document.getElementById('result-content'),
    resNote: document.getElementById('result-note')
  };

  let toastTimer;

  const showToast = (msg) => {
    UI.toast.textContent = msg; 
    UI.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => UI.toast.classList.remove('show'), 3000); 
  };

  const showError = (msg) => {
    UI.errMsg.innerHTML = msg; 
    UI.errMsg.style.display = 'block';
    showToast("JANGAN BIKIN EMOSI COBA 😡");
  };
  const hideError = () => UI.errMsg.style.display = 'none';

  const updateDisplay = () => {
    document.getElementById('disp-rA').textContent = state.A.r; document.getElementById('disp-cA').textContent = state.A.c;
    document.getElementById('disp-rB').textContent = state.B.r; document.getElementById('disp-cB').textContent = state.B.c;
  };

  ['A', 'B'].forEach(mat => {
    ['r', 'c'].forEach(dim => {
      document.getElementById(`${dim}${mat}-inc`).addEventListener('click', () => { if(state[mat][dim] < 8) { state[mat][dim]++; updateDisplay(); } });
      document.getElementById(`${dim}${mat}-dec`).addEventListener('click', () => { if(state[mat][dim] > 1) { state[mat][dim]--; updateDisplay(); } });
    });
  });

  const buildGrid = (element, rows, cols, idPrefix) => {
    element.innerHTML = ''; element.style.gridTemplateColumns = `repeat(${cols}, auto)`;
    for (let i = 0; i < rows * cols; i++) {
      let inp = document.createElement('input'); inp.type = 'number'; inp.className = `cell ${idPrefix}-cell`; inp.placeholder = '0'; inp.dataset.idx = i;
      inp.addEventListener('input', function() { this.classList.remove('err'); });
      inp.addEventListener('keydown', (e) => {
        let idx = parseInt(e.target.dataset.idx), cells = document.querySelectorAll(`.${idPrefix}-cell`);
        if (e.key === 'ArrowRight' && idx % cols !== cols - 1) cells[idx + 1]?.focus();
        if (e.key === 'ArrowLeft' && idx % cols !== 0) cells[idx - 1]?.focus();
        if (e.key === 'ArrowDown' && idx + cols < rows * cols) cells[idx + cols]?.focus();
        if (e.key === 'ArrowUp' && idx - cols >= 0) cells[idx - cols]?.focus();
        if (e.key === 'Enter') { e.preventDefault(); if (idx + 1 < rows * cols) cells[idx + 1].focus(); }
      });
      element.appendChild(inp);
    }
  };

  document.getElementById('btn-gen').addEventListener('click', () => {
    buildGrid(UI.gridA, state.A.r, state.A.c, 'matA'); buildGrid(UI.gridB, state.B.r, state.B.c, 'matB');
    UI.secMatrix.style.display = 'block'; UI.secResult.style.display = 'none'; hideError();
    setTimeout(() => UI.secMatrix.scrollIntoView({ behavior: 'smooth' }), 100);
  });

  const getMatrix = (prefix, rows, cols) => {
    let cells = document.querySelectorAll(`.${prefix}-cell`), matrix = [], isValid = true;
    for (let i = 0; i < rows; i++) {
      let row = [];
      for (let j = 0; j < cols; j++) {
        let val = parseFloat(cells[i * cols + j].value);
        if (isNaN(val)) { cells[i * cols + j].classList.add('err'); isValid = false; }
        row.push(isNaN(val) ? 0 : val);
      }
      matrix.push(row);
    }
    return { matrix, isValid };
  };

  //LOGIKA + & - DAN PERKALIAN

  const MathOp = {
    addSub: (m1, m2, isAdd) => m1.map((row, i) => row.map((val, j) => isAdd ? val + m2[i][j] : val - m2[i][j])),
    multiply: (m1, m2) => {
      let result = Array(m1.length).fill().map(() => Array(m2[0].length).fill(0));
      for(let i=0; i<m1.length; i++) for(let j=0; j<m2[0].length; j++) for(let k=0; k<m1[0].length; k++) result[i][j] += m1[i][k] * m2[k][j];
      return result;
    },
    determinant: (matrix) => {        // logika determinan
      let n = matrix.length; if(n===1) return matrix[0][0];
      let m = matrix.map(r => [...r]), det = 1;
      for (let i = 0; i < n; i++) {
        let p = i; for (let j = i+1; j < n; j++) if (Math.abs(m[j][i]) > Math.abs(m[p][i])) p = j;
        if (p !== i) { [m[i], m[p]] = [m[p], m[i]]; det *= -1; }
        if (m[i][i] === 0) return 0;
        det *= m[i][i];
        for (let j = i+1; j < n; j++) {
          let f = m[j][i] / m[i][i];
          for (let k = i+1; k < n; k++) m[j][k] -= f * m[i][k];
        }
      }
      return det;
    }
  };

  const renderResult = (title, contentHTML, note = "") => {
    hideError(); 
    UI.resTitle.textContent = title; 
    UI.resContent.innerHTML = contentHTML; 
    if (UI.resNote) UI.resNote.innerHTML = note;
    UI.secResult.style.display = 'block'; 
    setTimeout(() => UI.secResult.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const renderMatrixGrid = (matrix) => {
    let html = `<div class="res-grid" style="grid-template-columns: repeat(${matrix[0].length}, auto)">`;
    matrix.forEach(row => row.forEach(val => { let rounded = Math.round(val * 10000) / 10000; html += `<div class="res-cell">${Number.isInteger(rounded) ? rounded : rounded.toFixed(3)}</div>`; }));
    return html + `</div>`;
  };

  document.getElementById('btn-add').addEventListener('click', () => executeOp('add'));
  document.getElementById('btn-sub').addEventListener('click', () => executeOp('sub'));
  document.getElementById('btn-mul').addEventListener('click', () => executeOp('mul'));

  const executeOp = (type) => {
    let dataA = getMatrix('matA', state.A.r, state.A.c), dataB = getMatrix('matB', state.B.r, state.B.c);
    if(!dataA.isValid || !dataB.isValid) return showError("ISI YANG BENER WOE!!!");

    let A = dataA.matrix, B = dataB.matrix;

    if (type === 'add' || type === 'sub') {
      if(state.A.r !== state.B.r || state.A.c !== state.B.c) return showError(`Ordo Matriks A harus sama kaya B.`);
      renderResult(`Matriks A ${type === 'add' ? '+' : '−'} Matriks B`, renderMatrixGrid(MathOp.addSub(A, B, type === 'add')));
    }
    
    if (type === 'mul') {
      if(state.A.c !== state.B.r) return showError(`Kolom A harus sama kaya Baris B.`);
      renderResult(`Matriks A × Matriks B`, renderMatrixGrid(MathOp.multiply(A, B)));
    }
  };

  ['A', 'B'].forEach(mat => {
    document.getElementById(`btn-det${mat}`).addEventListener('click', () => {
      let data = getMatrix(`mat${mat}`, state[mat].r, state[mat].c);
      if(!data.isValid) return showError(`ISI YANG BENER WOE!!!`);
      if(state[mat].r !== state[mat].c) return showError(`HARUS PERSEGI MATRIKSNYA WOE!!!`);
      
      let rounded = Math.round(MathOp.determinant(data.matrix) * 10000) / 10000;
      
      let pesanInvers = (rounded !== 0) 
        ? "<div style='margin-top: 15px; font-size: 1.1rem; font-weight: 700; color: #2a8a5a;'>MATRIKSNYA PUNYA INVERS 🤘😝🤘</div>" 
        : "<div style='margin-top: 15px; font-size: 1.1rem; font-weight: 700; color: #c62828;'>MATRIKSNYA GA PUNYA INVERS 🤘😝🤘</div>";
      
      let gabunganHTML = `<div class="result-num">${rounded}</div>` + pesanInvers;
      
      renderResult(`Determinan Matriks ${mat}`, gabunganHTML);
    });
  });

  document.getElementById('btn-rand').addEventListener('click', () => {
    document.querySelectorAll('.cell').forEach(c => { c.value = Math.floor(Math.random() * 20) - 10; c.classList.remove('err'); });  // logika random matriks
    showToast("Angkanya diacak kaya hidup kamu yang acak-acakan, EHH UPSS");
  });

  document.getElementById('btn-iden').addEventListener('click', () => {
    let applied = false;
    ['matA', 'matB'].forEach((prefix, idx) => {
      let r = state[idx===0?'A':'B'].r, c = state[idx===0?'A':'B'].c;
      if (r === c) {
        let cells = document.querySelectorAll(`.${prefix}-cell`);
        for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) { cells[i * c + j].value = (i === j) ? 1 : 0; cells[i * c + j].classList.remove('err'); }
        applied = true;
      }
    });
    if(applied) showToast("Matriks Identitas DONE BANG! 😎");
    else showToast("IDENTITAS CUMA BISA MATRIKS PERSEGI!!!");
  });

  document.getElementById('btn-clr').addEventListener('click', () => {
    document.querySelectorAll('.cell').forEach(c => { c.value = ''; c.classList.remove('err'); });
    UI.secResult.style.display = 'none'; hideError();
  });

  updateDisplay();

  const bgMusic = document.getElementById('bg-music');
  bgMusic.volume = 1.0; 
  function initAudio() {
    bgMusic.play().then(() => {
      ['click', 'keydown', 'touchstart'].forEach(e => document.body.removeEventListener(e, initAudio));
    }).catch(err => console.warn("Nunggu trigger dari user."));
  }
  ['click', 'keydown', 'touchstart'].forEach(e => document.body.addEventListener(e, initAudio));
})();