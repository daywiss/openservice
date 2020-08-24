const test = require("tape");
const App = require("../libs/app");

const child = () => {
  return {
    error(msg) {
      throw new Error(msg);
    },
    echo(msg) {
      return msg;
    },
  };
};

const index = (config, services) => {
  return services;
};

const root = (config, services) => {
  return {
    echo(msg) {
      return services.index.child.echo(msg);
    },
    error(msg) {
      return services.index.child.error(msg);
    },
  };
};
const config = {
  start: ["test"],
  transports: {
    local: {
      require: "../transports/local",
    },
  },
  transport: "local",
  test: {
    start: ["index.child", "index", "root"],
    index: {
      require: index,
      clients: ["child"],
      child: {
        require: child,
      },
    },
    root: {
      require: root,
      clients: ["index"],
    },
  },
};

test("service proxy passthrough", (t) => {
  let services;
  t.test("init", async (t) => {
    services = await App(config).catch(t.end);
    t.ok(services.length);
    t.end();
  });
  t.test("echo", async (t) => {
    const [, , root] = services;
    // console.log(await index.child.echo('hello'))
    const result = await root.echo("hello").catch(t.end);
    t.equal(result, "hello");
    t.end();
  });
  t.test("error", async (t) => {
    const [, , root] = services;
    // console.log(await index.child.echo('hello'))
    const result = await root.error("hello").catch((e) => e);
    t.equal(result.message, "hello");
    t.end();
  });
  t.test("close", async (t) => {
    services.forEach((x) => x.utils.shutdown(0));
    t.end();
  });
});
