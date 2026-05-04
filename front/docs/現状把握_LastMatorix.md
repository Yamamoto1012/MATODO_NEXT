# [現状把握] LastMatorix（Matodo）フロントエンド/バックエンド 現状把握

## 1. 背景 (Background)

* **なぜこのタスクが必要か？**
  * 近々予定しているフロントエンドリファクタリング（`refactor.md`）の前提として、現状の機能・依存関係・画面フロー・課題を正しく把握し、改善対象と影響範囲を明確化するため。
* **現状の課題:**
  * フロントは Next.js 15（App Router）+ Firebase（Auth/Firestore/Storage）+ Tailwind + MUI、バックエンドは Flask の簡易スクレイピング構成。画面・機能は `README.md` に整理があるが、コード規模増加に伴い責務分離・命名・フォルダ構成・依存の明確化が必要。
  * ~~Firestore 登録で `setDoc(doc(db, "tasks", newTask.title), newTask)` を使用しており、タイトル重複で上書きされるリスク~~ → **解決済み**: Firestoreの自動生成IDを使用するように修正。
  * **webpackエラーを修正**: コンポーネント名の命名規約違反（小文字開始の関数名）を修正し、Next.jsの規約に準拠。
  * ~~`docker-compose.yml` の Dockerfile 大文字/小文字の表記ゆれ注意（README 指摘）~~ → **解決済み**: Docker設定削除完了。
  * バックエンドのスクレイピングは試験的実装で、エラーハンドリング・MFA・CSRF/SSL・API化などが未整備。
* **達成したいこと:**
  * 実装とドキュメントを横断して現状を一覧化し、改善候補を洗い出す。
  * リファクタリングに必要な前提（画面一覧、状態管理、主要コンポーネント、API/Firestore モデル、設定/起動方法、技術スタック）を一枚で参照可能にする。
* **関連資料:**
  * `README.md`（ルート）
  * `front/README.md`（Next.js テンプレ由来）
  * `refactor.md`（フロントエンドリファクタリング計画）
  * `front/package.json`（依存・スクリプト）
  * `backend/app.py` / `backend/requirements.txt`

## 2. 詳細 (Details) - 調査結果

### 画面構成・ルーティング（front/app配下）
- **ルート**: `/` → `/Auth`に自動リダイレクト（`front/app/page.js:9`）
- **認証フロー**: 
  - `/Auth`: 認証トップ - Google/メール/アカウント作成導線
  - `/Login`: メール/パスワードログイン
  - `/AccountCreating`: アカウント作成（未実装）
  - `/CreateProfile`: 初回プロフィール作成
- **メイン機能**:
  - `/Home`: アイゼンハワーマトリクス表示・タスク管理
  - `/CompletedTaskList`: 完了済みタスク一覧・戻し機能
  - `/Profile`: プロフィール表示・ログアウト

### UIコンポーネント構成（front/ui/*）
**表示専用コンポーネント**:
- `Days.jsx`, `ProfileCard.jsx` - プレゼン専用
- `TaskCard.jsx` - タスク表示・期限計算・色分けロジック含む

**コンテナ・ロジック含むコンポーネント**:
- `Menu.jsx` - サイドバーレイアウト（構成のみ）
- `MatrixArea.jsx` - Firebase取得・フィルタリング・マトリクス描画
- `AddTask.jsx` - タスク作成・Firebase書込み・IME対応
- `TaskList.jsx` - タスク一覧・詳細サイドバー・CRUD操作
- `CompletedTaskButton.jsx`, `ScrapingButton.jsx` - 単機能ボタン

**課題**: 表示とロジックの責務が混在（特に`MatrixArea`, `TaskList`, `AddTask`）

### Firebase利用状況（front/app/firebase.js）
- **サービス**: Auth, Firestore, Storage（環境変数で設定）
- **認証**: Email/Password + Google OAuth
- **データベース**: Firestore（リアルタイムリスナー使用）
- **ストレージ**: プロフィール画像用

