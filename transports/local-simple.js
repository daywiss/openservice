const highland = require("highland");

module.exports = async () => {
  const publishers = new Map();

  function publish(service) {
    const id = service;
    if (publishers.has(id)) return publishers.get(id);
    const pub = highland();
    pub.resume();
    publishers.set(id, pub);
    return pub;
  }

  function subscribe(service, channel) {
    return publish(service, channel)
      .observe()
      .filter((x) => x.channel === channel);
  }

  return {
    publish,
    subscribe,
  };
};
