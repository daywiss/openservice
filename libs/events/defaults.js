const uuid = require("nuid");
module.exports = (props) => {
  return {
    id: uuid.next(),
    channel: "",
    path: [],
    args: [],
    ...props,
  };
};