### Firestoreデータモデル・課題
**コレクション構成**:
```
users/{uid} - name, position, iconUrl
tasks/{taskId} - userId, title, memo, importance, urgency, deadline, isDone
```

**解決済みの課題**:
- **ID採番問題**: ~~`setDoc(doc(db, "tasks", newTask.title), newTask)`によりタイトル重複で上書きされる~~ 
  → **修正完了**: `addDoc(collection(db, "tasks"), newTask)`（`front/ui/AddTask.jsx`）でFirestoreの自動生成IDを使用するように変更

**残存課題**:
- **整合性**: 削除時のリレーション整合性未確保
- **セキュリティルール**: 未確認（実装時要確認）

### 依存ライブラリ・バージョン（front/package.json）
**主要技術スタック**:
- Next.js 15.4.6（App Router）
- React 19
- Firebase 12.1.0
- MUI 5.14.18（Icons + Material）
- Tailwind CSS 3.3.0
- TypeScript 5.3.2
- Node.js 22.0.0以上（エンジン要件）

**特記事項**:
- react-datepicker 4.24.0（日付選択）
- @dnd-kit（ドラッグ&ドロップ、未使用の可能性）
- axios 1.6.2（HTTP、バックエンド連携用と推測）

### バックエンド構成（backend/app.py）
**役割**: 学内ポータルスクレイピング（試験実装）
**技術**: Flask + BeautifulSoup4 + requests
**機能**: 
- ログイン認証（CSRF トークン取得）
- 履修科目情報取得
- セッション管理

**課題・リスク**:
- MFA未対応、エラーハンドリング不十分
- SSL検証無効化（`verify=False`）
- API化未実装（JSON返却なし）
- 法的・規約順守要確認

### ビルド・起動手順
**ネイティブ起動**（推奨）:
- フロント: `cd front && yarn dev`（開発）/ `yarn build && yarn start`（本番）
- リント: `yarn lint`
- バックエンド: `cd backend && python app.py`

**環境要件**:
- Node.js >=22.0.0（現在v20.11.0で動作確認済み）
- Python 3.11+
- 必要パッケージ: Flask 3.0.0, gunicorn 21.2.0（backend）

**注意**: Docker設定は削除済み。ネイティブ環境での開発に統一。

## 3. 改善候補の明文化とリファクタリング計画との差分

### 既知の改善候補（READMEより）
1. ~~**Firestore ID採番問題**: `setDoc(doc(db, "tasks", newTask.title), newTask)` → `addDoc(collection(db, "tasks"), newTask)`に変更~~ → **解決済み**
2. ~~**webpackエラー**: コンポーネント名の命名規約違反~~ → **解決済み**: 各ページコンポーネント関数名を大文字開始に修正
3. ~~**Node.js/ライブラリバージョン更新**: Next.js 14→15、React 18→19、Firebase 10→12、Node.js 22要件追加~~ → **完了**
4. ~~**Docker設定**: `dockerfile`/`Dockerfile`表記統一~~ → **解決済み**: Docker設定削除完了、ネイティブ環境に統一
5. **バックエンドセキュリティ**: MFA対応、CSRF/SSL検証、API化、規約順守

### 現状vs目標アーキテクチャの主要差分

#### 1. フォルダ構成
**現状**: `front/app/*`（ページ）+ `front/ui/*`（コンポーネント）
**目標**: `src/features/*`（機能別）+ `src/components/ui/*`（共通UI）
**ギャップ**: 機能横断・責務分離の抜本的な再構成が必要

#### 2. 状態管理
**現状**: 局所useState + Firebase直結合
**目標**: Jotai atoms + selectors + actions 分離
**ギャップ**: グローバル状態管理導入、データ取得層の抽象化

