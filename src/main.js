import words from 'an-array-of-english-words';

const ROOT = document.querySelector('#root');

const handleInput = (e, i, j) => {
  if (e.inputType !== 'insertText') return;
  const isLetter = e.data.length === 1 && e.data.match(/[a-zA-Z]/i);
  if (!isLetter) return;

  let nextRow = i;
  let nextCol = j + 1;
  if (nextCol > 3) {
    nextRow += 1;
    nextCol = 0;
  }
  const nextInput = document.querySelector(
    `input[data-row="${nextRow}"][data-col="${nextCol}"]`
  );
  if (nextInput) {
    nextInput.focus();
  }
};

const handleKeydown = (e, i, j) => {
  if (e.key !== 'Backspace') return;
  e.target.value = '';
  let prevRow = i;
  let prevCol = j - 1;
  if (prevCol < 0 && i > 0) {
    prevRow = i - 1;
    prevCol = 3; // assuming 4 columns per row
  }
  const prevInput = document.querySelector(
    `input[data-row="${prevRow}"][data-col="${prevCol}"]`
  );
  if (prevInput) {
    prevInput.focus();
  }
};

for (let i = 0; i < 4; i++) {
  const row = document.createElement('div');
  row.classList.add('row');
  for (let j = 0; j < 4; j++) {
    const input = document.createElement('input');
    input.classList.add('input');
    input.setAttribute('maxlength', 1);
    input.setAttribute('data-row', i);
    input.setAttribute('data-col', j);
    input.addEventListener('input', (e) => handleInput(e, i, j));
    input.addEventListener('keydown', (e) => handleKeydown(e, i, j));
    row.appendChild(input);
  }
  ROOT.appendChild(row);
}

const GRID = document.querySelectorAll('input');
const LETTERS = [];
for (let i = 0; i < 4; i++) {
  const row = [];
  for (let j = 0; j < 4; j++) {
    row.push(GRID[i * 4 + j]);
  }
  LETTERS.push(row);
}

const trie = {};
for (const word of words) {
  let node = trie;
  for (const char of word) {
    if (!node[char]) node[char] = {};
    node = node[char];
  }

  if (word.length >= 3) node.isWord = true;
}

const findWords = () => {
  const foundWords = new Set();
  const dx = [0, 0, 1, -1, 1, -1, 1, -1];
  const dy = [1, -1, 0, 0, 1, -1, -1, 1];
  const visited = new Array(4).fill().map(() => new Array(4).fill(false));

  const dfs = (x, y, node, path, positions, lastPos) => {
    if (node.isWord) {
      foundWords.add({ word: path, positions: [...positions, { x, y }] });
    }

    visited[x][y] = true;

    for (let i = 0; i < 8; i++) {
      const nx = x + dx[i];
      const ny = y + dy[i];
      if (nx >= 0 && ny >= 0 && nx < 4 && ny < 4 && !visited[nx][ny]) {
        if (
          !lastPos ||
          (Math.abs(nx - lastPos.x) <= 1 && Math.abs(ny - lastPos.y) <= 1)
        ) {
          const nextChar = LETTERS[nx][ny].value.toLowerCase();
          if (node[nextChar]) {
            dfs(
              nx,
              ny,
              node[nextChar],
              path + nextChar,
              [...positions, { x, y }],
              { x, y }
            );
          }
        }
      }
    }

    visited[x][y] = false;
  };

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const startChar = LETTERS[i][j].value.toLowerCase();
      if (trie[startChar]) {
        dfs(i, j, trie[startChar], startChar, [], null);
      }
    }
  }

  return [...foundWords];
};

let foundWords = null;
const button = document.createElement('button');
button.textContent = 'Find Word';

const hideNonUsedLetters = (word) => {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      LETTERS[i][j].style.visibility = 'hidden';
      LETTERS[i][j].value = '';
    }
  }

  if (!word || !word.positions) {
    return;
  }

  word.positions.forEach((pos, index) => {
    const letterElement = LETTERS[pos.x][pos.y];
    letterElement.style.visibility = 'visible';
    letterElement.value = index + 1;
  });
};

button.addEventListener('click', () => {
  if (!foundWords) foundWords = findWords();
  foundWords.sort((a, b) => b.word.length - a.word.length);
  hideNonUsedLetters(foundWords.shift());
});

ROOT.appendChild(button);
