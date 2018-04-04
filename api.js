const fs = require("fs");
const exec = require("child_process").exec;

const options = { maxBuffer: 1024 * 1000000 };

const canUseYarn = () => {
  return fs.existsSync("yarn.lock");
};

module.exports = {
  routes: {
    get: {
      init: (req, res) => {
        const appRoot = req.app.locals.appRoot;

        //check if workbox configuration exists
        let configExists = false;
        if (fs.existsSync(`${appRoot}/workbox-config.js`)) {
          configExists = true;
        }

        //check if workbox is installed
        let workboxInstalled = false;
        const package = require(`${appRoot}/package.json`);
        if (
          (package.dependencies && package.dependencies["workbox-cli"]) ||
          (package.devDependencies && package.devDependencies["workbox-cli"])
        ) {
          workboxInstalled = true;
        }

        return res.send({ configExists, workboxInstalled });
      }
    },
    post: {
      install: (req, res) => {
        const useYarn = canUseYarn();

        const command = useYarn
          ? "yarn add workbox-cli --dev --silent"
          : "npm install workbox-cli --save-dev --silent";

        exec(command, options, (error, response) => {
          if (error !== null) {
            console.log("exec error: " + error);
            return res.status(400).send({ result: false });
          }
          return res.send({ result: true });
        });
      }
    }
  }
};
