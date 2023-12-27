<?php
/**
 * Plugin Name: 3D Room Visualizer
 * Description: A plugin to visualize 3D rooms and furniture.
 * Version: 1.0
 * Author: Konstantinas Ignas Skutulas
 */

function enqueue_3d_scripts(): void {
    $plugin_directory = plugin_dir_url(__FILE__);

    // Enqueue Bootstrap CSS and JS
    wp_enqueue_style('bootstrap-css', $plugin_directory . 'node_modules/bootstrap/dist/css/bootstrap.min.css');
    wp_enqueue_script('bootstrap-js', $plugin_directory . 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js', array('jquery'), null, true);

    // Enqueue your plugin's main CSS
    wp_enqueue_style('main-css', $plugin_directory . 'src/css/styles.css');

    // Check if in development mode (WP_DEBUG is true)
    if (defined('WP_DEBUG') && WP_DEBUG) {
        // Load script from Webpack Dev Server
        wp_enqueue_script('my_3d_plugin_script', 'http://localhost:8080/main.bundle.js', array(), '1.0.0', true);
    } else {
        // Load script from your plugin's dist directory
        wp_enqueue_script('my_3d_plugin_script', $plugin_directory . 'dist/main.bundle.js', array(), '1.0.0', true);
    }
}


add_action('wp_enqueue_scripts', 'enqueue_3d_scripts');

function show_3d_visualizer(): bool|string
{
    // Retrieve the window and door values from the database or any other source
    $windowWidth = get_option('window_width', '1');
    $windowHeight = get_option('window_height', '1');
    $windowDistanceFromFloor = get_option('window_distance_from_floor', '1');
    $windowDistanceFromWall = get_option('window_distance_from_wall', '1');

    $doorWidth = get_option('door_width', '1');
    $doorHeight = get_option('door_height', '2');
    $doorDistanceFromWall = get_option('door_distance_from_wall', '2');

    $roomWidth = get_option('room_width', '10');
    $roomHeight = get_option('room_height', '2.5');
    $roomDepth = get_option('room_depth', '10');

    ob_start();
    ?>
    <div class="container-fluid my-5">
        <div class="row">
            <div class="col-lg-4 offset-lg-4">
                <div id="three-js-canvas" class="bg-dark border rounded-3 mb-4" style="height: 100vh;">
                    <!-- The 3D visualizer canvas will be inserted here by Three.js -->
                </div>
            </div>
        </div>
    </div>


            <div class="col-lg-12">
                <div class="settings-panel">
                    <h2>Visualization Furniture</h2>
                    <!-- Model Picker -->
                    <div id="model-picker" class="mb-3">
                        <label for="model-select" class="form-label">Select a 3D Model:</label>
                        <select id="model-select" class="form-select mb-2">
                            <option value="Chair">Chair</option>
                        </select>
                        <button id="load-model-button" class="btn btn-primary">Load Model</button>
                    </div>

                    <!-- Room Settings -->
                    <div id="room-settings" class="mb-3">
                        <h3>Room Settings</h3>
                        <label for="room-width" class="form-label">Width:</label>
                        <input type="number" id="room-width" name="room_width" value="<?php echo $roomWidth; ?>" class="form-control mb-2">
                        <label for="room-height" class="form-label">Height:</label>
                        <input type="number" id="room-height" name="room_height" value="<?php echo $roomHeight; ?>" class="form-control mb-2">
                        <label for="room-depth" class="form-label">Depth:</label>
                        <input type="number" id="room-depth" name="room_depth" value="<?php echo $roomDepth; ?>" class="form-control mb-3">
                        <button type="button" id="draw-room-button" class="btn btn-primary w-100">Draw Room</button>
                    </div>

                    <!-- Wall Selection Settings -->
                    <div id="wall-selection-settings" class="mb-3">
                        <h3>Select Wall</h3>
                        <label for="wall-selection"></label><select id="wall-selection" class="form-select">
                            <option value="0">Front Wall</option>
                            <option value="1">Back Wall</option>
                            <option value="2">Left Wall</option>
                            <option value="3">Right Wall</option>
                        </select>
                    </div>

                    <!-- Window Settings -->
                    <div id="window-settings" class="mb-3">
                        <h3>Window Settings</h3>
                        <label for="window-width" class="form-label">Width:</label>
                        <input type="number" id="window-width" value="<?php echo $windowWidth; ?>" class="form-control mb-2">
                        <label for="window-height" class="form-label">Height:</label>
                        <input type="number" id="window-height" value="<?php echo $windowHeight; ?>" class="form-control mb-2">
                        <label for="window-distance-from-floor" class="form-label">Distance from Floor:</label>
                        <input type="number" id="window-distance-from-floor" value="<?php echo $windowDistanceFromFloor; ?>" class="form-control mb-2">
                        <label for="window-distance-from-wall" class="form-label">Distance from Wall:</label>
                        <input type="number" id="window-distance-from-wall" value="<?php echo $windowDistanceFromWall; ?>" class="form-control mb-3">
                        <button type="button" id="load-window-button" class="btn btn-primary w-100">Add Window</button>
                    </div>

                    <!-- Door Settings -->
                    <div id="door-settings" class="mb-3">
                        <h3>Door Settings</h3>
                        <label for="door-width" class="form-label">Width:</label>
                        <input type="number" id="door-width" value="<?php echo $doorWidth; ?>" class="form-control mb-2">
                        <label for="door-height" class="form-label">Height:</label>
                        <input type="number" id="door-height" value="<?php echo $doorHeight; ?>" class="form-control mb-2">
                        <label for="door-distance-from-wall" class="form-label">Distance from Wall:</label>
                        <input type="number" id="door-distance-from-wall" value="<?php echo $doorDistanceFromWall; ?>" class="form-control mb-3">
                        <button type="button" id="load-door-button" class="btn btn-primary w-100">Add Door</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

add_shortcode('3d_visualizer', 'show_3d_visualizer');
?>
