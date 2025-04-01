/* toolscripts.js */

document.addEventListener("DOMContentLoaded", function () {
    // Observer for animating elements on scroll with a lower threshold
    const observerOptions = {
        threshold: 1.0
    };

    const animateObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log("Animating element:", entry.target);
                entry.target.classList.add('animate');
                observer.unobserve(entry.target); // Animate only once per element
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        animateObserver.observe(el);
    });

    // Button actions
    document.querySelector(".btn-primary").addEventListener("click", () => {
        window.location.href = "map interface/questions.html";
    });

    document.querySelector(".btn-secondary").addEventListener("click", () => {
        window.location.href = "systems_diagram1.html";
    });

    document.querySelector(".btn-about").addEventListener("click", () => {
        window.location.href = "intro.html";
    });
});