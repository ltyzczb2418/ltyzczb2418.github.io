/**
 * @module FluentDialog
 */

// 样式定义（包含深色模式变量、动画、按钮样式等）
const styles = `
/* ---------- CSS 变量（浅色模式默认值） ---------- */
:root {
  --border-radius-dialog: 8px;
  --border-radius-button: 4px;
  --shadow-modal: 0 16px 32px -8px rgba(0, 0, 0, 0.3), 0 8px 16px -6px rgba(0, 0, 0, 0.2);
  --bg-overlay: rgba(0, 0, 0, 0.4);
  --bg-dialog: rgba(255, 255, 255, 0.85);
  --bg-dialog-backdrop: rgba(255, 255, 255, 0.5);
  --bg-footer: rgba(0, 0, 0, 0.03);
  --text-primary: #1e1e1e;
  --text-secondary: #484848;
  --border-subtle: rgba(0, 0, 0, 0.08);
  --button-primary-bg: #0078d4;
  --button-primary-hover: #106ebe;
  --button-primary-active: #005a9e;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-xxl: 24px;
  --dialog-scale-in: 1.075;
  --dialog-scale-out: 1.075;
}

/* 深色模式变量覆盖（跟随系统） */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-overlay: rgba(0, 0, 0, 0.6);
    --bg-dialog: rgba(32, 32, 32, 0.9);
    --bg-dialog-backdrop: rgba(32, 32, 32, 0.7);
    --bg-footer: rgba(255, 255, 255, 0.03);
    --text-primary: #ffffff;
    --text-secondary: #c8c8c8;
    --border-subtle: rgba(255, 255, 255, 0.08);
    --button-primary-bg: #5A4AFF;
    --button-primary-hover: #6859FF;
    --button-primary-active: #4C3BFF;
  }
}

/* 弹窗容器 */
.fluent-dialog {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.fluent-dialog.show {
  display: flex;
}

/* 遮罩层 */
.dialog-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg-overlay);
  backdrop-filter: blur(10px);
  animation: fadeIn 0.15s ease-out;
}

/* 弹窗主体卡片 */
.dialog-container {
  position: relative;
  width: fit-content;
  min-width: min(450px, 90vw);
  max-width: min(800px, 90vw);
  background: var(--bg-dialog);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border-radius: var(--border-radius-dialog);
  box-shadow: var(--shadow-modal);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  animation: scaleIn 0.15s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
  display: flex;
  flex-direction: column;
}

.dialog-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-dialog-backdrop);
  border-radius: var(--border-radius-dialog);
  z-index: -1;
}

/* 弹窗头部 */
.dialog-header {
  padding: var(--spacing-xl) var(--spacing-xxl) 0 var(--spacing-xxl);
  margin-bottom: 13px;
}
.dialog-header h3 {
  font-size: 22px;
  font-weight: 1000;
  color: var(--text-primary);
  margin: 0;
  text-align: left;
}

/* 弹窗内容区 */
.dialog-content {
  padding: 0 var(--spacing-xxl) var(--spacing-lg) var(--spacing-xxl);
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.6;
  text-align: left;
  font-weight: 500;
}

/* 弹窗底部（按钮区域） */
.dialog-footer {
  padding: var(--spacing-lg) var(--spacing-xxl) var(--spacing-xl) var(--spacing-xxl);
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-footer);
  border-bottom-left-radius: var(--border-radius-dialog);
  border-bottom-right-radius: var(--border-radius-dialog);
}

/* 主要按钮样式 */
.fluent-button.primary {
  padding: 9px 48px;
  border-radius: var(--border-radius-button);
  border: none;
  background: var(--button-primary-bg);
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 120, 212, 0.3);
  transition: all 0.15s ease;
  min-width: 140px;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}
.fluent-button.primary:hover {
  background: var(--button-primary-hover);
  transform: scale(1.02);
}
.fluent-button.primary:active {
  background: var(--button-primary-active);
  transform: scale(0.98);
}
.fluent-button.primary:focus-visible {
  outline: 2px solid var(--button-primary-bg);
  outline-offset: 2px;
}

/* 动画定义 */
@keyframes scaleIn {
  0% { opacity: 0; transform: scale(var(--dialog-scale-in, 1.075)); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes scaleOut {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(var(--dialog-scale-out, 1.075)); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fluent-dialog.closing .dialog-overlay {
  animation: fadeIn 0.1s ease-out reverse;
}
.fluent-dialog.closing .dialog-container {
  animation: scaleOut 0.15s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
}

/* 上传表单样式（内嵌） */
.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.2rem 0;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.form-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
}
.form-group input, .form-group textarea {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
}
.form-group input:focus, .form-group textarea:focus {
  outline: none;
  border-color: #0F6CBD;
  box-shadow: 0 0 0 2px rgba(15, 108, 189, 0.2);
}
.image-preview {
  margin-top: 0.5rem;
  max-width: 100%;
  text-align: center;
}
.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
}
`;

export class FluentDialog {
  constructor({ title = '提示', content = '', onConfirm, onClose } = {}) {
    this.title = title;
    this.content = content;
    this.onConfirm = onConfirm || (() => {});
    this.onClose = onClose || (() => {});

    if (!document.querySelector('#fluent-dialog-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'fluent-dialog-styles';
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);

      const isMobile = /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent);
      if (!isMobile) {
        document.documentElement.style.setProperty('--dialog-scale-in', '1.2');
        document.documentElement.style.setProperty('--dialog-scale-out', '1.2');
      }
    }

