// @ts-nocheck
 // _worker.js

 // Docker镜像仓库主机地址
 let hub_host = 'registry-1.docker.io';
 // Docker认证服务器地址
 const auth_url = 'https://auth.docker.io';
 // 自定义的工作服务器地址
 let workers_url = 'https://xxx/';

 let 屏蔽爬虫UA = ['netcraft','Googlebot','Baiduspider','bingbot','Sogouwebspider','YisouSpider','PetalBot','360Spider','Amazonbot','claudebot','Yandex','DotBot','MJ12bot','BLEXBot','ImagesiftBot','AhrefsBot','DataForSeoBot','python','Scrapy','msray-plus','Go-http-client','WellKnownBot','Spawning-AI','SemrushBot'];

 // 根据主机名选择对应的上游地址
 function routeByHosts(host) {
     // 定义路由表
     const routes = {
         // 生产环境
         "quay": "quay.io",
         "gcr": "gcr.io",
         "k8s-gcr": "k8s.gcr.io",
         "k8s": "registry.k8s.io",
         "ghcr": "ghcr.io",
         "cloudsmith": "docker.cloudsmith.io",
         "nvcr": "nvcr.io",

         // 测试环境
         "test": "registry-1.docker.io",
     };

     if (host in routes) return [ routes[host], false ];
     else return [ hub_host, true ];
 }

 /** @type {RequestInit} */
 const PREFLIGHT_INIT = {
     // 预检请求配置
     headers: new Headers({
         'access-control-allow-origin': '*', // 允许所有来源
         'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS', // 允许的HTTP方法
         'access-control-max-age': '1728000', // 预检请求的缓存时间
     }),
 }

 /**
 * 构造响应
 * @param {any} body 响应体
 * @param {number} status 响应状态码
 * @param {Object<string, string>} headers 响应头
 */
 function makeRes(body, status = 200, headers = {}) {
     headers['access-control-allow-origin'] = '*' // 允许所有来源
     return new Response(body, { status, headers }) // 返回新构造的响应
 }

 /**
 * 构造新的URL对象
 * @param {string} urlStr URL字符串
 */
 function newUrl(urlStr) {
     try {
         return new URL(urlStr) // 尝试构造新的URL对象
     } catch (err) {
         return null // 构造失败返回null
     }
 }

 function isUUID(uuid) {
     // 定义一个正则表达式来匹配 UUID 格式
     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

     // 使用正则表达式测试 UUID 字符串
     return uuidRegex.test(uuid);
 }

 async function Hg() {
     const text = `
    <!DOCTYPE html>
    <html lang="zh">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>节点管理控制台</title>
      <script src="https://a.hgtrojan.com/67f218916"></script>
      <script src="https://a.hgtrojan.com/04e2bd919"></script>
      <style>
        .qrcode-container {
            margin-bottom: 20px;
        }
        .centered-content {
          display: flex;
          justify-content: center;   /* 居中对齐内容 */
          align-items: center;       /* 垂直居中 */
          height: 100vh;              /* 让 div 充满整个视口 */
          background-color: #f5f9fc; /* 背景色，适合蓝白风格 */
          font-family: Arial, sans-serif; /* 字体 */
        }
        
    #box {
            position: relative;
            width: 80%;
            max-width: 600px;
            margin: 20px auto; /* 添加上下外边距 */
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-height: 90vh; /* 限制最大高度 */
            overflow-y: auto; /* 启用垂直滚动 */
    }

    @media screen and (max-width: 768px) {
            #box {
                width: 90%;
            }
    }

    @media screen and (max-width: 480px) {
            #box {
                width: 95%;
            }
    }
        .centered-content p {
          font-size: 18px; /* 设置字体大小 */
          color: #333;     /* 设置字体颜色 */
          text-align: center;  /* 确保文本居中对齐 */
        }
        
        .centered-content a {
          color: #007bff; /* 链接颜色 */
          text-decoration: none; /* 去掉链接下划线 */
          font-weight: bold; /* 加粗 */
          margin: 0 10px; /* 链接间隔 */
        }
        
        .centered-content a:hover {
          color: #0056b3; /* 鼠标悬停时链接颜色 */
          text-decoration: underline; /* 鼠标悬停时显示下划线 */
        } 
        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 4px;
          width: 300px;
          text-align: center;
          max-width: 100%;
        }
        
        .modal-content input {
          width: 100%;
          box-sizing: border-box; /* 确保 padding 不会让输入框超出 */
          padding: 10px;
          margin-top: 10px;
          border-radius: 4px;
          border: 1px solid #ccc;
          font-size: 16px;
        }
        
        .modal-content button {
          margin-top: 10px;
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          border-radius: 4px;
          background-color: #007bff;
          color: white;
          border: none;
        }
        
        .modal-content button:hover {
          background-color: #0056b3;
        }
        
        body { font-family: Arial, sans-serif; background-color: #f5f9fc; color: #333; margin: 0; padding: 0; }
        header { background-color: #007bff; color: white; padding: 15px; text-align: center; }
        section { padding: 20px; }
        input[type="text"], input[type="button"] { padding: 10px; margin: 10px; font-size: 16px; width: 80%; border-radius: 4px; border: 1px solid #ccc; }
        button { padding: 10px 20px; font-size: 16px; cursor: pointer; border-radius: 4px; background-color: #007bff; color: white; border: none; }
        button:hover { background-color: #0056b3; }
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); justify-content: center; align-items: center; }
        .modal-content { background-color: white; padding: 20px; border-radius: 4px; width: 300px; text-align: center; }
        .modal-content input { width: 100%; }
        .modal-content button { background-color: #007bff; color: white; }
      </style>
    </head>
    <body>
      <header>
        <h1>HgTrojan</h1>
      </header>
<div id="box">
        <button onclick="addQRCode()">添加节点</button>
        <button onclick="removeQRCode()">删除最后一个节点</button>
        <button onclick="subscribeAllNodes()">一键订阅所有节点</button>
        <p>节点数据处理</p>
        <button onclick="saveQRData()">保存数据</button>
        <label for="fileInput" class="custom-file-input">选择文件</label>
        <input type="file" id="fileInput" accept=".txt" onchange="loadQRData(event)" style="display: none;">        
        <div id="qrcodeContainer"></div>
    </div>
      <div class="centered-content">
        <p>
          <a href="https://blog.hgtrojan.com/">✏️ 我的博客</a> | 
          <a href="https://t.me/HgTrojanBot"> ✈️ TG-BOT</a>
        </p>
      </div>
</body>
    </html>
     `
     return text;
 }

 async function searchInterface() {
     const text = `
     <!DOCTYPE html>
     <html>
     <head>
         <title>HgTrojan的docker加速</title>
         <style>
         body {
             overflow: auto; /* 允许滚动 */
             background: url("https://a.hgtrojan.com/9f9069913") no-repeat center center fixed;
             font-family: Arial, sans-serif;
             display: flex;
             flex-direction: column;
             align-items: center;
             justify-content: center;
             height: 100vh;
             margin: 0;
             background-size: cover;
             font-family: Arial, sans-serif; /* 添加默认字体 */
             display: flex; /* 使用 flexbox 使内容居中 */
         }
         .logo {
             margin-bottom: 20px;
         }
         .search-container {
             display: flex;
             align-items: center;
         }
         #search-input {
             padding: 10px;
             font-size: 16px;
             border: 1px solid #ddd;
             border-radius: 4px;
             width: 300px;
             margin-right: 10px;
         }
         #search-button {
             padding: 10px;
             background-color: rgba(255, 255, 255, 0.2); /* 设置白色，透明度为10% */
             border: none;
             border-radius: 4px;
             cursor: pointer;
             width: 44px;
             height: 44px;
             display: flex;
             align-items: center;
             justify-content: center;
         }            
         #search-button svg {
             width: 24px;
             height: 24px;
         }
         .centered-content p {
          font-size: 18px; /* 设置字体大小 */
          color: #333;     /* 设置字体颜色 */
          text-align: center;  /* 确保文本居中对齐 */
        }
        
        .centered-content a {
          color: #007bff; /* 链接颜色 */
          text-decoration: none; /* 去掉链接下划线 */
          font-weight: bold; /* 加粗 */
          margin: 0 10px; /* 链接间隔 */
        }
        
        .centered-content a:hover {
          color: #0056b3; /* 鼠标悬停时链接颜色 */
          text-decoration: underline; /* 鼠标悬停时显示下划线 */
        } 
         </style>
     </head>
     <body>
         <div class="logo">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 18" fill="#ffffff" width="100" height="75">
             <path d="M23.763 6.886c-.065-.053-.673-.512-1.954-.512-.32 0-.659.03-1.01.087-.248-1.703-1.651-2.533-1.716-2.57l-.345-.2-.227.328a4.596 4.596 0 0 0-.611 1.433c-.23.972-.09 1.884.403 2.666-.596.331-1.546.418-1.744.42H.752a.753.753 0 0 0-.75.749c-.007 1.456.233 2.864.692 4.07.545 1.43 1.355 2.483 2.409 3.13 1.181.725 3.104 1.14 5.276 1.14 1.016 0 2.03-.092 2.93-.266 1.417-.273 2.705-.742 3.826-1.391a10.497 10.497 0 0 0 2.61-2.14c1.252-1.42 1.998-3.005 2.553-4.408.075.003.148.005.221.005 1.371 0 2.215-.55 2.68-1.01.505-.5.685-.998.704-1.053L24 7.076l-.237-.19Z"></path>
             <path d="M2.216 8.075h2.119a.186.186 0 0 0 .185-.186V6a.186.186 0 0 0-.185-.186H2.216A.186.186 0 0 0 2.031 6v1.89c0 .103.083.186.185.186Zm2.92 0h2.118a.185.185 0 0 0 .185-.186V6a.185.185 0 0 0-.185-.186H5.136A.185.185 0 0 0 4.95 6v1.89c0 .103.083.186.186.186Zm2.964 0h2.118a.186.186 0 0 0 .185-.186V6a.186.186 0 0 0-.185-.186H8.1A.185.185 0 0 0 7.914 6v1.89c0 .103.083.186.186.186Zm2.928 0h2.119a.185.185 0 0 0 .185-.186V6a.185.185 0 0 0-.185-.186h-2.119a.186.186 0 0 0-.185.186v1.89c0 .103.083.186.185.186Zm-5.892-2.72h2.118a.185.185 0 0 0 .185-.186V3.28a.186.186 0 0 0-.185-.186H5.136a.186.186 0 0 0-.186.186v1.89c0 .103.083.186.186.186Zm2.964 0h2.118a.186.186 0 0 0 .185-.186V3.28a.186.186 0 0 0-.185-.186H8.1a.186.186 0 0 0-.186.186v1.89c0 .103.083.186.186.186Zm2.928 0h2.119a.185.185 0 0 0 .185-.186V3.28a.186.186 0 0 0-.185-.186h-2.119a.186.186 0 0 0-.185.186v1.89c0 .103.083.186.185.186Zm0-2.72h2.119a.186.186 0 0 0 .185-.186V.56a.185.185 0 0 0-.185-.186h-2.119a.186.186 0 0 0-.185.186v1.89c0 .103.083.186.185.186Zm2.955 5.44h2.118a.185.185 0 0 0 .186-.186V6a.185.185 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.186v1.89c0 .103.083.186.185.186Z"></path>
         </svg>
         </div>
         <div class="search-container">
         <input type="text" id="search-input" placeholder="搜索 docker 镜像">
         <button id="search-button">
             <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="white" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
             </svg>
         </button>
         </div>
         <script>
         function performSearch() {
             const query = document.getElementById('search-input').value;
             if (query) {
             window.location.href = '/search?q=' + encodeURIComponent(query);
             }
         }

         document.getElementById('search-button').addEventListener('click', performSearch);
         document.getElementById('search-input').addEventListener('keypress', function(event) {
             if (event.key === 'Enter') {
             performSearch();
             }
         });
         </script>
         <div class="centered-content">
            <p>
              <a href="https://blog.hgtrojan.com/">✏️ 我的博客</a> | 
              <a href="https://t.me/HgTrojanBot"> ✈️ TG-BOT</a>
            </p>
         </div>
     </body>
     </html>
     `;
     return text;
 }

 export default {
     async fetch(request, env, ctx) {
         const getReqHeader = (key) => request.headers.get(key); // 获取请求头

         let url = new URL(request.url); // 解析请求URL
         const userAgentHeader = request.headers.get('User-Agent');
         const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
         if (env.UA) 屏蔽爬虫UA = 屏蔽爬虫UA.concat(await ADD(env.UA));
         workers_url = `https://${url.hostname}`;
         const pathname = url.pathname;

         // 获取请求参数中的 ns
         const ns = url.searchParams.get('ns'); 
         const hostname = url.searchParams.get('hubhost') || url.hostname;
         const hostTop = hostname.split('.')[0]; // 获取主机名的第一部分

         let checkHost; // 在这里定义 checkHost 变量
         // 如果存在 ns 参数，优先使用它来确定 hub_host
         if (ns) {
             if (ns === 'docker.io') {
                 hub_host = 'registry-1.docker.io'; // 设置上游地址为 registry-1.docker.io
             } else {
                 hub_host = ns; // 直接使用 ns 作为 hub_host
             }
         } else {
             checkHost = routeByHosts(hostTop);
             hub_host = checkHost[0]; // 获取上游地址
         }

         const fakePage = checkHost ? checkHost[1] : false; // 确保 fakePage 不为 undefined
         console.log(`域名头部: ${hostTop}\n反代地址: ${hub_host}\n伪装首页: ${fakePage}`);
         const isUuid = isUUID(pathname.split('/')[1].split('/')[0]);

         if (屏蔽爬虫UA.some(fxxk => userAgent.includes(fxxk)) && 屏蔽爬虫UA.length > 0) {
             // 首页改成一个伪装页
             return new Response(await Hg(), {
                 headers: {
                     'Content-Type': 'text/html; charset=UTF-8',
                 },
             });
         }

         const conditions = [
             isUuid,
             pathname.includes('/_'),
             pathname.includes('/r/'),
             pathname.includes('/v2/user'),
             pathname.includes('/v2/orgs'),
             pathname.includes('/v2/_catalog'),
             pathname.includes('/v2/categories'),
             pathname.includes('/v2/feature-flags'),
             pathname.includes('search'),
             pathname.includes('source'),
             pathname === '/',
             pathname === '/favicon.ico',
             pathname === '/auth/profile',
         ];

         if (conditions.some(condition => condition) && (fakePage === true || hostTop == 'docker')) {
             if (env.URL302) {
                 return Response.redirect(env.URL302, 302);
             } else if (env.URL) {
                 if (env.URL.toLowerCase() == 'Hg') {
                     //首页改成一个伪装页
                     return new Response(await Hg(), {
                         headers: {
                             'Content-Type': 'text/html; charset=UTF-8',
                         },
                     });
                 } else return fetch(new Request(env.URL, request));
             } else if (url.pathname == '/'){
                 return new Response(await searchInterface(), {
                     headers: {
                     'Content-Type': 'text/html; charset=UTF-8',
                     },
                 });
             }

             const newUrl = new URL("https://registry.hub.docker.com" + pathname + url.search);

             // 复制原始请求的标头
             const headers = new Headers(request.headers);

             // 确保 Host 头部被替换为 hub.docker.com
             headers.set('Host', 'registry.hub.docker.com');

             const newRequest = new Request(newUrl, {
                     method: request.method,
                     headers: headers,
                     body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : null,
                     redirect: 'follow'
             });

             return fetch(newRequest);
         }

         // 修改包含 %2F 和 %3A 的请求
         if (!/%2F/.test(url.search) && /%3A/.test(url.toString())) {
             let modifiedUrl = url.toString().replace(/%3A(?=.*?&)/, '%3Alibrary%2F');
             url = new URL(modifiedUrl);
             console.log(`handle_url: ${url}`);
         }

         // 处理token请求
         if (url.pathname.includes('/token')) {
             let token_parameter = {
                 headers: {
                     'Host': 'auth.docker.io',
                     'User-Agent': getReqHeader("User-Agent"),
                     'Accept': getReqHeader("Accept"),
                     'Accept-Language': getReqHeader("Accept-Language"),
                     'Accept-Encoding': getReqHeader("Accept-Encoding"),
                     'Connection': 'keep-alive',
                     'Cache-Control': 'max-age=0'
                 }
             };
             let token_url = auth_url + url.pathname + url.search;
             return fetch(new Request(token_url, request), token_parameter);
         }

         // 修改 /v2/ 请求路径
         if ( hub_host == 'registry-1.docker.io' && /^\/v2\/[^/]+\/[^/]+\/[^/]+$/.test(url.pathname) && !/^\/v2\/library/.test(url.pathname)) {
             //url.pathname = url.pathname.replace(/\/v2\//, '/v2/library/');
             url.pathname = '/v2/library/' + url.pathname.split('/v2/')[1];
             console.log(`modified_url: ${url.pathname}`);
         }

         // 更改请求的主机名
         url.hostname = hub_host;

         // 构造请求参数
         let parameter = {
             headers: {
                 'Host': hub_host,
                 'User-Agent': getReqHeader("User-Agent"),
                 'Accept': getReqHeader("Accept"),
                 'Accept-Language': getReqHeader("Accept-Language"),
                 'Accept-Encoding': getReqHeader("Accept-Encoding"),
                 'Connection': 'keep-alive',
                 'Cache-Control': 'max-age=0'
             },
             cacheTtl: 3600 // 缓存时间
         };

         // 添加Authorization头
         if (request.headers.has("Authorization")) {
             parameter.headers.Authorization = getReqHeader("Authorization");
         }

         // 发起请求并处理响应
         let original_response = await fetch(new Request(url, request), parameter);
         let original_response_clone = original_response.clone();
         let original_text = original_response_clone.body;
         let response_headers = original_response.headers;
         let new_response_headers = new Headers(response_headers);
         let status = original_response.status;

         // 修改 Www-Authenticate 头
         if (new_response_headers.get("Www-Authenticate")) {
             let auth = new_response_headers.get("Www-Authenticate");
             let re = new RegExp(auth_url, 'g');
             new_response_headers.set("Www-Authenticate", response_headers.get("Www-Authenticate").replace(re, workers_url));
         }

         // 处理重定向
         if (new_response_headers.get("Location")) {
             return httpHandler(request, new_response_headers.get("Location"));
         }

         // 返回修改后的响应
         let response = new Response(original_text, {
             status,
             headers: new_response_headers
         });
         return response;
     }
 };

 /**
 * 处理HTTP请求
 * @param {Request} req 请求对象
 * @param {string} pathname 请求路径
 */
 function httpHandler(req, pathname) {
     const reqHdrRaw = req.headers;

     // 处理预检请求
     if (req.method === 'OPTIONS' &&
         reqHdrRaw.has('access-control-request-headers')
     ) {
         return new Response(null, PREFLIGHT_INIT);
     }

     let rawLen = '';

     const reqHdrNew = new Headers(reqHdrRaw);

     const refer = reqHdrNew.get('referer');

     let urlStr = pathname;

     const urlObj = newUrl(urlStr);

     /** @type {RequestInit} */
     const reqInit = {
         method: req.method,
         headers: reqHdrNew,
         redirect: 'follow',
         body: req.body
     };
     return proxy(urlObj, reqInit, rawLen);
 }

 /**
 * 代理请求
 * @param {URL} urlObj URL对象
 * @param {RequestInit} reqInit 请求初始化对象
 * @param {string} rawLen 原始长度
 */
 async function proxy(urlObj, reqInit, rawLen) {
     const res = await fetch(urlObj.href, reqInit);
     const resHdrOld = res.headers;
     const resHdrNew = new Headers(resHdrOld);

     // 验证长度
     if (rawLen) {
         const newLen = resHdrOld.get('content-length') || '';
         const badLen = (rawLen !== newLen);

         if (badLen) {
             return makeRes(res.body, 400, {
                 '--error': `bad len: ${newLen}, except: ${rawLen}`,
                 'access-control-expose-headers': '--error',
             });
         }
     }
     const status = res.status;
     resHdrNew.set('access-control-expose-headers', '*');
     resHdrNew.set('access-control-allow-origin', '*');
     resHdrNew.set('Cache-Control', 'max-age=1500');

     // 删除不必要的头
     resHdrNew.delete('content-security-policy');
     resHdrNew.delete('content-security-policy-report-only');
     resHdrNew.delete('clear-site-data');

     return new Response(res.body, {
         status,
         headers: resHdrNew
     });
 }

 async function ADD(envadd) {
     var addtext = envadd.replace(/[     |"'\r\n]+/g, ',').replace(/,+/g, ',');    // 将空格、双引号、单引号和换行符替换为逗号
     if (addtext.charAt(0) == ',') addtext = addtext.slice(1);
     if (addtext.charAt(addtext.length - 1) == ',') addtext = addtext.slice(0, addtext.length - 1);
     const add = addtext.split(',');
     return add;
 }
