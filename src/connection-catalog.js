(function(root){
 const providers=[
  {id:'deepseek',name:'DeepSeek',url:'https://api.deepseek.com',docs:'https://api-docs.deepseek.com/',hint:'填写 DeepSeek 开放平台 API Key 和已开通的模型 ID。'},
  {id:'kimi',name:'Kimi · 月之暗面',url:'https://api.moonshot.cn/v1',docs:'https://platform.kimi.com/docs/get-api-key',hint:'使用 Kimi 开放平台 API Key；与 Kimi Work 客户端登录分开设置。'},
  {id:'qwen',name:'千问 · 阿里云百炼',url:'https://dashscope.aliyuncs.com/compatible-mode/v1',docs:'https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope',hint:'默认北京地域兼容地址；也可填控制台的业务空间专属地址。Key 与地址须属于同一地域。'},
  {id:'zhipu',name:'智谱 GLM',url:'https://open.bigmodel.cn/api/paas/v4',docs:'https://docs.bigmodel.cn/cn/guide/develop/openai/introduction',hint:'默认通用 API；Coding Plan 请按自己的套餐文档更换地址。'},
  {id:'minimax',name:'MiniMax',url:'https://api.minimax.cn/v1',docs:'https://platform.minimax.cn/docs/api-reference/text-openai-api',hint:'默认中国站通用 API；请填写对应站点的 Key。'},
  {id:'volcengine',name:'豆包 · 火山方舟',url:'https://ark.cn-beijing.volces.com/api/v3',docs:'https://docs.volcengine.com/docs/ark/base-url-and-authentication',hint:'填写方舟 API Key；模型 ID 可填已开通模型或推理接入点 ID。此地址不是 Coding Plan。'},
  {id:'hunyuan',name:'腾讯混元',url:'https://api.hunyuan.cloud.tencent.com/v1',docs:'https://cloud.tencent.cn/document/product/1729/111007',hint:'填写混元 OpenAI 兼容接口的 API Key。'},
  {id:'qianfan',name:'百度千帆',url:'https://qianfan.baidubce.com/v2',logo:'qianfan.ico',docs:'https://cloud.baidu.com/doc/qianfan-docs/s/Fm9l6ocai',hint:'使用千帆 V2 API Key，填写控制台已开通的模型 ID。'},
  {id:'siliconflow',name:'硅基流动',url:'https://api.siliconflow.cn/v1',logo:'siliconflow.ico',docs:'https://api-docs.siliconflow.cn/docs/userguide/quickstart',hint:'填写完整模型 ID，包含服务商或组织前缀。'},
  {id:'spark',name:'讯飞星火',url:'https://maas-api.cn-huabei-1.xf-yun.com/v2',logo:'spark.ico',docs:'https://www.xfyun.cn/doc/spark/Spark-X2.5.html',hint:'默认 Spark-X2.5 接口；旧版星火请按控制台调整地址与认证值。'},
  {id:'openai',name:'OpenAI',url:'https://api.openai.com/v1',docs:'https://platform.openai.com/api-keys',hint:'填写 OpenAI API Key 和模型 ID。'},
  {id:'anthropic',name:'Anthropic',protocol:'anthropic',url:'https://api.anthropic.com/v1',docs:'https://console.anthropic.com/',hint:'使用 Anthropic Messages 协议。'},
  {id:'custom',name:'自定义 API',url:'',hint:'自行填写名称、基础地址、API Key、模型 ID 和协议；支持 OpenAI 兼容或 Anthropic Messages。'}
 ];
 const clients=[
  {id:'workbuddy',name:'WorkBuddy',logo:'workbuddy.png',auto:true,docs:'https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Product-Guide',steps:['安装并启动腾讯 WorkBuddy 后，点击“一键配置”。','也可在客户端 MCP 设置中合并下方 JSON；配置后刷新 MCP 或重启 WorkBuddy。']},
  {id:'harness',name:'DeepSeek Harness',logo:'deepseek.png',auto:true,format:'harness',docs:'https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/mcp.md',steps:['安装并启动 DeepSeek Harness 后，点击“一键配置”。','手动方式：将下方 YAML 合并到用户目录 .dsh/cordis.patch.yml；不要覆盖已有补丁，然后重启客户端。']},
  {id:'kimi-work',name:'Kimi Work',logo:'kimi.png',docs:'https://www.kimi.com/help/plugins-and-skills/overview',steps:['在 Kimi Work 桌面端打开 MCP 管理页，添加本地 STDIO 服务。','名称填 yimucraft；将下方 command、args 和 env 分别填入命令、参数和环境变量。每个参数单独一项。','保存并启用服务，在 Work 新任务中检查一幕工具。此入口不修改 Kimi Code 配置。']},
  {id:'qwenwork',name:'千问办公 QwenWork',logo:'qwenwork.png',docs:'https://docs.qwenwork.ai/zh/desktop/connectors',steps:['桌面端打开“扩展 → 连接器”，添加自定义 MCP 服务。','选择粘贴 JSON 配置，粘贴下方内容；或选 STDIO 后分别填写 command、args、env。','保存后启用连接器。云端任务不能直接启动你电脑上的命令。']},
  {id:'dumate',name:'百度搭子 DuMate',logo:'dumate.png',docs:'https://cloud.baidu.com/product-s/dumate_developement_platform.html',limited:true,steps:['在百度搭子桌面端的“连接应用”中检查是否提供自定义本地 MCP / STDIO。','若当前版本提供此入口，使用下方标准配置；若只允许远程服务 URL，暂不能直接连接一幕的本地 STDIO 服务。','当前已准备通用配置与官方入口；本地传输兼容性尚未确认，不标记为已接通。']},
  {id:'qwen-code',name:'Qwen Code',logo:'qwen.png',auto:true,docs:'https://github.com/QwenLM/qwen-code/blob/main/docs/developers/tools/mcp-server.md',steps:['安装并启动 Qwen Code 后，点击“一键配置”。','也可将下方 mcpServers 合并到用户目录 .qwen/settings.json；保留原有设置，然后重启客户端。']},
  {id:'codex',name:'Codex（本地）',logo:'codex.png',auto:true,format:'codex',steps:['使用本机 Codex 桌面端或 CLI，点击“一键配置”。','手动方式：将下方 TOML 合并到用户 config.toml 后刷新 MCP。此配置不是 Codex Cloud 的远程连接。']},
  {id:'claude-code',name:'Claude Code',logo:'claude.png',auto:true,steps:['安装并启动 Claude Code 后，点击“一键配置”。','配置后刷新 MCP；也可按通用 JSON 配置合并 mcpServers。']},
  {id:'claude-desktop',name:'Claude Desktop',logo:'claude.png',auto:true,steps:['安装并启动 Claude Desktop 后，点击“一键配置”，然后重启客户端。']},
  {id:'cursor',name:'Cursor',logo:'cursor.png',auto:true,steps:['安装并启动 Cursor 后，点击“一键配置”，在 MCP 设置确认一幕服务。']}
 ];
 const catalog={providers,clients};if(typeof module==='object')module.exports=catalog;else root.YimuConnections=catalog;
})(globalThis);
