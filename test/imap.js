var should=require('chai').should()
    ,scapegoat=require('../index');


var imap= new scapegoat.IMAP({
    host:'imap.gmail.com'
    ,username:'coc.belmer@gmail.com'
    ,password:'110LoMrr1pru'
});


imap.start();

imap.on('imap:mail',function(mail)
{
  console.log(mail);
});
