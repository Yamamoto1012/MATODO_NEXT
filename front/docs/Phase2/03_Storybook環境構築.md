# Phase2.3: Storybook環境構築

## 概要 (Overview)

UIコンポーネントの可視化・テスト環境としてStorybookを導入します。Next.js App Router、Tailwind CSS、MUIとの統合を行い、コンポーネント開発の効率化を図ります。

## 技術選定理由 (Technical Selection Rationale)

* **Storybook**: デファクトスタンダード、Next.js公式サポート、豊富なアドオン
* **@storybook/nextjs**: Next.js専用の最適化された統合
* **Component Driven Development**: 独立したコンポーネント開発環境
* **Visual Testing**: UIの回帰テストと品質保証

## 実装ステップ (Implementation Steps)

### ステップ1: Storybookインストール

```bash
# Storybook初期化（自動設定）
npx storybook@latest init

# または手動インストール
yarn add --dev @storybook/nextjs @storybook/react @storybook/react-vite @storybook/blocks @storybook/essentials
```

### ステップ2: 基本設定ファイル作成

`.storybook/main.ts` を作成:

```typescript
import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../src/**/*.story.@(js|jsx|ts|tsx|mdx)',
    '../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)'
  ],
  
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-actions'
  ],

  framework: {
    name: '@storybook/nextjs',
    options: {
      image: {
        loading: 'eager'
      },
      nextConfigPath: '../next.config.js'
    }
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    }
  },

  staticDirs: ['../public'],

  env: (config) => ({
    ...config,
    NODE_ENV: 'development'
  }),

  core: {
    disableTelemetry: true
  }
}

export default config
```

### ステップ3: プレビュー設定

`.storybook/preview.ts` を作成:

```typescript
import type { Preview } from '@storybook/react'
import { initialize, mswLoader } from 'msw-storybook-addon'

// Tailwind CSSをインポート
import '../src/app/globals.css'

// MUI Theme Provider（必要な場合）
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from '../src/theme/theme' // プロジェクトのtheme設定

// MSW初期化（API Mockingが必要な場合）
initialize()

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      autodocs: 'tag',
    },
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#333333',
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1024px',
            height: '768px',
          },
        },
      },
    },
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ margin: '1rem' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],

  loaders: [mswLoader],
}

export default preview
```

### ステップ4: Tailwind CSS + MUI統合設定

#### Tailwind CSSのStorybook対応

`.storybook/preview-head.html` を作成（必要に応じて）:

```html
<style>
  /* Storybook特有のスタイルリセット */
  .sb-show-main {
    padding: 0;
  }
  
  /* Tailwind CSS優先度調整 */
  .css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input {
    /* MUIスタイルの特定要素をTailwindに適合 */
  }
</style>
```

#### CSS優先度の調整

`src/styles/storybook.css` を作成:

```css
/* Storybook専用スタイル */
.storybook-wrapper {
  @apply min-h-screen bg-gray-50;
}

/* MUI + Tailwind CSS競合対策 */
.MuiButton-root {
  /* MUIのButtonコンポーネント用の調整 */
  @apply !text-base !normal-case;
}

.MuiCard-root {
  /* MUIのCardコンポーネント用の調整 */
  @apply !shadow-md;
}

/* Tailwind CSS変数の上書き防止 */
:root {
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
}
```

### ステップ5: Firebase Mock設定

`.storybook/firebase-mock.ts` を作成:

```typescript
import { initialize, rest } from 'msw'

export const handlers = [
  // Firebase Firestore API Mock
  rest.get('/v1/projects/:projectId/databases/:database/documents/*', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        documents: [
          {
            name: 'projects/mock/databases/(default)/documents/tasks/1',
            fields: {
              title: { stringValue: 'Sample Task' },
              completed: { booleanValue: false },
              createdAt: { timestampValue: new Date().toISOString() }
            }
          }
        ]
      })
    )
  }),

  // Firebase Auth Mock
  rest.post('/v1/accounts:signInWithPassword', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        localId: 'mock-user-id',
        email: 'test@example.com',
        idToken: 'mock-id-token',
        refreshToken: 'mock-refresh-token'
      })
    )
  })
]

// MSW Worker初期化（Storybook環境用）
if (typeof window !== 'undefined') {
  const { worker } = require('./browser')
  worker.start()
}
```

