module.exports = {
  apps: [
    {
      name: "postgres",
      script: "server/postgres.sh",
      interpreter: "bash"
    },
    {
      name: "auth",
      script: "auth/auth-server.js",
      interpreter: "node"
    },
    {
      name: "frontend",
      script: "npm",
      args: "start",
      cwd: "/data/data/com.termux/files/home/downloads/fea/feaclient_server",
      interpreter: "none"
    }
  ]
};
