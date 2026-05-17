// Lightweight rich text editor for Bank Details
export function initRichEditor(containerId, initialHtml = '') {
  const wrap = document.getElementById(containerId);
  if (!wrap) return null;
  wrap.innerHTML = `
    <div class="rich-toolbar">
      <button type="button" data-cmd="bold" title="Bold"><b>B</b></button>
      <button type="button" data-cmd="italic" title="Italic"><i>I</i></button>
      <button type="button" data-cmd="underline" title="Underline"><u>U</u></button>
      <button type="button" data-cmd="strikeThrough" title="Strike"><s>S</s></button>
      <span class="sep"></span>
      <button type="button" data-cmd="insertUnorderedList" title="Bullet List">• List</button>
      <button type="button" data-cmd="insertOrderedList" title="Numbered List">1. List</button>
      <span class="sep"></span>
      <button type="button" data-cmd="justifyLeft" title="Align Left">⬅</button>
      <button type="button" data-cmd="justifyCenter" title="Align Center">⬌</button>
      <button type="button" data-cmd="justifyRight" title="Align Right">➡</button>
      <span class="sep"></span>
      <select data-cmd="fontSize" title="Font Size">
        <option value="">Size</option>
        <option value="2">Small</option>
        <option value="3" selected>Normal</option>
        <option value="4">Medium</option>
        <option value="5">Large</option>
        <option value="6">XL</option>
      </select>
      <input type="color" data-cmd="foreColor" title="Text Color" value="#000000">
      <span class="sep"></span>
      <button type="button" data-cmd="removeFormat" title="Clear Formatting">✕</button>
    </div>
    <div class="rich-content" contenteditable="true" id="${containerId}_content"></div>
  `;
  const content = document.getElementById(`${containerId}_content`);
  content.innerHTML = initialHtml || '';

  wrap.querySelectorAll('button[data-cmd]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cmd = btn.dataset.cmd;
      content.focus();
      document.execCommand(cmd, false, null);
    });
  });
  wrap.querySelectorAll('select[data-cmd], input[data-cmd]').forEach(el => {
    el.addEventListener('change', (e) => {
      const cmd = el.dataset.cmd;
      const val = el.value;
      if (!val) return;
      content.focus();
      document.execCommand(cmd, false, val);
    });
  });

  return {
    getHTML: () => content.innerHTML,
    setHTML: (html) => { content.innerHTML = html || ''; }
  };
}
