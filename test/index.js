var should=require('chai').should()
    ,scapegoat=require('../index');


var imap= new scapegoat.IMAP;
var pop3 = new scapegoat.POP3({
  host:'pop.gmail.com'
  ,enabletls:true
  ,username:'coc.belmer@gmail.com'
  ,password:'110LoMrr1pru'
  ,debug:false
});

var escape=imap.escape
    ,unescape=pop3.unescape;


describe('#escape',function(){

  it('converts & into &amp;',function () {
    escape('&').should.equal('&amp;');
  });

  it('converts " into &quot;',function () {
    escape('"').should.equal('&quot;');
  });

});

describe('#connect',function ()
{

  it('connect to server',function (done)
  {
    var eventFired=false;
    this.timeout(5000);// this is mocha timeout

    setTimeout(function(){
      eventFired.should.equal(true);
      done();
    },3000);

    pop3.connect();
    pop3.on('connected',function(success)
    {
      eventFired=success;
    });

  });
});

describe('#retrieving mail',function () {

  it('retrieve mails from server',function(done) {

    var eventFired=false;
    this.timeout(10000);// this is mocha timeout

    setTimeout(function(){
      eventFired.should.equal(true);
      done();
    },9000);

    pop3.retrieve();
    pop3.on('retrieving',function (success) {
      eventFired=success;
    });

    pop3.on('zero_message',function (success) {
      eventFired=success;
    });

  });
});
