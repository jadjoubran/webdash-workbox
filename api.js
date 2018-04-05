const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;
const { join } = require("path");

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
        //delete entry in require.cache in order to get the updated package.json every time init is called
        delete require.cache[require.resolve(`${appRoot}/package.json`)];

        if (
          (package.dependencies && package.dependencies["workbox-cli"]) ||
          (package.devDependencies && package.devDependencies["workbox-cli"])
        ) {
          workboxInstalled = true;
        }

        return res.send({ configExists, workboxInstalled });
      },
      "check-ignores": (req, res) => {
        const query = req.query;
        let dir = query.dir || "./";
        dir = path.resolve(dir);

        const isDirectory = source => fs.lstatSync(source).isDirectory();

        const getDirectories = source => {
          return fs
            .readdirSync(source)
            .map(name => join(source, name))
            .filter(isDirectory)
            .map(item => item.replace(`${dir}`, ""))
            .map(
              item =>
                item[0] === "/" || item[0] === "\\" ? item.substr(1) : item
            )
            .filter(item => !item.startsWith("."));
        };
        const dirs = getDirectories(dir);
        const typicallyIgnored = ["bower_components", "node_modules"];

        const intersection = dirs.filter(
          e => typicallyIgnored.indexOf(e) !== -1
        );
        return res.send({ result: intersection });
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
