---
description: Jotaiを使った状態管理システムの導入とTaskListコンポーネントのリファクタリング
globs: 
alwaysApply: false
---

# [Phase3] 状態管理導入（Jotai + TaskListリファクタリング）

## 1. 背景 (Background)

* **なぜこのタスクが必要か？**
  * 現在の状態管理は各コンポーネントが独立してFirebaseからデータ取得しており、コンポーネント間のデータ同期に問題があります。
  * AddTaskでタスクを作成してもMatrixAreaに反映されない、TaskListで更新してもMatrixAreaに反映されないなど、手動リロードに依存した設計になっています。
  * リファクタリングの第一段階として、TaskListコンポーネントを題材にモダンな状態管理パターンを導入し、後続のコンポーネントリファクタリングの基盤とする必要があります。
* **現状の課題:** 
  * コンポーネント間でのリアルタイム状態共有ができない
  * 重複したFirestoreクエリロジック（MatrixArea と TaskList で同一パターン）
  * `onSnapshot` 未使用によりリアルタイム更新が実装されていない
  * プロップスドリリングが発生している（軽度だが将来的に拡大の可能性）
* **達成したいこと:** 
  * Jotaiによる軽量で型安全な状態管理システムの導入
  * TaskListコンポーネントのContainer/Viewパターンへのリファクタリング
  * リアルタイム状態同期の実現
  * 他コンポーネントのリファクタリングの基盤構築
* **関連資料:**
  * 現状把握_LastMatorix.md（状態管理調査結果）
  * refactor.md（目標アーキテクチャ - Jotai atoms + selectors）

## 2. 詳細 (Details)

* **何を実装するのか？**
  * - [ ] Jotaiの導入と基本設定
  * - [ ] タスク状態管理用のAtom定義（tasksAtom, selectedTaskAtom, etc.）
  * - [ ] Firebase操作用のカスタムフック作成（useTaskActions）
  * - [ ] TaskListコンポーネントのContainer/View分離
  * - [ ] リアルタイム更新機能の実装（onSnapshot使用）
  * - [ ] 既存コンポーネント（MatrixArea, AddTask）との状態同期

## 3. 完了の定義 / 終了要件 (Definition of Done / Acceptance Criteria)

* **機能要件:**
  * - [ ] TaskListでタスクのCRUD操作が正常に動作すること
  * - [ ] AddTaskでタスク作成時、TaskListにリアルタイムで反映されること
  * - [ ] TaskListでタスク更新時、他のコンポーネントにリアルタイムで反映されること
  * - [ ] サイドバーのタスク詳細編集機能が正常に動作すること
* **非機能要件:**
  * - [ ] TypeScriptによる型安全性が確保されていること
  * - [ ] 既存の機能が正常に動作し続けること（非破壊的な変更）
  * - [ ] パフォーマンスが向上していること（無駄なFirestoreクエリの削減）
* **テスト要件:**
  * - [ ] リファクタリング後のTaskList関連コンポーネントのテストが実装されていること
  * - [ ] Jotai atomsのテストが実装されていること

## 4. 実装方針 (Implementation Plan)

* **影響範囲の調査:**
  * - 新規作成: `src/store/`（atoms定義）
  * - 新規作成: `src/hooks/`（カスタムフック）
  * - リファクタリング: `front/ui/TaskList.jsx` → `src/components/task/TaskList/`
  * - 修正: `front/ui/AddTask.jsx`（状態管理との連携）
  * - 修正: `front/ui/MatrixArea.jsx`（状態管理との連携）

* **実装ステップ:**
  
  1. **Jotai導入・基盤構築:**
     * `jotai` パッケージインストール
     * `src/store/atoms/taskAtoms.ts` 作成
       - `tasksAtom`: タスク一覧状態
       - `selectedTaskAtom`: 選択中タスク状態
       - `showSidebarAtom`: サイドバー表示状態
     * `src/store/atoms/authAtoms.ts` 作成（認証状態管理 + SSR/SSG対応）

  2. **カスタムフック作成（Firebaseリスナー管理強化）:**
     * `src/hooks/useTaskActions.ts`: CRUD操作フック
       - `createTask`, `updateTask`, `deleteTask`, `toggleTaskComplete`
       - **Firebase `onSnapshot` 管理**: 適切なクリーンアップとメモリリーク防止
       - **リスナーのライフサイクル管理**: 認証状態変更時の自動アタッチ/デタッチ
     * `src/hooks/useTaskFilters.ts`: タスクフィルタリングフック
     * `src/hooks/useFirebaseCleanup.ts`: リスナー自動クリーンアップ用フック

  3. **TaskListコンポーネントのリファクタリング:**
     * `src/components/task/TaskList/TaskListContainer.tsx`: ロジック担当
     * `src/components/task/TaskList/TaskListView.tsx`: 表示担当
     * `src/components/task/TaskList/components/TaskDetailSidebar.tsx`: サイドバー分離
     * `src/components/task/TaskList/TaskList.tsx`: エントリーポイント

  4. **既存コンポーネントの状態管理連携:**
     * `AddTask.jsx`: タスク作成時のatom更新処理追加
     * `MatrixArea.jsx`: atomからの状態購読に変更（一旦は並行稼働）

  5. **リアルタイム更新の実装（安全性強化）:**
     * **`useTaskActions` 実装戦略**:
       - `onSnapshot`リスナーの返り値を適切に保持
       - `useEffect`のクリーンアップ関数でリスナーの解除
       - コンポーネントアンマウント時の自動クリーンアップ
     * **認証状態連動**:
       - `authAtom`と連動したリスナーの動的アタッチ/デタッチ
       - ログアウト時の即座リスナー解除

  6. **型定義・テストの追加:**
     * `src/types/task.ts`: タスク関連型定義
     * `src/components/task/TaskList/__tests__/`: コンポーネントテスト
     * `src/store/__tests__/`: atomsテスト

## 5. 備考 (Notes)

* **技術選定理由:**
  * **Jotai**: 軽量、atom-based、TypeScript親和性高、学習コスト低
  * **Container/View分離**: 責務分離、テスタビリティ向上、再利用性向上
* **実装上の注意点（リスク管理強化）:**
  * **既存コンポーネントとの共存**: 段階的移行中の状態同期管理
  * **Firebaseリスナー管理**: メモリリーク、ゾンビリスナー防止の徹底
  * **SSR/SSG対応**: Jotai atomsのhydration戦略、サーバーサイドでのFirebase初期化タイミング
  * **エラーハンドリング**: onSnapshotエラー時のフォールバック処理
* **マイグレーション戦略:**
  * Phase 1: TaskList単体での新状態管理導入
  * Phase 2: AddTaskとの連携
  * Phase 3: MatrixAreaの段階的移行
  * Phase 4: 旧コンポーネントの完全削除
* **次フェーズへの準備:**
  * 今回確立するパターンを他コンポーネント（AddTask、MatrixArea）にも適用
  * 機能別フォルダ構成への移行基盤
* **パフォーマンス考慮・回帰テスト:**
  * **Atom設計戦略**: 細かい粒度で不要なre-render防止、セレクター活用
  * **onSnapshot最適化**: リスナーの統合、重複サブスクリプション防止
  * **回帰テスト計画**: Jotai導入前後の機能比較、パフォーマンス測定
  * **ロールバック計画**: 問題発生時の旧実装への復旧手順