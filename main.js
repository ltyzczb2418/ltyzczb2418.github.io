import { FluentDialog } from './dialog.js';

// main.js - 加载导航栏、页面切换动画、居中旋转加载指示器（匀速旋转）

(function() {
    // 动态创建加载指示器样式（居中的圆环旋转）
    function injectSpinnerStyles() {
        if (document.getElementById('spinner-styles')) return;
        const style = document.createElement('style');
        style.id = 'spinner-styles';
        style.textContent = `
            /* 半透明遮罩层 */
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(3px);
                z-index: 10002;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.2s ease, visibility 0.2s ease;
                pointer-events: none;
            }
            .loading-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            /* WinUI 3 风格的旋转圆环 - 匀速转动 */
            .winui-spinner {
                width: 48px;
                height: 48px;
                position: relative;
                animation: rotate 1.5s linear infinite;
            }
            .winui-spinner-circle {
                box-sizing: border-box;
                width: 100%;
                height: 100%;
                border: 4px solid rgba(15, 108, 189, 0.2);
                border-top-color: #0F6CBD;
                border-radius: 50%;
                animation: spin 5s linear infinite;
            }
            @keyframes rotate {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @media (max-width: 640px) {
                .winui-spinner {
                    width: 40px;
                    height: 40px;
                }
                .winui-spinner-circle {
                    border-width: 3px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    let overlay = null;
    let spinner = null;

    function createSpinnerOverlay() {
        if (overlay) return;
        injectSpinnerStyles();
        const div = document.createElement('div');
        div.className = 'loading-overlay';
        const spinnerContainer = document.createElement('div');
        spinnerContainer.className = 'winui-spinner';
        const circle = document.createElement('div');
        circle.className = 'winui-spinner-circle';
        spinnerContainer.appendChild(circle);
        div.appendChild(spinnerContainer);
        document.body.appendChild(div);
        overlay = div;
        spinner = spinnerContainer;
    }

    function showProgressBar() {
        createSpinnerOverlay();
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
    }

    function hideProgressBar() {
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    // 辅助函数：转义 HTML
    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // 初始化活动上传功能
    function initActivityUpload() {
        const uploadBtn = document.getElementById('uploadActivityBtn');
        if (!uploadBtn) return;
        const newBtn = uploadBtn.cloneNode(true);
        uploadBtn.parentNode.replaceChild(newBtn, uploadBtn);
        newBtn.addEventListener('click', () => {
            FluentDialog.uploadActivity((activity) => {
                const activityGrid = document.getElementById('activityGrid');
                if (!activityGrid) return;
                const { name, description, imageDataUrl } = activity;
                const newCard = document.createElement('div');
                newCard.className = 'activity-card';
                const bgImage = imageDataUrl ? `url('${imageDataUrl}')` : 'url(https://picsum.photos/id/20/300/200)';
                newCard.innerHTML = `
                    <div class="activity-img" style="background-image: ${bgImage}"></div>
                    <div class="activity-info">
                        <h3>${escapeHtml(name)}</h3>
                        <p>${escapeHtml(description)}</p>
                    </div>
                `;
                activityGrid.insertBefore(newCard, activityGrid.firstChild);
            });
        });
    }

    // 初始化荣誉卡片点击弹窗
    function initHonorCards() {
        const honorItems = document.querySelectorAll('.honor-item');
        honorItems.forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            newItem.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const title = newItem.getAttribute('data-title') || newItem.querySelector('h3')?.innerText || '荣誉详情';
                const description = newItem.getAttribute('data-description') || newItem.querySelector('p')?.innerText || '';
                const date = newItem.getAttribute('data-date') || newItem.querySelector('.honor-date')?.innerText || '';
                const imageUrl = newItem.getAttribute('data-image');
                
                let contentHtml = `
                    <div class="honor-detail">
                        <p style="margin-bottom: 12px;"><strong>获奖时间：</strong> ${date}</p>
                        <p style="margin-bottom: 16px;">${description}</p>
                `;
                if (imageUrl) {
                    contentHtml += `
                        <div class="honor-award-image" style="text-align: center; margin-top: 12px;">
                            <img src="${imageUrl}" alt="奖状图片" style="max-width: 100%; max-height: 300px; border-radius: 8px; cursor: pointer; transition: transform 0.2s;" 
                                 onclick="window.open('${imageUrl}', '_blank')">
                            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 8px;">点击图片查看大图</p>
                        </div>
                    `;
                } else {
                    contentHtml += `<p style="color: #999;">暂无奖状图片</p>`;
                }
                contentHtml += `</div>`;
                
                FluentDialog.alert(contentHtml, title);
            });
        });
    }

    // 获取当前页面标识（支持多页面）
    function getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('honor.html')) return 'honor';
        if (path.includes('ty80y.html')) return 'ty80y';
        return 'index';
    }

    // 页面URL映射
    function getPageUrl(page) {
        const map = {
            'index': 'index.html',
            'honor': 'honor.html',
            'ty80y': 'ty80y.html'
        };
        return map[page] || 'index.html';
    }

    // 加载导航栏
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        fetch('header.html')
            .then(response => response.text())
            .then(data => {
                headerContainer.innerHTML = data;
                initNavigation();
                highlightCurrentNav();
                // 初始加载时，根据当前页面初始化相应功能
                const currentPage = getCurrentPage();
                if (currentPage === 'index') {
                    initActivityUpload();
                } else if (currentPage === 'honor') {
                    initHonorCards();
                }
                // ty80y 页面无特殊初始化
            })
            .catch(error => console.error('加载导航栏失败:', error));
    }

    // 高亮当前导航项
    function highlightCurrentNav() {
        const currentPage = getCurrentPage();
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === currentPage) {
                link.style.color = '#0F6CBD';
                link.classList.add('active');
            } else {
                link.style.color = '';
                link.classList.remove('active');
            }
        });
    }

    // 页面切换动画
    let isTransitioning = false;

    function switchPage(targetPage, direction) {
        if (isTransitioning) return;
        isTransitioning = true;

        showProgressBar();

        const currentContent = document.getElementById('page-content');
        if (!currentContent) {
            hideProgressBar();
            isTransitioning = false;
            return;
        }

        let url = getPageUrl(targetPage);
        fetch(url)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newContent = doc.getElementById('page-content');
                if (!newContent) {
                    console.error('新页面缺少 #page-content 容器');
                    hideProgressBar();
                    isTransitioning = false;
                    return;
                }

                const exitClass = direction === 'right' ? 'page-slide-exit' : 'page-slide-exit-right';
                const enterClass = direction === 'right' ? 'page-slide-enter' : 'page-slide-enter-left';

                currentContent.classList.add(exitClass);

                setTimeout(() => {
                    currentContent.innerHTML = newContent.innerHTML;
                    currentContent.classList.remove(exitClass);
                    currentContent.classList.add(enterClass);

                    setTimeout(() => {
                        currentContent.classList.remove(enterClass);
                        isTransitioning = false;

                        const newUrl = getPageUrl(targetPage);
                        if (window.location.pathname !== `/${newUrl}`) {
                            window.history.pushState({ page: targetPage }, '', newUrl);
                        }

                        highlightCurrentNav();

                        // 根据目标页面初始化特定功能
                        if (targetPage === 'index') {
                            initActivityUpload();
                            if (window.location.hash) {
                                const targetId = window.location.hash.substring(1);
                                const targetElement = document.getElementById(targetId);
                                if (targetElement) {
                                    setTimeout(() => {
                                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }, 50);
                                }
                            }
                        } else if (targetPage === 'honor') {
                            initHonorCards();
                        }
                        // ty80y 页面无特殊初始化

                        hideProgressBar();
                    }, 400);
                }, 400);
            })
            .catch(error => {
                console.error('加载页面失败:', error);
                hideProgressBar();
                isTransitioning = false;
            });
    }

    // 初始化导航栏事件绑定
    function initNavigation() {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetPage = this.getAttribute('data-page');
                const targetId = this.getAttribute('data-target');

                const currentPage = getCurrentPage();

                if (targetPage === currentPage) {
                    if (targetId) {
                        const targetElement = document.getElementById(targetId);
                        if (targetElement) {
                            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            window.history.pushState({}, '', `#${targetId}`);
                        }
                    }
                    return;
                }

                // 计算方向：从索引页到荣誉页/新页面为右，反之为左（简单处理）
                const pageOrder = ['index', 'honor', 'ty80y'];
                const currentIdx = pageOrder.indexOf(currentPage);
                const targetIdx = pageOrder.indexOf(targetPage);
                const direction = targetIdx > currentIdx ? 'right' : 'left';
                switchPage(targetPage, direction);
            });
        });

        window.addEventListener('popstate', function(event) {
            const newPage = getCurrentPage();
            const oldPage = event.state?.page || getCurrentPage();
            if (oldPage !== newPage) {
                const pageOrder = ['index', 'honor', 'ty80y'];
                const oldIdx = pageOrder.indexOf(oldPage);
                const newIdx = pageOrder.indexOf(newPage);
                const direction = newIdx > oldIdx ? 'right' : 'left';
                switchPage(newPage, direction);
            } else {
                if (window.location.hash) {
                    const targetId = window.location.hash.substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }
        });
    }
})();