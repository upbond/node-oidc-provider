# General Specifications

## System Architecture

### Components
1. **OIDC Provider (node-oidc-provider)**
   - Handles OIDC authentication flows
   - Issues ID tokens containing DIDs
   - Manages client registrations and interactions

2. **Frontend Server (Next.js)**
   - Server-side rendered login interface
   - Handles Web3Auth MPC initialization
   - Manages DID generation and VC issuance
   - Processes OIDC interactions

3. **Web3Auth MPC Core Kit**
   - Generates and manages Ed25519 key shares
   - Implements 2-of-3 threshold signature scheme
   - Provides secure key management without full key reconstruction

4. **Sphereon SSI SDK (Veramo)**
   - DID generation and management
   - VC issuance and verification
   - Custom KMS integration with Web3Auth MPC

### Data Flow
1. Client initiates OIDC authorization request
2. Frontend server renders login form
3. User authenticates and triggers MPC key generation
4. DID is generated using MPC key material
5. Optional VC issuance occurs
6. OIDC interaction completes with DID in ID token

## Technical Specifications

### Key Management
- **Key Type**: Ed25519
- **Threshold Scheme**: 2-of-3
- **Share Distribution**:
  - Server-side share
  - Client-side share
  - Cloud backup share
- **Security Requirements**:
  - No full key reconstruction
  - Secure share storage
  - Encrypted communication between shares

### DID Specifications
- **Method**: did:key
- **Key Type**: Ed25519
- **Format**: Base58 encoded public key
- **Storage**: Persistent database with user association

### VC Specifications
- **Format**: JWT VC
- **Issuer**: User's DID
- **Optional Claims**:
  - Login proof
  - Authentication timestamp
  - Additional user attributes

### OIDC Integration
- **ID Token Claims**:
  ```json
  {
    "sub": "did:key:z6Mkw...",
    "did": "did:key:z6Mkw..."
  }
  ```
- **Required Endpoints**:
  - `/authorize`
  - `/interaction/:uid/login`
  - `/token`

## Implementation Details

### Custom KMS Implementation
```typescript
interface Web3AuthMpcKMS {
  // Key management
  generateKey(): Promise<Key>;
  getKey(keyRef: string): Promise<Key>;
  
  // Signing operations
  sign(data: Buffer, keyRef: string): Promise<Buffer>;
  verify(data: Buffer, signature: Buffer, keyRef: string): Promise<boolean>;
}
```

### DID Generation Flow
1. Initialize Web3Auth MPC
2. Generate key shares
3. Create did:key using public key material
4. Store DID and key references
5. Return DID for OIDC integration

### VC Issuance Flow
1. Prepare VC claims
2. Sign VC using MPC shares
3. Verify VC signature
4. Store VC if needed
5. Return signed VC

## Security Considerations

### Key Share Management
- Secure storage of server-side share
- Encrypted client-side share storage
- Secure backup share management
- Regular key rotation policies

### Communication Security
- TLS for all network communications
- Encrypted share exchange
- Secure session management
- Protection against replay attacks

### Access Control
- Role-based access control for key operations
- Audit logging for all key operations
- Rate limiting for authentication attempts
- Session timeout policies

## Testing Requirements

### Unit Tests
- MPC key generation and management
- DID generation and verification
- VC issuance and verification
- OIDC token generation

### Integration Tests
- End-to-end authentication flow
- MPC share communication
- DID integration with OIDC
- VC issuance and verification

### Security Tests
- Key share security
- Communication encryption
- Access control enforcement
- Session management

## Deployment Considerations

### Environment Requirements
- Node.js runtime
- Secure key storage
- Database for DID/VC persistence
- Network access for MPC communication

### Scaling Considerations
- Horizontal scaling of OIDC provider
- Load balancing for frontend servers
- Database sharding for DID storage
- Caching strategies for VC verification

### Monitoring and Logging
- Authentication success/failure rates
- Key operation metrics
- DID generation statistics
- VC issuance tracking
