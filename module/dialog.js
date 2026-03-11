/**
 * @module FluentDialog
 */

// 样式定义（包含深色模式变量、动画、按钮样式等）
const styles = `
/* ---------- CSS 变量（浅色模式默认值） ---------- */
:root {
  --border-radius-dialog: 8px;        /* 弹窗圆角 */
  --border-radius-button: 4px;        /* 按钮圆角 */
  --shadow-modal: 0 16px 32px -8px rgba(0, 0, 0, 0.3), 0 8px 16px -6px rgba(0, 0, 0, 0.2); /* 弹窗阴影 */
  --bg-overlay: rgba(0, 0, 0, 0.4);    /* 遮罩层背景 */
  --bg-dialog: rgba(255, 255, 255, 0.85); /* 弹窗主体背景（半透） */
  --bg-dialog-backdrop: rgba(255, 255, 255, 0.5); /* 弹窗背景加强层 */
  --bg-footer: rgba(0, 0, 0, 0.03);     /* 底部栏背景 */
  --text-primary: #1e1e1e;              /* 主文本颜色 */
  --text-secondary: #484848;             /* 次要文本颜色 */
  --border-subtle: rgba(0, 0, 0, 0.08);  /* 边框颜色 */
  --button-primary-bg: #0078d4;          /* 按钮背景色（Fluent 蓝） */
  --button-primary-hover: #106ebe;       /* 按钮悬停色 */
  --button-primary-active: #005a9e;      /* 按钮激活色 */
  --spacing-sm: 8px;                     /* 小间距 */
  --spacing-md: 12px;                    /* 中间距 */
  --spacing-lg: 16px;                    /* 大间距 */
  --spacing-xl: 20px;                     /* 加大间距 */
  --spacing-xxl: 24px;                    /* 最大间距 */

  /* ----- 新增动画幅度变量（默认手机幅度 1.075） ----- */
  --dialog-scale-in: 1.075;
  --dialog-scale-out: 1.075;
}

/* ---------- 深色模式变量覆盖（跟随系统） ---------- */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-overlay: rgba(0, 0, 0, 0.6);          /* 更深遮罩 */
    --bg-dialog: rgba(32, 32, 32, 0.9);        /* 深色半透背景 */
    --bg-dialog-backdrop: rgba(32, 32, 32, 0.7); /* 深色加强层 */
    --bg-footer: rgba(255, 255, 255, 0.03);     /* 底部栏深色背景 */
    --text-primary: #ffffff;                    /* 主文本白色 */
    --text-secondary: #c8c8c8;                   /* 次要文本浅灰 */
    --border-subtle: rgba(255, 255, 255, 0.08);  /* 深色边框 */
    --button-primary-bg: #5A4AFF;                /* 深色按钮亮蓝色 */
    --button-primary-hover: #6859FF;             /* 深色按钮悬停 */
    --button-primary-active: #4C3BFF;             /* 深色按钮激活 */
  }
}

/* ---------- 弹窗容器 ---------- */
.fluent-dialog {
  display: none;                /* 默认隐藏 */
  position: fixed;              /* 固定定位覆盖全屏 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  align-items: center;          /* 居中内容（开启flex时生效） */
  justify-content: center;
  z-index: 1000;                /* 确保弹窗在最上层 */
}
.fluent-dialog.show {
  display: flex;                /* 显示时采用flex布局 */
}

/* ---------- 遮罩层 ---------- */
.dialog-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg-overlay);
  backdrop-filter: blur(10px);   /* 轻微模糊背景 */
  animation: fadeIn 0.15s ease-out; /* 淡入动画 */
}

/* ---------- 弹窗主体卡片 ---------- */
.dialog-container {
  position: relative;
  /* 宽度根据内容自动调整，受最小/最大宽度约束 */
  width: fit-content;
  min-width: min(450px, 90vw);      /* 最小450px，但在小屏幕上不超过视口宽度 */
  max-width: min(800px, 90vw);      /* 最大800px，同时保证移动端有边距 */
  background: var(--bg-dialog);
  backdrop-filter: blur(25px) saturate(180%);  /* 毛玻璃效果 */
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border-radius: var(--border-radius-dialog);
  box-shadow: var(--shadow-modal);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  animation: scaleIn 0.15s cubic-bezier(0.2, 0.9, 0.3, 1) forwards; /* 缩放入场动画 */
  display: flex;
  flex-direction: column;
  /* will-change: transform, opacity;*/ /* 优化动画性能 */
}

/* 弹窗背景加强层（用于增强毛玻璃效果下的不透明度） */
.dialog-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-dialog-backdrop);
  border-radius: var(--border-radius-dialog);
  z-index: -1;                  /* 置于文本下方 */
}

/* ---------- 弹窗头部 ---------- */
.dialog-header {
  padding: var(--spacing-xl) var(--spacing-xxl) 0 var(--spacing-xxl);
  margin-bottom: 13px;           /* 与内容区的间距 */
}
.dialog-header h3 {
  font-size: 22px;
  font-weight: 1000;             /* 极粗标题 */
  color: var(--text-primary);
  margin: 0;
  text-align: left;
}

/* ---------- 弹窗内容区 ---------- */
.dialog-content {
  padding: 0 var(--spacing-xxl) var(--spacing-lg) var(--spacing-xxl);
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.6;
  text-align: left;
  font-weight: 500;
}

/* ---------- 弹窗底部（按钮区域） ---------- */
.dialog-footer {
  padding: var(--spacing-lg) var(--spacing-xxl) var(--spacing-xl) var(--spacing-xxl);
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-footer);
  border-bottom-left-radius: var(--border-radius-dialog);
  border-bottom-right-radius: var(--border-radius-dialog);
}

/* ---------- 主要按钮样式 ---------- */
.fluent-button.primary {
  padding: 9px 48px;
  border-radius: var(--border-radius-button);
  border: none;
  background: var(--button-primary-bg);
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 120, 212, 0.3); /* 轻微光晕 */
  transition: all 0.15s ease;   /* 平滑过渡 */
  min-width: 140px;
  -webkit-tap-highlight-color: transparent; /* 移动端点击高亮去除 */
  outline: none;
}
.fluent-button.primary:hover {
  background: var(--button-primary-hover);
  transform: scale(1.02);       /* 悬停微放大 */
}
.fluent-button.primary:active {
  background: var(--button-primary-active);
  transform: scale(0.98);       /* 点击微缩小 */
}
.fluent-button.primary:focus-visible {
  outline: 2px solid var(--button-primary-bg); /* 键盘焦点指示 */
  outline-offset: 2px;
}

/* ---------- 动画定义（使用变量，支持动态调整幅度） ---------- */
/* 弹窗缩放入场：从稍微放大到原始大小 */
@keyframes scaleIn {
  0% { opacity: 0; transform: scale(var(--dialog-scale-in, 1.075)); }
  100% { opacity: 1; transform: scale(1); }
}
/* 弹窗缩放出场：从原始大小到稍微放大并淡出 */
@keyframes scaleOut {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(var(--dialog-scale-out, 1.075)); }
}
/* 遮罩淡入 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 弹窗关闭时的动画（反向使用入场动画） */
.fluent-dialog.closing .dialog-overlay {
  animation: fadeIn 0.1s ease-out reverse;
}
.fluent-dialog.closing .dialog-container {
  animation: scaleOut 0.15s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
}
`;

