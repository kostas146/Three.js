// DoorWindow.js
import * as THREE from "three";
import { config } from '../utils/Config';

const windowsMap = new Map();
const doorsMap = new Map();
const openingsConfig = [];

function getWallDimensions(wallIndex) {
    switch (wallIndex) {
        case 0:
        case 1:
            return { width: config.roomSize.width, height: config.roomSize.height };
        case 2:
        case 3:
            return { width: config.roomSize.depth, height: config.roomSize.height };
        default:
            return null;
    }
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}



export function handleRoomResize(scene) {
    openingsConfig.forEach((opening, index) => {
        const wallDimensions = getWallDimensions(opening.wallIndex);

        if(wallDimensions === null){
            console.error('Error: Invalid wall index. Cannot read dimensions of wall.');
            return ;
        }

        const width = opening.relativeWidth * wallDimensions.width;
        const height = opening.relativeHeight * wallDimensions.height;
        const distanceFromWall = opening.relativeDistanceFromWall * wallDimensions.width;
        const distanceFromFloor = opening.relativeDistanceFromFloor * wallDimensions.height;

        if (opening.type === 'window') {
            openingsConfig[index].mesh = createWindow(
                scene, width, height, distanceFromFloor, distanceFromWall, opening.wallIndex
            );
        }

        if (opening.type === 'door') {
            openingsConfig[index].mesh = createDoor(
                scene, width, height, distanceFromWall, opening.wallIndex
            );
        }
    });
}

function createOpening(scene, width, height, distanceFromWall, distanceFromFloor, wallIndex, material, type) {
    const wallDimensions = getWallDimensions(wallIndex);
    if (!wallDimensions) {
        console.error('Invalid wall dimensions');
        return undefined;
    }

    const clampedWidth = clamp(width, 0, wallDimensions.width);
    const clampedHeight = clamp(height, 0, wallDimensions.height);
    const clampedDistanceFromWall = clamp(distanceFromWall, 0, wallDimensions.width - clampedWidth);
    const clampedDistanceFromFloor = clamp(distanceFromFloor, 0, wallDimensions.height - clampedHeight);

    if (isNaN(clampedWidth) || isNaN(clampedHeight)) {
        console.error(`Invalid dimensions for geometry creation: clampedWidth=${clampedWidth}, clampedHeight=${clampedHeight}`);
        return undefined;
    }

    const positioningData = getPositionAndRotation(wallIndex, clampedWidth, clampedDistanceFromWall);
    let mesh = getMesh(type, clampedWidth, clampedHeight, material, wallIndex, scene);

    mesh.position.set(positioningData.xPosition, clampedDistanceFromFloor + (clampedHeight / 2), positioningData.zPosition + 0.20);
    mesh.rotation.y = positioningData.yRotation;

    // Store the configuration for each opening
    openingsConfig.push({
        type,
        wallIndex,
        relativeWidth: width / config.roomSize.width,
        relativeHeight: height / config.roomSize.height,
        relativeDistanceFromWall: distanceFromWall / config.roomSize.width,
        relativeDistanceFromFloor: distanceFromFloor / config.roomSize.height,
        mesh
    });

    return mesh;
}
function getPositionAndRotation(wallIndex, clampedWidth, clampedDistanceFromWall) {
    const wallThickness = 0.1;
    const offset = 0.15;
    const halfWidth = config.roomSize.width / 2;
    const halfDepth = config.roomSize.depth / 2;
    const depthOffset = wallThickness / 2 + offset;
    const widthOffset = wallThickness / 2 + offset;

    let positions = {
        xPosition: 0,
        zPosition: 0,
        yRotation: 0
    };

    switch (wallIndex) {
        case 0:
            positions.xPosition = -halfWidth + clampedDistanceFromWall + clampedWidth / 2;
            positions.zPosition = halfDepth - depthOffset;
            positions.yRotation = Math.PI;
            break;
        case 1:
            positions.xPosition = -halfWidth + clampedDistanceFromWall + clampedWidth / 2;
            positions.zPosition = -halfDepth - depthOffset;
            positions.yRotation = 0;
            break;
        case 2:
            positions.xPosition = -halfWidth - widthOffset + 2*wallThickness;
            positions.zPosition = -halfDepth + clampedDistanceFromWall + clampedWidth / 2;
            positions.yRotation = Math.PI / 2;
            break;
        case 3:
            positions.xPosition = halfWidth - widthOffset + 2*wallThickness;
            positions.zPosition = -halfDepth + clampedDistanceFromWall + clampedWidth / 2;
            positions.yRotation = -Math.PI / 2;
            break;
    }
    return positions;
}

