# gal-view（本地定制版）

相对官方 `github:Ayase34/gal-view#main` 的改动：

- `.dsh-plugin/client.js`（客户端）
  - 朗读：整段退路关闭、按页记录、切标签静默、刷新后第一条朗读
  - 朗读时机：默认立刻开口；`localStorage.setItem("gv-wait-typing","on")` 可改回"等字幕打完"
  - 分页：断句只按句末标点，绝不劈开词
  - 翻页：只由点击驱动（自动翻页已关闭）
  - 交互：点击立绘 = 重播当前这一页（原先右下角小喇叭已移除）
  - 设置面板新增：音色 / 朗读台词 / 语速 / 打字速度 / 立绘
  - 打字速度默认"快 240 字/秒"，可用 `gv-type-speed` 覆盖（fast|normal|slow|scene）
- `.dsh-plugin/index.mjs`（宿主端）
  - `GET /gal-view-voice?text=&voice=&rate=` → audio/mpeg（edge-tts 合成，带磁盘缓存与 ETag）
  - `GET /gal-view-art/list`、`/gal-view-art/galgame-neutral.webp` → 内置立绘
  - 可用环境变量 `GAL_VIEW_RATE` 改默认语速
- `art/galgame-neutral.webp`：内置女仆立绘

## 换机器安装

1. 把本目录放到 `~/.dsh/plugins/gal-view`
2. **朗读依赖**：`pip install edge-tts`（Python 3.9+）。不装则只有朗读无声，其余功能正常
3. 在 profile 里登记（二选一）
   - `dsh plugin --profile web add link:<本目录绝对路径>`
   - 或手工在 `~/.dsh/profiles/web/package.json` 的 dependencies 加 `"gal-view": "link:<路径>"`
4. 重启 DSH

## 注意

- `.voice-cache/` 是语音缓存，**不入库**（已在 .gitignore）
- `gal-scene.json` 约 5.7 MB、`client.js` 约 6 MB，仓库体量偏大属正常