#### 3. 責務分離
**現状**: 表示・ロジック・副作用が混在（特に`MatrixArea.jsx`, `TaskList.jsx`）
**目標**: View/Container パターン + カスタムフック
**ギャップ**: 既存コンポーネントの分解・再構成

#### 4. テスト・品質管理
**現状**: テスト環境未整備
**目標**: Vitest + RTL（単体）+ Playwright（E2E）+ Storybook
**ギャップ**: テストインフラ・CI/CD の新規構築

#### 5. 開発環境・ツール
**現状**: ESLint（Next.js標準）
**目標**: Biome（linter + formatter）
**ギャップ**: 開発ツール刷新・設定移行

#### 6. パフォーマンス・アクセシビリティ
**現状**: 測定・最適化未実施
**目標**: Lighthouse >= 90, A11y準拠
**ギャップ**: パフォーマンス監視・改善プロセスの導入

### 段階的移行戦略（推奨）
1. ~~**Phase 1**: Firestore ID採番修正 + Docker設定統一~~ → **完了**: ID採番修正済み、Docker設定削除完了
2. **Phase 2**: 開発環境刷新（Biome, Vitest, Storybook）
3. **Phase 3**: 状態管理導入（Jotai）+ 1機能のリファクタ（TaskList）
4. **Phase 4**: 機能別フォルダ構成移行 + 他機能のContainer/View分離
5. **Phase 5**: E2Eテスト + CI/CD + パフォーマンス最適化

## 4. 完了の定義 / 終了要件 (Definition of Done / Acceptance Criteria)

* **機能/成果物要件:**
  - [x] 本ドキュメントに画面構成・主要機能・依存関係・起動方法が整理されている
  - [x] Firestore モデルと課題（ID 採番、上書きリスク等）が明文化されている
  - [x] 改善候補（命名/責務分離/構成/API 化/セキュリティ/テスト）が箇条書きで列挙されている
  - [x] リファクタリング方針（`refactor.md`）と現状の差分が俯瞰できる

* **検証/動作要件:**
  - [x] `yarn dev` でフロントが起動できる前提が確認されている（環境変数は別途用意）
  - [x] `yarn build` が成功し、全ページが正常にビルドできる
  - [x] バックエンドが`python app.py`で起動できる
  - [x] ネイティブ環境での動作が確認されている（Docker設定削除完了）

## 4. 実装方針 (Implementation Plan)

* **どのように進めるか？**
  1. ドキュメント/構成の一次把握
     - 参照: ルート `README.md`, `refactor.md`, `front/package.json`, `front/app/firebase.js`, `backend/app.py`
  2. 画面/コンポーネントの棚卸し
     - `front/app/*` のページ単位で機能と依存を要約
     - `front/ui/*` の責務（表示/ロジック/副作用）を切り分け
  3. データ/API の把握
     - Firebase 利用範囲（Auth/Firestore/Storage）とアクセス層の実装箇所を整理
     - Firestore モデルの課題（ID 採番、更新/削除の一貫性）
  4. 起動/運用の確認
     - ローカル手動起動（`yarn dev`）と Docker 起動手順の差分
     - 画像ドメイン許可（`next.config.js`）や環境変数の必須項目確認
  5. 改善候補の取りまとめ
     - `refactor.md` の目標アーキテクチャと現状差分から、段階的移行案へ落とし込み

## 5. 備考 (Notes)

* セキュリティと法令遵守:
  * スクレイピングは学内ポータルを対象としており、実運用想定では MFA/CSRF/SSL/規約順守・API 化が必須。
* スコープ:
  * 本タスクは現状把握と課題の明文化まで。機能追加やコード修正は別タスク。
* 命名/責務/構成の詳細規約:
  * 別途ワークスペースルール（例: 命名規約・コメント方針、SRP、構造化）に準拠して次タスクで反映。

---

以上。以降のリファクタリング計画に向け、当ドキュメントを起点に改善チケットへ分解します。
