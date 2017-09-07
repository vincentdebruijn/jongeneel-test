const assert = require('chai').assert;
const fetch = require('node-fetch');
const Validator = require('jsonschema').Validator;

const validator = new Validator();
const schema = require('../api/api.json');
const host = process.env.HOST;

describe('JSON schemas', () => {
  // Assuming all tests are for the responses to GET
  const tests = [{ href: `/products/ZH0670`, path: '/products/{id}' }];
  const getJson = function(res) {
    return res.text();
  };

  tests.forEach(function(test) {
    it(`gives a valid response for ${test.href}`, function(done) {
      // TODO: use url helper
      fetch(`${host}${test.href}`).then(res => {
        let status = res.status;
        getJson(res).then(json => {
          console.log(json);
          // Add the path and status code to the response
          // let responseSchema = {};
          // responseSchema[status] = { schema: json };
          // let pathSchema = {};
          // pathSchema[test.schema] = { get: { responses: responseSchema } };
          // // Validate the response
          // //TODO: always passes...
          // let result = validator.validate({ paths: pathSchema }, schema);

          let responseSchema = schema.paths[test.path].get.responses[status].schema;
          let validateSchema = { definitions: schema.definitions };
          Object.assign(validateSchema, responseSchema);
          let result = validator.validate(json, validateSchema);

          console.log(result);
          assert.isEmpty(result.errors);
          done();
        });
      });
    });
  });
});
