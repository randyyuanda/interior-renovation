const jsonServer = require('json-server');
const auth = require('json-server-auth');

const app = jsonServer.create();
const router = jsonServer.router('src/data/db.json');
const middlewares = jsonServer.defaults();

app.use(middlewares);

app.db = router.db;

app.use(auth);
app.use(router);

app.listen(3001, () => {
  console.log('\n  JSON Server Auth running at http://localhost:3001\n');
  console.log('  Endpoints:');
  console.log('    POST /login   { email, password }');
  console.log('    POST /register { email, password }');
  console.log('    GET  /users   (protected)\n');
});
