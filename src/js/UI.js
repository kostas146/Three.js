
import {loadModel} from "./ModelLoader";


// Function to get the URL for the selected model based on its name
export function getModelURL(modelName) {
    // Define a mapping of model names to their corresponding URLs
    const modelURLs = {
        'Chair': 'http://localhost/wordpress/wp-content/uploads/2023/10/uploads_files_3993850_Chair.glb',
    };

    return modelURLs[modelName] || '';
}

// This function sets up the model loader UI
export function setupModelLoader(scene, camera, renderer, orbitControls) {
    const modelSelect = document.getElementById("model-select");
    const loadModelButton = document.getElementById("load-model-button");
    const loadedModels = {}; // Object to keep track of loaded models

    if (loadModelButton) {
        loadModelButton.addEventListener("click", () => {
            // Get the selected model name from the dropdown
            const selectedModel = modelSelect.value;

            // Check if model has already been loaded
            if (loadedModels[selectedModel]) {
                alert('Model already loaded');
                return;
            }

            // Log the selected model name for debugging
            console.log("Selected model:", selectedModel);

            // Load the model with the selected name
            loadModel(scene, camera, renderer, selectedModel, orbitControls);

            // Add model to the loaded models object
            loadedModels[selectedModel] = true;
        });
    }
}

// Call this function when your scene is ready
// setupModelLoader(scene);
