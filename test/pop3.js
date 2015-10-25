var should=require('chai').should()
    ,scapegoat=require('../index');

var pop3 = new scapegoat.POP3({
  host:'pop.gmail.com'
  ,enabletls:true
  ,username:'coc.belmer@gmail.com'
  ,password:'110LoMrr1pru'
  ,debug:false
});


pop3.connect();

pop3.on('pop:connected',function(success)
{
  pop3.start();
  console.log('pop3 mail retrieving...');

})

pop3.on('pop:mail',function(mail){
  console.log(mail);
});

pop3.on('pop:error',function(err){
  console.log(err);
});
