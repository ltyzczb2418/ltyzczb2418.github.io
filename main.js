// main.js - 加载导航栏、页面切换动画、不定状态加载条

(function() {
    // 动态创建加载条样式（确保动画全局可用）
    function injectProgressBarStyles() {
        if (document.getElementById('progress-styles')) return;
        const style = document.createElement('style');
        style.id = 'progress-styles';
        style.textContent = `
            #global-progress-bar {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: linear-gradient(90deg, #0F6CBD 0%, #2B88D8 25%, #0F6CBD 50%, #2B88D8 75%, #0F6CBD 100%);
                background-size: 200% 100%;
                z-index: 10001;
                transform: translateX(-100%);
                transition: transform 0.3s ease;
                pointer-events: none;
                box-shadow: 0 0 4px rgba(15,108,189,0.5);
            }
            #global-progress-bar.active {
                transform: translateX(0);
                animation: progressIndeterminate 1.5s infinite linear;
            }
            @keyframes progressIndeterminate {
                0% {
                    background-position: 0% 0;
                }
                100% {
                    background-position: 200% 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    let progressBar = null;

    function createProgressBar() {
        if (progressBar) return;
        injectProgressBarStyles();
        const bar = document.createElement('div');
        bar.id = 'global-progress-bar';
        document.body.appendChild(bar);
        progressBar = bar;
    }

    function showProgressBar() {
        createProgressBar();
        // 强制重绘后添加 active 类，触发动画
        requestAnimationFrame(() => {
            progressBar.classList.add('active');
        });
    }

    function hideProgressBar() {
        if (progressBar) {
            progressBar.classList.remove('active');
            // 可选：延迟移除，避免闪现
            setTimeout(() => {
                if (progressBar && !progressBar.classList.contains('active')) {
                    // 保持存在，下次直接使用
                }
            }, 300);
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

        // 显示不定状态加载条
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
                // 提取新页面的 #page-content 内容
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

                // 等待退出动画完成
                setTimeout(() => {
                    // 替换内容
                    currentContent.innerHTML = newContent.innerHTML;
                    // 移除退出动画类，添加入场动画类
                    currentContent.classList.remove(exitClass);
                    currentContent.classList.add(enterClass);

                    // 等待入场动画完成
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

                        // 隐藏加载条
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