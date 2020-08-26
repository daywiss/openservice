const test = require("tape");
const Streamify = require(".");
const highland = require("highland");
const lodash = require("lodash");

const methods = {
  echo: (x) => x,
  stream: (x) => highland(lodash.times(x)),
  error: (x) => {
    throw new Error(x);
  },
};

test("streamify", (t) => {
  t.test("init", (t) => {
    const result = Streamify({ name: "test" }, methods);
    t.ok(result);
    t.end();
  });
  t.test("echo", (t) => {
    const write = Streamify({ name: "test" }, methods, (channel, x) => {
      t.equal(x.channel, "responses");
      t.equal(x.args[0], "test");
      t.end();
    });
    write({ channel: "requests", path: "echo", args: ["test"] });
  });
  t.test("error", (t) => {
    const write = Streamify({ name: "test" }, methods, (channel, x) => {
      t.equal(x.channel, "errors");
      t.equal(x.args[0].message, "test");
      t.end();
    });
    write({ channel: "requests", path: "error", args: ["test"] });
  });
  t.test("stream", (t) => {
    t.plan(11);
    const write = Streamify({ name: "test" }, methods, (channel, x) => {
      t.equal(x.channel, "streams");
    });
    write({ channel: "requests", path: "stream", args: [10] });
  });
});
