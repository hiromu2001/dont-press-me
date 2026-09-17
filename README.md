# Don't Press Me

押せば押すほど成長し、変化し、最後には反抗し始める小さなボタン育成ゲームです。

## 遊ぶ

GitHub Pages でURLからそのまま遊べます。

**https://hiromu2001.github.io/dont-press-me/**

## 何が起きる？

最初はただのボタンです。

しかし押し続けると、台詞が変わり、怒り、逃げ、偽物を生み、やがてあなたの操作そのものに反抗し始めます。

- 全9段階の変化
- 実績9個
- 逃げるボタン
- 偽物ボタンの出現
- 200回で特殊イベント
- 250回でエンディング
- 効果音
- スマホ対応
- 進行状況の自動保存

## 技術構成

- React
- Vite
- CSS
- Web Audio API
- LocalStorage
- GitHub Actions
- GitHub Pages

ニューラルネットワークや生成AIは使っていません。ブラウザだけで動作します。

## ローカルで起動

```bash
npm install
npm run dev
```

ビルド確認は次のコマンドです。

```bash
npm run build
```

## 自動公開

`main` ブランチに変更が入ると、GitHub Actions が自動でビルドし、GitHub Pages に公開します。

## ライセンス

個人制作・学習用プロジェクトです。
