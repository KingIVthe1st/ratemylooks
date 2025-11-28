// Matrix Rain Animation
class MatrixRain {
    constructor() {
        this.canvas = document.getElementById('matrixCanvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.fontSize = 14;
        this.columns = 0;
        this.drops = [];

        // Matrix characters
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~'.split('');

        this.resize();
        this.init();
        this.animate();

        // Resize on window resize
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = Array(this.columns).fill(0);
    }

    init() {
        // Initialize drops at random positions
        for (let i = 0; i < this.drops.length; i++) {
            this.drops[i] = Math.floor(Math.random() * -100);
        }
    }

    animate() {
        // Black background with slight transparency for trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Set text style
        this.ctx.font = `${this.fontSize}px monospace`;

        // Draw characters
        for (let i = 0; i < this.drops.length; i++) {
            // Random character
            const char = this.chars[Math.floor(Math.random() * this.chars.length)];

            // Color - cyan with varying opacity
            const opacity = Math.random() * 0.5 + 0.3;
            this.ctx.fillStyle = `rgba(0, 212, 255, ${opacity})`;

            // Draw character
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;
            this.ctx.fillText(char, x, y);

            // Reset drop to top randomly
            if (y > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }

            // Move drop down
            this.drops[i]++;
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new MatrixRain());
} else {
    new MatrixRain();
}