    this.dialog = this._createDialog();
    document.body.appendChild(this.dialog);

    this.overlay = this.dialog.querySelector('.dialog-overlay');
    this.confirmBtn = this.dialog.querySelector('#confirmBtn');
    this.titleEl = this.dialog.querySelector('#dialogTitle');
    this.contentEl = this.dialog.querySelector('#dialogDesc');

    this._bindEvents();
  }

  _createDialog() {
    const dialogDiv = document.createElement('div');
    dialogDiv.className = 'fluent-dialog';
    dialogDiv.setAttribute('role', 'dialog');
    dialogDiv.setAttribute('aria-modal', 'true');
    dialogDiv.setAttribute('aria-labelledby', 'dialogTitle');
    dialogDiv.setAttribute('aria-describedby', 'dialogDesc');
    dialogDiv.innerHTML = `
      <div class="dialog-overlay" id="dialogOverlay"></div>
      <div class="dialog-container">
        <div class="dialog-header">
          <h3 id="dialogTitle">${this.title}</h3>
        </div>
        <div class="dialog-content" id="dialogDesc">${this.content}</div>
        <div class="dialog-footer">
          <button class="fluent-button primary" id="confirmBtn">确定</button>
        </div>
      </div>
    `;
    return dialogDiv;
  }

  _bindEvents() {
    this.confirmBtn.addEventListener('click', () => {
      this.onConfirm();
      this.close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.dialog.classList.contains('show')) {
        this.close();
      }
    });

    this.dialog.querySelector('.dialog-container').addEventListener('click', (e) => e.stopPropagation());
  }

  open() {
    this.dialog.classList.remove('closing');
    this.dialog.classList.add('show');
    this.confirmBtn.focus();
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.dialog.classList.add('closing');
    setTimeout(() => {
      this.dialog.classList.remove('show', 'closing');
      document.body.style.overflow = '';
      this.onClose();
    }, 140);
  }

  setTitle(newTitle) {
    this.titleEl.textContent = newTitle;
  }

  setContent(newContent) {
    this.contentEl.innerHTML = newContent;
  }

  destroy() {
    this.dialog.remove();
  }

  // ========== 便捷静态方法 ==========

  static alert(content, title = '提示', onConfirm = null) {
    const dialog = new FluentDialog({
      title,
      content,
      onConfirm: onConfirm || (() => {})
    });
    dialog.open();
    return dialog;
  }

  static confirm(content, onConfirm, onClose = null, title = '确认') {
    const dialog = new FluentDialog({
      title,
      content,
      onConfirm,
      onClose
    });
    dialog.open();
    return dialog;
  }

  /**
   * 上传活动弹窗（底部确定+取消）
   * @param {Function} onSubmit - 提交回调，接收 { name, description, imageDataUrl }
   * @returns {FluentDialog} 弹窗实例
   */
  static uploadActivity(onSubmit) {
    const contentHtml = `
      <div class="upload-form">
        <div class="form-group">
          <label>活动名称 *</label>
          <input type="text" id="activityName" placeholder="请输入活动名称">
        </div>
        <div class="form-group">
          <label>活动描述</label>
          <textarea id="activityDesc" rows="3" placeholder="请输入活动描述"></textarea>
        </div>
        <div class="form-group">
          <label>活动图片</label>
          <input type="file" id="activityImage" accept="image/*">
          <div class="image-preview" id="imagePreview"></div>
        </div>
      </div>
    `;
    const dialog = new FluentDialog({
      title: '上传新活动',
      content: contentHtml,
      onConfirm: () => {}
    });

    const footer = dialog.dialog.querySelector('.dialog-footer');
    if (footer) {
      footer.innerHTML = '';
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = '取消';
      cancelBtn.className = 'fluent-button primary';
      cancelBtn.style.marginRight = '12px';
      cancelBtn.addEventListener('click', () => dialog.close());

      const confirmBtn = document.createElement('button');
      confirmBtn.textContent = '确定';
      confirmBtn.className = 'fluent-button primary';
      confirmBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('activityName');
        const descTextarea = document.getElementById('activityDesc');
        const previewDiv = document.getElementById('imagePreview');
        const name = nameInput ? nameInput.value.trim() : '';
        if (!name) {
          alert('请填写活动名称');
          return;
        }
        const description = descTextarea ? descTextarea.value.trim() : '暂无描述';
        let imageDataUrl = '';
        const previewImg = previewDiv ? previewDiv.querySelector('img') : null;
        if (previewImg) {
          imageDataUrl = previewImg.src;
        }
        if (onSubmit) {
          onSubmit({ name, description, imageDataUrl });
        }
        dialog.close();
      });
      footer.appendChild(cancelBtn);
      footer.appendChild(confirmBtn);
    }

    dialog.open();

    setTimeout(() => {
      const fileInput = document.getElementById('activityImage');
      const previewDiv = document.getElementById('imagePreview');
      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              previewDiv.innerHTML = `<img src="${ev.target.result}" alt="预览">`;
            };
            reader.readAsDataURL(file);
          } else {
            previewDiv.innerHTML = '';
          }
        });
      }
    }, 100);

    return dialog;
  }
}