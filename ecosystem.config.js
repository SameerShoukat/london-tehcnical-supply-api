module.exports = {
  apps: [{
    name: "london-technical-supply",
    script: "./server.js",
    cwd: __dirname,  // Ensures PM2 uses the current directory
    watch: false,
    env: {
      NODE_ENV: "development"
    },
    env_production: {
      NODE_ENV: "production"
    }
  }]
}