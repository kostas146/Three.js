const path = require('path');

module.exports = {
    entry: {
        main: './src/js/main.js' // Your existing entry point
    },
    output: {
        filename: '[name].bundle.js', // Use [name] to generate separate bundles
        path: path.resolve(__dirname, 'dist'),
        clean: true, // Add this to clean the output directory on every build
    },
    devServer: {
        static: path.join(__dirname, 'dist'),
        hot: true,
        open: true, // Optional: Open the browser after server had been started
        port: 8080, // Optional: Specify a port number
        proxy: {
            '**': 'http://localhost/wordpress/visualization-furniture/' // Replace with the URL of your local WordPress
        },
        headers: {
            'Access-Control-Allow-Origin': '*', // Allow all origins
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
        }
    },
    // ... other configurations
};