/**
 * FluentDialog 类 - 创建并管理一个 Fluent Design 弹窗实例
 */
export class FluentDialog {
  /**
   * 创建一个弹窗实例。
   * @param {Object} options - 配置选项
   * @param {string} [options.title='提示'] - 弹窗标题
   * @param {string} [options.content=''] - 弹窗正文（支持 HTML 字符串）
   * @param {Function} [options.onConfirm] - 点击“确定”按钮后的回调函数（无参数）
   * @param {Function} [options.onClose] - 弹窗关闭后的回调函数（无参数）
   */
  constructor({ title = '提示', content = '', onConfirm, onClose } = {}) {
    /** @type {string} 当前标题 */
    this.title = title;
    /** @type {string} 当前内容（HTML） */
    this.content = content;
    /** @type {Function} 确定回调 */
    this.onConfirm = onConfirm || (() => {});
    /** @type {Function} 关闭回调 */
    this.onClose = onClose || (() => {});

    // 注入样式（仅首次创建时注入）
    if (!document.querySelector('#fluent-dialog-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'fluent-dialog-styles';
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);

      // ----- 根据 UA 调整动画幅度（手机保持 1.075，电脑改为 1.2）-----
      // 匹配手机 UA（排除 iPad，因为 iPad 通常屏幕较大，归为电脑）
      const isMobile = /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent);
      if (!isMobile) {
        // 电脑端设置更大的缩放幅度
        document.documentElement.style.setProperty('--dialog-scale-in', '1.2');
        document.documentElement.style.setProperty('--dialog-scale-out', '1.2');
      }
    }

