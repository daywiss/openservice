module.exports = (config,services)=>{
  // setInterval(x=>{
  //   services.producer.stream(10000).then(stream=>{
  //     return stream.collect().toPromise(Promise)
  //   }).then(result=>{
  //     console.log(result.length)
  //   }).catch(console.log)
  // },1000)

  setInterval(x=>{
    services.producer.array(10000).then(result=>{
      // console.log(result.length)
    })
  },1000)

  services.producer.on('array',result=>{
    console.log('listen',result.length)
  })

  services.producer.array.stream().each(result=>{
    console.log('stream',result.args[0].length)
  })
}
