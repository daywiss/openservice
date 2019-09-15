module.exports = config => {
  const table = new Map()
  return {
    get:(...args)=>table.get(...args),
    set:(...args)=>table.set(...args),
    has:(...args)=>table.has(...args),
    values(){
      return [...table.values()]
    },
  }
}

