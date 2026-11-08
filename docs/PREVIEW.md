# 预览图画板

详情页的预览图以**飞书画板**为编辑源，`docs/preview*.svg` 是它的导出快照。
本文件记录两种语言各自对应的画板，供 `node scripts/preview.mjs push|pull` 使用。

| 语言 | 文档 | 画板 token |
|---|---|---|
| `en` | （待填：飞书文档 URL） | （待填：whiteboard token） |
| `zh` | （待填：飞书文档 URL） | （待填：whiteboard token） |

当前两张图由仓库直接编写（未建画板）；后续在飞书画板精修后，用 `push`/`pull` 同步，
并把两份画板地址与 token 补进上表。

## 操作

```sh
# 把本地 SVG 推上画板（整板重建）
node scripts/preview.mjs push --lang zh

# 从画板导出 SVG 覆盖本地文件
node scripts/preview.mjs pull --lang zh

# 离线校验（npm run check 会自动调用）
npm run preview:check
```

规则见 fleet 的 `docs/display-contract.md`。
