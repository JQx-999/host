const canvas = document.getElementById('starfield');
const glow = document.getElementById('cursor-glow');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('custom-modal');
const openBtn = document.getElementById('open-modal-btn');
const closeBtn = document.getElementById('close-modal-btn');

let stars = [];
const numStars = 500; // Adjust this number for more or fewer stars!

const neonColors = [
  "rgb(0, 255, 242)",   // Cyan
  "rgb(255, 0, 127)",   // Hot Pink
  "rgb(57, 255, 20)",   // Electric Lime
  "rgb(186, 12, 247)",  // Vaporwave Purple
  "rgb(255, 170, 0)",   // Neon Orange
  "rgb(255, 234, 0)"    // Bright Yellow
];

const mouse = {
  x: null,
  y: null,
  radius: 75 // The distance at which stars start reacting to the mouse
};

// Open Modal Function
openBtn.addEventListener('click', () => {
  modal.classList.add('active');
});

// Close Modal Function
closeBtn.addEventListener('click', () => {
  modal.classList.remove('active');
});

// Resize canvas to fit screen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initStars();
}

// Generate stars with random properties
function initStars() {
  stars = [];
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      baseX: Math.random() * canvas.width,  // Track original position
      baseY: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5, // Star size
      alpha: Math.random(),               // Starting brightness
      speed: Math.random() * 0.02 + 0.005 // Pulsing/twinkle speed
    });
  }
}

function initStars() {
  stars = [];
  for (let i = 0; i < numStars; i++) {
    // Pick a random color from our neon palette for each star
    const randomColor = neonColors[Math.floor(Math.random() * neonColors.length)];
    
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      baseX: Math.random() * canvas.width,  
      baseY: Math.random() * canvas.height, 
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005,
      neonColor: randomColor // Assigning the unique color here!
    });
  }
}

// Close Modal if user clicks ANYWHERE outside the pop-up box
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.classList.remove('active');
  }
});

// Track mouse movement
window.addEventListener('mousemove', (event) => {
  mouse.x = event.x;
  mouse.y = event.y;
  // Move the glow div to match the cursor position
  glow.style.left = event.x + 'px';
  glow.style.top = event.y + 'px';
});

// Reset mouse position when it leaves the screen so stars don't stay stuck
window.addEventListener('mouseout', () => {
  mouse.x = null;
  mouse.y = null;
});

// Animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  stars.forEach(star => {
    // 1. Twinkle effect
    star.alpha += star.speed;
    if (star.alpha > 1 || star.alpha < 0) star.speed = -star.speed;

    // Default styling (normal stars)
    let starColor = `rgba(255, 255, 255, ${Math.abs(star.alpha)})`;
    ctx.shadowBlur = 0; // No glow by default (good for performance!)

    // 2. Mouse Interaction (Distance Formula)
    if (mouse.x !== null && mouse.y !== null) {
      let dx = mouse.x - star.x;
      let dy = mouse.y - star.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < mouse.radius) {
        // Calculate force to push away
        let force = (mouse.radius - distance) / mouse.radius;
        let forceX = (dx / distance) * force * 5; 
        let forceY = (dy / distance) * force * 5;
        
        star.x -= forceX;
        star.y -= forceY;

        // --- MULTI-COLOR NEON GLOW ACTIVATION ---
        // Instead of a fixed color, we break the string apart to inject the alpha opacity
        let pureRGB = star.neonColor.replace('rgb', 'rgba').replace(')', `, ${Math.abs(star.alpha) + 0.4})`);
        starColor = pureRGB;
        ctx.shadowBlur = 15; 
        ctx.shadowColor = star.neonColor; // Glow matches the star's specific color
      } else {
        // Return to natural position
        if (star.x !== star.baseX) star.x += (star.baseX - star.x) * 0.05;
        if (star.y !== star.baseY) star.y += (star.baseY - star.y) * 0.05;
      }
    } else {
      if (star.x !== star.baseX) star.x += (star.baseX - star.x) * 0.05;
      if (star.y !== star.baseY) star.y += (star.baseY - star.y) * 0.05;
    }

    // 3. Ambient floating drift
    star.baseY -= 0.1; 
    if (star.baseY < 0) {
      star.baseY = canvas.height;
      star.x = star.baseX = Math.random() * canvas.width;
    }

    // 4. Draw the star with the calculated styles
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = starColor;
    ctx.fill();
  });
  
  requestAnimationFrame(animate);
}

// Event Listeners & Start
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animate();