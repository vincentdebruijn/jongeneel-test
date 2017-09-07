const expect = require('chai').expect;
const fetch = require('node-fetch');
const Validator = require('jsonschema').Validator;
const validator = new Validator();
const api = require('../api/api.json');

const host = process.env.HOST;
const token = process.env.TOKEN;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;

// Get the schema for the given path , method and status code from the Swagger API.
const getSchema = function(path, method, status) {
  let schema = api.paths[path][method].responses[status].schema;
  if (schema === undefined) return undefined;

  let schemaAndDefs = {};
  Object.assign(schemaAndDefs, schema);
  schemaAndDefs.definitions = api.definitions;
  return schemaAndDefs;
};

// Create options for the fetch.
const createOpts = function(test) {
  let opts = {};
  if (test.post) {
    opts.method = 'POST';
  }
  if (test.json) {
    opts.body = JSON.stringify(test.json);
    opts.headers = { 'Content-type': 'application/json' };
  }
  return opts;
};

describe('endpoint', () => {
  const tests = [
    // TODO: Add category, filters, sort.
    { href: '/products/?q="Hout"', path: '/products', code: 200 },
    { href: '/products', path: '/products', code: 400 },
    { href: '/products/ZH0670', path: '/products/{id}', code: 200 },
    { href: '/products/Z%4', path: '/products/{id}', code: 400 },
    { href: '/facets/?q="Hout"', path: '/facets', code: 200 },
    { href: '/facets', path: '/facets', code: 400 },

    { href: '/auth/login', path: '/auth/login', post: true, json: { username: username, password: password }, code: 200 },
    { href: '/auth/login', path: '/auth/login', post: true, code: 400 },
    { href: '/auth/logout', path: '/auth/logout', post: true, code: 'default' }

    // TODO: Requires token
    // { href: '/user/me', path: '/user/me', code: 200 },
    // { href: '/user/me', path: '/user/me', code: 400 },
    // { href: '/user/me', path: '/user/me', code: 404 }
    // { href: '/cart', path: '/cart', code: 200, json: true }
    // { href: '/cart/add', path: '/cart/add', code: 204, json: false },
    // { href: '/cart/clear', path: '/cart/clear', code: 204, json: false },
    // { href: '/cart/checkout', path: '/cart/checkout', code: 204, json: false },

    // Not implemented yet in the app
    // { href: '/suggestions/?q="Hout"', path: '/suggestions', code: 200 },
    // { href: '/suggestions', path: '/suggestions', code: 400 },
    // { href: '/projects', path: '/projects', code: 200}
    // { href: '/projects', path: '/projects', code: 400 },
    // { href: '/projects', path: '/projects', code: 404 },
    // { href: '/orders', path: '/orders', code: 200 },
    // { href: '/orders', path: '/orders', code: 404 },
    // { href: '/orders/1', path: '/orders{id}', code: 200 },
    // { href: '/orders/1', path: '/orders{id}', code: 404 },
    // { href: '/invoices', path: '/invoices', code: 200 },
    // { href: '/invoices', path: '/invoices', code: 404, json: false },
    // { href: '/invoices/1', path: '/invoices{id}', code: 200, json: true },
    // { href: '/invoices/1', path: '/invoices{id}', code: 404, json: false }
  ];

  tests.forEach(function(test) {
    it(`gives a valid response for ${test.href}`, () => {
      let opts = createOpts(test);
      return fetch(`${host}${test.href}`, opts).then(res => {
        if (test.code !== 'default') expect(res.status).to.be.equal(test.code);

        let schema = getSchema(test.path, test.post ? 'post' : 'get', test.code);
        if (schema !== undefined) {
          return res.json().then(json => {
            let result = validator.validate(json, schema);

            // Ensure the errors get printed on the screen if there are any
            if (result.errors.length > 0) console.log(result.errors.toString());
            expect(result.errors).to.be.empty;
          });
        } else {
          return res.text().then(text => {
            console.log(text);
          });
        }
      });
    });
  });
});
