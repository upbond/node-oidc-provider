# Test Structure Specification

## 1. テストの基本構造

### 1.1 ディレクトリ構成
```
test/
├── / # 基本的なユーティリティテスト
├── auth_time/ # 認証時刻関連のテスト
├── authorization_code/ # 認可コードフローのテスト
├── backchannel_logout/ # バックチャネルログアウトのテスト
├── base_token/ # トークン基本機能のテスト
├── certificate_bound_access_tokens/ # 証明書バインドトークンのテスト
├── ciba/ # Client Initiated Backchannel Authenticationのテスト
├── claim_types/ # クレームタイプのテスト
├── claims/ # クレーム処理のテスト
├── client_auth/ # クライアント認証のテスト
├── client_credentials/ # クライアントクレデンシャルフローのテスト
├── client_id_uri/ # クライアントIDとURIのテスト
├── configuration/ # プロバイダー設定のテスト
├── core/ # コア機能のテスト
├── cors/ # CORS機能のテスト
├── custom_grants/ # カスタムグラントタイプのテスト
├── custom_response_modes/ # カスタムレスポンスモードのテスト
├── device_code/ # デバイスコードフローのテスト
├── discovery/ # ディスカバリーエンドポイントのテスト
├── dpop/ # DPoP (Demonstrating Proof of Possession) のテスト
├── dynamic_registration/ # 動的クライアント登録のテスト
├── dynamic_token_ttl/ # 動的トークンTTLのテスト
├── encryption/ # 暗号化機能のテスト
├── end_session/ # セッション終了のテスト
├── errors/ # エラーハンドリングのテスト
├── external_signing/ # 外部署名のテスト
├── fapi/ # Financial-grade API のテスト
├── form_post/ # フォームポストレスポンスモードのテスト
├── formats/ # トークンフォーマットのテスト
├── helpers/ # テストヘルパー関数
├── id_token_claims/ # IDトークンクレームのテスト
├── interaction/ # ユーザー対話のテスト
├── introspection/ # トークンイントロスペクションのテスト
├── iss/ # Issuer関連のテスト
├── jwt/ # JWTトークンのテスト
├── jwt_introspection/ # JWTイントロスペクションのテスト
├── jwt_response_modes/# JWTレスポンスモードのテスト
├── oauth/ # OAuth2.0コア機能のテスト
├── oauth_native_apps/ # ネイティブアプリケーション向けOAuthのテスト
├── pairwise/ # Pairwise Subject Identifiersのテスト
├── pkce/ # PKCE (Proof Key for Code Exchange) のテスト
├── provider/ # OIDCプロバイダーコアのテスト
├── pushed_authorization_requests/ # PARのテスト
├── refresh/ # リフレッシュトークンのテスト
├── registration_management/ # クライアント登録管理のテスト
├── registration_policies/ # 登録ポリシーのテスト
├── request/ # リクエスト処理のテスト
├── resource_indicators/ # リソースインジケーターのテスト
├── revocation/ # トークン失効のテスト
├── routing/ # ルーティングのテスト
├── session_bound_tokens/ # セッションバインドトークンのテスト
├── sessions/ # セッション管理のテスト
├── signatures/ # 署名処理のテスト
├── userinfo/ # ユーザー情報エンドポイントのテスト
└── web_message/ # Webメッセージレスポンスモードのテスト
```

### 1.2 共通ファイル
- `test_helper.js`: テストのセットアップと共通機能を提供
- `default.config.js`: デフォルトのプロバイダー設定を定義
- `models.js`: テスト用のモデル定義を提供
- `keys.js`: テスト用の暗号鍵を定義
- `run.js`: テスト実行のエントリーポイント
- `capture_output.js`: テスト出力のキャプチャ機能
- `ci.js`: CI環境用の設定
- `client.sig.key.js`: クライアント署名キーの定義

## 2. テストの基本パターン

### 2.1 テストファイルの構造
```javascript
import { expect } from 'chai';
import sinon from 'sinon';
import bootstrap from '../test_helper.js';

describe('機能カテゴリ', () => {
  before(bootstrap(import.meta.url));
  afterEach(sinon.restore);

  context('テストシナリオ', () => {
    beforeEach(async function() {
      // テストの前準備
    });

    it('期待される動作', async function() {
      // テストケース
    });
  });
});
```

### 2.2 設定ファイルの構造
```javascript
// {feature}.config.js
export default {
  config: {
    features: {
      // 機能固有の設定
    },
    // その他の設定
  },
  client: {
    // テストクライアントの設定
  }
};
```

## 3. テストカテゴリ別の実装パターン

### 3.1 認証フローテスト
- 認可コードフロー
- クライアントクレデンシャル
- デバイスフロー
- CIBAフロー

### 3.2 セキュリティテスト
- PKCE
- DPoP
- FAPI
- 証明書バインド

### 3.3 トークン管理テスト
- 発行
- 検証
- 失効
- イントロスペクション

### 3.4 セッション管理テスト
- セッション作成
- セッション更新
- セッション終了
- バックチャネルログアウト

## 4. テストヘルパーの利用

### 4.1 プロバイダーの初期化
```javascript
const provider = new Provider('http://localhost', {
  clients: [...],
  features: {...},
  // その他の設定
});
```

### 4.2 テストエージェントの利用
```javascript
const agent = supertest(provider.app);
await agent
  .get('/auth')
  .query(params)
  .expect(200);
```

## 5. テスト実行

### 5.1 実行コマンド
```bash
# すべてのテストを実行
npm test

# 特定のカテゴリのテストを実行
mocha test/authorization_code/**/*.test.js

# カバレッジレポートの生成
npm run test:coverage
```

### 5.2 CI/CD環境での実行
```bash
# CI環境での実行
NODE_ENV=test npm test

# デバッグ出力の有効化
DEBUG=oidc-provider:* npm test
```

## 6. テスト拡張のガイドライン

### 6.1 新機能のテスト追加
1. 適切なディレクトリを選択または作成
2. 設定ファイルを作成 (`{feature}.config.js`)
3. テストファイルを作成 (`{feature}.test.js`)
4. 共通ヘルパーを活用

### 6.2 テストカバレッジ
1. 正常系のテスト
2. エラーケースのテスト
3. エッジケースのテスト
4. セキュリティ要件のテスト

## 7. ベストプラクティス

### 7.1 テスト設計
1. 一つのテストファイルは一つの機能に集中
2. 適切な記述的なテスト名を使用
3. テストの前提条件を明確に記述
4. モック/スタブを適切に使用

### 7.2 テストメンテナンス
1. 重複コードを避ける
2. テストデータを分離
3. 設定を再利用可能にする
4. テストの依存関係を明確にする