function getMesh(type, clampedWidth, clampedHeight, material, wallIndex, scene) {
    const openingKey = `${wallIndex}-${type}`;
    const openingsMap = (type === 'window') ? windowsMap : doorsMap;
    const geometry = new THREE.BoxGeometry(clampedWidth, clampedHeight, 0.1);

    let mesh;

    if (openingsMap.has(openingKey)) {
        mesh = openingsMap.get(openingKey);
        mesh.geometry.dispose();
        mesh.geometry = geometry;
    } else {
        mesh = new THREE.Mesh(geometry, material);
        openingsMap.set(openingKey, mesh);
        scene.add(mesh);
    }

    return mesh;
}

export function createWindow(scene, width, height, distanceFromFloor, distanceFromWall, wallIndex) {
    const windowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00FFFF,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false,
        wireframe: false
    });

    return createOpening(scene, width, height, distanceFromWall, distanceFromFloor, wallIndex, windowMaterial, 'window');
}

export function createDoor(scene, width, height, distanceFromWall, wallIndex) {
    const doorMaterial = new THREE.MeshBasicMaterial({
        color: 0x654321,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: true,
        wireframe: false
    });

    return createOpening(scene, width, height, distanceFromWall, 0, wallIndex, doorMaterial, 'door');
}

export function handleLoadButton(scene, type, walls) {
    if (!Array.isArray(walls) || walls.length === 0) {
        console.error('Walls array is undefined or empty');
        return;
    }

    const inputs = gatherInputValues(type);
    if (!inputs) return;

    const selectedWallIndex = getSelectedWallIndex();
    if (selectedWallIndex < 0 || selectedWallIndex > walls.length - 1) {
        console.error(`Selected wall index ${selectedWallIndex} is out of bounds`);
        return;
    }

    if (type === 'window') {
        createWindow(scene, inputs.width, inputs.height, inputs.distanceFromFloor, inputs.distanceFromWall, selectedWallIndex);
    } else if (type === 'door') {
        createDoor(scene, inputs.width, inputs.height, inputs.distanceFromWall, selectedWallIndex);
    }
}


export function getSelectedWallIndex() {
    const wallSelection = document.getElementById('wall-selection');
    if (!wallSelection) {
        console.error('Wall selection element not found');
        return -1; // Return an invalid index
    }
    const index = parseInt(wallSelection.value, 10);
    if (isNaN(index)) {
        console.error('Invalid wall selection index');
        return -1; // Return an invalid index
    }
    return index;
}

function gatherInputValues(type) {
    const widthInput = document.getElementById(`${type}-width`);
    const heightInput = document.getElementById(`${type}-height`);
    const distanceFromWallInput = document.getElementById(`${type}-distance-from-wall`);
    const distanceFromFloorInput = type === 'window' ? document.getElementById('window-distance-from-floor') : null;

    if (!widthInput || !heightInput || !distanceFromWallInput) {
        console.error(`Input element for ${type} is missing`);
        return null;
    }

    // For windows
    if (type === 'window') {
        return {
            width: parseFloat(widthInput.value) * config.scale,
            height: parseFloat(heightInput.value) * config.scale,
            distanceFromFloor: parseFloat(distanceFromFloorInput.value) * config.scale,
            distanceFromWall: parseFloat(distanceFromWallInput.value) * config.scale,
        };
    }


    // For doors
    if (type === 'door') {
        return {
            width: parseFloat(document.getElementById('door-width').value) * config.scale,
            height: parseFloat(document.getElementById('door-height').value) * config.scale,
            distanceFromWall: parseFloat(document.getElementById('door-distance-from-wall').value) * config.scale
        };
    }
}


// Helper function to ensure objects are within wall limits and adjust dimensions and positions
function adjustDimensionsAndPosition(width, height, distanceFromWall, distanceFromFloor, wall) {
    const wallWidth = (wall === 'front' || wall === 'back') ? config.roomSize.width : config.roomSize.depth;
    const wallHeight = config.roomSize.height;

    // Clamp width and height to prevent exceeding wall boundaries
    const clampedWidth = clamp(width, 0, wallWidth - distanceFromWall);
    const clampedHeight = clamp(height, 0, wallHeight - distanceFromFloor);
    // Clamp position to prevent placement out of wall boundaries
    const clampedDistanceFromWall = clamp(distanceFromWall, 0, wallWidth - clampedWidth);
    const clampedDistanceFromFloor = clamp(distanceFromFloor, 0, wallHeight - clampedHeight);


    return {
        clampedWidth,
        clampedHeight,
        clampedDistanceFromWall,
        clampedDistanceFromFloor
    };
}
