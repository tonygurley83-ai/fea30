module.exports = {
  apps: [
    {
      name: "postgres",
      script: "./server/postgres.sh",
      interpreter: "bash",
      cwd: "./FEAClientApiService",
      autorestart: true,
      watch: false
    },

    {
      name: "auth",
      script: "./auth/auth-server.js",
      cwd: "./FEAClientApiService",
      autorestart: true,
      watch: false,
      env: {
        PORT: 5000,
        NODE_ENV: "production"
      }
    },

    {
      name: "frontend",
      script: "npm",
      args: "start",
      cwd: "./",
      autorestart: true,
      watch: false
    }
  ]
};