### ステップ6: package.jsonスクリプト追加

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "storybook:build": "storybook build",
    "storybook:serve": "npx http-server storybook-static -p 6006",
    "chromatic": "npx chromatic --project-token=PROJECT_TOKEN"
  }
}
```

### ステップ7: TypeScript設定

`tsconfig.json` に Storybook用の設定追加:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/stories/*": ["./src/stories/*"]
    }
  },
  "include": [
    ".storybook/*.ts",
    ".storybook/*.tsx", 
    "**/*.stories.tsx",
    "**/*.story.tsx"
  ]
}
```

## Next.js App Router対応

### Server Components制限対応

```typescript
// .storybook/preview.ts の decorators に追加
decorators: [
  (Story) => {
    // Server Components互換性のための設定
    return (
      <div suppressHydrationWarning>
        <Story />
      </div>
    )
  }
]
```

### 環境変数の設定

`.storybook/main.ts` の `env` 設定:

```typescript
env: (config) => ({
  ...config,
  NEXT_PUBLIC_FIREBASE_API_KEY: 'mock-api-key',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'mock-project',
  NODE_ENV: 'development'
})
```

### Image最適化の対応

```typescript
// .storybook/main.ts の framework options
framework: {
  name: '@storybook/nextjs',
  options: {
    image: {
      loading: 'eager',
      domains: ['example.com']
    }
  }
}
```

## スタイル競合対策

### Tailwind CSS vs MUI優先度調整

1. **Layer順序の明確化**:
```css
@layer base, components, utilities, mui-override;

@layer mui-override {
  .MuiButton-root {
    @apply !bg-blue-500 !text-white;
  }
}
```

2. **Specificity戦略**:
```typescript
// StorybookのdecoratorsでMUI ThemeProviderを最上位に配置
decorators: [
  (Story) => (
    <ThemeProvider theme={theme}>
      <div className="tw-reset"> {/* Tailwind専用wrapper */}
        <Story />
      </div>
    </ThemeProvider>
  )
]
```

### CSS-in-JS vs Tailwind CSS対応

```typescript
// styled-componentsなどとの競合対策
const StyledWrapper = styled.div`
  /* styled-componentsスタイル */
  && {
    /* Tailwindより高い優先度 */
  }
`
```

## 検証項目 (Verification Items)

### 基本機能検証
- [ ] `yarn storybook` でStorybookが起動する
- [ ] コンポーネントがStorybook内で正しく表示される
- [ ] アドオン（Controls、Actions、Docs）が動作する
- [ ] ビルド（`yarn storybook:build`）が成功する

### Next.js統合検証
- [ ] Next.js Image コンポーネントが動作する
- [ ] App Router機能がStorybookで動作する
- [ ] 環境変数が正しく読み込まれる
- [ ] Path aliasが正しく解決される

### スタイル統合検証
- [ ] Tailwind CSSクラスが適用される
- [ ] MUIコンポーネントが正しく表示される
- [ ] スタイル競合が発生しない
- [ ] レスポンシブデザインが確認できる

### Firebase Mock検証
- [ ] Firebase依存コンポーネントがMockで動作する
- [ ] API呼び出しがモックされる
- [ ] 認証状態がシミュレーションされる

## トラブルシューティング (Troubleshooting)

### よくある問題

1. **CSS読み込みエラー**
   ```typescript
   // .storybook/main.ts
   webpackFinal: async (config) => {
     config.module.rules.push({
       test: /\.css$/,
       use: ['style-loader', 'css-loader', 'postcss-loader']
     })
     return config
   }
   ```

2. **Next.js Image最適化エラー**
   ```typescript
   // next.config.js でのimages設定をStorybook設定に同期
   ```

3. **Firebase接続エラー**
   ```typescript
   // .storybook/preview.ts でFirebase完全モック化
   ```

### パフォーマンス問題
- **ビルド時間**: 必要最小限のアドオンのみ有効化
- **メモリ使用量**: webpack設定の最適化
- **Hot Reload**: ファイル変更検知範囲の限定

## 完了の定義 (Definition of Done)

- [ ] Storybookが正常に起動・動作する
- [ ] Next.js App Routerとの統合が完了している
- [ ] Tailwind CSS + MUIのスタイル競合が解決されている
- [ ] Firebase Mockが適切に設定されている
- [ ] TypeScript設定が完了している
- [ ] 基本的なアドオン（Controls、Actions、Docs）が動作する
- [ ] ビルド・デプロイが正常に動作する

## 次のステップ

Phase2.3完了後は [Phase2.4: サンプル実装](./04_サンプル実装.md) に進みます。