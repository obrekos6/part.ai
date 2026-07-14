(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=document.getElementById(`theme-toggle`),t=document.getElementById(`theme-icon`),n=`<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>`,r=`<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>`;function i(e){t.innerHTML=e===`dark`?r:n}function a(){return!!document.startViewTransition}function o(e){document.documentElement.setAttribute(`data-theme`,e),i(e)}function s(){i(document.documentElement.getAttribute(`data-theme`)),a()||document.body.classList.add(`safari-fallback`),e.addEventListener(`click`,e=>{let t=document.documentElement.getAttribute(`data-theme`)===`dark`?`light`:`dark`;if(a()){let n=e.clientX,r=e.clientY,i=Math.hypot(Math.max(n,window.innerWidth-n),Math.max(r,window.innerHeight-r)),a=document.startViewTransition(()=>{o(t)});document.documentElement.style.setProperty(`--x`,`${n}px`),document.documentElement.style.setProperty(`--y`,`${r}px`),document.documentElement.style.setProperty(`--r`,`${i}px`),a.finished.then(()=>{localStorage.setItem(`part-ai-theme`,t)})}else o(t),localStorage.setItem(`part-ai-theme`,t)}),window.matchMedia(`(prefers-color-scheme: dark)`).addEventListener(`change`,e=>{localStorage.getItem(`part-ai-theme`)||o(e.matches?`dark`:`light`)})}var c=document.getElementById(`sidebar`),l=document.getElementById(`toggle-btn`),u=document.getElementById(`sidebar-overlay`),d=document.getElementById(`new-chat-btn`),f=document.getElementById(`message-input`),p=localStorage.getItem(`part-ai-sidebar`)!==`hidden`,m=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/></svg>`,ee=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/></svg>`;function h(){return window.innerWidth<=768}function g(){c&&(c.classList.toggle(`hidden`,!p),l&&(l.innerHTML=p?m:ee),h()?u&&u.classList.toggle(`active`,p):u&&u.classList.remove(`active`))}function _(){p=!p,g(),h()||localStorage.setItem(`part-ai-sidebar`,p?`visible`:`hidden`)}function te(){localStorage.getItem(`part-ai-sidebar`)===`hidden`?(p=!1,c.classList.add(`pre-hidden`),requestAnimationFrame(()=>{requestAnimationFrame(()=>{c.classList.remove(`pre-hidden`),g()})})):g(),l&&l.addEventListener(`click`,_),u&&u.addEventListener(`click`,()=>{h()&&p&&_()}),h()&&p&&_(),window.addEventListener(`resize`,()=>{window.innerWidth>768&&p&&u&&u.classList.remove(`active`),g()}),d&&d.addEventListener(`click`,()=>{f&&(f.value=``,f.focus()),h()&&p&&_()})}var v=document.getElementById(`chat-form`),y=document.getElementById(`message-input`),b=document.getElementById(`send-btn`),x=document.getElementById(`chat-form`),S=document.querySelector(`.center-content`),C=document.getElementById(`dynamic-title`),w=document.querySelector(`.subtitle`),T=document.querySelector(`.input-container`),E=`https://ymgxlmeqtpyfgxvcclun.supabase.co/functions/v1/ask-ai`,D=20,O=`part-ai-chat`,k=!1,A=[],j=[],ne=0;function re(){try{let e=localStorage.getItem(O);if(e){let t=JSON.parse(e);return j=t.allMessages||[],A=t.messageHistory||[],t.chatStarted||!1}}catch{localStorage.removeItem(O)}return!1}function M(){try{localStorage.setItem(O,JSON.stringify({allMessages:j,messageHistory:A,chatStarted:k}))}catch{}}var N=document.getElementById(`chat-scroll-area`);N||(N=document.createElement(`div`),N.id=`chat-scroll-area`,N.style.cssText=`
    flex: 1;
    overflow-y: auto;
    display: none;
    padding: 0 24px 16px 24px;
    width: 100%;
    min-height: 0;
  `,S.insertBefore(N,T));var P=document.getElementById(`chat-messages`);P||(P=document.createElement(`div`),P.id=`chat-messages`,P.style.cssText=`
    width: 100%;
    max-width: min(680px, 90vw);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,N.appendChild(P));function F(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}var I=/```([a-zA-Z0-9_+-]*)(?::([^\n`]+))?\n([\s\S]*?)```/g,ie={html:`html`,htm:`html`,css:`css`,js:`js`,javascript:`js`,jsx:`jsx`,ts:`ts`,typescript:`ts`,tsx:`tsx`,python:`py`,py:`py`,json:`json`,bash:`sh`,sh:`sh`,shell:`sh`,java:`java`,c:`c`,cpp:`cpp`,"c++":`cpp`,php:`php`,sql:`sql`,yaml:`yml`,yml:`yml`,xml:`xml`,md:`md`,markdown:`md`};function ae(){let e={};return function(t){let n=(t||`txt`).toLowerCase(),r=ie[n]||n||`txt`;e[r]=(e[r]||0)+1;let i=e[r];return i===1?`code.${r}`:`code-${i}.${r}`}}function L(e){let t=[],n=0,r,i=ae();for(I.lastIndex=0;(r=I.exec(e))!==null;){r.index>n&&t.push({type:`text`,content:e.slice(n,r.index)});let a=(r[1]||``).trim(),o=(r[2]?r[2].trim():``)||i(a);t.push({type:`code`,lang:a,fileName:o,code:r[3].replace(/\n$/,``)}),n=I.lastIndex}return n<e.length&&t.push({type:`text`,content:e.slice(n)}),t}function R(e){return/```[a-zA-Z0-9_+-]*(?::[^\n`]+)?\n[\s\S]*?```/.test(e)}function z(e){let t=[],n=e.replace(/```([a-zA-Z0-9+-]*)?\n?([\s\S]*?)```/g,(e,n,r)=>{let i=t.length;return t.push({lang:(n||``).trim(),code:F(r).trimEnd()}),`\x00CODEBLOCK${i}\x00`});n=F(n),n=n.replace(/^### (.+)$/gm,`<h3>$1</h3>`),n=n.replace(/^## (.+)$/gm,`<h2>$1</h2>`),n=n.replace(/^# (.+)$/gm,`<h1>$1</h1>`),n=n.replace(/^\s*---\s*$/gm,`<hr>`);let r=n.split(`
`),i=[],a=[];function o(){if(a.length){let e=a.map(e=>e.replace(/^> ?/,``)).join(`<br>`);i.push(`<blockquote>${e}</blockquote>`),a=[]}}for(let e of r)e.startsWith(`>`)?a.push(e):(o(),i.push(e));o(),n=i.join(`
`);let s=n.split(`
`),c=[],l=!1,u=`ul`,d=[];for(let e of s){let t=e.trim(),n=t.match(/^[-*] (.*)$/),r=t.match(/^(\d+)\. (.*)$/),i=t.match(/^[-*] \[([ xX])\] (.*)$/);if(i){let e=`<span class="md-check">${i[1].toLowerCase()===`x`?`☑`:`☐`}</span> ${i[2]}`;l||(l=!0,u=`ul`,d=[]),d.push(e)}else if(n)l||(l=!0,u=`ul`,d=[]),d.push(n[1]);else if(r)l||(l=!0,u=`ol`,d=[]),d.push(r[2]);else{if(l){let e=u===`ul`?`ul`:`ol`;c.push(`<${e}><li>${d.join(`</li><li>`)}</li></${e}>`),l=!1,d=[]}c.push(e)}}if(l){let e=u===`ul`?`ul`:`ol`;c.push(`<${e}><li>${d.join(`</li><li>`)}</li></${e}>`)}return n=c.join(`
`),n=n.replace(/^(\|.*\|)\n\|[-:\s|]+\n((?:\|.*\|\n?)+)/gm,(e,t,n)=>{let r=t.split(`|`).map(e=>e.trim()).filter(e=>e),i=n.trim().split(`
`).map(e=>e.split(`|`).map(e=>e.trim()).filter(e=>e)),a=`<table class="md-table"><thead><tr>`;return r.forEach(e=>{a+=`<th>${e}</th>`}),a+=`</tr></thead><tbody>`,i.forEach(e=>{a+=`<tr>`,e.forEach(e=>{a+=`<td>${e}</td>`}),a+=`</tr>`}),a+=`</tbody></table>`,a}),n=n.replace(/\[([^\]]+)\]\(([^)]+)\)/g,`<a href="$2" target="_blank" rel="noopener">$1</a>`),n=n.replace(/\*\*(.+?)\*\*/g,`<strong>$1</strong>`),n=n.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g,`<em>$1</em>`),n=n.replace(/~~(.+?)~~/g,`<del>$1</del>`),n=n.replace(/__(.+?)__/g,`<u>$1</u>`),n=n.replace(/`(.+?)`/g,`<code>$1</code>`),n=n.replace(/\x00CODEBLOCK(\d+)\x00/g,(e,n)=>{let{lang:r,code:i}=t[+n];return`<pre class="md-code-block"><code${r?` class="language-${r}"`:``}>${i}</code></pre>`}),n=n.replace(/\n/g,`<br>`),n}var oe=`<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;function se(e,t,n){ne+=1;let r=document.createElement(`div`);r.className=`code-block`,r.innerHTML=`
    <div class="code-block-header">
      <div class="code-block-header-info">
        ${oe}
        <span class="code-block-filename">${F(t)}</span>
        <span class="code-block-lang">${F(e||``)}</span>
      </div>
    </div>
    <div class="code-block-body">
      <pre class="code-block-code"><code></code></pre>
    </div>
  `,r.querySelector(`.code-block-code code`).textContent=n;let i=r.querySelector(`.code-block-body`);return requestAnimationFrame(()=>{r.querySelector(`.code-block-code`).scrollHeight<=108&&i.classList.add(`expanded`)}),r}function B(e=`Thinking`){let t=document.createElement(`div`);t.className=`thinking-block`,t.style.display=`none`,t.innerHTML=`
    <button class="thinking-header" type="button" aria-expanded="false">
      <div class="thinking-left">
        <svg class="thinking-icon spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="thinking-title">${(()=>{let t=document.createElement(`div`);return t.textContent=e,t.innerHTML})()}</span>
      </div>
      <div class="thinking-right">
        <span class="thinking-time"></span>
        <svg class="thinking-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </button>
    <div class="thinking-body-wrap">
      <div class="thinking-body"></div>
    </div>
  `;let n=t.querySelector(`.thinking-header`),r=t.querySelector(`.thinking-body-wrap`),i=t.querySelector(`.thinking-body`),a=t.querySelector(`.thinking-chevron`),o=t.querySelector(`.thinking-time`),s=Date.now(),c=!1,l=null;function u(){let e=(Date.now()-s)/1e3;o.textContent=e.toFixed(2)+`s`}function d(){t.style.display=`block`,t.style.opacity=`0`,t.style.transform=`translateY(-6px)`,requestAnimationFrame(()=>{t.style.transition=`opacity 0.3s ease, transform 0.3s ease`,t.style.opacity=`1`,t.style.transform=`translateY(0)`}),u(),l&&clearInterval(l),l=setInterval(u,100)}function f(){c=!c,t.classList.toggle(`expanded`,c),n.setAttribute(`aria-expanded`,String(c)),c?r.style.maxHeight=i.scrollHeight+20+`px`:r.style.maxHeight=`0`}n.addEventListener(`click`,f),n.addEventListener(`mouseenter`,()=>{t.classList.contains(`done`)||(o.style.display=`none`,a.style.display=`block`)}),n.addEventListener(`mouseleave`,()=>{t.classList.contains(`done`)||(o.style.display=`block`,a.style.display=`none`)});function p(){l&&=(clearInterval(l),null),t.classList.add(`done`);let e=t.querySelector(`.thinking-icon`);e.classList.remove(`spinning`),e.innerHTML=`
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M8 12l3 3 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;let r=(Date.now()-s)/1e3,i=r<.01?`<0.01s`:r.toFixed(2)+`s`;o.textContent=i,o.style.display=`block`,a.style.display=`none`,n.addEventListener(`mouseenter`,()=>{o.style.display=`none`,a.style.display=`block`}),n.addEventListener(`mouseleave`,()=>{o.style.display=`block`,a.style.display=`none`})}return{el:t,show:d,appendText(e){i.textContent+=e,t.classList.contains(`expanded`)&&(r.style.maxHeight=i.scrollHeight+20+`px`)},finish:p,getStartedAt(){return s}}}function V(e,t,n){if(e.innerHTML=``,n){e.innerHTML=t.replace(/\n/g,`<br>`);return}let r=L(t);if(r.length===1&&r[0].type===`text`){e.innerHTML=z(t);return}for(let t of r)if(t.type===`text`){if(t.content.trim()===``)continue;let n=document.createElement(`div`);n.innerHTML=z(t.content),e.appendChild(n)}else e.appendChild(se(t.lang,t.fileName,t.code))}function ce(e,t){j.push({text:e,isUser:t});let n=document.createElement(`div`);return n.className=`chat-message`,n.style.cssText=`
    padding: 12px 16px;
    border-radius: 14px;
    max-width: 85%;
    word-wrap: break-word;
    font-size: 14px;
    line-height: 1.6;
    align-self: ${t?`flex-end`:`flex-start`};
    background-color: ${t?`var(--text-primary)`:`var(--btn-bg)`};
    color: ${t?`var(--bg-main)`:`var(--text-primary)`};
    border: 1px solid var(--border-color);
    opacity: 0;
    transform: translateY(20px);
  `,!t&&R(e)&&(n.style.maxWidth=`100%`),V(n,e,t),P.appendChild(n),requestAnimationFrame(()=>{n.style.transition=`opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)`,n.style.opacity=`1`,n.style.transform=`translateY(0)`}),N.scrollTop=N.scrollHeight,M(),n}var H=null;function U(){H&&=(H.remove(),null),H=document.createElement(`div`),H.className=`typing-indicator`,H.style.cssText=`
    padding: 8px 16px;
    border-radius: 14px;
    align-self: flex-start;
    color: var(--text-muted);
    font-size: 16px;
    letter-spacing: 3px;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  `,H.textContent=`...`,P.appendChild(H),requestAnimationFrame(()=>{H.style.opacity=`1`,H.style.transform=`translateY(0)`}),N.scrollTop=N.scrollHeight;let e=setTimeout(()=>{if(H&&H.parentNode){let e=document.createElement(`div`);e.style.cssText=`
        font-size: 12px;
        color: var(--text-muted);
        opacity: 0.6;
        padding: 4px 16px;
        margin-top: -4px;
        align-self: flex-start;
      `,e.textContent=`Ответ занимает больше обычного, но я усердно работаю! Попробуйте перезагрузить страницу, если ответ через чур долгий.`,H.after(e),H._hint=e}},15e3);H._slowHintTimeout=e}function W(){H&&=(H._slowHintTimeout&&clearTimeout(H._slowHintTimeout),H._hint&&H._hint.remove(),H.remove(),null)}function G(e){return new Promise(t=>setTimeout(t,e))}async function le(){k||(k=!0,M(),C.style.transition=`opacity 0.3s ease, transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,C.style.opacity=`0`,C.style.transform=`translateY(-20px)`,await G(200),w.style.transition=`opacity 0.3s ease, transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,w.style.opacity=`0`,w.style.transform=`translateY(-20px)`,await G(200),N.style.display=`block`,S.style.justifyContent=`flex-start`,S.style.paddingTop=`20px`,S.style.paddingBottom=`0`,C.style.display=`none`,w.style.display=`none`)}function ue(){k=!1,A=[],j=[],P.innerHTML=``,N.style.display=`none`,N.scrollTop=0,M(),C.style.display=``,w.style.display=``,C.style.opacity=`1`,C.style.transform=`translateY(0)`,w.style.opacity=`1`,w.style.transform=`translateY(0)`,C.style.transition=``,w.style.transition=``,S.style.justifyContent=`center`,S.style.paddingTop=``,S.style.paddingBottom=``}function de(){P.innerHTML=``;for(let e of j){let t=document.createElement(`div`);t.className=`chat-message`,t.style.cssText=`
      padding: 12px 16px;
      border-radius: 14px;
      max-width: 85%;
      word-wrap: break-word;
      font-size: 14px;
      line-height: 1.6;
      align-self: ${e.isUser?`flex-end`:`flex-start`};
      background-color: ${e.isUser?`var(--text-primary)`:`var(--btn-bg)`};
      color: ${e.isUser?`var(--bg-main)`:`var(--text-primary)`};
      border: 1px solid var(--border-color);
      opacity: 0;
      transform: translateY(20px);
    `,!e.isUser&&R(e.text)&&(t.style.maxWidth=`100%`),V(t,e.text,e.isUser),P.appendChild(t),requestAnimationFrame(()=>{t.style.transition=`opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)`,t.style.opacity=`1`,t.style.transform=`translateY(0)`})}N.scrollTop=N.scrollHeight}async function fe(){let e=``,t=``,n=null,r=!1;U();try{let i=await fetch(E,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({messages:A})});if(!i.ok){console.warn(`Response error, retrying...`);let i=await fetch(E,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({messages:A})});if(!i.ok)return W(),e;W();let a=i.body.getReader(),o=new TextDecoder,s=``,c=document.createElement(`div`);c.className=`chat-message`,c.id=`streaming-message`,c.style.cssText=`
        padding: 12px 16px;
        border-radius: 14px;
        max-width: 85%;
        word-wrap: break-word;
        font-size: 14px;
        line-height: 1.6;
        align-self: flex-start;
        background-color: var(--btn-bg);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        opacity: 0;
        transform: translateY(20px);
      `,P.appendChild(c),requestAnimationFrame(()=>{c.style.transition=`opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)`,c.style.opacity=`1`,c.style.transform=`translateY(0)`});let l=document.createElement(`div`);for(c.appendChild(l);;){let{done:i,value:u}=await a.read();if(i)break;s+=o.decode(u,{stream:!0});let d=s.split(`
`);s=d.pop()||``;for(let i of d)if(i.startsWith(`data: `)){let a=i.slice(6);if(a===`[DONE]`)continue;try{let i=JSON.parse(a).choices?.[0]?.delta||{},o=i.reasoning||i.reasoning_content;o&&(n||(n=B(`Thinking`),c.insertBefore(n.el,l),n.show()),t+=o,n.appendText(o),N.scrollTop=N.scrollHeight);let s=i.content;s&&(r||=!0,n&&!n.el.classList.contains(`done`)&&n.finish(),e+=s,R(e)&&(c.style.maxWidth=`100%`),V(l,e,!1),N.scrollTop=N.scrollHeight)}catch{}}}return n&&!n.el.classList.contains(`done`)&&n.finish(),c.removeAttribute(`id`),e&&(A.push({role:`assistant`,content:e}),A.length>D&&(A=A.slice(-20)),j.push({text:e,isUser:!1}),M()),W(),e}W();let a=i.body.getReader(),o=new TextDecoder,s=``,c=document.createElement(`div`);c.className=`chat-message`,c.id=`streaming-message`,c.style.cssText=`
      padding: 12px 16px;
      border-radius: 14px;
      max-width: 85%;
      word-wrap: break-word;
      font-size: 14px;
      line-height: 1.6;
      align-self: flex-start;
      background-color: var(--btn-bg);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      opacity: 0;
      transform: translateY(20px);
    `,P.appendChild(c),requestAnimationFrame(()=>{c.style.transition=`opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)`,c.style.opacity=`1`,c.style.transform=`translateY(0)`});let l=document.createElement(`div`);for(c.appendChild(l);;){let{done:i,value:u}=await a.read();if(i)break;s+=o.decode(u,{stream:!0});let d=s.split(`
`);s=d.pop()||``;for(let i of d)if(i.startsWith(`data: `)){let a=i.slice(6);if(a===`[DONE]`)continue;try{let i=JSON.parse(a).choices?.[0]?.delta||{},o=i.reasoning||i.reasoning_content;o&&(n||(n=B(`Thinking`),c.insertBefore(n.el,l),n.show()),t+=o,n.appendText(o),N.scrollTop=N.scrollHeight);let s=i.content;s&&(r||=!0,n&&!n.el.classList.contains(`done`)&&n.finish(),e+=s,R(e)&&(c.style.maxWidth=`100%`),V(l,e,!1),N.scrollTop=N.scrollHeight)}catch{}}}n&&!n.el.classList.contains(`done`)&&n.finish(),c.removeAttribute(`id`),e&&(A.push({role:`assistant`,content:e}),A.length>D&&(A=A.slice(-20)),j.push({text:e,isUser:!1}),M())}catch(e){console.error(`Stream error:`,e)}return W(),e}function pe(){re()&&j.length>0&&(k=!0,N.style.display=`block`,S.style.justifyContent=`flex-start`,S.style.paddingTop=`20px`,S.style.paddingBottom=`0`,C.style.display=`none`,w.style.display=`none`,de()),y.addEventListener(`input`,function(){this.style.height=`auto`,this.style.height=Math.min(this.scrollHeight,200)+`px`,b.classList.toggle(`active`,this.value.trim().length>0)}),v.addEventListener(`submit`,async function(e){e.preventDefault();let t=y.value.trim();if(t===``){v.classList.add(`shake`),setTimeout(()=>v.classList.remove(`shake`),400);return}y.value=``,y.style.height=`auto`,b.classList.remove(`active`),y.focus(),k||await le(),A.push({role:`user`,content:t}),A.length>D&&(A=A.slice(-20)),ce(t,!0),await fe()}),y.addEventListener(`keydown`,function(e){e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),v.dispatchEvent(new Event(`submit`)))});let e=0,t,n=()=>{e=(e+.5)%360,x.style.setProperty(`--gradient-angle`,`${e}deg`),t=requestAnimationFrame(n)};y.addEventListener(`focus`,()=>{let e=document.documentElement.getAttribute(`data-theme`)===`dark`;x.style.setProperty(`--glow-color`,e?`rgba(255, 255, 255, 0.8)`:`rgba(0, 0, 0, 0.5)`),x.classList.add(`glow-active`),n()}),y.addEventListener(`blur`,()=>{x.classList.remove(`glow-active`),cancelAnimationFrame(t)}),window.addEventListener(`beforeunload`,()=>{t&&cancelAnimationFrame(t)});let r=document.getElementById(`new-chat-btn`);r&&r.addEventListener(`click`,()=>{ue()})}var K=!1,q,J,Y,X;function me(){K||(K=!0,q=document.createElement(`div`),q.className=`preview-overlay`,document.body.appendChild(q),J=document.createElement(`div`),J.className=`preview-panel preview-panel-left`,J.innerHTML=`
    <div class="preview-header">
      <span class="preview-title" id="preview-title-left">Превью</span>
      <div class="preview-actions">
        <button class="preview-action-btn" id="preview-refresh-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Обновить
        </button>
        <button class="preview-close-btn" id="preview-close-btn-left">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="preview-body" id="preview-body-left">
      <div class="preview-empty">Нет содержимого для предпросмотра</div>
    </div>
  `,document.body.appendChild(J),X=document.getElementById(`preview-title-left`),Y=document.getElementById(`preview-body-left`),q.addEventListener(`click`,Q),document.getElementById(`preview-close-btn-left`).addEventListener(`click`,Q),document.getElementById(`preview-refresh-btn`).addEventListener(`click`,()=>{J._lastContent!==void 0&&Z(J._lastLang,J._lastContent)}))}function he(e,t){let n=(e||``).toLowerCase();return n===`html`||n===`htm`?/<html[\s>]/i.test(t)?t:`<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${t}</body></html>`:n===`css`?`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${t}</style></head><body><div style="font-family:sans-serif;padding:16px;color:#333;">Предпросмотр стилей (нет разметки — показан пустой документ со стилями)</div></body></html>`:n===`javascript`||n===`js`?`<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><div id="app" style="font-family:sans-serif;padding:16px;color:#333;"></div><script>try{${t}}catch(e){document.body.innerHTML='<pre style="color:red;padding:16px;">'+e+'</pre>';}<\/script></body></html>`:`<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><pre style="padding:16px;white-space:pre-wrap;">${t.replace(/</g,`&lt;`)}</pre></body></html>`}function Z(e,t){Y.innerHTML=``;let n=document.createElement(`iframe`);n.className=`preview-iframe`,n.setAttribute(`sandbox`,`allow-scripts allow-same-origin allow-forms allow-modals allow-popups`),Y.appendChild(n),n.srcdoc=he(e,t||``)}function ge(e,t,n){me(),X.textContent=e||`Превью`,J._lastLang=t,J._lastContent=n,Z(t,n),q.classList.add(`active`),J.classList.add(`active`)}function Q(){q?.classList.remove(`active`),J?.classList.remove(`active`)}var $=[`Чем может помочь part.ai?`,`Что сегодня создадим?`,`Есть идея?`,`О чём думаешь?`];document.getElementById(`dynamic-title`).innerText=$[Math.floor(Math.random()*$.length)],s(),te(),pe(),window.partAi={openPanel:ge,closePanel:Q};