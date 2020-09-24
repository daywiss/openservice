const highland = require("highland");

module.exports = async () => {
  const publishers = new Map();
  const subscribers = new Map();

  function publish(service, channel, source) {
    const id = [service, channel].join(".");
    if (publishers.has(id)) return publishers.get(id);
    const pub = highland();
    pub.resume();
    publishers.set(id, pub);
    return pub;
  }

  function subscribe(service, channel, source) {
    const id = [service, channel, source].join(".");
    if(subscribers.has(id)) return subscribers.get(id).observe()
    const sub = publish(service, channel).observe();
    subscribers.set(id,sub)
    return sub
  }

  return {
    publish,
    subscribe,
  };
};
