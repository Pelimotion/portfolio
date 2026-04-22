document.addEventListener('DOMContentLoaded', () => {
    // 1. Update Local Time (Rio de Janeiro: UTC-3)
    const updateLocalTime = () => {
        const timeElement = document.getElementById('local-time');
        if (!timeElement) return;

        const now = new Date();
        const options = {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        const timeString = new Intl.DateTimeFormat('en-GB', options).format(now);
        timeElement.textContent = `LOCAL_TIME: ${timeString}`;
    };

    updateLocalTime();
    setInterval(updateLocalTime, 1000);

    // 2. Scroll Progress & Section Indicator
    const scrollProgress = document.getElementById('scroll-progress');
    const sectionIndicator = document.getElementById('section-indicator');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        // Progress Bar
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (scrollProgress) scrollProgress.style.width = scrolled + '%';

        // Section Indicator
        let currentSection = 'STATUS_IDLE';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 120) {
                currentSection = `VIEWING_${section.getAttribute('id').toUpperCase()}`;
            }
        });
        
        if (sectionIndicator && sectionIndicator.textContent !== currentSection) {
            sectionIndicator.textContent = currentSection;
            // Mechanical Glitch Trigger
            document.body.classList.add('glitch-active');
            setTimeout(() => {
                document.body.classList.remove('glitch-active');
            }, 60);
        }
    });

    // 3. Precision Cursor
    const cursor = document.createElement('div');
    cursor.className = 'precision-cursor';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // 4. Intersection Observer for Mechanical Reveal
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: add a slight sound or haptic-like visual click
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-mech').forEach(el => {
        revealObserver.observe(el);
    });

    // 5. Language fills (Mechanical Trigger)
    const langBars = document.querySelectorAll('.lang-bar');
    const langObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target.querySelector('.bar-fill');
                const val = entry.target.getAttribute('data-val');
                setTimeout(() => {
                    if (fill) fill.style.width = `${val}%`;
                }, 300); // Mechanical delay
                langObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    langBars.forEach(bar => langObserver.observe(bar));
});
