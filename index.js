"use strict";

var EventEmitter = require("events").EventEmitter;
var util = require('util');
var pop3=require('poplib');
var MailParser=require('mailparser').MailParser;
var mailparser=new MailParser();

module.exports.POP3=POP3;
module.exports.IMAP=IMAP;

function IMAP()
{
  // body...
}

function POP3 (options)
{
  var self=this;

  this.tlserrs = options.tlserrs ? options.tlserrs : false;
  this.enabletls = options.enabletls ? options.enabletls : false;
  this.debug = options.debug ? options.debug : true;
  this.port = options.port ? options.port : 995;
  this.host = options.host;
  this.username = options.username;
  this.password = options.password;
  this.totalmsgcount=0;
  this.mails=[];
  this.currmsg=0;
  this.pop_client=new pop3(this.port,this.host,
  {
    tlserrs:this.tlserrs,
    enabletls:this.enabletls,
    debug:this.debug
  });
  this.mailparser=new MailParser();
}

util.inherits(POP3, EventEmitter);
util.inherits(IMAP, EventEmitter);

IMAP.prototype.escape=function(html)
{
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

POP3.prototype.connect= function (){
  var self = this;

  self.pop_client.on('connect',function (){
    console.log('Connect Success');
    self.pop_client.login(self.username,self.password);
  });

  self.pop_client.on('locked',function (cmd) {
    console.log('Current command has not finished yet. You tried calling '+cmd);
  });

  self.pop_client.on('login',function (status,rawdata){
    if(status){

      console.log('LOGIN/PASS success');
      self.emit('connected',true);

    }else{

      console.log('LOGIN/PASS failed');
      self.pop_client.quit();
    }
  });

}

POP3.prototype.retrieve=function (){

  var self=this;

  self.pop_client.list();
  self.pop_client.on('list',function(status, msgcount, msgnumber, data,rawdata){

    if (status === false) {

      console.log("LIST failed");
      self.pop_client.quit();

    } else if (msgcount > 0)
    {

      self.emit('retrieving',true);
      self.totalmsgcount = msgcount;
      self.currmsg = 1;
      console.log("LIST success with " + msgcount + " message(s)");

      self.pop_client.retr(1);

    } else {

      console.log("LIST success with 0 message(s)");
      self.emit('zero_message',true);
      self.pop_client.quit();

    }
  });

  self.pop_client.on('retr',function(status,msgnumber,data,rawdata){

    if (status === true)
    {
      console.log("RETR success " + msgnumber);
      self.currmsg += 1;

      self.mailparser.write(new Buffer(data + "\r\n\r\n"));
      self.mailparser.end();

      self.pop_client.dele(msgnumber);

    } else {

      console.log("RETR failed for msgnumber " + msgnumber);
      self.pop_client.rset();

    }
  });

  self.pop_client.on('dele',function(status,msgnumber,data,rawdata){

    if(status===true){

      if (self.currmsg > self.totalmsgcount){

        console.log('TOTAL mails '+self.mails.length);
        self.emit('retrieve_done',self.mails);

        self.pop_client.quit();
      }
      else{
        self.pop_client.retr(self.currmsg);
      }

    }else{

      console.log('DELE failed for msgnumber '+msgnumber);
      self.pop_client.quit();
    }
  });

  self.pop_client.on("rset", function(status,rawdata) {
    self.pop_client.quit();
  });

  self.pop_client.on('quit',function(status,rawdata){

    if(status===true) console.log('QUIT success');
    else console.log('QUIT failed');
  });

  self.mailparser.on('end',function(mail){

    self.mails.push(mail);

  });

  self.mailparser.on("headers", function(headers){
      // console.log(headers.received);
  });
}
