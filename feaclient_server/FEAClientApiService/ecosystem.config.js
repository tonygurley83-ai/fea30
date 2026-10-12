module.exports = {

  apps: [

    {
      name: "postgres",
      script: "server/postgres.sh",
      interpreter: "bash",
      autorestart: true
    },

    {
      name: "auth",
      script: "auth/auth-server.js",
      interpreter: "node",
      autorestart: true
     }/*,*/
    /** {
      *name: "api",
      *script: "api-server.js",
      *interpreter: "node",
      *autorestart: true
    }**/

  ]

};
