function sourceURL(value){
 if(value===undefined||value==='')return '';
 if(typeof value!=='string'||value.length>4096)throw Error('来源网址无效');
 value=value.trim();if(!value)return '';
 let url;try{url=new URL(value);}catch{throw Error('请输入完整的 http 或 https 来源网址');}
 if(!['http:','https:'].includes(url.protocol)||!url.hostname||url.username||url.password)throw Error('来源网址只支持不含登录信息的 http 或 https 地址');
 return url.href;
}
module.exports={sourceURL};
