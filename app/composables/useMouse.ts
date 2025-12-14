import * as THREE from 'three/webgpu';

const mousePos = new THREE.Vector2(0, 0);
const mouseVelocity = new THREE.Vector2(0, 0);
const prevMousePos = new THREE.Vector2(0, 0);

export const useUseMouse = () => {
  let velocityResetTimeout: ReturnType<typeof setTimeout> | null = null;
  
  onMounted(() => {
    window.addEventListener('mousemove', (event: MouseEvent) => {
      // Store previous position
      prevMousePos.copy(mousePos);
      
      // Update current position
      mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      // Calculate velocity (delta between current and previous frame)
      mouseVelocity.x = mousePos.x - prevMousePos.x;
      mouseVelocity.y = mousePos.y - prevMousePos.y;
      
      // Clear existing timeout
      if (velocityResetTimeout) {
        clearTimeout(velocityResetTimeout);
      }
      
      // Set timeout to reset velocity if no movement detected
      velocityResetTimeout = setTimeout(() => {
        mouseVelocity.set(0, 0);
      }, 50); // Reset after 50ms of no movement
    });
  });

  return {
    mousePos,
    mouseVelocity,
  };
}
