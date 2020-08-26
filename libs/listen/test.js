const test = require("tape");
const Listen = require(".");
const Events = require("models/events");

test("listen", (t) => {
  let listen;
  t.test("init", (t) => {
    listen = Listen();
    t.ok(listen);
    t.end();
  });
  t.test("responses", (t) => {
    const event = Events("responses").create("test");
    // console.log(event)
    t.plan(2);
    listen
      .listen("test")
      .take(2)
      .each((result) => {
        t.deepEqual(result.path, event.path);
      });
    listen.write(event);
    listen.write(event);
  });
  t.test("errors", (t) => {
    const event = Events("errors").create("test", new Error("test"));
    // console.log(event)
    listen = Listen("errors");
    listen
      .listen("test")
      .take(1)
      .each((result) => {
        t.deepEqual(result.args[0].message, "test");
        t.end();
      });
    listen.write(event);
  });
  t.test("requests", (t) => {
    const event = Events("requests").create("test", "hello", "world");
    // console.log(event)
    listen = Listen("requests");
    listen
      .listen("test")
      .take(1)
      .each((result) => {
        t.deepEqual(result.args.join(" "), "hello world");
        t.end();
      });
    listen.write(event);
    listen.write(event);
  });
  t.test("root", (t) => {
    const createEvent = Events("requests").create;
    listen = Listen("requests");
    const events = [
      createEvent("test", 1),
      createEvent([], 1),
      createEvent(null, 1),
      createEvent(undefined, 1),
      createEvent("", 1),
      createEvent(0, 1),
    ];
    // console.log(event)
    listen.listen("test").each((result) => {
      //count 1
      t.deepEqual(["test"], result.path);
    });
    listen.listen(null).each((result) => {
      //count events.length
      t.ok(result);
    });
    listen.listen([]).each((result) => {
      //count 4
      t.deepEqual(result.path, []);
    });
    t.plan(events.length + 4 + 1);
    events.forEach(listen.write.bind(listen));
  });
});
