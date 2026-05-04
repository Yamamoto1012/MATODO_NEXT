# Phase2.2: Vitest環境構築

## 概要 (Overview)

軽量で高速なテスト環境を構築するため、Vitest + React Testing Libraryを導入します。Jest互換APIによりスムーズな移行と、Vite-nativeによる高速なテスト実行を実現します。

## 技術選定理由 (Technical Selection Rationale)

* **Vitest**: Vite-nativeで高速、Jest互換API、ES Modules対応
* **React Testing Library**: React Hooksとコンポーネントテストのベストプラクティス
* **jsdom**: ブラウザ環境の軽量シミュレーション
* **Firebase Mock対応**: テスト環境でのFirebase依存関係の分離

## 実装ステップ (Implementation Steps)

### ステップ1: パッケージインストール

```bash
# Vitest関連パッケージ
yarn add --dev vitest @vitest/ui @vitest/coverage-v8

# React Testing Library
yarn add --dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Vite関連
yarn add --dev @vitejs/plugin-react

# jsdom (ブラウザ環境シミュレーション)
yarn add --dev jsdom

# Firebase Mock用
yarn add --dev firebase-mock
```

### ステップ2: Vitest設定ファイル作成

`vitest.config.ts` を作成:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '.next/',
        'out/',
      ],
    },
    include: [
      '**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
      '**/?(*.)(test|spec).(js|jsx|ts|tsx)'
    ],
    exclude: [
      'node_modules/',
      '.next/',
      'out/',
      'dist/'
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@/types': resolve(__dirname, './src/types')
    }
  }
})
```

### ステップ3: テストセットアップファイル作成

`src/test/setup.ts` を作成:

```typescript
import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Firebase Mock設定
import { initializeApp } from 'firebase/app'

// テスト前にFirebase Mockを初期化
beforeAll(() => {
  // Firebase設定をモック化
  const mockFirebaseConfig = {
    apiKey: 'mock-api-key',
    authDomain: 'mock-auth-domain',
    projectId: 'mock-project-id',
    storageBucket: 'mock-storage-bucket',
    messagingSenderId: 'mock-sender-id',
    appId: 'mock-app-id'
  }
  
  // テスト環境でのFirebase初期化
  process.env.NODE_ENV = 'test'
})

// 各テスト後のクリーンアップ
afterEach(() => {
  cleanup()
})

// 全テスト終了後のクリーンアップ
afterAll(() => {
  // 必要に応じてクリーンアップ処理
})

// console.errorのモック（不要なエラーログ抑制）
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
```

### ステップ4: Firebase Mock設定

`src/test/mocks/firebase.ts` を作成:

```typescript
import { vi } from 'vitest'

// Firebase Firestore Mock
export const mockFirestore = {
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({
      get: vi.fn(() => Promise.resolve({
        exists: true,
        data: () => ({ 
          id: 'mock-id',
          title: 'Mock Task',
          completed: false 
        })
      })),
      set: vi.fn(() => Promise.resolve()),
      update: vi.fn(() => Promise.resolve()),
      delete: vi.fn(() => Promise.resolve())
    })),
    add: vi.fn(() => Promise.resolve({ id: 'mock-new-id' })),
    where: vi.fn(() => ({
      get: vi.fn(() => Promise.resolve({
        docs: [
          {
            id: 'mock-id-1',
            data: () => ({ title: 'Task 1', completed: false })
          },
          {
            id: 'mock-id-2', 
            data: () => ({ title: 'Task 2', completed: true })
          }
        ]
      }))
    }))
  }))
}

// Firebase Auth Mock
export const mockAuth = {
  currentUser: {
    uid: 'mock-user-id',
    email: 'test@example.com',
    displayName: 'Test User'
  },
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve({
    user: {
      uid: 'mock-user-id',
      email: 'test@example.com'
    }
  })),
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn((callback) => {
    // 初期状態でログイン済みユーザーを設定
    callback(mockAuth.currentUser)
    return vi.fn() // unsubscribe function
  })
}

