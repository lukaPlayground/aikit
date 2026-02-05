// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    }
    
    lastScroll = currentScroll;
});

// Copy code on click
document.querySelectorAll('.code-example pre').forEach(pre => {
    pre.style.cursor = 'pointer';
    pre.title = 'Click to copy';
    
    pre.addEventListener('click', async () => {
        const code = pre.textContent;
        try {
            await navigator.clipboard.writeText(code);
            
            // Visual feedback
            const originalBg = pre.style.background;
            pre.style.background = 'rgba(0,255,0,0.2)';
            
            setTimeout(() => {
                pre.style.background = originalBg;
            }, 200);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });
});

// Analytics (optional - add your tracking code)
// Google Analytics, etc.
