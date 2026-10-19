
// Esperar até que o HTML esteja carregado
document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // Ano automático no rodapé
    const year = document.getElementById("year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    // Menu responsivo
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");

            menuToggle.setAttribute("aria-expanded", String(isOpen));

            menuToggle.innerHTML = isOpen
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<i class="fa-solid fa-bars"></i>';
        });

        // Fechar o menu depois de clicar numa ligação
        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.innerHTML =
                    '<i class="fa-solid fa-bars"></i>';
            });
        });
    }

    // Texto animado no início
    const typedText = document.getElementById("typed-text");

    if (typedText && !prefersReducedMotion) {
        const roles = [
            "Desenvolvedor de Software",
            "Estudante de Python",
            "Entusiasta de React.js",
            "Futuro Engenheiro de Software"
        ];

        let roleIndex = 0;

        if (window.gsap) {
            gsap.to(typedText, {
                opacity: 0,
                duration: 0.25,
                repeat: -1,
                repeatDelay: 2,
                yoyo: true,
                onRepeat: () => {
                    roleIndex = (roleIndex + 1) % roles.length;
                    typedText.textContent = roles[roleIndex];
                }
            });
        }
    }

    // Botão especial para Marcela
    const loveButton = document.getElementById("loveButton");
    const loveToast = document.getElementById("loveToast");
    const bigHeart = document.getElementById("bigHeart");

    if (loveButton && loveToast) {
        loveButton.addEventListener("click", () => {
            loveToast.classList.add("show");

            window.setTimeout(() => {
                loveToast.classList.remove("show");
            }, 2600);

            if (bigHeart && window.gsap && !prefersReducedMotion) {
                gsap.fromTo(
                    bigHeart,
                    { scale: 1 },
                    {
                        scale: 1.3,
                        duration: 0.22,
                        repeat: 5,
                        yoyo: true,
                        ease: "power1.inOut"
                    }
                );
            }
        });
    }

    // Botão "voltar ao início"
    const backTop = document.getElementById("backTop");

    if (backTop) {
        window.addEventListener("scroll", () => {
            backTop.classList.toggle("visible", window.scrollY > 450);
        }, { passive: true });
    }

    // Animações GSAP
    if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
        gsap.registerPlugin(ScrollTrigger);

        // Entrada do cabeçalho
        gsap.from(".brand", {
            y: -20,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        });

        // Entrada dos elementos da primeira secção
        gsap.from(".hero-copy > *", {
            y: 25,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            delay: 0.15
        });

        // Entrada do cartão de código
        gsap.from(".code-card", {
            x: 35,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            delay: 0.25
        });

        // Cartões que aparecem durante o scroll
        gsap.utils.toArray(".reveal").forEach((element) => {
            gsap.from(element, {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 88%",
                    once: true
                }
            });
        });

        // Rotação suave do círculo decorativo
        gsap.to(".orb", {
            rotation: 360,
            duration: 45,
            repeat: -1,
            ease: "none"
        });

        // Entrada da secção dedicada à Marcela
        gsap.from(".love-card", {
            y: 35,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".love-card",
                start: "top 82%",
                once: true
            }
        });

        // Pulsação do coração
        if (bigHeart) {
            gsap.to(bigHeart, {
                scale: 1.1,
                duration: 0.8,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
    }

    // Destacar a secção atual na navegação
    if ("IntersectionObserver" in window && navLinks) {
        const sections = document.querySelectorAll("main section[id]");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        navLinks.querySelectorAll("a").forEach((link) => {
                            link.classList.toggle(
                                "active",
                                link.getAttribute("href") ===
                                "#" + entry.target.id
                            );
                        });
                    }
                });
            },
            {
                rootMargin: "-35% 0px -55% 0px"
            }
        );

        sections.forEach((section) => observer.observe(section));
    }
});
