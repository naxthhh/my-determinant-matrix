(function App() {
  const bg = document.getElementById('math-bg');
  const symbols = ['+', '-', '×', '÷', '=', '∑', 'π', '√', 'Δ', '∞', 'X', 'Y', '%', '∫', 'd/dx', 'a²', 'b³'];
  
  const numberOfSymbols = 35; 

  for(let i = 0; i < numberOfSymbols; i++) {
    let el = document.createElement('div');
    el.className = 'sym';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    
    el.style.left = `${Math.random() * 100}%`;
    el.style.fontSize = `${Math.random() * 20 + 20}px`;
    
    let duration = Math.random() * 20 + 25; 
    
    let delay = Math.random() * -45; 
    
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${delay}s`;
    
    bg.appendChild(el);
  }


  let order = 3;

  const UI = {
    dispOrder: document.getElementById('order-display'),
    grid: document.getElementById('m-grid'),
    secMatrix: document.getElementById('matrix-section'),
    secResult: document.getElementById('result-section'),
    errMsg: document.getElementById('err-msg'),
    resNum: document.getElementById('result-num'),
    resNote: document.getElementById('result-note'),
    toast: document.getElementById('toast')
  };

  let toastTimer;

  function showToast(msg) {
    UI.toast.textContent = msg;
    UI.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => UI.toast.classList.remove('show'), 2500);
  }

  function updateOrderDisplay() {
    UI.dispOrder.textContent = order;
  }

  function generateGrid() {
    UI.grid.innerHTML = '';
    UI.grid.style.gridTemplateColumns = `repeat(${order}, auto)`;
    
    for (let i = 0; i < order * order; i++) {
      let inp = document.createElement('input');
      inp.type = 'number';
      inp.className = 'cell';
      inp.placeholder = '0';
      inp.dataset.idx = i;
      
      inp.addEventListener('input', function() { this.classList.remove('err'); });
      
      inp.addEventListener('keydown', (e) => {
        let idx = parseInt(e.target.dataset.idx);
        let cells = document.querySelectorAll('.cell');
        
        if (e.key === 'ArrowRight' && idx % order !== order - 1) cells[idx + 1]?.focus();
        if (e.key === 'ArrowLeft' && idx % order !== 0) cells[idx - 1]?.focus();
        if (e.key === 'ArrowDown' && idx + order < order * order) cells[idx + order]?.focus();
        if (e.key === 'ArrowUp' && idx - order >= 0) cells[idx - order]?.focus();
        
        if (e.key === 'Enter') {
          e.preventDefault(); 
          
          if (idx + 1 < order * order) {
            cells[idx + 1].focus(); 
          } else {
            document.getElementById('btn-calc').focus();
          }
        }
      });

      UI.grid.appendChild(inp);
    }
  }

  function getMatrixValues() {
    let cells = document.querySelectorAll('.cell');
    let matrix = [];
    let isValid = true;

    for (let i = 0; i < order; i++) {
      let row = [];
      for (let j = 0; j < order; j++) {
        let cell = cells[i * order + j];
        let val = parseFloat(cell.value);
        if (isNaN(val)) {
          cell.classList.add('err');
          isValid = false;
        }
        row.push(isNaN(val) ? 0 : val);
      }
      matrix.push(row);
    }
    return { matrix, isValid };
  }

  function calculateDeterminant(matrix, n) {
    if (n === 1) return matrix[0][0];
    
    let m = matrix.map(row => [...row]); 
    let det = 1;

    for (let i = 0; i < n; i++) {
      let pivotRow = i;
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(m[j][i]) > Math.abs(m[pivotRow][i])) pivotRow = j;
      }
      
      if (pivotRow !== i) {
        [m[i], m[pivotRow]] = [m[pivotRow], m[i]];
        det *= -1;
      }
      
      if (m[i][i] === 0) return 0;
      
      det *= m[i][i];
      
      for (let j = i + 1; j < n; j++) {
        let factor = m[j][i] / m[i][i];
        for (let k = i + 1; k < n; k++) {
          m[j][k] -= factor * m[i][k];
        }
      }
    }
    return det;
  }

  document.getElementById('btn-dec').addEventListener('click', () => { if (order > 1) { order--; updateOrderDisplay(); }});
  document.getElementById('btn-inc').addEventListener('click', () => { if (order < 8) { order++; updateOrderDisplay(); }});
  
  document.getElementById('btn-gen').addEventListener('click', () => {
    generateGrid();
    UI.secMatrix.style.display = 'block';
    UI.secResult.style.display = 'none';
    UI.errMsg.style.display = 'none';
    setTimeout(() => UI.secMatrix.scrollIntoView({ behavior: 'smooth' }), 100);
  });

  document.getElementById('btn-rand').addEventListener('click', () => {
    document.querySelectorAll('.cell').forEach(c => {
      c.value = Math.floor(Math.random() * 20) - 10; 
      c.classList.remove('err');
    });
    showToast('Angkanya diacak kaya hidup kamu yang acak-acakan, EHH UPSS');
  });

  document.getElementById('btn-iden').addEventListener('click', () => {
    let cells = document.querySelectorAll('.cell');
    for (let i = 0; i < order; i++) {
      for (let j = 0; j < order; j++) {
        cells[i * order + j].value = (i === j) ? 1 : 0;
        cells[i * order + j].classList.remove('err');
      }
    }
    showToast('Matriks Identitas DONE BANG!');
  });

  document.getElementById('btn-clr').addEventListener('click', () => {
    document.querySelectorAll('.cell').forEach(c => {
      c.value = '';
      c.classList.remove('err');
    });
    UI.errMsg.style.display = 'none';
    UI.secResult.style.display = 'none';
  });

  document.getElementById('btn-calc').addEventListener('click', () => {
    const { matrix, isValid } = getMatrixValues();
    
    if (!isValid) {
      UI.errMsg.style.display = 'block';
      showToast('JANGAN BIKIN EMOSI COBA 😡');
      return;
    }
    
    UI.errMsg.style.display = 'none';
    let det = calculateDeterminant(matrix, order);
    
    let roundedDet = Math.round(det * 10000) / 10000;
    
    UI.resNum.textContent = Number.isInteger(roundedDet) ? roundedDet : roundedDet.toFixed(4);
    UI.resNote.textContent = roundedDet !== 0 
      ? "MATRIXNYA PUNYA INVERS 🤘😝🤘" 
      : "MATRIXNYA GA PUNYA INVERS 🤘😝🤘";
      
    UI.secResult.style.display = 'block';
    setTimeout(() => UI.secResult.scrollIntoView({ behavior: 'smooth' }), 100);
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    UI.secMatrix.style.display = 'none';
    UI.secResult.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  updateOrderDisplay();

  const bgMusic = document.getElementById('bg-music');
  
  bgMusic.volume = 1.0; 

  function initAudio() {
    bgMusic.play().then(() => {
      document.body.removeEventListener('click', initAudio);
      document.body.removeEventListener('keydown', initAudio);
      document.body.removeEventListener('touchstart', initAudio);
    }).catch(err => {
      console.warn("Autoplay dicegah oleh browser:", err);
    });
  }

  document.body.addEventListener('click', initAudio);
  document.body.addEventListener('keydown', initAudio);
  document.body.addEventListener('touchstart', initAudio);

})();