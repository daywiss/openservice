module.exports = (config,services,emit)=>{
  return {
    hello(text='world'){
      return ['hello',text].join(' ')
    }
  }
}
