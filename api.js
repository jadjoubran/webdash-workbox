module.exports = {
  routes: {
    get: {
      'your-endpoint-name-here': (req, res) => {
        //get app root pointing to the end-user's app
        const appRoot = req.app.locals.appRoot;
        //get webdash.json config
        const config = req.app.locals.config;

        const result = 42;

        return res.send({ result });
      }
    }
  }
}
