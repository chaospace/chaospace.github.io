(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[931],{8005:function(e,r,t){Promise.resolve().then(t.bind(t,1811)),Promise.resolve().then(t.bind(t,8609))},8609:function(e,r,t){"use strict";t.r(r),t.d(r,{default:function(){return g}});var n=t(9268),s=t(9),a=t(3380),o=t(8683),c=t.n(o),i=t(5846),l=t.n(i),u=t(9614),f=t(4602),d=function(e){let{date:r,readTime:t}=e,s=(0,f.Z)(r,"yyyy-MM-dd");return(0,n.jsxs)("span",{className:"flex flex-wrap gap-2 items-center text-xs",children:[(0,n.jsxs)("span",{className:"inline-flex items-center basis-24 flex-grow-0",children:[(0,n.jsx)(a.G,{icon:u.fT7,size:"xs"}),(0,n.jsx)("time",{className:"pl-1",dateTime:s,children:s})]}),(0,n.jsxs)("span",{className:"inline-flex items-center basis-24 flex-grow-0",children:[(0,n.jsx)(a.G,{icon:u.SZw,size:"xs"}),(0,n.jsx)("span",{className:"pl-1",children:"".concat(Math.ceil(t)," minutes")})]})]})},h=function(e){let{tags:r}=e;return(0,n.jsx)("ul",{className:"flex flex-wrap gap-1 items-center mb-2",children:r.map((e,r)=>(0,n.jsx)("li",{className:"rounded bg-gray-400 bg-opacity-20 p-1 text-[10px]",children:e.toUpperCase()},r))})},p=t(3039);let m={from:{opacity:0,x:-10},to:function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;return{opacity:1,x:0,transition:{delay:.1*e}}}};function x(e){let{title:r,slug:t,date:o,tags:c,summary:i,readTime:u,prefix:f,index:x=0}=e;return(0,n.jsx)(p.E.article,{custom:x,variants:m,initial:"from",animate:"to",className:"relative box-border border-image before:content-normal  before:absolute     before:box-border  before:bottom-0 before:left-0 before:w-0 before:h-0 before:border-l-transparent before:border-l-2 before:border-b-transparent before:border-b-2 before:invisible before:pointer-events-none  after:absolute after:pointer-events-none after:top-0  after:right-0 after:invisible after:content-normal after:w-0 after:h-0 after:border-r-transparent after:border-t-transparent after:border-r-2 after:border-t-2 after:rounded-tr-md  hover:before:w-full hover:before:h-full hover:after:w-full  hover:after:h-full hover:before:visible hover:after:visible transition-transform duration-100 transform-gpu select-none ease-out ",children:(0,n.jsxs)("div",{className:"flex flex-col gap-1 p-4",children:[(0,n.jsx)(d,{date:o,readTime:u}),(0,n.jsx)(l(),{href:"/".concat(f,"/").concat(t),children:(0,n.jsx)("h3",{className:"font-bold truncate",children:r})}),c&&(0,n.jsx)(h,{tags:c}),(0,n.jsx)("p",{className:"text-sm",children:i}),(0,n.jsxs)(l(),{className:"text-xs text-primary-500 subpixel-antialiased underline underline-offset-4",href:"/".concat(f,"/").concat(t),children:["read more ",(0,n.jsx)(a.G,{className:"ml-1",icon:s.jmi})]})]})})}var g=function(e){let{className:r,posts:t,prefix:s="",children:a}=e;return(0,n.jsxs)(p.E.div,{className:c()("grid grid-cols-1 auto-rows-auto gap-4",r),children:[t.map((e,r)=>(0,n.jsx)(x,{...e,prefix:s,index:r},e.slug)),a]})}},1811:function(e,r,t){"use strict";t.r(r),t.d(r,{default:function(){return v}});var n=t(9268),s=t(6006),a=function(e){let[r,t]=(0,s.useState)(null);return(0,s.useEffect)(()=>{let r=document.createElement("img");r.onload=()=>t(r),r.src=e},[e]),r},o=t(6079),c=function(e){let r=arguments.length>1&&void 0!==arguments[1]&&arguments[1];(0,s.useEffect)(()=>(r&&e(),window.addEventListener("resize",e),()=>{window.addEventListener("resize",e)}),[e])},i=t(1348),l=t(8683),u=t.n(l),f=t(1213),d=t(226),h=t(5984),p=t(8611);let m=(e,r,t,n)=>{let s=Math.PI/2,a=-1*s+2*Math.PI*(n%1),o=e+Math.cos(a)*t-.01,c=r+Math.sin(a)*t,i=a>=s?1:0;return n%1==0&&n>0&&(i=1),["M ".concat(e,",").concat(r),"L ".concat(e,",").concat(r-t),"A ".concat(t,",").concat(t," 0 ").concat(i,", 1 ").concat(o,",").concat(c),"Z"].join(" ")},x=(e,r)=>{e.setAttribute("d",m(50,50,48,r))},g=(0,s.forwardRef)((e,r)=>{let{progress:t=o.BA.INIT,progressSize:a=.5,color:c="#ffcc00",repeat:i=!1}=e,l=(0,s.useRef)(null),u=(0,s.useRef)(null),m=(0,s.useRef)(null);return(0,f.Z)(()=>{let e=l.current.querySelector("p.progress-label");m.current=new h.Z(e,{types:"chars, words"}),u.current=d.p8.context(()=>{},l),d.p8.set(e,{perspective:400});let r=l.current.querySelector("svg > path"),t=l.current.querySelector(".progress-circle");return u.current.add("show",()=>{let e=d.p8.timeline({ease:"power1"});e.call(()=>{l.current.dataset.progress="0",d.p8.set(l.current,{autoAlpha:1}),x(r,1)}).from(l.current,{duration:.6,autoAlpha:0,y:10,transformOrigin:"50% 50%"}).from(m.current.chars,{duration:.5,scale:0,rotationY:-180,stagger:.1,transformOrigin:"50% 100%"},"<").from(t,{duration:.6,scale:0,transformOrigin:"50% 50%"},"<").to(l.current.dataset,{duration:1,progress:1,repeat:-1,onUpdate:()=>{x(r,Number(l.current.dataset.progress))}}).to(m.current.chars,{duration:.6,keyframes:{color:["white","black","white"],y:[0,-5,0]},stagger:.1,repeat:-1,repeatDelay:.5},"<")}),u.current.add("hide",()=>{let e=d.p8.timeline();e.to(l.current,{duration:.6,autoAlpha:0,y:-10}).to(l.current.dataset,{duration:.6,progress:0,onUpdate:()=>{let e=Number(l.current.dataset.progress);x(r,e)},ease:"power1"},"<").to(m.current.chars,{duration:.6,autoAlpha:0,scale:0,rotationY:-360,transformOrigin:"50% 100%",stagger:.1,ease:"power2"},"<")}),()=>{u.current.revert(),m.current.revert()}},[]),(0,f.Z)(()=>{let e=~~(48*a);d.p8.set(l.current.querySelector(".progress-circle"),{width:e,height:e})},[a]),(0,f.Z)(()=>{let e=l.current.querySelector("svg > path");switch(t===o.BA.COMPLETE&&p.env.STORY_BOOK&&(l.current.dataset.progress="1"),t){case o.BA.DEFAULAT:x(e,1);break;case o.BA.INIT:u.current.show();break;case o.BA.COMPLETE:u.current.hide()}return()=>{u.current.revert()}},[t,i]),(0,s.useImperativeHandle)(r,()=>({show:()=>{u.current.show()},hide:()=>{u.current.hide()},reset:()=>{u.current.revert()}}),[]),(0,n.jsxs)("div",{ref:l,className:"relative text-center",children:[(0,n.jsx)("div",{className:"progress-circle w-20 h-20 text-inherit mx-auto",children:(0,n.jsxs)("svg",{width:"100%",height:"100%",viewBox:"0 0 100 100",className:"drop-shadow",children:[(0,n.jsx)("defs",{children:(0,n.jsxs)("radialGradient",{id:"gradient",children:[(0,n.jsx)("stop",{offset:"90%",stopColor:"red"}),(0,n.jsx)("stop",{offset:"100%",stopColor:"transparent"})]})}),(0,n.jsx)("path",{fill:c})]})}),(0,n.jsx)("p",{className:"progress-label text-3xl text-white text-shadow subpixel-antialiased",children:"Santorini"})]})});g.displayName="CircleProgress";var b=t(8611);let E=(e,r,t)=>e.state!==r?{progress:t,state:r}:{...e,progress:t};var v=function(e){let{className:r,children:l,url:d="/images/santorini.jpg"}=e,[h,p]=(0,s.useState)(d),m=(0,s.useRef)(null),x=(0,s.useRef)(null),v=(0,s.useCallback)(e=>{e&&null===m.current&&(m.current=e)},[]),R=(0,s.useRef)(null);a(d);let[N,O]=(0,s.useState)({state:o.BA.INIT,progress:0}),w=(0,s.useMemo)(()=>e=>{let{data:r}=e,{state:t,progress:n}=r;t===o.Bg.WORK_PROGRESS_BEFORE?O(e=>E(e,o.BA.INIT,n)):t===o.Bg.WORK_PROGRESS_ING||t===o.Bg.WORK_PROGRESS_COMPLETE&&O(e=>E(e,o.BA.COMPLETE,n))},[]),I=(0,s.useCallback)(()=>{let e=m.current.parentElement.clientWidth,r=m.current.parentElement.clientHeight;return(Number(m.current.style.width)!==e||Number(m.current.style.height)!==r)&&(m.current.style.width="".concat(e,"px"),m.current.style.height="".concat(r,"px")),{width:e,height:r}},[]),S=(0,s.useMemo)(()=>(0,i.iz)(()=>{R.current.postMessage({state:o.Bg.SYNC,stage:I(),devicePixelRatio})},300),[I]);return(0,f.Z)(()=>(R.current=new Worker(t.tu(new URL(t.p+t.u(143),t.b))),R.current.onmessage=w,R.current.onerror=e=>{console.log("e",e)},b.env.STORY_BOOK?(x.current=m.current.transferControlToOffscreen(),R.current.postMessage({state:o.Bg.INITIALIZE,canvas:x.current,devicePixelRatio},[x.current])):x.current?R.current.postMessage({state:o.Bg.INITIALIZE,canvas:x.current,devicePixelRatio},[x.current]):x.current=m.current.transferControlToOffscreen(),()=>{R.current.terminate()}),[w]),(0,s.useEffect)(()=>{R.current&&R.current.postMessage({state:o.Bg.IMAGE_CHANGE,url:d,stage:I(),devicePixelRatio})},[d,I]),c(S),(0,n.jsxs)("div",{className:u()("relative bg-inherit aspect-video",r),children:[(0,n.jsx)("canvas",{className:"absolute transition-all duration-75 ease-out",ref:v}),(0,n.jsx)("article",{className:"absolute flex w-full h-full justify-center items-center",children:(0,n.jsx)(g,{progress:N.state,progressSize:.2,color:"#ffffff"})}),l]})}},6079:function(e,r,t){"use strict";t.d(r,{BA:function(){return o},Bg:function(){return a},Zt:function(){return f}});var n,s,a,o,c=t(9),i=t(4152),l=t.n(i),u=t(8611);l().join(u.cwd(),"content");let f={DARK:"dark",LIGHT:"light"};(n=a||(a={})).INITIALIZE="INITIALIZE",n.IMAGE_CHANGE="IMAGE_CHANGE",n.RESIZE="RESIZE",n.DRAW="DRAW",n.SYNC="SYNC",n.WORK_PROGRESS_BEFORE="WORK_PROGRESS_BEFORE",n.WORK_PROGRESS_ING="WORK_PROGRESS_ING",n.WORK_PROGRESS_COMPLETE="WORK_PROGRESS_COMPLETE",(s=o||(o={}))[s.DEFAULAT=0]="DEFAULAT",s[s.INIT=1]="INIT",s[s.PROGRESS=2]="PROGRESS",s[s.COMPLETE=3]="COMPLETE",c.OGB,c.w49,c.irx,c.e_0},1213:function(e,r,t){"use strict";var n=t(6006);let s=n.useLayoutEffect;r.Z=s},1348:function(e,r,t){"use strict";t.d(r,{iz:function(){return n}});let n=function(e){let r,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:100;return function(){for(var n=arguments.length,s=Array(n),a=0;a<n;a++)s[a]=arguments[a];r&&clearTimeout(r),r=setTimeout(()=>{clearTimeout(r),r=void 0,e(...s)},t)}}}},function(e){e.O(0,[957,224,599,846,578,150,988,984,253,961,744],function(){return e(e.s=8005)}),_N_E=e.O()}]);