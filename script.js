document.addEventListener('DOMContentLoaded', function () {

    /* ===================== 모바일 메뉴 ===================== */
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    mobileMenuBtn.addEventListener('click', function () {
        mobileMenu.classList.toggle('hidden');
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            mobileMenu.classList.add('hidden');
        });
    });


    /* ===================== 언어 전환 (EN / KO) =====================
       모든 번역 대상 요소는 class="i18n" + data-en / data-ko 속성을 가짐.
       초기 textContent는 data-en과 동일하게 HTML에 작성되어 있어
       JS가 늦게 실행되어도 영어가 기본으로 보임.
    */
    const i18nElements = document.querySelectorAll('.i18n');
    const langButtons = document.querySelectorAll('[data-lang-switch]');

    function setLanguage(lang) {
        i18nElements.forEach(function (el) {
            const text = el.dataset[lang];
            if (text) {
                el.innerHTML = text;
            }
        });
        document.documentElement.lang = lang;
        langButtons.forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.langSwitch === lang);
        });
        try {
            localStorage.setItem('site-lang', lang);
        } catch (e) {
            /* 프라이빗 브라우징 등에서 localStorage 접근 실패 시 무시 */
        }
    }

    langButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            setLanguage(btn.dataset.langSwitch);
        });
    });

    let savedLang = 'en';
    try {
        savedLang = localStorage.getItem('site-lang') || 'en';
    } catch (e) {
        savedLang = 'en';
    }
    setLanguage(savedLang);


    /* ===================== 스크롤 페이드인 ===================== */
    const fadeObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-in').forEach(function (el) {
        fadeObserver.observe(el);
    });


    /* ===================== 스크롤에 따른 활성 내비 링크 ===================== */
    const sectionIds = ['about', 'courses', 'how-it-works', 'reviews', 'faq', 'apply'];
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        let current = '';
        sectionIds.forEach(function (id) {
            const section = document.getElementById(id);
            if (section && window.scrollY >= section.offsetTop - 120) {
                current = id;
            }
        });
        navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();


    /* ===================== FAQ 아코디언 ===================== */
    document.querySelectorAll('.faq-item').forEach(function (item) {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function () {
            const isOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
                if (openItem !== item) openItem.classList.remove('open');
            });
            item.classList.toggle('open', !isOpen);
        });
    });


    /* ===================== 수강생 후기 캐러셀 ===================== */
    const slides = Array.from(document.querySelectorAll('.testimonial-slide'));
    const dotsContainer = document.getElementById('testimonialDots');
    const prevBtn = document.getElementById('testimonialPrev');
    const nextBtn = document.getElementById('testimonialNext');
    let currentSlide = 0;
    let autoplayTimer = null;

    slides.forEach(function (_, index) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to review ' + (index + 1));
        dot.addEventListener('click', function () {
            goToSlide(index);
        });
        dotsContainer.appendChild(dot);
    });
    const dots = Array.from(dotsContainer.children);

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(function () {
            goToSlide(currentSlide + 1);
        }, 6000);
    }
    function stopAutoplay() {
        if (autoplayTimer) clearInterval(autoplayTimer);
    }

    prevBtn.addEventListener('click', function () { goToSlide(currentSlide - 1); startAutoplay(); });
    nextBtn.addEventListener('click', function () { goToSlide(currentSlide + 1); startAutoplay(); });

    const reviewsSection = document.getElementById('reviews');
    reviewsSection.addEventListener('mouseenter', stopAutoplay);
    reviewsSection.addEventListener('mouseleave', startAutoplay);
    startAutoplay();


    /* ===================== 연락처 이메일 런타임 조립 =====================
       HTML 소스에 평문 이메일을 넣지 않고, 조각을 조합해 삽입함으로써
       "페이지 소스 보기" 같은 단순한 방식의 자동 수집을 다소 어렵게 함.
       TODO: 아래 parts를 실제 연락용 이메일 주소로 교체하세요.
       (주의: 이 방식도 콘솔에서 직접 변수를 조회하면 그대로 드러나므로
       완전한 차단이 아니라 "가벼운 억제" 수준임을 감안할 것)
    */
    const emailParts = ['hello', '@', 'seoyeonkorean', '.com'];
    const emailEl = document.getElementById('contactEmail');
    if (emailEl) {
        const email = emailParts.join('');
        const link = document.createElement('a');
        link.href = 'mailto:' + email;
        link.textContent = email;
        link.className = 'hover:text-cream transition';
        emailEl.appendChild(link);
    }


    /* ===================== 개인정보 보호를 위한 개발자 도구 억제 =====================
       중요: 아래 코드는 "일반 사용자의 가벼운 복사/캡처"를 억제하는 수준의
       장치일 뿐이며, 의도적으로 소스를 확인하려는 사용자를 기술적으로
       완전히 막을 수는 없다. 실제로 노출되면 안 되는 민감 정보는
       애초에 HTML/JS 소스에 평문으로 포함하지 않는 것이 유일한 안전한 방법.
    */

    // 우클릭(컨텍스트 메뉴) 비활성화
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    // 개발자 도구를 여는 대표적인 키 조합 차단 (F12, Ctrl/Cmd+Shift+I/J/C, Ctrl/Cmd+U)
    document.addEventListener('keydown', function (e) {
        const blockedCombo =
            e.key === 'F12' ||
            ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) ||
            ((e.ctrlKey || e.metaKey) && ['U', 'u'].includes(e.key));
        if (blockedCombo) {
            e.preventDefault();
        }
    });

    // .protected 영역에서 텍스트 선택/복사/드래그 방지
    document.querySelectorAll('.protected').forEach(function (el) {
        el.addEventListener('copy', function (e) { e.preventDefault(); });
        el.addEventListener('selectstart', function (e) { e.preventDefault(); });
        el.addEventListener('dragstart', function (e) { e.preventDefault(); });
    });

    // 개발자 도구 열림 여부에 대한 간단한 추정(창 크기 차이 기반) 및 경고 오버레이
    // 독(dock) 형태로 열린 데스크톱 개발자 도구에서만 어느 정도 감지되며,
    // 분리된 창(undocked)이나 모바일 환경에서는 감지되지 않을 수 있음.
    const devtoolsOverlay = document.getElementById('devtoolsOverlay');
    const DEVTOOLS_THRESHOLD = 160;

    function checkDevtools() {
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        const likelyOpen = widthDiff > DEVTOOLS_THRESHOLD || heightDiff > DEVTOOLS_THRESHOLD;
        devtoolsOverlay.classList.toggle('hidden', !likelyOpen);
    }

    window.addEventListener('resize', checkDevtools);
    setInterval(checkDevtools, 1000);
    checkDevtools();

});
