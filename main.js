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
                backdrop-filter: blur(4px);
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
                animation: rotate 3.5s linear infinite;
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
        // 创建遮罩层
        const div = document.createElement('div');
        div.className = 'loading-overlay';
        // 创建圆环容器
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

    // 加载导航栏
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        fetch('header.html')
            .then(response => response.text())
            .then(data => {
                headerContainer.innerHTML = data;
                initNavigation();
                highlightCurrentNav();
            })
            .catch(error => console.error('加载导航栏失败:', error));
    }

    // 获取当前页面标识（从 URL 路径判断，默认为 index）
    function getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('honor.html')) return 'honor';
        return 'index';
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

        // 显示居中旋转加载指示器
        showProgressBar();

        const currentContent = document.getElementById('page-content');
        if (!currentContent) {
            hideProgressBar();
            isTransitioning = false;
            return;
        }

        // 获取新页面内容
        let url = targetPage === 'index' ? 'index.html' : 'honor.html';
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

                // 应用动画类
                const exitClass = direction === 'right' ? 'page-slide-exit' : 'page-slide-exit-right';
                const enterClass = direction === 'right' ? 'page-slide-enter' : 'page-slide-enter-left';

                currentContent.classList.add(exitClass);

                setTimeout(() => {
                    // 替换内容
                    currentContent.innerHTML = newContent.innerHTML;
                    currentContent.classList.remove(exitClass);
                    currentContent.classList.add(enterClass);

                    setTimeout(() => {
                        currentContent.classList.remove(enterClass);
                        isTransitioning = false;

                        // 更新浏览器 URL 和历史记录
                        const newUrl = targetPage === 'index' ? 'index.html' : 'honor.html';
                        if (window.location.pathname !== `/${newUrl}`) {
                            window.history.pushState({ page: targetPage }, '', newUrl);
                        }

                        // 重新高亮导航
                        highlightCurrentNav();

                        // 如果新页面是 index，处理锚点滚动
                        if (targetPage === 'index' && window.location.hash) {
                            const targetId = window.location.hash.substring(1);
                            const targetElement = document.getElementById(targetId);
                            if (targetElement) {
                                setTimeout(() => {
                                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 50);
                            }
                        }

                        // 隐藏加载指示器
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

                // 如果目标页面与当前页面相同，则处理锚点滚动
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

                // 页面不同，执行切换动画
                const direction = (currentPage === 'index' && targetPage === 'honor') ? 'right' : 'left';
                switchPage(targetPage, direction);
            });
        });

        // 监听浏览器前进后退
        window.addEventListener('popstate', function(event) {
            const newPage = getCurrentPage();
            const oldPage = event.state?.page || getCurrentPage();
            if (oldPage !== newPage) {
                const direction = newPage === 'honor' ? 'right' : 'left';
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