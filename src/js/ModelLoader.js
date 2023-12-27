import * as THREE from "three";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {DragControls} from 'three/examples/jsm/controls/DragControls';
import {config} from '../utils/Config';
import {getModelURL} from './UI'

let currentModel = null;
let originalModelSize = null;
let loadedModelName = null;

export function loadModel(scene, camera, renderer, modelName, orbitControls, callback) {
    // We return a promise here that gets resolved when the model is loaded (or rejected on error).
    return new Promise((resolve, reject) => {
        // If the model is already loaded, we resolve the promise right away.
        if (modelName === loadedModelName) {
            resolve();
        } else {
            const loader = new GLTFLoader();
            const modelURL = getModelURL(modelName);

            loader.load(modelURL, gltf => {
                    const model = gltf.scene;
                    model.updateMatrixWorld(true);

                    const box = new THREE.Box3().setFromObject(model);
                    originalModelSize = box.getSize(new THREE.Vector3());

                    const center = box.getCenter(new THREE.Vector3());

                    model.position.sub(center);
                    model.position.y = 0;
                    scene.add(model);

                    currentModel = model;

                    const dragControls = new DragControls([model], camera, renderer.domElement);
                    dragControls.mouseButton = THREE.MOUSE.RIGHT;

                    dragControls.addEventListener('dragstart', event => {
                        orbitControls.enabled = false;
                    });

                    dragControls.addEventListener('drag', event => {
                        event.object.updateMatrixWorld(true);

                        const dragBox = new THREE.Box3().setFromObject(event.object);
                        const size = dragBox.getSize(new THREE.Vector3());

                        const maxX = (config.roomSize.width - size.x) / 2;
                        const maxZ = (config.roomSize.depth - size.z) / 2;

                        const minX = -maxX;
                        const minZ = -maxZ;

                        if (event.object.position.x > maxX) event.object.position.x = maxX;
                        if (event.object.position.x < minX) event.object.position.x = minX;

                        event.object.position.y = size.y / 2;

                        if (event.object.position.z > maxZ) event.object.position.z = maxZ;
                        if (event.object.position.z < minZ) event.object.position.z = minZ;
                    });

                    dragControls.addEventListener('dragend', event => {
                        orbitControls.enabled = true;
                    });

                    resolve(model);
                },
                undefined,
                error => {
                    console.error('An error happened while loading model:', error);
                    reject(error); // Reject the promise when there's an error in loading the model
                });
        }
    });
}export { currentModel, originalModelSize };
