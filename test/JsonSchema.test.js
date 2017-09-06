const assert = require('assert');
const fetch = require('node-fetch');
const host = process.env.HOST;

describe('JSON schemas', () => {
  // TODO: parse JSON schema
  // const schema = ...;
  const tests = [{ href: `/products/ZH0670`, schema: '/products/' }];

  tests.forEach(function(test) {
    it(`gives a valid response for ${test.href}`, function(done) {
      // TODO: use url helper
      fetch(`${host}${test.href}`)
        .then(res => {
          return res.text();
        })
        .then(json => {
          console.log(json);
          // TODO: get and assert the schema
          assert(true);
          done();
        });
    });
  });
});
