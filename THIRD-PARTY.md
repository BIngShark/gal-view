# 第三方组件与素材声明（Third-Party Notices）

本仓库是 [`Ayase34/gal-view`](https://github.com/Ayase34/gal-view) 的**修改版**，并包含来自其他项目的素材。以下逐项列明来源与许可。

---

## 1. Ayase34/gal-view（本仓库的上游）

- 仓库：https://github.com/Ayase34/gal-view
- 许可：**MIT**
- 版权：**Copyright (c) 2026 Yunicon**
- 本仓库对上游内容的使用方式：

| 上游文件 | 本仓库的处理 |
| --- | --- |
| `LICENSE` | **逐字保留**原文 ✓ |
| `gal-scene.json` | **逐字节相同** ✓（上游随包分发的默认预设场景） |
| `scripts/`、`tests/`、`package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`、`cordis.patch.yml` | **逐字节相同** ✓ |
| `.dsh-plugin/client.js` | 上游代码的**修改版** ✓（改动清单见 README） |
| `.dsh-plugin/index.mjs` | **大幅重写** ✓（原 644 字节 → 现约 8.5 KB） |

MIT 要求"在所有副本中保留版权声明与许可声明" ✓ 本仓库通过**完整保留上游 `LICENSE` 原文**满足该要求。

## 2. @lanxing/dsh-galgame（内置立绘来源）

- npm：https://www.npmjs.com/package/@lanxing/dsh-galgame
- 许可：**MIT**（包内 `license` 字段声明，v1.1.0）
- 说明：该包**未声明作者与仓库地址**，故此处仅以包名与链接署名。
- 本仓库的使用方式：`art/galgame-neutral.webp`（鲸鱼娘／女仆立绘，286,224 B）取自该插件的立绘资源；该插件自述为 *"whale-girl (DeepSeek) portrait"*。

### 适用于上述素材的 MIT License 全文

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 3. gal-scene.json 内嵌的三张图片

`gal-scene.json` 与上游**逐字节相同**（blob `a88686d6e11530bdbba44bbec53b1706dfcb6852`），其中内嵌的三张图片（背景 / 角色立绘 / 对话框）是**随上游预设场景一同分发**的，并非本仓库新增。其著作权归各自原作者所有。**若您是其中任何一张的作者**，请在 issue 中告知，我们会补上署名，或按要求移除。

## 4. 本仓库新增的部分

`README.md`、`INSTALL.md`、`.gitignore`、`THIRD-PARTY.md`，以及 `client.js` / `index.mjs` 中本仓库的改动，均由本仓库维护者以 **MIT** 发布，与上游一致。