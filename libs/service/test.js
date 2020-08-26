const test = require("tape");
const Service = require(".");
const Transport = require("../transport")("local");

function TestService(config, clients, emit) {
  emit("online", true);
}
const config = {
  name: "test.service",
  clients: ["test.client"],
};

test("service", (t) => {
  let service, transport;
  t.test("init", async (t) => {
    transport = Transport();
    service = await Service(TestService, config, transport);
    t.ok(service);
    t.end();
  });
  t.test("online", async (t) => {
    await service.online.listen((x) => {
      t.ok(x);
      t.end();
    });
  });
  t.test("echo", async (t) => {
    const msg = "test";
    const result = await service.echo(msg);
    t.equal(result, msg);
    t.end();
  });
  t.test("shutdown", async (t) => {
    await service.shutdown();
    t.end();
  });
});
