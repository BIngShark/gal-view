# gal-view（个人修改版）

> ## ⚠️ 这是修改版，不是原版
>
> **原版**：[`Ayase34/gal-view`](https://github.com/Ayase34/gal-view) —— *"把 dsh 会话界面切换成 galgame 游戏界面的插件"*，MIT 许可，版权归 **Yunicon**（见 [LICENSE](./LICENSE)）。
>
> **本仓库是在原版基础上修改而来的个人分支。** 界面、场景编辑器、分页与渲染等**原创设计全部属于原作者**；本仓库只改动下面列出的部分，并**完整保留原 LICENSE 与版权声明**。
>
> 想要原汁原味的版本，请直接装原版：
> ```powershell
> dsh plugin --profile web add github:Ayase34/gal-view#main
> ```

## 这个版本改了什么

### 客户端 `.dsh-plugin/client.js`

| 改动 | 说明 |
| --- | --- |
| **语音朗读** | 新台词/新页出现后自动朗读**当前这一页** |
| **朗读时机** | 默认**立刻开口**；`localStorage.setItem("gv-wait-typing","on")` 可改回"等字幕打完" |
| **不再抢读** | 关掉"分页未就绪就整段抢读"的退路，只逐页朗读 |
| **同页只念一次** | 切标签回来不重复念；刷新页面后第一条会念 |
| **翻页** | 完全由点击决定（自动翻页已关闭） |
| **点击立绘** | 重播当前这一页（原右下角小喇叭已移除） |
| **分页断句** | 只在句末标点断开，绝不劈开词语 |
| **预合成** | 台词定稿后按「当前页 → 下一页 → 其余」预热音频，翻页几乎零延迟 |
| **设置面板** | 新增：音色 / 朗读台词 / 语速 / 打字速度 / 立绘 |
| **打字速度** | 默认"快 240 字/秒"，可用 `gv-type-speed`（`fast`\|`normal`\|`slow`\|`scene`）覆盖 |

### 宿主端 `.dsh-plugin/index.mjs`

- 新增 `GET /gal-view-voice?text=&voice=&rate=` → `audio/mpeg`（调用 edge-tts 合成；磁盘缓存 + ETag + 并发去重）
- 新增 `GET /gal-view-voice/health` → 状态自查
- 新增 `GET /gal-view-art/list`、`/gal-view-art/galgame-neutral.webp` → 内置立绘（白名单，避免目录穿越）
- **Python 解释器自动探测**（环境变量 → 常见安装位置 → PATH），不再依赖任何人的本机路径
- 环境变量：`GAL_VIEW_VOICE` / `GAL_VIEW_PITCH` / `GAL_VIEW_RATE` / `GAL_VIEW_PYTHON`

### 资源

- `art/galgame-neutral.webp`：新增内置女仆立绘
- `gal-scene.json`：场景与立绘**全部内嵌**（data URI），仓库自足，别人装上不缺图

## 安装

```powershell
dsh plugin --profile web add github:BIngShark/gal-view#main
pip install edge-tts
# 然后重启 DSH
```

**不装 Python / edge-tts 也能用** —— 只是朗读没有声音，其余功能照常。

### 自查

浏览器打开 `http://127.0.0.1:3080/gal-view-voice/health`：

```json
{"ok":true,"pythonExists":true, ...}
```

若 `pythonExists:false`，设环境变量 `GAL_VIEW_PYTHON` 指向你的 `python.exe` 即可。

## 素材与署名

| 素材 | 来源 / 作者 |
| --- | --- |
| 插件本体、场景编辑器、渲染、分页等**原版部分** | **[Ayase34/gal-view](https://github.com/Ayase34/gal-view)** —— MIT，© 2026 **Yunicon**（见 [LICENSE](./LICENSE)） |
| `art/galgame-neutral.webp`（内置鲸鱼娘／女仆立绘，本仓库新增） | 取自 **[`@lanxing/dsh-galgame`](https://www.npmjs.com/package/@lanxing/dsh-galgame)** 的立绘（该插件自述为 *whale-girl (DeepSeek) portrait*）。**版权归原作者 lanxing 所有** |
| `gal-scene.json` 内嵌的三张图：背景 / **角色立绘** / 对话框 | 由使用者在原版场景编辑器中放入场景。**版权归各自原作者所有**；本仓库只是随场景文件一并分发，未做任何改动 |
| `client.js` / `index.mjs` 中本仓库新增的代码 | MIT，与上游一致 |

> 如果你是上述某张立绘的作者，或希望补上/更正署名，请开 issue 或联系仓库维护者，我们会立刻处理。
## 许可

沿用原版 **MIT**，原版权声明见 [LICENSE](./LICENSE)（© 2026 Yunicon）。
本修改版新增/改动的部分同样以 MIT 发布。

原版仓库：https://github.com/Ayase34/gal-view
本修改版：https://github.com/BIngShark/gal-view