# 3D Models for Civic Pulse

## Mazda Miata Model Setup

The application requires a 3D model of a Mazda Miata in GLB format. The current `miata.glb` file is just a placeholder and needs to be replaced with an actual 3D model file.

### How to Add the 3D Model

1. Obtain a Mazda Miata 3D model in GLB format from sources like:
   - [Sketchfab](https://sketchfab.com)
   - [TurboSquid](https://www.turbosquid.com)
   - [CGTrader](https://www.cgtrader.com)

2. Ensure the model is optimized for web use:
   - Reduced polygon count (ideally under 100k triangles)
   - Compressed textures
   - File size between 2-10MB for good performance

3. Replace the placeholder `miata.glb` file in this directory with your actual model file.

### Model Requirements

- Format: GLB (binary glTF)
- Named materials: The code expects materials with names containing 'body', 'glass', and 'light'
- Proper orientation: The car should face forward along the Z-axis
- Centered pivot point: The model's origin should be at the center of the car

### Troubleshooting

If the model doesn't appear correctly:

1. Check the model's scale - you may need to adjust the scale parameter in `Enhanced3DCar.tsx`
2. Verify material names - if your model uses different naming conventions, update the material detection logic
3. Check model orientation - you may need to add rotation to the model in the component

### Alternative Implementation

If you cannot find a suitable Miata model, the code includes a fallback implementation using primitive shapes. To use this:

1. Check the git history for the previous implementation using THREE.js primitives
2. Alternatively, you can use any car model in GLB format and adjust the code accordingly