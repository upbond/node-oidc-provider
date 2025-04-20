## 🎯 目的（Goal）

OIDCログインフロー中に、秘密鍵を一切復元せずに安全にEd25519署名を行う構成を構築する。  
Web3AuthのMPC Core Kitを活用し、Sphereon SSI SDK（Veramoベース）と統合して、DID生成・VC発行・OIDCログインまでを完結させる。  
ログイン後にはDIDをOIDCのIDトークンに含める。

---

## ⚙️ 使用する技術要素（Tech Stack）

- **OIDC Provider**: node-oidc-provider
- **Frontend**: SSR対応（例：Next.js）
- **DID/VC管理**: Sphereon SSI SDK（Veramoベース）
- **KMS**: Web3Auth MPC Core Kit（Custom KMSとして実装）
- **DID方式**: did:key（Ed25519鍵ベース）
- **VC形式**: JWT VC（任意）

---

## 🧩 構成概要（Architecture）

```
[Client App]
  └─ OIDC SDK → /authorize

[Frontend Server (Next.js SSR)]
  └─ /interaction/:uid/login
      └─ Loginフォーム送信後：
          ├─ Web3Auth MPC鍵を生成（Ed25519鍵のshareを複数端末に）
          ├─ Veramo Agent経由でDID生成（Sphereon SDK）
          ├─ 必要に応じてVC発行
          ├─ DIDをDBに保存
          └─ interactionFinished()でOIDCフロー完了通知

[node-oidc-provider]
  └─ ID Token発行
      └─ sub: DID（または claims.did に含める）
```

---

## 🔐 要件（Requirements）

### 🔑 1. Ed25519鍵管理
- Web3Auth MPCでEd25519鍵を生成
- 鍵shareは少なくとも2-of-3（例：サーバー / クライアント / クラウド）
- 秘密鍵は一切復元しない
- Veramoの `sign()` に対応するようCustomKMSを実装（`IKeyManagementSystem`）

### 🪪 2. DID生成
- DIDは `did:key` を使用
- Veramo Agent経由で生成
- 鍵素材はWeb3Auth MPCで生成された鍵を使用

### 📄 3. VC発行（任意）
- VCはSphereon SDKでJWT形式で発行
- 発行者は自身のDID
- 必要であれば「ログイン証明」VCとして出力

### 🧾 4. OIDC連携
- OIDC IDトークンには以下のいずれかの形式でDIDを含める：
```json
{
  "sub": "did:key:z6Mkw...",
  "did": "did:key:z6Mkw..."
}
```
- `/interaction/:uid/login` にログインフォーム + 処理ロジック
- OIDC Provider へ `interactionFinished()` で戻す

---

## 📦 期待される成果物（Deliverables）

- `Web3AuthMpcKMS.ts`：Veramo KMSのカスタム実装（MPC経由の署名対応）
- `agent.ts`：Veramo Agentの定義（上記KMSを登録）
- `interactionLogin.ts`：SSRログイン画面 & 処理（Next.js）
- DID生成ロジック：Veramo agent 経由で `did:key` を作成
- VC発行ロジック：JWT署名もMPC署名で実行
- node-oidc-provider設定：subまたはclaims.didにDIDを含める

---

## 🧪 テスト想定（Optional）

- MPC署名でVeramo `agent.keyManagerSign` が正常に動作すること
- MPC鍵から生成されたDIDで、正しいJWT VCが署名されること
- OIDC IDトークンにDIDが正しく埋め込まれて返ること

---

## 🧠 備考（Notes）

- MPCの署名実行には複数端末/環境間のセッションが必要になることを想定して設計する
- サーバー側とクライアント側における `share` 保管・通信方式は分離して設計可能
- 必要に応じてQRコード連携やローカルストレージ活用も検討

