document.addEventListener("DOMContentLoaded", () => {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;

    // Ano no rodapé
    $("#year").textContent = new Date().getFullYear();

    // Tema claro/escuro (lembra a escolha)
    const themeBtn = $("#themeToggle");
    const setTheme = (t) => {
        root.dataset.theme = t;
        themeBtn.innerHTML = t === "dark" ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
        $('meta[name="theme-color"]').content = t === "dark" ? "#06070f" : "#f5f6fc";
    };
    let saved = null;
    try { saved = localStorage.getItem("theme"); } catch (e) {}
    setTheme(saved || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
    themeBtn.addEventListener("click", () => {
        const next = root.dataset.theme === "dark" ? "light" : "dark";
        setTheme(next);
        try { localStorage.setItem("theme", next); } catch (e) {}
    });

    // Menu responsivo
    const menuToggle = $("#menuToggle");
    const navLinks = $("#navLinks");
    const closeMenu = () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    };
    menuToggle.addEventListener("click", () => {
        const open = navLinks.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });
    $$("a", navLinks).forEach((a) => a.addEventListener("click", closeMenu));

    // Barra de progresso, botão de topo e destaque do menu
    const progress = $("#progress");
    const backTop = $("#backTop");
    window.addEventListener("scroll", () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
        backTop.classList.toggle("visible", scrollY > 450);
    }, { passive: true });

    const sections = $$("main section[id]");
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                $$("a", navLinks).forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
            }
        });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach((s) => navObserver.observe(s));

    // Brilho do cursor + brilho dentro dos cartões
    const glow = $("#cursorGlow");
    window.addEventListener("pointermove", (e) => {
        glow.style.transform = `translate(${e.clientX - 260}px, ${e.clientY - 260}px)`;
    }, { passive: true });
    $$(".spot").forEach((el) => {
        el.addEventListener("pointermove", (e) => {
            const r = el.getBoundingClientRect();
            el.style.setProperty("--mx", e.clientX - r.left + "px");
            el.style.setProperty("--my", e.clientY - r.top + "px");
        });
    });

    // Inclinação 3D suave
    if (!reduced && matchMedia("(hover: hover)").matches) {
        $$(".tilt").forEach((el) => {
            el.addEventListener("pointermove", (e) => {
                const r = el.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
            });
            el.addEventListener("pointerleave", () => (el.style.transform = ""));
        });
    }

    // Texto que escreve e apaga
    const typed = $("#typed-text");
    const roles = ["Desenvolvedor de Software", "Estudante de Python", "Entusiasta de React.js", "Futuro Engenheiro de Software"];
    if (reduced) {
        typed.textContent = roles[0];
    } else {
        let r = 0, c = 0, del = false;
        const tick = () => {
            const word = roles[r];
            c += del ? -1 : 1;
            typed.textContent = word.slice(0, c);
            let wait = del ? 35 : 80;
            if (!del && c === word.length) { del = true; wait = 1600; }
            else if (del && c === 0) { del = false; r = (r + 1) % roles.length; wait = 350; }
            setTimeout(tick, wait);
        };
        tick();
    }

    // Números que contam e barras de competências
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const el = e.target;
            countObserver.unobserve(el);
            const end = +el.dataset.count;
            if (reduced) { el.textContent = end; return; }
            const t0 = performance.now();
            const step = (t) => {
                const p = Math.min((t - t0) / 1400, 1);
                el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
    }, { threshold: 0.6 });
    $$("[data-count]").forEach((el) => countObserver.observe(el));

    const barObserver = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                $("b", e.target).style.width = e.target.dataset.level + "%";
                barObserver.unobserve(e.target);
            }
        });
    }, { threshold: 0.4 });
    $$(".skill").forEach((el) => barObserver.observe(el));

    // Filtros de competências e projetos
    $$(".filters").forEach((group) => {
        const items = $$("[data-cat]", document.getElementById(group.dataset.target));
        $$(".chip", group).forEach((chip) => {
            chip.addEventListener("click", () => {
                $$(".chip", group).forEach((c) => c.classList.toggle("active", c === chip));
                const f = chip.dataset.filter;
                items.forEach((it) => it.classList.toggle("hidden", f !== "all" && it.dataset.cat !== f));
            });
        });
    });

    // Fundo de partículas ligadas
    const canvas = $("#bg");
    const ctx = canvas.getContext("2d");
    let W, H, pts = [];
    const resize = () => {
        W = canvas.width = innerWidth;
        H = canvas.height = innerHeight;
        pts = Array.from({ length: Math.min(70, Math.floor(W / 22)) }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3
        }));
    };
    const draw = () => {
        ctx.clearRect(0, 0, W, H);
        const light = root.dataset.theme === "light";
        const rgb = light ? "80,70,200" : "140,160,255";
        pts.forEach((p, i) => {
            p.x = (p.x + p.vx + W) % W;
            p.y = (p.y + p.vy + H) % H;
            ctx.fillStyle = `rgba(${rgb},.7)`;
            ctx.fillRect(p.x, p.y, 2, 2);
            for (let j = i + 1; j < pts.length; j++) {
                const d = Math.hypot(p.x - pts[j].x, p.y - pts[j].y);
                if (d < 130) {
                    ctx.strokeStyle = `rgba(${rgb},${0.18 * (1 - d / 130)})`;
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
                }
            }
        });
        if (!reduced) requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener("resize", resize);

    // Botão da Marcela: toast, coração a pulsar e corações a subir
    const loveButton = $("#loveButton");
    const loveToast = $("#loveToast");
    const bigHeart = $("#bigHeart");
    const hearts = $("#hearts");
    loveButton.addEventListener("click", () => {
        loveToast.classList.add("show");
        setTimeout(() => loveToast.classList.remove("show"), 2600);
        if (!reduced) {
            for (let i = 0; i < 18; i++) {
                const h = document.createElement("i");
                h.className = "fa-solid fa-heart float-heart";
                h.style.left = Math.random() * 100 + "%";
                h.style.fontSize = 14 + Math.random() * 22 + "px";
                h.style.animationDelay = Math.random() * 0.8 + "s";
                hearts.appendChild(h);
                setTimeout(() => h.remove(), 4500);
            }
            if (window.gsap) gsap.fromTo(bigHeart, { scale: 1 }, { scale: 1.3, duration: 0.22, repeat: 5, yoyo: true, ease: "power1.inOut" });
        }
    });

    // Copiar email e formulário (abre o programa de email)
    const copyBtn = $("#copyEmail");
    copyBtn.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(copyBtn.dataset.email);
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
        } catch (e) {
            copyBtn.textContent = copyBtn.dataset.email;
        }
        setTimeout(() => (copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar email'), 2000);
    });

    $("#contactForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const f = e.currentTarget;
        const subject = encodeURIComponent("Contacto via portfólio — " + $("#cName").value);
        const body = encodeURIComponent($("#cMsg").value);
        location.href = `mailto:${f.dataset.email}?subject=${subject}&body=${body}`;
    });

    // Animações GSAP (uma entrada no início + revelações ao fazer scroll)
    if (window.gsap && window.ScrollTrigger && !reduced) {
        gsap.registerPlugin(ScrollTrigger);
        gsap.from(".hero-copy > *", { y: 25, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" });
        gsap.from(".code-card", { x: 35, opacity: 0, duration: 1, delay: 0.2, ease: "power3.out" });
        gsap.to(".orb", { rotation: 360, duration: 40, repeat: -1, ease: "none" });
        gsap.to(bigHeart, { scale: 1.1, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut" });

        $$(".reveal").forEach((el) => {
            gsap.from(el, { y: 30, opacity: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
        });
        gsap.from(".love-card", { y: 35, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".love-card", start: "top 82%", once: true } });
    }
});
