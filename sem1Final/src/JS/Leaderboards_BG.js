// BackgroundManager.js
export class BackgroundManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.shapes = [];
    this.mouse = { x: 0, y: 0, radius: 300 };
    this.animationId = null;
    this.scrollY = 0;
  }

  init() {
    // Get container when we're sure it exists
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.error(`Container with id "${this.containerId}" not found`);
      return;
    }

    // Setup canvas
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';

    this.container.appendChild(this.canvas);
    this.resize();

    // Create shapes
    this.createShapes();

    // Event listeners
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('scroll', () => this.handleScroll());

    // Start animation
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.createShapes();
  }

  createShapes() {
    this.shapes = [];
    const shapeCount = 32;
    
    // Calculate size based on screen dimensions
    const minScreenSize = Math.min(this.canvas.width, this.canvas.height);
    const minSize = minScreenSize * 0.20; // 20% of screen size
    const maxSize = minScreenSize * 0.40; // 40% of screen size
    
    for (let i = 0; i < shapeCount; i++) {
      const size = minSize + Math.random() * (maxSize - minSize);
      
      this.shapes.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        width: size,
        height: size,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        color: this.getRandomColor(),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        minSpeed: 0.1 + Math.random() * 0.2,
        repulsionRadius: size * 1.2
      });
    }
  }

  getRandomColor() {
    const colors = [
      'rgba(255, 122, 48, 0.3)',    // Orange
      'rgba(70, 92, 136, 0.3)',     // Blue
      'rgba(233, 227, 223, 0.25)',  // White
      'rgba(76, 175, 80, 0.3)',     // Green
      'rgba(156, 39, 176, 0.3)',    // Purple
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  handleMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  handleScroll() {
    this.scrollY = window.scrollY;
  }

  updateShapes() {
    const pushForce = 0.3; // Much more subtle push
    
    this.shapes.forEach(shape => {
      // Calculate distance to mouse (accounting for scroll)
      const dx = shape.x - this.mouse.x;
      const dy = (shape.y - this.scrollY) - this.mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Avoid mouse with very subtle force but large radius
      if (distance < this.mouse.radius) {
        const angle = Math.atan2(dy, dx);
        const force = pushForce * (1 - distance / this.mouse.radius);
        
        shape.vx += Math.cos(angle) * force;
        shape.vy += Math.sin(angle) * force;
      }
      
      // Apply friction for momentum (less friction)
      shape.vx *= 0.995;
      shape.vy *= 0.995;
      
      // Enforce minimum speed
      const currentSpeed = Math.sqrt(shape.vx * shape.vx + shape.vy * shape.vy);
      if (currentSpeed < shape.minSpeed) {
        // If too slow, give a gentle push in current direction
        if (currentSpeed > 0) {
          const ratio = shape.minSpeed / currentSpeed;
          shape.vx *= ratio;
          shape.vy *= ratio;
        } else {
          // If completely stopped, random gentle direction
          shape.vx = (Math.random() - 0.5) * shape.minSpeed;
          shape.vy = (Math.random() - 0.5) * shape.minSpeed;
        }
      }
      
      // Update position
      shape.x += shape.vx;
      shape.y += shape.vy;
      shape.rotation += shape.rotationSpeed;
      
      const teleportMargin = Math.max(shape.width, shape.height) * 2;
      
      if (shape.x < -teleportMargin) {
        shape.x = this.canvas.width + teleportMargin;
      } else if (shape.x > this.canvas.width + teleportMargin) {
        shape.x = -teleportMargin;
      }
      
      if (shape.y < -teleportMargin) {
        shape.y = this.canvas.height + teleportMargin;
      } else if (shape.y > this.canvas.height + teleportMargin) {
        shape.y = -teleportMargin;
      }
      
      // More frequent random movement variation
      if (Math.random() < 0.01) {
        shape.vx += (Math.random() - 0.5) * 0.15;
        shape.vy += (Math.random() - 0.5) * 0.15;
      }
    });

    // Check for shape-to-shape repulsion
    this.checkShapeRepulsion();
  }

  checkShapeRepulsion() {
    const shapePushForce = 0.08;
    
    for (let i = 0; i < this.shapes.length; i++) {
      for (let j = i + 1; j < this.shapes.length; j++) {
        const shapeA = this.shapes[i];
        const shapeB = this.shapes[j];
        
        // Calculate distance between shape centers
        const centerAX = shapeA.x + shapeA.width / 2;
        const centerAY = shapeA.y + shapeA.height / 2;
        const centerBX = shapeB.x + shapeB.width / 2;
        const centerBY = shapeB.y + shapeB.height / 2;
        
        const dx = centerAX - centerBX;
        const dy = centerAY - centerBY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Use the average repulsion radius of both shapes
        const avgRadius = (shapeA.repulsionRadius + shapeB.repulsionRadius) / 2;
        
        // If shapes are too close, repel each other
        if (distance < avgRadius) {
          const angle = Math.atan2(dy, dx);
          const force = shapePushForce * (1 - distance / avgRadius);
          
          // Apply equal and opposite forces (Newton's 3rd law)
          shapeA.vx += Math.cos(angle) * force;
          shapeA.vy += Math.sin(angle) * force;
          shapeB.vx -= Math.cos(angle) * force;
          shapeB.vy -= Math.sin(angle) * force;
        }
      }
    }
  }

  drawShapes() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Save current transformation
    this.ctx.save();
    
    // Apply scroll offset to create parallax effect
    this.ctx.translate(0, -this.scrollY * 0.3);
    
    this.shapes.forEach(shape => {
      this.ctx.save();
      this.ctx.translate(shape.x + shape.width / 2, shape.y + shape.height / 2);
      this.ctx.rotate(shape.rotation);
      
      // Fill shape with subtle gradient
      const gradient = this.ctx.createLinearGradient(
        -shape.width / 2, -shape.height / 2,
        shape.width / 2, shape.height / 2
      );
      gradient.addColorStop(0, shape.color);
      gradient.addColorStop(1, shape.color.replace('0.3', '0.4').replace('0.25', '0.35'));
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
      
      // Subtle border
      this.ctx.strokeStyle = shape.color.replace('0.3', '0.5').replace('0.25', '0.4');
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
      
      this.ctx.restore();
    });
    
    this.ctx.restore();
  }

  animate() {
    this.updateShapes();
    this.drawShapes();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', () => this.resize());
    window.removeEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.removeEventListener('scroll', () => this.handleScroll());
    if (this.container && this.container.contains(this.canvas)) {
      this.container.removeChild(this.canvas);
    }
  }
}