    // 创建弹窗 DOM
    /** @type {HTMLDivElement} 弹窗根元素 */
    this.dialog = this._createDialog();
    document.body.appendChild(this.dialog);

    // 绑定元素引用
    /** @type {HTMLElement} 遮罩层元素 */
    this.overlay = this.dialog.querySelector('.dialog-overlay');
    /** @type {HTMLButtonElement} 确定按钮 */
    this.confirmBtn = this.dialog.querySelector('#confirmBtn');
    /** @type {HTMLElement} 标题元素 */
    this.titleEl = this.dialog.querySelector('#dialogTitle');
    /** @type {HTMLElement} 内容元素 */
    this.contentEl = this.dialog.querySelector('#dialogDesc');

    // 初始化事件
    this._bindEvents();
  }

  /**
   * 创建弹窗的 HTML 结构
   * @private
   * @returns {HTMLDivElement} 弹窗根元素
   */
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

  /**
   * 绑定内部事件（确定按钮、ESC键关闭、阻止内容区冒泡）
   * @private
   */
  _bindEvents() {
    // 确定按钮关闭
    this.confirmBtn.addEventListener('click', () => {
      this.onConfirm();
      this.close();
    });

    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.dialog.classList.contains('show')) {
        this.close();
      }
    });

    // 阻止点击内容区冒泡，防止点击内容区关闭弹窗（因为遮罩层没有直接绑定关闭事件）
    this.dialog.querySelector('.dialog-container').addEventListener('click', (e) => e.stopPropagation());
  }

  /**
   * 打开弹窗
   * - 显示弹窗，移除 closing 类
   * - 自动聚焦确定按钮
   * - 禁止背景滚动
   */
  open() {
    this.dialog.classList.remove('closing');
    this.dialog.classList.add('show');
    this.confirmBtn.focus();
    document.body.style.overflow = 'hidden'; // 禁止背景滚动
  }

  /**
   * 关闭弹窗（带动画）
   * - 添加 closing 类触发关闭动画
   * - 动画结束后隐藏弹窗并恢复背景滚动
   * - 调用 onClose 回调
   */
  close() {
    this.dialog.classList.add('closing');
    setTimeout(() => {
      this.dialog.classList.remove('show', 'closing');
      document.body.style.overflow = ''; // 恢复滚动
      this.onClose();
    }, 140); // 略小于动画时长 150ms
  }

  /**
   * 更新弹窗标题
   * @param {string} newTitle - 新标题
   */
  setTitle(newTitle) {
    this.titleEl.textContent = newTitle;
  }

  /**
   * 更新弹窗内容（支持 HTML）
   * @param {string} newContent - 新内容（HTML 字符串）
   */
  setContent(newContent) {
    this.contentEl.innerHTML = newContent;
  }

  /**
   * 销毁弹窗 DOM，释放资源
   * - 从文档中移除弹窗元素
   */
  destroy() {
    this.dialog.remove();
  }

  // ========== 便捷静态方法 ==========

  /**
   * 显示一个简单的提示弹窗（仅确定按钮）
   * @param {string} content - 提示内容（支持 HTML）
   * @param {string} [title='提示'] - 弹窗标题
   * @param {Function} [onConfirm] - 点击确定后的回调（可选，无参数）
   * @returns {FluentDialog} 创建的弹窗实例（通常无需保存，但可用于后续手动关闭等操作）
   */
  static alert(content, title = '提示', onConfirm = null) {
    const dialog = new FluentDialog({
      title,
      content,
      onConfirm: onConfirm || (() => {})
    });
    dialog.open();
    return dialog;
  }

  /**
   * 显示一个确认弹窗（只有确定按钮，但可通过回调处理确认逻辑）
   * @param {string} content - 确认内容（支持 HTML）
   * @param {Function} onConfirm - 点击确定后的回调（无参数）
   * @param {Function} [onClose] - 弹窗关闭后的回调（可选，无参数）
   * @param {string} [title='确认'] - 弹窗标题
   * @returns {FluentDialog} 创建的弹窗实例
   */
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
}