/* toolscripts.js */

document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll("section");
    const options = {
        root: null,
        threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, options);

    sections.forEach((section) => {
        observer.observe(section);
    });

    // Button for exploring the map
    document.querySelector(".btn-primary").addEventListener("click", () => {
        //open the interface
        window.location.href = "map interface/questions.html";
        
        // Scroll to the section
        // const mapContainer = document.querySelector(".solutions");
        //  if (mapContainer) {
        //    mapContainer.scrollIntoView({ behavior: "smooth" });
        //   else {
        //    console.error("Error: .map-container section not found.");
        //  }
    });

    document.querySelector(".btn-secondary").addEventListener("click", () => {
        window.location.href = "systems_diagram.html";
    });

    document.querySelector(".btn-about").addEventListener("click", () => {
        window.location.href = "intro.html";
    });
    
});
