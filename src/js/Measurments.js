// Measurements.js
import * as THREE from 'three';
import { config } from '../utils/Config';

class Measurements {
    constructor(scene) {
        this.scene = scene;
        this.measurementLines = [];
        this.measurementInfo = [];
    }

    addMeasurement(start, end) {
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const line = new THREE.Line(geometry, material);

        this.measurementLines.push(line);
        this.scene.add(line);

        this.calculateDistance(start, end);
    }

    calculateDistance(start, end) {
        const distance = start.distanceTo(end);
        this.measurementInfo.push({ start, end, distance });

        // You could enhance this to display the measurement in the scene or in the UI
        console.log(`Measured distance: ${distance.toFixed(2)}`);
    }

    clearMeasurements() {
        this.measurementLines.forEach(line => {
            this.scene.remove(line);
        });
        this.measurementLines = [];
        this.measurementInfo = [];
    }
}

export default Measurements;