// Firebase モックの適用
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => mockFirestore),
  collection: vi.fn((db, path) => mockFirestore.collection(path)),
  doc: vi.fn((collection, id) => collection.doc(id)),
  addDoc: vi.fn((collection, data) => collection.add(data)),
  getDocs: vi.fn((query) => query.get()),
  getDoc: vi.fn((docRef) => docRef.get()),
  setDoc: vi.fn((docRef, data) => docRef.set(data)),
  updateDoc: vi.fn((docRef, data) => docRef.update(data)),
  deleteDoc: vi.fn((docRef) => docRef.delete()),
  where: vi.fn((field, operator, value) => ({ where: vi.fn() }))
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
  signInWithEmailAndPassword: vi.fn(mockAuth.signInWithEmailAndPassword),
  signOut: vi.fn(mockAuth.signOut),
  onAuthStateChanged: vi.fn(mockAuth.onAuthStateChanged)
}))

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({}))
}))
```

### ステップ5: package.jsonスクリプト追加

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### ステップ6: TypeScript設定更新

`tsconfig.json` の `compilerOptions` に追加:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

## Next.js + App Router対応

### 環境変数設定
テスト環境用の環境変数を `.env.test` に設定:

```env
# Firebase Test Config
NEXT_PUBLIC_FIREBASE_API_KEY=mock-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mock-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mock-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mock-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=mock-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=mock-app-id

NODE_ENV=test
```

### Server Components対応
Server Componentsのテストは制限がありますが、Client Components用の設定:

```typescript
// vitest.config.ts の test設定に追加
test: {
  // ... 他の設定
  env: {
    NODE_ENV: 'test'
  }
}
```

## 検証項目 (Verification Items)

### 基本機能検証
- [ ] `yarn test` でテストが実行される
- [ ] `yarn test:watch` でwatch モードが動作する
- [ ] `yarn test:ui` でUI表示が動作する
- [ ] `yarn test:coverage` でカバレッジレポートが生成される

### Firebase Mock検証
- [ ] Firestoreのcollection/doc操作がモックされる
- [ ] Firebase Authの認証状態がモックされる
- [ ] テスト実行時に実際のFirebaseに接続しない
- [ ] Mock設定が他のテストに影響しない

### React Testing Library検証
- [ ] コンポーネントのrender/unmountが正常に動作する
- [ ] ユーザーイベントのシミュレーションが動作する
- [ ] DOM操作のアサーションが正常に動作する
- [ ] Hooksのテストが可能である

### パフォーマンス検証
- [ ] テスト実行速度がJestより高速である
- [ ] Hot reloadによる高速な再実行が動作する
- [ ] 並列実行による効率的なテストが動作する

## トラブルシューティング (Troubleshooting)

### よくある問題

1. **Firebase接続エラー**
   ```typescript
   // setup.tsでFirebaseを完全にモック化
   vi.mock('firebase/app', () => ({
     initializeApp: vi.fn(),
     getApps: vi.fn(() => [])
   }))
   ```

2. **Next.js Router関連エラー**
   ```typescript
   // useRouter mocksの設定
   vi.mock('next/router', () => ({
     useRouter: () => ({
       push: vi.fn(),
       pathname: '/test',
       query: {}
     })
   }))
   ```

3. **CSS Import エラー**
   ```typescript
   // vitest.config.tsで css: true を設定済みだが、
   // 必要に応じてcss mockingも可能
   ```

### 環境固有の問題
- **SSR/SSG**: テスト環境ではclient-sideでのみ実行
- **Environment Variables**: `.env.test` の読み込み確認
- **Path Aliases**: `resolve.alias` の設定確認

## 完了の定義 (Definition of Done)

- [ ] Vitestが正常にインストール・設定されている
- [ ] React Testing Libraryが使用可能である
- [ ] Firebase Mockが適切に設定されている
- [ ] `yarn test` でサンプルテストが実行される
- [ ] テストカバレッジが取得できる
- [ ] Next.js App Routerとの互換性が確認されている
- [ ] 開発体験（watch mode、UI）が良好である

## 次のステップ

Phase2.2完了後は [Phase2.3: Storybook環境構築](./03_Storybook環境構築.md) に進みます。