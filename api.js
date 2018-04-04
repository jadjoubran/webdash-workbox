const fs = require("fs");

module.exports = {
  routes: {
    get: {
      init: (req, res) => {
        const appRoot = req.app.locals.appRoot;
        const config = req.app.locals.config;

        //check if workbox configuration exists
        const configExists = false;
        if (fs.existsSync(`${appRoot}/workbox-config.js`)) {
          configExists = true;
        }

        //check if workbox is installed
        const workboxInstalled = false;
        const package = require(`${appRoot}/package.json`);
        if (
          (package.dependencies && package.dependencies["workbox-cli"]) ||
          (package.devDependencies && package.devDependencies["workbox-cli"])
        ) {
          workboxInstalled = true;
        }

        return res.send({ configExists, workboxInstalled });
      }
    }
  }
};
