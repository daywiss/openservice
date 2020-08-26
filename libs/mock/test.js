const test = require("tape");
const Mock = require(".");

test("mock", (t) => {
  let mock;
  t.test("init", (t) => {
    mock = Mock(console.log);
    mock.deep.call("test");
    t.end();
  });
  t.test("call", async (t) => {
    const p = ["a", "b"];
    const params = ["this", "is", "a", "test"];
    const res = "ok";
    t.plan(3);
    mock = Mock(async (type, path, args) => {
      t.deepEqual(path, p);
      t.deepEqual(args, params);
      return res;
    });

    const result = await mock.a.b(...params);
    t.equal(result, res);
  });
  t.test("call mock array syn", async (t) => {
    const p = ["a", "b"];
    const params = ["this", "is", "a", "test"];
    const res = "ok";
    t.plan(3);
    mock = Mock(async (type, path, args) => {
      t.deepEqual(path, p);
      t.deepEqual(args, params);
      return res;
    });

    const result = await mock["a"]["b"](...params);
    t.equal(result, res);
  });
  t.test("console log", async (t) => {
    mock = Mock((type, path, args) => {
      t.ok(type);
      t.ok(path);
      t.ok(args);
      // console.log(path,...args)
      return "ok";
    });

    console.log(mock.test("blah"));
    console.log(mock());
    t.end();
  });
  t.test("set", async (t) => {
    mock = Mock((type, path, args) => {
      console.log(type, path, args);
      t.ok(args);
      t.end();
      // return 'ok'
    });

    mock.test.set = true;
  });
  t.test("del", async (t) => {
    mock = Mock((type, path, args) => {
      console.log(type, path, args);
      return "ok";
    });

    delete mock.test.set;
    t.end();
  });
  // t.test('override',t=>{

  //   mock = Mock((path,...args)=>{
  //   },{
  //     emit(path,...args){
  //       t.deepEqual(path,['deep'])
  //       t.deepEqual(args,['test'])
  //       t.end()
  //     }
  //   })
  //   mock.deep.emit('test')
  // })
});
// const test = require('tape')
// const Mock = require('.')

// test('mock',t=>{
//   let mock
//   t.test('init',t=>{
//     mock = Mock(console.log)
//     mock.deep.call('test')
//     t.end()
//   })
//   t.test('call',async t=>{
//     const p = ['a','b']
//     const params = ['this','is','a','test']
//     const res = 'ok'
//     t.plan(4)
//     mock = Mock(async (path,call,...args)=>{
//       t.deepEqual(path,p.slice(0,1))
//       t.deepEqual(call,p[1])
//       t.deepEqual(args,params)
//       return res
//     })

//     result = await mock.a.b(...params)
//     t.equal(result,res)
//   })
//   t.test('call mock array syn',async t=>{
//     const p = ['a','b']
//     const params = ['this','is','a','test']
//     const res = 'ok'
//     t.plan(4)
//     mock = Mock(async (path,call,...args)=>{
//       t.deepEqual(path,p.slice(0,1))
//       t.deepEqual(call,p[1])
//       t.deepEqual(args,params)
//       return res
//     })

//     result = await mock['a']['b'](...params)
//     t.equal(result,res)
//   })
// })
