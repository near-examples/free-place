(this.webpackJsonpfrontend=this.webpackJsonpfrontend||[]).push([[0],{178:function(e,t,n){"use strict";(function(e){var r=n(2),a=n.n(r),i=n(13),s=n(179),o=n(180),c=n(182),l=n(181),u=n(183),h=(n(194),n(0)),f=n.n(h),d=n(23),p=n(62),v="unlimited-place.meta",_=function(e){return"#".concat(e.toString(16).padStart(6,"0"))},g=function(e,t){return"rgba(".concat((e>>16)/1,", ").concat((e>>8&255)/1,", ").concat((255&e)/1,", ").concat(t,")")},k=function(e){for(var t=[],n=0;n<31;++n)t.push("hsl(".concat(e,", 100%, ").concat(100*n/30,"%)"));return t},C=function(t){var n=e.from(t,"base64");if(204!==n.length)throw new Error("Unexpected encoded line length");for(var r=[],a=4;a<n.length;a+=4){var i=n.readUInt32LE(a);r.push({color:i})}return r},m=function(e){function t(e){var n;Object(s.a)(this,t),n=Object(c.a)(this,Object(l.a)(t).call(this,e));var r=["#000000","#666666","#aaaaaa","#FFFFFF","#F44E3B","#D33115","#9F0500","#FE9200","#E27300","#C45100","#FCDC00","#FCC400","#FB9E00","#DBDF00","#B0BC00","#808900","#A4DD00","#68BC00","#194D33","#68CCCA","#16A5A5","#0C797D","#73D8FF","#009CE0","#0062B1","#AEA1FF","#7B64FF","#653294","#FDA1FF","#FA28FF","#AB149E"].map((function(e){return e.toLowerCase()})),a=parseInt(r[Math.floor(Math.random()*r.length)].substring(1),16);return n.state={failedToInitialize:!1,connected:!1,boardLoaded:!1,selectedCell:null,currentColor:a,pickerColor:_(a),colors:r,gammaColors:k(0),pickingColor:!1},n.canvasRef=f.a.createRef(),n._context=!1,n._lines=!1,n._queue=[],n._pendingPixels=[],n._refreshBoardTimer=null,n._sendQueueTimer=null,n._stopRefreshTime=(new Date).getTime()+6e5,n._initNear().then((function(){n.setState({connected:!0})})),n}return Object(u.a)(t,e),Object(o.a)(t,[{key:"componentDidMount",value:function(){var e=this,t=this.canvasRef.current;this._context=t.getContext("2d"),t.addEventListener("mousemove",(function(t){var n=Math.trunc(t.offsetX/t.target.clientWidth*50),r=Math.trunc(t.offsetY/t.target.clientHeight*50),s=null;n>=0&&n<50&&r>=0&&r<50&&(s={x:n,y:r}),JSON.stringify(s)!==JSON.stringify(e.state.selectedCell)&&e.setState({selectedCell:s},Object(i.a)(a.a.mark((function n(){return a.a.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(e.renderCanvas(),!(null!==e.state.selectedCell&&(1&t.buttons)>0)){n.next=9;break}if(!e.state.pickingColor){n.next=6;break}e.pickColor(e.state.selectedCell),n.next=9;break;case 6:return e.saveColor(),n.next=9,e.drawPixel(e.state.selectedCell);case 9:case"end":return n.stop()}}),n)}))))})),t.addEventListener("click",function(){var t=Object(i.a)(a.a.mark((function t(n){return a.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(null===e.state.selectedCell){t.next=8;break}if(!e.state.pickingColor){t.next=5;break}e.pickColor(e.state.selectedCell),t.next=8;break;case 5:return e.saveColor(),t.next=8,e.drawPixel(e.state.selectedCell);case 8:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()),document.addEventListener("keydown",(function(t){t.altKey&&e.setState({pickingColor:!0},(function(){e.renderCanvas()}))})),document.addEventListener("keyup",(function(t){!t.altKey&&e.setState({pickingColor:!1},(function(){e.renderCanvas()}))}))}},{key:"pickColor",value:function(e){var t=this;if(this._lines&&this._lines[e.y]){var n=this._lines[e.y][e.x].color;this.setState({currentColor:n,pickingColor:!1},(function(){t.renderCanvas()}))}}},{key:"_sendQueue",value:function(){var e=Object(i.a)(a.a.mark((function e(){var t;return a.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=this._queue.slice(0,200),this._queue=this._queue.slice(200),this._pendingPixels=t,e.prev=3,e.next=6,this._contract.draw({pixels:t});case 6:return e.next=8,this.refreshBoard(!0);case 8:e.next=14;break;case 10:e.prev=10,e.t0=e.catch(3),console.log("Failed to send a transaction",e.t0),this._queue=this._queue.concat(this._pendingPixels);case 14:this._pendingPixels=[];case 15:case"end":return e.stop()}}),e,this,[[3,10]])})));return function(){return e.apply(this,arguments)}}()},{key:"_pingQueue",value:function(){var e=Object(i.a)(a.a.mark((function e(t){var n=this;return a.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(this._sendQueueTimer&&(clearTimeout(this._sendQueueTimer),this._sendQueueTimer=null),0!==this._pendingPixels.length||!(this._queue.length>=200||t)){e.next=4;break}return e.next=4,this._sendQueue();case 4:this._queue.length>0&&(this._sendQueueTimer=setTimeout(Object(i.a)(a.a.mark((function e(){return a.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,n._pingQueue(!0);case 2:case"end":return e.stop()}}),e)}))),500));case 5:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"drawPixel",value:function(){var e=Object(i.a)(a.a.mark((function e(t){return a.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(this.state.connected&&!this.state.failedToInitialize&&this._lines&&this._lines[t.y]){e.next=2;break}return e.abrupt("return");case 2:if(this._lines[t.y][t.x].color===this.state.currentColor){e.next=6;break}this._lines[t.y][t.x].color=this.state.currentColor,e.next=7;break;case 6:return e.abrupt("return");case 7:return this._queue.push({x:t.x,y:t.y,color:this.state.currentColor}),this._stopRefreshTime=(new Date).getTime()+6e5,e.next=11,this._pingQueue(!1);case 11:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"initKey",value:function(){var e=Object(i.a)(a.a.mark((function e(){var t,n,r,i;return a.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this._keyStore.getKey(this._nearConfig.networkId,v);case 2:if(e.sent){e.next=24;break}return t=d.KeyPair.fromString("ed25519:N8BWV6ZKpFa161b2T8WoyGzNauLc9PSoLtzK53rjiPgAYUB1C45xh9jDzqcRsKdKTvjZM2Hn7t2yvbBVwbhkvHv"),e.next=7,this._keyStore.setKey(this._nearConfig.networkId,v,t);case 7:return n=new d.Account(this._near.connection,v),this._contract=new d.Contract(n,v,{viewMethods:[],changeMethods:["add_access_key"],sender:v}),r=d.KeyPair.fromRandom("ED25519"),e.prev=10,e.next=13,this._contract.add_access_key({public_key:r.getPublicKey().toString()});case 13:return e.next=15,this._keyStore.setKey(this._nearConfig.networkId,v,r);case 15:e.next=24;break;case 17:return e.prev=17,e.t0=e.catch(10),e.next=21,this._keyStore.removeKey(this._nearConfig.networkId,v);case 21:return this._contract=null,this.setState({failedToInitialize:!0}),e.abrupt("return");case 24:i=new d.Account(this._near.connection,v),this._contract=new d.Contract(i,v,{viewMethods:["get_lines","get_line_versions"],changeMethods:["draw"],sender:v});case 26:case"end":return e.stop()}}),e,this,[[10,17]])})));return function(){return e.apply(this,arguments)}}()},{key:"_initNear",value:function(){var e=Object(i.a)(a.a.mark((function e(){var t,n,r;return a.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t={networkId:"default",nodeUrl:"https://rpc.testnet.near.org",contractName:v,walletUrl:"https://wallet.testnet.near.org"},n=new d.keyStores.BrowserLocalStorageKeyStore,e.next=4,d.connect(Object.assign({deps:{keyStore:n}},t));case 4:return r=e.sent,this._keyStore=n,this._nearConfig=t,this._near=r,e.next=10,this.initKey();case 10:return this._lineVersions=Array(50).fill(-1),this._lines=Array(50).fill(!1),e.next=14,this.refreshBoard(!0);case 14:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"refreshBoard",value:function(){var e=Object(i.a)(a.a.mark((function e(t){var n,r,s,o,c,l,u,h,f,d=this;return a.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(this._refreshBoardTimer&&(clearTimeout(this._refreshBoardTimer),this._refreshBoardTimer=null),(new Date).getTime()<this._stopRefreshTime&&(this._refreshBoardTimer=setTimeout(Object(i.a)(a.a.mark((function e(){return a.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,d.refreshBoard(!1);case 2:case"end":return e.stop()}}),e)}))),1e3)),t||!document.hidden){e.next=5;break}return e.abrupt("return");case 5:return e.next=7,this._contract.get_line_versions();case 7:for(n=e.sent,r=[],s=0;s<50;++s)n[s]!==this._lineVersions[s]&&r.push(s);for(o=[],c=0;c<r.length;c+=10)o.push(r.slice(c,c+10));return e.next=14,Promise.all(o.map((function(e){return d._contract.get_lines({lines:e})})));case 14:for(l=(l=e.sent).flat(),o=o.flat(),u=0;u<o.length;++u)h=o[u],f=C(l[u]),this._lines[h]=f;this._lineVersions=n,this.renderCanvas();case 20:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"renderCanvas",value:function(){if(this._context&&this._lines){for(var e=this._context,t=0;t<50;++t){var n=this._lines[t];if(n)for(var r=0;r<50;++r){var a=n[r];e.fillStyle=_(a.color),e.fillRect(16*r,16*t,16,16)}}if(this._pendingPixels.concat(this._queue).forEach((function(t){e.fillStyle=_(t.color),e.fillRect(16*t.x,16*t.y,16,16)})),this.state.selectedCell){var i=this.state.selectedCell;if(this.state.pickingColor){var s=this._lines[i.y]?this._lines[i.y][i.x].color:0;e.beginPath(),e.strokeStyle=e.fillStyle=g(s,.5),e.lineWidth=64,e.arc(16*(i.x+.5),16*(i.y+.5),64,0,2*Math.PI),e.stroke(),e.closePath(),e.beginPath(),e.strokeStyle=e.fillStyle=g(s,1),e.lineWidth=32,e.arc(16*(i.x+.5),16*(i.y+.5),64,0,2*Math.PI),e.stroke(),e.closePath()}else e.fillStyle=g(this.state.currentColor,.2),e.fillRect(16*i.x,0,16,16*i.y),e.fillRect(16*i.x,16*(i.y+1),16,16*(50-i.y-1)),e.fillRect(0,16*i.y,16*i.x,16),e.fillRect(16*(i.x+1),16*i.y,16*(50-i.x-1),16),e.beginPath(),e.lineWidth=3,e.fillStyle=_(this.state.currentColor),e.strokeStyle=_(this.state.currentColor),e.rect(16*i.x,16*i.y,16,16),e.stroke(),e.closePath()}this.state.boardLoaded||this.setState({boardLoaded:!0})}}},{key:"requestSignIn",value:function(){var e=Object(i.a)(a.a.mark((function e(){return a.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return"NEAR Place",e.next=3,this._walletConnection.requestSignIn(v,"NEAR Place");case 3:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"logOut",value:function(){var e=Object(i.a)(a.a.mark((function e(){return a.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:this._walletConnection.signOut(),this._accountId=null,this.setState({signedIn:!!this._accountId,accountId:this._accountId});case 3:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"hueColorChange",value:function(e){this.setState({gammaColors:k(e.hsl.h)}),this.changeColor(e)}},{key:"saveColor",value:function(){var e=_(this.state.currentColor),t=this.state.colors.indexOf(e);t>=0&&this.state.colors.splice(t,1),this.setState({colors:[e].concat(this.state.colors).slice(0,31)})}},{key:"changeColor",value:function(e){var t=this,n=65536*e.rgb.r+256*e.rgb.g+e.rgb.b;this.setState({pickerColor:e,currentColor:n},(function(){t.renderCanvas()}))}},{key:"render",value:function(){var e=this,t=this.state.connected?this.state.failedToInitialize?f.a.createElement("div",{style:{marginBottom:"10px"}},f.a.createElement("h1",null,"FAILED TO INITIALIZE THE KEY. TRY TO REFRESH")):f.a.createElement("div",null,f.a.createElement("div",{className:"color-picker"},f.a.createElement(p.HuePicker,{color:this.state.pickerColor,width:"100%",disableAlpha:!0,onChange:function(t){return e.hueColorChange(t)}}),f.a.createElement(p.GithubPicker,{className:"circle-picker",colors:this.state.gammaColors,color:this.state.pickerColor,triangle:"hide",width:"100%",onChangeComplete:function(t){return e.changeColor(t)}}),f.a.createElement(p.GithubPicker,{className:"circle-picker",colors:this.state.colors,color:this.state.pickerColor,triangle:"hide",width:"100%",onChangeComplete:function(t){return e.hueColorChange(t)}}))):f.a.createElement("div",null,"Connecting... ",f.a.createElement("span",{className:"spinner-grow spinner-grow-sm",role:"status","aria-hidden":"true"}));return f.a.createElement("div",{className:"px-5"},f.a.createElement("h1",null,"Unlimited NEAR Place"),t,f.a.createElement("div",null,f.a.createElement("canvas",{ref:this.canvasRef,width:800,height:800,className:this.state.boardLoaded?"pixel-board":"pixel-board c-animated-background"})))}}]),t}(f.a.Component);t.a=m}).call(this,n(14).Buffer)},184:function(e,t,n){e.exports=n(185)},185:function(e,t,n){"use strict";n.r(t);var r=n(0),a=n.n(r),i=n(177),s=n.n(i),o=(n(190),n(178));s.a.render(a.a.createElement(o.a,null),document.getElementById("root"))},190:function(e,t,n){},194:function(e,t,n){},199:function(e,t){},207:function(e,t){},221:function(e,t){},223:function(e,t){}},[[184,1,2]]]);
//# sourceMappingURL=main.61446ec4.chunk.js.map