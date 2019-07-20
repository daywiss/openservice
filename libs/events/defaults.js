const uuid = require('uuid/v4')
module.exports = props => {
  return {
    id: uuid(),
    channel: '',
    path: [],
    args: [],
    ...props,
  }
}
