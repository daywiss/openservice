const test = require("tape");
const Transport = require("../transport");
const Server = require(".");

const methods = {
  echo: (x) => x,
};

test("server", (t) => {
  let server, transport;
  t.test("init", (t) => {
    transport = Transport("local")();
    server = Server("test", methods, transport);
    t.ok(server);
    t.end();
  });
  t.test("echo", (t) => {
    const msg = "test";
    transport.subscribe("test", "responses").once("data", (result) => {
      t.equal(result.args[0], msg);
      t.end();
    });
    server.emit("echo", msg);
  });
});
