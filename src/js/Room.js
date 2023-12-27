import * as THREE from "three";
import { config } from '../utils/Config';

const scene = new THREE.Scene();
let createdWalls = [];

// Function to create and add a mesh to the scene
export function createAndAddMesh(scene, geometry, material, position, rotation = new THREE.Vector3()) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    scene.add(mesh);
    return mesh;
}

export function createGround(scene) {
    const texture = new THREE.TextureLoader().load(config.TestTextureURL);

    // Assuming the ground is a 50x50 plane, we set the texture to repeat only once
    texture.repeat.set(1, 1); // This will ensure the texture covers the entire surface once

    // Optionally, you can set the texture to clamp to the edge if it doesn't fill the geometry completely
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;

    const material = new THREE.MeshStandardMaterial({ map: texture });
    createAndAddMesh(scene, new THREE.PlaneGeometry(50, 50), material, [0, -0.5, 0], [-Math.PI / 2, 0, 0]);
}


export function createRoom(scene, width, height, depth, textureURL) {
    // Check if textureURL is defined
    if (!textureURL) {
        console.error("Texture URL is undefined.");
        return;
    }
    // Clear existing room
    removeExistingObjects(scene, 'wall');
    removeExistingObjects(scene, 'floor');


    // Create walls and floor with new dimensions
    const wallDimensions = [
        [width, height, config.wallThickness, 0, height / 2, depth / 2], // Front wall
        [width, height, config.wallThickness, 0, height / 2, -depth / 2], // Back wall
        [config.wallThickness, height, depth, width / 2, height / 2, 0], // Right wall
        [config.wallThickness, height, depth, -width / 2, height / 2, 0], // Left wall
        [width, config.wallThickness, depth, 0, -config.wallThickness / 2, 0] // Floor
    ];

    wallDimensions.forEach((dim, index) => {
        const wall = createWall(scene, dim, textureURL);

        // Check if the current object is a wall (not the floor)
        if (index < 4) { // There are 4 walls
            wall.userData.type = 'wall';
            wall.userData.index = index+1; // Store the wall index for reference
            createdWalls.push(wall);
        } else {
            wall.userData.type = 'floor';
        }
    });

    return createdWalls;
}

function createWall(scene, dimensions, textureURL) {
    const [width, height, depth, x, y, z] = dimensions;
    const texture = new THREE.TextureLoader().load(textureURL);
    texture.encoding = THREE.sRGBEncoding;

    // Create or update the material with the new texture
    const material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });

    // If a wall with the same dimensions already exists, update its material
    const existingWall = scene.children.find(obj => obj.userData.type === 'wall' && obj.position.x === x && obj.position.y === y && obj.position.z === z);
    if (existingWall) {
        existingWall.material = material;
    } else {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
        wall.position.set(x, y, z);
        scene.add(wall);
        return wall;
    }
}



export function createAdvancedLighting(scene) {
    // Ambient light for soft, diffused light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Directional light for a sunlight-like effect
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048; // Higher for better shadow resolution
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Point lights for additional illumination
    const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight1.position.set(-50, 30, 50);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight2.position.set(50, 30, -50);
    scene.add(pointLight2);
}


export function handleResize(camera, renderer) {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}



// Other utility functions
function removeExistingObjects(scene, objectType) {
    const objectsToRemove = scene.children.filter(obj => obj.userData.type === objectType);
    objectsToRemove.forEach(obj => {
        obj.material.dispose();
        obj.geometry.dispose();
        scene.remove(obj);
    });
}

