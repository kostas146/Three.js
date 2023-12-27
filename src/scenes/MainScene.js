import * as THREE from "three";
import {config} from '../utils/Config';
import {createAdvancedLighting, createGround, createRoom, handleResize} from '../js/Room.js';
import {handleLoadButton, handleRoomResize} from '../js/DoorWindow';
import {setupModelLoader} from "../js/UI";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {EffectComposer} from "three/addons/postprocessing/EffectComposer";
import {RenderPass} from "three/addons/postprocessing/RenderPass";
import {UnrealBloomPass} from "three/addons/postprocessing/UnrealBloomPass";
import {currentModel} from "../js/ModelLoader";

let originalModelSize = null;
const currentModelName = null;
export { currentModel, originalModelSize };

export function initScene() {
    // Create a new scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    // Enable shadow mapping in the renderer
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Or use THREE.PCFShadowMap for a different shadow type

    // Set the size of the renderer to the window's inner width and height
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Append the renderer to the DOM element
    document.getElementById("three-js-canvas").appendChild(renderer.domElement);

    // Set up the camera's position and orientation
    const roomCenter = new THREE.Vector3(0, config.roomSize.height / 2, 0);
    camera.position.set(config.roomSize.width / 2, config.roomSize.height, config.roomSize.depth / 2);
    camera.lookAt(roomCenter);

    // Return the scene, camera, and renderer
    return { scene, camera, renderer };
}


export function initOrbitControls(camera, renderer) {
    // Create a new OrbitControls instance with the camera and renderer
    const orbitControls = new OrbitControls(camera, renderer.domElement);

    // Configure OrbitControls settings
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.screenSpacePanning = false;
    orbitControls.maxPolarAngle = Math.PI / 2;

    // Return the OrbitControls instance
    return orbitControls;
}



export function setupEventHandlers(scene, camera, renderer, walls, orbitControls) {
    // Load window on click
    document.getElementById('load-window-button').addEventListener('click', () => handleLoadButton(scene, 'window', walls));
    // Load door on click
    document.getElementById('load-door-button').addEventListener('click', () => handleLoadButton(scene, 'door', walls));
    // Handle window resize
    window.addEventListener('resize', () => handleResize(camera, renderer));
    // Handle draw room on click
    document.getElementById('draw-room-button').addEventListener('click', () => handleDrawRoomButtonClick(scene, walls, camera, renderer, orbitControls));
}

export function handleDrawRoomButtonClick(scene, walls, camera, renderer, orbitControls) {
    // Retrieve room dimensions from input fields
    const roomWidth = document.getElementById('room-width').value * config.scale;
    const roomHeight = document.getElementById('room-height').value * config.scale;
    const roomDepth = document.getElementById('room-depth').value * config.scale;

    // Update the global config object
    config.roomSize = { width: roomWidth, height: roomHeight, depth: roomDepth };

    // Recreate the room with updated dimensions
    createRoom(scene, roomWidth, roomHeight, roomDepth, config.WallsTextureURL);

    // Adjust doors and windows after redrawing
    handleRoomResize(scene);

    if (currentModel && originalModelSize) {
        rescaleModel(currentModel); // Call rescaleModel function
    }
}
function calculateScaleFactor() {
    // Calculate the scale factor based on the new room dimensions and the original model size
    const newRoomSize = config.roomSize;
    return Math.min(
        newRoomSize.width / originalModelSize.x,
        newRoomSize.height / originalModelSize.y,
        newRoomSize.depth / originalModelSize.z
    );
}
export function rescaleModel(model) {
    if (model && originalModelSize) {
        const scaleFactor = Math.min(
            config.roomSize.width / originalModelSize.x,
            config.roomSize.depth / originalModelSize.z
        );
        // Ensure height does not exceed room height
        const scaleHeight = Math.min(scaleFactor, config.roomSize.height / originalModelSize.y);

        model.scale.set(scaleFactor, scaleHeight, scaleFactor);

        // Update the originalModelSize
        const box = new THREE.Box3().setFromObject(model);
        originalModelSize = box.getSize(new THREE.Vector3());
    }
}
export function setupSceneAndControls() {
    const { scene, camera, renderer } = initScene();
    const orbitControls = initOrbitControls(camera, renderer);
    return { scene, camera, renderer, orbitControls }
}

export function animateRendering(composer) {
    // Define recursive rendering function
    function animate() {
        requestAnimationFrame(animate);
        composer.render(); // Use composer for rendering
    }
    // Start rendering animation
    animate();
}

export function main() {
    // Initial scene and control setup
    const { scene, camera, renderer, orbitControls } = setupSceneAndControls();
    // Create the ground and initial room
    createGround(scene);
    let walls = createRoom(scene, config.roomSize.width, config.roomSize.height, config.roomSize.depth, config.WallsTextureURL);
    // Create lighting
    createAdvancedLighting(scene);
    // Setup Event Handlers
    setupEventHandlers(scene, camera, renderer, walls, orbitControls);
    // Setup Model Loader UI
    setupModelLoader(scene, camera, renderer, orbitControls);
    // Setup Post-Processing Effects and initiate rendering
    const composer = setUpPostProcessingEffects(renderer, scene, camera);
    // Begin animation
    animateRendering(composer);
}

function setUpPostProcessingEffects(renderer, scene, camera) {
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85));
    return composer;
}