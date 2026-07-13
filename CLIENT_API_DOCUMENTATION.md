# QuantumVault: Client-Side API Specification

This document outlines the complete client-side API specification for QuantumVault. It includes all endpoints for Authentication, mTLS, Post-Quantum Cryptography, Policies, Audit Logs, PKI Certificate Authority, and health checks.

## Table of Contents

- [1. Authentication & Two-Factor Authentication (2FA) API](#1-authentication-two-factor-authentication-2fa-api)
  - [1.1 Google OAuth Login](#11-google-oauth-login)
  - [1.2 Verify 2FA Login](#12-verify-2fa-login)
  - [1.3 Get User Profile](#13-get-user-profile)
  - [1.4 Setup 2FA](#14-setup-2fa)
  - [1.5 Verify 2FA Setup](#15-verify-2fa-setup)
  - [1.6 Get 2FA Status](#16-get-2fa-status)
  - [1.7 Disable 2FA](#17-disable-2fa)
  - [1.8 Get IP Whitelist Settings](#18-get-ip-whitelist-settings)
  - [1.9 Update IP Whitelist Settings](#19-update-ip-whitelist-settings)
- [2. mTLS (Mutual TLS) Management API](#2-mtls-mutual-tls-management-api)
  - [2.1 Get mTLS Settings](#21-get-mtls-settings)
  - [2.2 Update mTLS Settings](#22-update-mtls-settings)
  - [2.3 Issue mTLS Client Certificate](#23-issue-mtls-client-certificate)
  - [2.4 Get Active mTLS Certificates](#24-get-active-mtls-certificates)
  - [2.5 Get Revoked mTLS Certificates](#25-get-revoked-mtls-certificates)
  - [2.6 Revoke mTLS Certificate](#26-revoke-mtls-certificate)
  - [2.7 Download mTLS Credentials](#27-download-mtls-credentials)
  - [2.8 Verify Certificate (Internal Debug)](#28-verify-certificate-internal-debug)
- [3. Post-Quantum Cryptography (PQC) Keys API](#3-post-quantum-cryptography-pqc-keys-api)
  - [3.1 List PQC Keys](#31-list-pqc-keys)
  - [3.2 Create PQC Key](#32-create-pqc-key)
  - [3.3 Update PQC Key](#33-update-pqc-key)
  - [3.4 Rotate PQC Key](#34-rotate-pqc-key)
- [4. Standard SSH/Authentication Keys API](#4-standard-sshauthentication-keys-api)
  - [4.1 List Auth Keys](#41-list-auth-keys)
  - [4.2 Create Auth Key](#42-create-auth-key)
  - [4.3 Update Auth Key](#43-update-auth-key)
- [5. Access Control Policies API](#5-access-control-policies-api)
  - [5.1 List Policies](#51-list-policies)
  - [5.2 Create Access Policy](#52-create-access-policy)
  - [5.3 Update Access Policy](#53-update-access-policy)
- [6. Public Post-Quantum Cryptographic Operations API](#6-public-post-quantum-cryptographic-operations-api)
  - [6.1 Sign Data](#61-sign-data)
  - [6.2 Verify Signature](#62-verify-signature)
  - [6.3 Encapsulate Key (KEM)](#63-encapsulate-key-kem)
  - [6.4 Decapsulate Key (KEM)](#64-decapsulate-key-kem)
  - [6.5 Symmetric Encrypt](#65-symmetric-encrypt)
  - [6.6 Symmetric Decrypt](#66-symmetric-decrypt)
- [7. System Audit Logs & Dashboard Statistics API](#7-system-audit-logs-dashboard-statistics-api)
  - [7.1 Get Audit Logs](#71-get-audit-logs)
  - [7.2 Get Dashboard Stats](#72-get-dashboard-stats)
- [8. PKI Certificate Authority (CA) & Certificates API](#8-pki-certificate-authority-ca-certificates-api)
  - [8.1 Create PKI Key](#81-create-pki-key)
  - [8.2 List PKI Keys](#82-list-pki-keys)
  - [8.3 Get Single PKI Key](#83-get-single-pki-key)
  - [8.4 Setup Root CA](#84-setup-root-ca)
  - [8.5 Issue Intermediate CA](#85-issue-intermediate-ca)
  - [8.6 Get Certificate Stats](#86-get-certificate-stats)
  - [8.7 List Certificates](#87-list-certificates)
  - [8.8 Generate CSR from Key](#88-generate-csr-from-key)
  - [8.9 Import Certificate](#89-import-certificate)
  - [8.10 Sign CSR (Intermediate CA)](#810-sign-csr-intermediate-ca)
  - [8.11 Get Single Certificate Details](#811-get-single-certificate-details)
  - [8.12 Download Certificate PEM Only](#812-download-certificate-pem-only)
  - [8.13 Download Full Trust Chain](#813-download-full-trust-chain)
  - [8.14 Get Certificate Audit Trail](#814-get-certificate-audit-trail)
  - [8.15 Renew Certificate](#815-renew-certificate)
  - [8.16 Revoke Certificate](#816-revoke-certificate)
  - [8.17 Certificate Live Event Logs (SSE Stream)](#817-certificate-live-event-logs-sse-stream)
- [9. Public Forms & Health API](#9-public-forms-health-api)
  - [9.1 Submit Contact Request](#91-submit-contact-request)
  - [9.2 System Health Check](#92-system-health-check)

---


---


## 1. Authentication & Two-Factor Authentication (2FA) API


### 1.1 Google OAuth Login

**Description:**  
Exchanges a Google Authorization Code for a JWT access token. If 2FA is active on the user's account, it returns a temporary session token and demands 2FA verification.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/auth/google`  
*   **Authentication:** `None`  

**Request Specifications:**  
*   **Headers:**  
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `code` | `string` | **Yes** | Authorization code returned by Google OAuth 2.0 flow |

*   **JSON Payload Example:**  
```json
{
    "code": "4/0AeaYSHC..."
}
```

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK (2FA Disabled)**
        ```json
        {
            "requires2FA": false,
            "token": "eyJhbGciOi...",
            "user": {
                "name": "Alice Dev",
                "email": "alice@company.com",
                "avatar": "https://lh3.googleusercontent.com/a/ACg8oc...",
                "id": "1048293028302"
            }
        }
        ```

    *   **HTTP 200 OK (2FA Enabled)**
        ```json
        {
            "requires2FA": true,
            "tempToken": "eyJhbGciOi...",
            "user": {
                "name": "Alice Dev",
                "email": "alice@company.com",
                "avatar": "https://lh3.googleusercontent.com/a/ACg8oc...",
                "id": "1048293028302"
            }
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `400 Bad Request` | `"Authorization code is required"` | code field is missing or empty |
    | `401 Unauthorized` | `"Failed to exchange Google code"` | Google API rejects the authorization code |
    | `401 Unauthorized` | `"Failed to verify Google access token"` | Google userinfo endpoint rejects token |
    | `500 Internal Server Error` | `"Internal server error"` | Unexpected database or server error |

**Operation Details & Side Effects:**  
*   The temporary session token (`tempToken`) returned when `requires2FA` is true expires strictly in 5 minutes.
*   Successful login events are logged in the system audit trail.

---


### 1.2 Verify 2FA Login

**Description:**  
Verifies the user's 6-digit TOTP token during the login flow using the temporary token received from Google Login.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/auth/2fa/verify`  
*   **Authentication:** `None`  

**Request Specifications:**  
*   **Headers:**  
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `tempToken` | `string` | **Yes** | Restrictive 5-minute token from /api/auth/google |
    | `code` | `string` | **Yes** | 6-digit verification code from authenticator app |

*   **JSON Payload Example:**  
```json
{
    "tempToken": "eyJhbGciOi...",
    "code": "123456"
}
```

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "token": "eyJhbGciOi...",
            "user": {
                "name": "Alice Dev",
                "email": "alice@company.com",
                "avatar": "https://lh3.googleusercontent.com/a/ACg8oc...",
                "id": "1048293028302"
            }
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `400 Bad Request` | `"Temp token and code are required"` | Either parameter is missing or empty |
    | `400 Bad Request` | `"2FA not configured for this user"` | The user account does not have 2FA set up |
    | `400 Bad Request` | `"Invalid 2FA code"` | TOTP code is incorrect or expired (drift) |
    | `401 Unauthorized` | `"Invalid or expired verification..."` | tempToken is invalid or has expired |
    | `401 Unauthorized` | `"Invalid verification token"` | tempToken is valid but not a 2FA token |


---


### 1.3 Get User Profile

**Description:**  
Retrieves the currently authenticated user's profile information.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/auth/me`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "name": "Alice Dev",
            "email": "alice@company.com",
            "avatar": "https://lh3.googleusercontent.com/a/ACg8oc...",
            "id": "1048293028302",
            "twoFactorEnabled": true
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `401 Unauthorized` | `"Access token required"` | Authorization header is missing or invalid |
    | `404 Not Found` | `"User not found"` | Authenticated user ID is missing in database |


---


### 1.4 Setup 2FA

**Description:**  
Initiates the TOTP configuration sequence. Returns a shared secret, otpauth URI, and QR code raw data.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/auth/2fa/setup`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "secret": "NBSWY3DPEB3W64TBNQ",
            "otpauthUri": "otpauth://totp/QuantumVault:alice%40company.com?secret=NBSWY3DPEB3W64TBNQ&issuer=QuantumVault",
            "qrData": "otpauth://totp/QuantumVault:alice%40company.com?secret=NBSWY3DPEB3W64TBNQ&issuer=QuantumVault"
        }
        ```

**Operation Details & Side Effects:**  
*   Calling setup does not activate 2FA immediately. You must verify a code via `/api/auth/2fa/verify-setup` to commit the enablement.

---


### 1.5 Verify 2FA Setup

**Description:**  
Completes the 2FA configuration sequence by verifying a code with the generated secret. Enables 2FA.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/auth/2fa/verify-setup`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `code` | `string` | **Yes** | 6-digit token from the authenticator app |
    | `secret` | `string` | **Yes** | The base32 secret returned by the `/2fa/setup` endpoint |

*   **JSON Payload Example:**  
```json
{
    "code": "654321",
    "secret": "NBSWY3DPEB3W64TBNQ"
}
```

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "enabled": true
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `400 Bad Request` | `"Code and secret are required"` | Either parameter is missing |
    | `400 Bad Request` | `"Invalid verification code"` | The code failed to verify against secret |


---


### 1.6 Get 2FA Status

**Description:**  
Checks whether 2FA is currently active for the authenticated account.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/auth/2fa/status`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "enabled": true
        }
        ```
        
        ---
        
        #


---


### 1.7 Disable 2FA

**Description:**  
Deactivates Two-Factor Authentication for the account and deletes the saved secret.

**HTTP Specification:**  
*   **Method:** `DELETE`  
*   **URL:** `/api/auth/2fa`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "enabled": false
        }
        ```
        
        ---
        
        #


---


### 1.8 Get IP Whitelist Settings

**Description:**  
Returns the user's IP Access Whitelist constraints.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/auth/settings/ip-whitelist`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "mode": "selected",
            "whitelist": [
                "203.0.113.5",
                "198.51.100.0/24"
            ]
        }
        ```

**Operation Details & Side Effects:**  
*   `mode` can be "any" (no IP verification) or "selected" (only whitelist allows API requests).

---


### 1.9 Update IP Whitelist Settings

**Description:**  
Updates the client whitelist configurations. Supports individual IPs and CIDR ranges.

**HTTP Specification:**  
*   **Method:** `PUT`  
*   **URL:** `/api/auth/settings/ip-whitelist`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `mode` | `string` | **Yes** | Must be "any" or "selected" |
    | `whitelist` | `array` | No | Array of IP addresses/CIDR ranges. Optional if mode is any |

*   **JSON Payload Example:**  
```json
{
    "mode": "selected",
    "whitelist": ["203.0.113.10", "192.168.1.0/24"]
}
```

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "mode": "selected",
            "whitelist": ["203.0.113.10", "192.168.1.0/24"]
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `400 Bad Request` | `"Mode is required..."` | mode parameter is missing |
    | `400 Bad Request` | `"Invalid mode. Must be 'any' or..."` | mode parameter is not "any" or "selected" |
    | `400 Bad Request` | `"Invalid IP address or CIDR: <val>"` | String in whitelist is not valid IP/CIDR |



[↑ Back to Table of Contents](#table-of-contents)

---


## 2. mTLS (Mutual TLS) Management API


### 2.1 Get mTLS Settings

**Description:**  
Returns the client's current mTLS security configuration status.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/auth/mtls/settings`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "mtlsMode": "standard",
            "mtlsEnabled": false,
            "certificateCount": 1,
            "certificates": [
                {
                    "id": "4b6c92d5-...",
                    "certificateName": "Main Gateway Client",
                    "serialNumber": "0x4ae82d1c902b",
                    "fingerprint": "a9f87c6e5d...",
                    "validFrom": "2026-07-09T00:00:00.000Z",
                    "validUntil": "2027-07-09T00:00:00.000Z",
                    "issuedAt": "2026-07-09T06:00:00.000Z"
                }
            ]
        }
        ```
        
        ---
        
        #


---


### 2.2 Update mTLS Settings

**Description:**  
Configures mTLS enforcement rules.

**HTTP Specification:**  
*   **Method:** `PUT`  
*   **URL:** `/api/auth/mtls/settings`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `mtlsMode` | `string` | **Yes** | Must be "standard" (no client cert) or "mtls" (cert req'd) |

*   **JSON Payload Example:**  
```json
{
    "mtlsMode": "mtls"
}
```

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "mtlsMode": "mtls",
            "mtlsEnabled": true
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `400 Bad Request` | `"MTLS mode is required"` | mtlsMode field is missing |
    | `400 Bad Request` | `"Invalid mTLS mode"` | Value is not "standard" or "mtls" |

**Operation Details & Side Effects:**  

[!CAUTION]
>


---


### 2.3 Issue mTLS Client Certificate

**Description:**  
Signs a PEM-formatted CSR to generate client, CA, and server certificates for mTLS access.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/auth/mtls/issue`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `csr` | `string` | **Yes** | Valid PEM-encoded Certificate Signing Request string |
    | `certificateName` | `string` | **Yes** | Friendly label / hostname for validation |

*   **JSON Payload Example:**  
```json
{
    "csr": "-----BEGIN CERTIFICATE REQUEST-----\nMIIB...",
    "certificateName": "prod-crypto-worker"
}
```

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "success": true,
            "certificate": {
                "id": "e83b4010-...",
                "certificateName": "prod-crypto-worker",
                "serialNumber": "0x4bf2e09121a",
                "fingerprint": "b0a2d3c4e5...",
                "clientCert": "-----BEGIN CERTIFICATE-----\nMIID...",
                "caCert": "-----BEGIN CERTIFICATE-----\nMIID...",
                "serverCert": "-----BEGIN CERTIFICATE-----\nMIID...",
                "validFrom": "2026-07-09T06:50:00.000Z",
                "validUntil": "2027-07-09T06:50:00.000Z",
                "issuedAt": "2026-07-09T06:50:00.000Z"
            }
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `400 Bad Request` | `"Valid CSR is required"` | csr field is empty or missing |
    | `400 Bad Request` | `"Certificate name is required"` | certificateName field is empty |
    | `500 Internal Server Error` | `"Failed to issue certificate: ..."` | OpenSSL generation fails (system failure) |


---


### 2.4 Get Active mTLS Certificates

**Description:**  
Retrieves active mTLS validation certificates.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/auth/mtls/certificates`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "certificates": [
                {
                    "id": "e83b4010-...",
                    "certificateName": "prod-crypto-worker",
                    "serialNumber": "0x4bf2e09121a",
                    "fingerprint": "b0a2d3c4e5...",
                    "validFrom": "2026-07-09T06:50:00.000Z",
                    "validUntil": "2027-07-09T06:50:00.000Z",
                    "issuedAt": "2026-07-09T06:50:00.000Z"
                }
            ],
            "count": 1
        }
        ```
        
        ---
        
        #


---


### 2.5 Get Revoked mTLS Certificates

**Description:**  
Retrieves certificates that have been intentionally invalidated.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/auth/mtls/certificates/revoked`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "certificates": [
                {
                    "id": "3a0d9271-...",
                    "certificateName": "old-crypto-worker",
                    "serialNumber": "0x2af19d8",
                    "fingerprint": "c1f7a2...",
                    "validFrom": "2025-07-09T06:50:00.000Z",
                    "validUntil": "2026-07-09T06:50:00.000Z",
                    "issuedAt": "2025-07-09T06:50:00.000Z",
                    "revokedAt": "2026-07-09T06:51:00.000Z",
                    "revocationReason": "key_compromise"
                }
            ],
            "count": 1
        }
        ```
        
        ---
        
        #


---


### 2.6 Revoke mTLS Certificate

**Description:**  
Revokes an mTLS certificate by its ID, preventing future cryptographic access through that device.

**HTTP Specification:**  
*   **Method:** `DELETE`  
*   **URL:** `/api/auth/mtls/certificates/:certificateId`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "success": true,
            "message": "Certificate revoked successfully",
            "certificateId": "e83b4010-..."
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `400 Bad Request` | `"Certificate ID is required"` | certificateId param is missing in route |
    | `404 Not Found` | `"Certificate not found"` | Certificate does not exist or isn't active |


---


### 2.7 Download mTLS Credentials

**Description:**  
Downloads a raw JSON payload containing the client certificate, CA certificate, and server certificate.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/auth/mtls/download/:certificateId`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK (with `Content-Disposition**
        attachment` header):
        ```json
        {
            "certificateName": "prod-crypto-worker",
            "serialNumber": "0x4bf2e09121a",
            "issuedAt": "2026-07-09T06:50:00.000Z",
            "validFrom": "2026-07-09T06:50:00.000Z",
            "validUntil": "2027-07-09T06:50:00.000Z",
            "certificates": {
                "clientCrt": "-----BEGIN CERTIFICATE-----\nMIID...",
                "caCrt": "-----BEGIN CERTIFICATE-----\nMIID...",
                "serverCrt": "-----BEGIN CERTIFICATE-----\nMIID..."
            }
        }
        ```
        
        ---
        
        #


---


### 2.8 Verify Certificate (Internal Debug)

**Description:**  
Manually checks the validity, structure, and revocation status of a PEM certificate string.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/auth/mtls/verify`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `certificate` | `string` | **Yes** | PEM certificate string to examine |

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK (If valid)**
        ```json
        {
            "valid": true,
            "userId": 1,
            "certificateId": "e83b4010-...",
            "certificateName": "prod-crypto-worker",
            "serialNumber": "0x4bf2e09121a",
            "fingerprint": "b0a2d3c4e5...",
            "user": {
                "id": 1,
                "name": "Alice Dev",
                "email": "alice@company.com"
            }
        }
        ```

    *   **HTTP 200 OK (If invalid/revoked)**
        ```json
        {
            "valid": false,
            "error": "Certificate has been revoked"
        }
        ```
        
        ---



[↑ Back to Table of Contents](#table-of-contents)

---


## 3. Post-Quantum Cryptography (PQC) Keys API


### 3.1 List PQC Keys

**Description:**  
Lists all PQC and Hybrid keys managed by the user.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/pqc-keys`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        [
            {
                "id": "3c0f92d5-...",
                "name": "production-signer",
                "algorithm": "ML-DSA",
                "parameters": "ML-DSA-65 (NIST Parameter Set)",
                "operations": "Sign · Verify",
                "operationsObj": {
                    "sign": true,
                    "verify": true,
                    "encrypt": false,
                    "decrypt": false,
                    "encapsulate": false,
                    "decapsulate": false
                },
                "environment": "Production",
                "status": "active",
                "version": 1,
                "publicKeyClassical": null,
                "symmetricKey": null,
                "created": "2026-07-09T06:50:00.000Z",
                "createdAt": "2026-07-09T06:50:00.000Z",
                "updatedAt": "2026-07-09T06:50:00.000Z"
            }
        ]
        ```
        
        ---
        
        #


---


### 3.2 Create PQC Key

**Description:**  
Generates a new Post-Quantum Cryptographic key pair or symmetric key on the server.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/pqc-keys`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `name` | `string` | **Yes** | Label. Alphanumeric, underscores, hyphens only. Max 30. |
    | `algorithm` | `string` | **Yes** | ML-DSA, ML-KEM, ECDSA, Hybrid-DSA, Hybrid-KEM, AES-256 |
    | `environment` | `string` | No | e.g., "Development", "Staging", "Production". |

*   **JSON Payload Example:**  
```json
{
    "name": "db-encryptor-v1",
    "algorithm": "AES-256",
    "environment": "Production"
}
```

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 201 Created**
        ```json
        {
            "id": "5e8d9102-...",
            "name": "db-encryptor-v1",
            "algorithm": "AES-256",
            "parameters": "AES-256-GCM Symmetric Key",
            "operations": "Encrypt · Decrypt",
            "operationsObj": {
                "sign": false,
                "verify": false,
                "encrypt": true,
                "decrypt": true,
                "encapsulate": false,
                "decapsulate": false
            },
            "environment": "Production",
            "status": "active",
            "version": 1,
            "publicKeyClassical": null,
            "symmetricKey": "c3ae8f921...", 
            "created": "2026-07-09T07:00:00.000Z",
            "createdAt": "2026-07-09T07:00:00.000Z",
            "updatedAt": "2026-07-09T07:00:00.000Z"
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `400 Bad Request` | `"Key name is required"` | name field is empty |
    | `400 Bad Request` | `"Invalid algorithm"` | alg is not in the supported array |
    | `400 Bad Request` | `"An active PQC key with the name..."` | User already has active key with this name |

**Operation Details & Side Effects:**  
*   Operations are strictly locked by the system depending on algorithm (e.g. ML-DSA -> Sign/Verify).

---


### 3.3 Update PQC Key

**Description:**  
Renames a key or modifications status. renmaing propagates renaming to linked access control policies.

**HTTP Specification:**  
*   **Method:** `PUT`  
*   **URL:** `/api/pqc-keys/:id`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `name` | `string` | No | New label. Alphanumeric, underscores, hyphens only. Max 30. |
    | `status` | `string` | No | Must be "active", "rotated", or "disabled" |

*   **JSON Payload Example:**  
```json
{
    "name": "db-encryptor-legacy",
    "status": "disabled"
}
```

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "id": "5e8d9102-...",
            "name": "db-encryptor-legacy",
            "algorithm": "AES-256",
            "status": "disabled",
            "version": 1,
            ...
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `400 Bad Request` | `"Key name cannot be empty"` | name is empty string |
    | `400 Bad Request` | `"Invalid status"` | status not active/rotated/disabled |
    | `404 Not Found` | `"PQC Key not found"` | ID doesn't exist for the user |


---


### 3.4 Rotate PQC Key

**Description:**  
Deactivates the current key by moving it to `rotated` status, creates a new key version with fresh materials under the same name, and re-routes active policy links.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/pqc-keys/:id/rotate`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "id": "9a8f2e10-...",
            "name": "production-signer",
            "algorithm": "ML-DSA",
            "status": "active",
            "version": 2,
            ...
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `404 Not Found` | `"PQC Key not found"` | Key ID not found |



[↑ Back to Table of Contents](#table-of-contents)

---


## 4. Standard SSH/Authentication Keys API


### 4.1 List Auth Keys

**Description:**  
Lists all standard/classical SSH and authorization keys.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/auth-keys`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        [
            {
                "id": "a1b2c3d4-...",
                "name": "office-mac-terminal",
                "algorithm": "ECDSA",
                "fingerprint": "SHA256:d8a9f2e...",
                "publicKey": "-----BEGIN PUBLIC KEY-----\nMFkw...",
                "publicKeyDsa": null,
                "status": "active",
                "created": "2026-07-09T06:50:00.000Z",
                "createdAt": "2026-07-09T06:50:00.000Z",
                "updatedAt": "2026-07-09T06:50:00.000Z"
            }
        ]
        ```
        
        ---
        
        #


---


### 4.2 Create Auth Key

**Description:**  
Creates a new classical key pair or imports an existing public key.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/auth-keys`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `name` | `string` | **Yes** | Label for the credential. |
    | `algorithm` | `string` | **Yes** | Must be "RSA", "ECDSA", "ML-DSA", or "Hybrid" |
    | `publicKey` | `string` | No | External public key PEM string. If empty, vault generates |

*   **JSON Payload Example:**  
```json
{
    "name": "office-mac-terminal",
    "algorithm": "ECDSA"
}
```

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 201 Created**
        ```json
        {
            "id": "a1b2c3d4-...",
            "name": "office-mac-terminal",
            "algorithm": "ECDSA",
            "fingerprint": "SHA256:d8a9f2e...",
            "publicKey": "-----BEGIN PUBLIC KEY-----\n...",
            "privateKey": "-----BEGIN PRIVATE KEY-----\n...", 
            "status": "active",
            "created": "2026-07-09T06:50:00.000Z"
        }
        ```
        
        ---
        
        #


---


### 4.3 Update Auth Key

**Description:**  
Renames or disables a standard authentication key.

**HTTP Specification:**  
*   **Method:** `PUT`  
*   **URL:** `/api/auth-keys/:id`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `name` | `string` | No | New key label. |
    | `status` | `string` | No | Must be "active" or "disabled" |

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "id": "a1b2c3d4-...",
            "name": "office-mac-terminal-legacy",
            "status": "disabled",
            ...
        }
        ```
        
        ---



[↑ Back to Table of Contents](#table-of-contents)

---


## 5. Access Control Policies API


### 5.1 List Policies

**Description:**  
Lists all access control policies mapping classical Auth Keys to PQC keys.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/policies`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        [
            {
                "id": "1c8d92e5-...",
                "name": "worker-signing-policy",
                "authKey": "office-mac-terminal",
                "authKeyId": "a1b2c3d4-...",
                "pqcKey": "production-signer",
                "pqcKeyId": "3c0f92d5-...",
                "operations": "Sign,Verify",
                "rateLimit": "100/m",
                "status": "active",
                "created": "2026-07-09T06:55:00.000Z",
                "createdAt": "2026-07-09T06:55:00.000Z",
                "updatedAt": "2026-07-09T06:55:00.000Z"
            }
        ]
        ```
        
        ---
        
        #


---


### 5.2 Create Access Policy

**Description:**  
Creates a policy link that authorizes a client holding the `authKeyId` to execute operations using `pqcKeyId`.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/policies`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `name` | `string` | **Yes** | Identifier name for policy |
    | `authKeyId` | `string` | **Yes** | UUIDv4 of the active Authentication Key |
    | `pqcKeyId` | `string` | **Yes** | UUIDv4 of the active PQC/Symmetric Key |
    | `operations` | `string` | **Yes** | Comma-separated operations (Sign, Verify, Encrypt, etc.) |
    | `rateLimit` | `string` | No | String config (e.g. "100/m") |
    | `status` | `string` | No | "active" or "disabled" |

*   **JSON Payload Example:**  
```json
{
    "name": "worker-signing-policy",
    "authKeyId": "a1b2c3d4-...",
    "pqcKeyId": "3c0f92d5-...",
    "operations": "Sign,Verify",
    "rateLimit": "100/m",
    "status": "active"
}
```

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 201 Created**
        ```json
        {
            "id": "1c8d92e5-...",
            "name": "worker-signing-policy",
            "authKey": "office-mac-terminal",
            "authKeyId": "a1b2c3d4-...",
            "pqcKey": "production-signer",
            "pqcKeyId": "3c0f92d5-...",
            "operations": "Sign,Verify",
            "rateLimit": "100/m",
            "status": "active",
            "created": "2026-07-09T06:55:00.000Z"
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `400 Bad Request` | `"Policy name is required"` | name parameter is empty |
    | `400 Bad Request` | `"Invalid PQC Key ID"` | pqcKeyId doesn't belong to active user |
    | `400 Bad Request` | `"Cannot link policy to a disabled..."` | Target key status is not "active" |
    | `400 Bad Request` | `"A policy already exists for this..."` | Policy combination already exists |


---


### 5.3 Update Access Policy

**Description:**  
Updates details or state of an access control rule.

**HTTP Specification:**  
*   **Method:** `PUT`  
*   **URL:** `/api/policies/:id`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "id": "1c8d92e5-...",
            "status": "disabled",
            ...
        }
        ```
        
        ---



[↑ Back to Table of Contents](#table-of-contents)

---


## 6. Public Post-Quantum Cryptographic Operations API


### 6.1 Sign Data

**Description:**  
Calculates a post-quantum, classical, or hybrid signature over arbitrary data.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/crypto/sign`  
*   **Authentication:** `Bearer JWT OR Signed Request (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `x-pqc-key-id: <pqc_key_id_uuid>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `data` | `string` | **Yes** | String data payload to sign |
    | `timestamp` | `number` | No | Unix epoch milliseconds (Required if Signed Request) |

*   **JSON Payload Example:**  
```json
{
    "data": "important-payload-string",
    "timestamp": 1783584000000
}
```

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK (ML-DSA / ECDSA)**
        ```json
        {
            "signature": "81c0e2d5ab83..."
        }
        ```

    *   **HTTP 200 OK (Hybrid-DSA)**
        ```json
        {
            "signature": {
                "pqc": "81c0e2d5ab83...",
                "classical": "3045022100e4..."
            }
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `400 Bad Request` | `"Missing required parameters..."` | x-pqc-key-id, x-auth-key-id, or data is missing |
    | `400 Bad Request` | `"Operation 'sign' is not supported..."` | PQC Key does not have signing capability |
    | `400 Bad Request` | `"Algorithm mismatch..."` | Attempting to sign using a KEM/AES key |
    | `401 Unauthorized` | `"Invalid cryptographic signature."` | Request body signature verification failed |
    | `401 Unauthorized` | `"Request timestamp is missing,..."` | timestamp drift is > 5 minutes |
    | `403 Forbidden` | `"Crypto operation blocked: IP..."` | Client IP address is blocked by whitelist |
    | `403 Forbidden` | `"MTLS is enabled... no client cert..."` | mTLS is configured but no cert provided |
    | `403 Forbidden` | `"No active policy found..."` | Policy linking the auth & PQC key is absent |
    | `403 Forbidden` | `"Operation 'sign' is not permitted..."` | Policy exists but excludes signing |


---


### 6.2 Verify Signature

**Description:**  
Verifies a cryptographic signature against a data string.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/crypto/verify`  
*   **Authentication:** `Bearer JWT OR Signed Request (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `x-pqc-key-id: <pqc_key_id_uuid>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `data` | `string` | **Yes** | Original string payload |
    | `signature` | `string` | **Yes** | The signature value to verify (string or hybrid object) |
    | `timestamp` | `number` | No | Unix epoch milliseconds (Required if Signed Request) |

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "isValid": true
        }
        ```
        
        ---
        
        #


---


### 6.3 Encapsulate Key (KEM)

**Description:**  
Generates a shared secret and encapsulates it into a ciphertext package.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/crypto/encapsulate`  
*   **Authentication:** `Bearer JWT OR Signed Request (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `x-pqc-key-id: <pqc_key_id_uuid>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK (ML-KEM)**
        ```json
        {
            "ciphertext": "a1b2c3...",
            "sharedSecret": "f8e7d6..."
        }
        ```

    *   **HTTP 200 OK (Hybrid-KEM)**
        ```json
        {
            "ciphertext": {
                "pqc": "a1b2c3...",
                "classical": "d4e5f6..."
            },
            "sharedSecret": {
                "pqc": "f8e7d6...",
                "classical": "c1b2a3..."
            }
        }
        ```
        
        ---
        
        #


---


### 6.4 Decapsulate Key (KEM)

**Description:**  
Decapsulates a ciphertext envelope to extract the private shared secret key.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/crypto/decapsulate`  
*   **Authentication:** `Bearer JWT OR Signed Request (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `x-pqc-key-id: <pqc_key_id_uuid>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `ciphertext` | `string` | **Yes** | Encapsulated ciphertext package (string or hybrid object) |
    | `timestamp` | `number` | No | Unix epoch milliseconds (Required if Signed Request) |

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK (ML-KEM)**
        ```json
        {
            "sharedSecret": "f8e7d6..."
        }
        ```

    *   **HTTP 200 OK (Hybrid-KEM)**
        ```json
        {
            "sharedSecret": {
                "pqc": "f8e7d6...",
                "classical": "c1b2a3..."
            }
        }
        ```
        
        ---
        
        #


---


### 6.5 Symmetric Encrypt

**Description:**  
Encrypts data using AES-256-GCM symmetric algorithm keys.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/crypto/encrypt`  
*   **Authentication:** `Bearer JWT OR Signed Request (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `x-pqc-key-id: <pqc_key_id_uuid>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `data` | `string` | **Yes** | String data to encrypt |
    | `timestamp` | `number` | No | Unix epoch milliseconds (Required if Signed Request) |

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "ciphertext": "8fa82b...",
            "iv": "3ea2f10b...",
            "authTag": "c0e9b1da..."
        }
        ```
        
        ---
        
        #


---


### 6.6 Symmetric Decrypt

**Description:**  
Decrypts AES-256-GCM ciphertext data.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/crypto/decrypt`  
*   **Authentication:** `Bearer JWT OR Signed Request (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `x-pqc-key-id: <pqc_key_id_uuid>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `ciphertext` | `string` | **Yes** | Hex-encoded ciphertext string |
    | `iv` | `string` | **Yes** | Hex-encoded Initialization Vector |
    | `authTag` | `string` | **Yes** | Hex-encoded authentication tag validation bytes |
    | `timestamp` | `number` | No | Unix epoch milliseconds (Required if Signed Request) |

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "data": "original-plaintext-string"
        }
        ```
        
        ---



[↑ Back to Table of Contents](#table-of-contents)

---


## 7. System Audit Logs & Dashboard Statistics API


### 7.1 Get Audit Logs

**Description:**  
Retrieves the operations audit trail. Automatically filters system operations and only shows security failures and user configuration edits.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/audit-logs`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        [
            {
                "id": 142,
                "operation": "pqc_sign",
                "authKey": "office-mac-terminal",
                "authKeyId": "a1b2c3d4-...",
                "pqcKey": "production-signer",
                "pqcKeyId": "3c0f92d5-...",
                "policyId": "1c8d92e5-...",
                "sourceIP": "198.51.100.42",
                "result": "success",
                "createdAt": 1783584500000,
                "timestamp": "2026-07-09T06:58:20.000Z"
            }
        ]
        ```
        
        ---
        
        #


---


### 7.2 Get Dashboard Stats

**Description:**  
Aggregates entity counts and operation volumes.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/dashboard/stats`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "pqcKeys": 4,
            "authKeys": 2,
            "policies": 3,
            "totalOperations": 1245,
            "successfulEvents": 1241
        }
        ```
        
        ---



[↑ Back to Table of Contents](#table-of-contents)

---


## 8. PKI Certificate Authority (CA) & Certificates API


### 8.1 Create PKI Key

**Description:**  
Generates a new P-256 ECDSA public/private key-pair designated strictly for PKI operations (end-entity).

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/cert/keys`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `name` | `string` | **Yes** | Max 30 chars. Alphanumeric, underscores, hyphens only. |

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 201 Created**
        ```json
        {
            "id": "7a9c82b1-...",
            "name": "web-server-key",
            "algorithm": "ECDSA",
            "parameters": "P-256",
            "publicKeyPem": "-----BEGIN PUBLIC KEY-----\nMFkw...",
            "caType": "NONE",
            "parentKeyId": null,
            "pathLenConstraint": null,
            "status": "active",
            "createdAt": "2026-07-09T07:15:00.000Z"
        }
        ```
        
        ---
        
        #


---


### 8.2 List PKI Keys

**Description:**  
Lists all PKI keys in the certificate module database.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/cert/keys`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        [
            {
                "id": "7a9c82b1-...",
                "name": "web-server-key",
                "algorithm": "ECDSA",
                "caType": "NONE",
                ...
            }
        ]
        ```
        
        ---
        
        #


---


### 8.3 Get Single PKI Key

**Description:**  
Retrieves details of a specific key.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/cert/keys/:id`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        Same format as create.
        
        ---
        
        #


---


### 8.4 Setup Root CA

**Description:**  
Creates a self-signed Root CA key-pair and self-signed certificate for the authenticated user. One-time operation.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/cert/keys/setup-root-ca`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `commonName` | `string` | **Yes** | Common Name (CN). Max 64 chars. |
    | `organizationName` | `string` | **Yes** | Organization Name (O). Max 64 chars. |
    | `country` | `string` | No | Country (C). Exactly 2 uppercase letters. e.g. "IN" |

*   **JSON Payload Example:**  
```json
{
    "commonName": "Acme Corp Root CA G1",
    "organizationName": "Acme Corporation",
    "country": "IN"
}
```

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 201 Created**
        ```json
        {
            "key": {
                "id": "4d7c2a11-...",
                "name": "Acme Corp Root CA G1",
                "algorithm": "ECDSA",
                "parameters": "P-256",
                "caType": "ROOT",
                "parentKeyId": null,
                "pathLenConstraint": 1,
                "status": "active",
                "createdAt": "2026-07-09T07:20:00.000Z"
            },
            "cert": {
                "id": "5f8e12c1-...",
                "name": "Acme Corp Root CA G1 Certificate",
                "subject": "CN=Acme Corp Root CA G1,O=Acme Corporation,C=IN",
                "issuer": "CN=Acme Corp Root CA G1,O=Acme Corporation,C=IN",
                "serialNumber": "a4d8c9...",
                "thumbprint": "9a2d8e3c...",
                "status": "ACTIVE",
                "notBefore": "2026-07-09T07:20:00.000Z",
                "notAfter": "2036-07-09T07:20:00.000Z",
                "parentCertificateId": null,
                "issuingKeyId": null,
                "createdAt": "2026-07-09T07:20:00.000Z"
            }
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `400 Bad Request` | `"Common Name is required..."` | commonName is empty or > 64 chars |
    | `400 Bad Request` | `"Organization Name is required..."` | organizationName is empty or > 64 chars |
    | `400 Bad Request` | `"Country must be exactly 2..."` | country code is invalid |
    | `409 Conflict` | `"Root CA already setup for this user"` | User already has setup a Root CA |


---


### 8.5 Issue Intermediate CA

**Description:**  
Issues an Intermediate CA certificate signed by the specified Root CA key.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/cert/keys/:rootKeyId/issue-intermediate`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `name` | `string` | **Yes** | CA name label (max 100). Alphanumeric + spaces/dots/etc. |
    | `subjectDN` | `string` | **Yes** | Subject DN (e.g. CN=Interm,O=Acme,C=IN). CN is required |
    | `validityDays` | `number` | No | Validity duration. Integer: 30 to 1825 (5 years max). |

*   **JSON Payload Example:**  
```json
{
    "name": "Acme Issuing CA G1",
    "subjectDN": "CN=Acme Corp Issuing CA G1,O=Acme Corporation,C=IN",
    "validityDays": 1825
}
```

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 201 Created**
        ```json
        {
            "key": {
                "id": "6a8b2d10-...",
                "name": "Acme Issuing CA G1",
                "caType": "INTERMEDIATE",
                "parentKeyId": "4d7c2a11-...",
                ...
            },
            "cert": {
                "id": "1e2f9d8a-...",
                "name": "Acme Issuing CA G1 Certificate",
                "subject": "CN=Acme Corp Issuing CA G1,O=Acme Corporation,C=IN",
                "issuer": "CN=Acme Corp Root CA G1,O=Acme Corporation,C=IN",
                "status": "ACTIVE",
                "certType": "INTERMEDIATE",
                ...
            },
            "chain": [
                "-----BEGIN CERTIFICATE-----\nICA...",
                "-----BEGIN CERTIFICATE-----\nROOT..."
            ]
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `403 Forbidden` | `"Only a ROOT CA key can issue..."` | rootKeyId points to a key with caType!=ROOT |
    | `422 Unprocessable Entity` | `"Root CA key is not active"` | Parent Root key status is not active |
    | `422 Unprocessable Entity` | `"Root CA certificate not found"` | No ACTIVE certificate found for rootKeyId |


---


### 8.6 Get Certificate Stats

**Description:**  
Returns overall counts of leaf certificates grouped by state.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/cert/certificates/stats`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "total": 12,
            "active": 10,
            "expiringSoon": 1,
            "revoked": 1,
            "pending": 0
        }
        ```
        
        ---
        
        #


---


### 8.7 List Certificates

**Description:**  
Lists all leaf and CA certificates with support for pagination and filtering by status.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/cert/certificates`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "total": 1,
            "page": 1,
            "totalPages": 1,
            "certificates": [
                {
                    "id": "9c8e10d2-...",
                    "name": "web-server-cert",
                    "keyId": "7a9c82b1-...",
                    "issuingKeyId": "6a8b2d10-...",
                    "parentCertificateId": "1e2f9d8a-...",
                    "certType": "LEAF",
                    "subject": "CN=web.acme.com",
                    "issuer": "CN=Acme Corp Issuing CA G1,O=Acme Corporation,C=IN",
                    "serialNumber": "8c2f10...",
                    "thumbprint": "5e1a0b...",
                    "status": "ACTIVE",
                    "notBefore": "2026-07-09T07:30:00.000Z",
                    "notAfter": "2027-07-09T07:30:00.000Z",
                    "issuedInternally": true,
                    "publicKeyAlgorithm": "ECDSA",
                    "createdAt": "2026-07-09T07:30:00.000Z"
                }
            ]
        }
        ```
        
        ---
        
        #


---


### 8.8 Generate CSR from Key

**Description:**  
Generates a CSR from a PKI key using profile validations.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/cert/certificates/keys/:keyId/csr`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `subjectDN` | `string` | **Yes** | DN string. Max 64 chars for CN/O/OU. CN is required |
    | `sans` | `array` | No | Array of SAN strings (DNS names, IPs, Emails) |
    | `keyUsage` | `array` | No | digitalSignature, keyEncipherment, keyAgreement, etc. |
    | `extendedKeyUsage` | `array` | No | ServerAuth, ClientAuth, CodeSigning, etc. |

*   **JSON Payload Example:**  
```json
{
    "subjectDN": "CN=web.acme.com,O=Acme Corporation,C=IN",
    "sans": ["web.acme.com", "alt.acme.com", "192.168.1.10"],
    "keyUsage": ["digitalSignature", "keyEncipherment"],
    "extendedKeyUsage": ["ServerAuth"]
}
```

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "csr": "-----BEGIN CERTIFICATE REQUEST-----\nMIIB...",
            "certificateId": "Pending-Certificate-UUID"
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `400 Bad Request` | `"TLS Server Certificate... validity..."` | Profile rule triggered (e.g. ServerAuth eku |
    | `` |  | must have DNS/IP SANs) |
    | `403 Forbidden` | `"A Root CA key cannot generate..."` | keyId belongs to a ROOT CA key |

**Operation Details & Side Effects:**  
*   Generating a CSR creates a stub certificate record in `PENDING` state.

---


### 8.9 Import Certificate

**Description:**  
Imports an externally signed certificate, linking it to the private key.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/cert/certificates/import`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `certificate` | `string` | **Yes** | PEM-encoded certificate string |
    | `keyId` | `string` | No | UUIDv4 of the associated private key |
    | `name` | `string` | No | Friendly name label |
    | `chain` | `string` | No | PEM CA chain certificates |

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 201 Created**
        ```json
        {
            "id": "9c8e10d2-...",
            "status": "ACTIVE",
            ...
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `422 Unprocessable Entity` | `"Certificate public key does not..."` | The public key of cert does not match keyId |


---


### 8.10 Sign CSR (Intermediate CA)

**Description:**  
Signs a leaf CSR using an Intermediate CA private key.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/cert/certificates/sign-csr`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `csrPem` | `string` | **Yes** | Valid PEM-encoded CSR |
    | `issuingKeyId` | `string` | **Yes** | UUIDv4 of the Intermediate CA private key |
    | `name` | `string` | No | Certificate friendly label |
    | `validityDays` | `number` | No | Validity in days. Max 397 (TLS) or 825 (Others). |

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 201 Created**
        ```json
        {
            "id": "leaf-cert-uuid",
            "name": "web-server-cert",
            "status": "ACTIVE",
            "certificatePem": "-----BEGIN CERTIFICATE-----\n...",
            "chainPem": "-----BEGIN CERTIFICATE-----\nLeaf\n-----BEGIN CERTIFICATE-----\nICA...",
            ...
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `403 Forbidden` | `"Root CA cannot directly sign..."` | issuingKeyId is a Root CA key |
    | `403 Forbidden` | `"This key is not a CA..."` | issuingKeyId is a NONE key |
    | `422 Unprocessable Entity` | `"Intermediate CA certificate not..."` | No active certificate exists for issuingKey |


---


### 8.11 Get Single Certificate Details

**Description:**  
Retrieves detailed properties of a certificate record, including PEM content.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/cert/certificates/:id`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "id": "leaf-cert-uuid",
            "name": "web-server-cert",
            "status": "ACTIVE",
            "certificatePem": "-----BEGIN CERTIFICATE-----\n...",
            "chainPem": "-----BEGIN CERTIFICATE-----\nLeaf\n...",
            ...
        }
        ```
        
        ---
        
        #


---


### 8.12 Download Certificate PEM Only

**Description:**  
Returns the PEM certificate string.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/cert/certificates/:id/download`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "name": "web-server-cert",
            "pem": "-----BEGIN CERTIFICATE-----\n...",
            "chain": "-----BEGIN CERTIFICATE-----\n..."
        }
        ```
        
        ---
        
        #


---


### 8.13 Download Full Trust Chain

**Description:**  
Returns the full trust chain in order (Leaf -> Intermediate -> Root).

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/cert/certificates/:id/chain`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "name": "web-server-cert",
            "certificatePem": "-----BEGIN CERTIFICATE-----\nLeaf...",
            "chainPem": "-----BEGIN CERTIFICATE-----\nLeaf\n-----BEGIN CERTIFICATE-----\nICA\n-----BEGIN CERTIFICATE-----\nRoot...",
            "subject": "CN=web.acme.com",
            "issuer": "CN=Acme Corp Issuing CA G1"
        }
        ```
        
        ---
        
        #


---


### 8.14 Get Certificate Audit Trail

**Description:**  
Retrieves lifecycle audit log entries for a certificate (creation, signatures, downloads, revocations).

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/cert/certificates/:id/audit-logs`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        [
            {
                "id": 84,
                "certificateId": "leaf-cert-uuid",
                "action": "LEAF_CERT_ISSUED",
                "performedBy": "1",
                "sourceIP": "192.168.1.5",
                "details": "{\"issuingKeyId\":\"...\",\"icaCertId\":\"...\"}",
                "createdAt": "2026-07-09T07:30:00.000Z"
            }
        ]
        ```
        
        ---
        
        #


---


### 8.15 Renew Certificate

**Description:**  
Renews an active certificate by generating a new CSR for signing.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/cert/certificates/:id/renew`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "message": "New CSR generated for renewal. Import the new certificate after CA signs it.",
            "csr": "-----BEGIN CERTIFICATE REQUEST-----\n...",
            "newCertificateId": "New-Pending-Cert-UUID"
        }
        ```
        
        ---
        
        #


---


### 8.16 Revoke Certificate

**Description:**  
Revokes an internal certificate, setting status to `REVOKED`.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/api/cert/certificates/:id/revoke`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `reason` | `string` | No | Revocation reason description. Max 255 chars. |

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "id": "leaf-cert-uuid",
            "status": "REVOKED",
            ...
        }
        ```
        
        ---
        
        #


---


### 8.17 Certificate Live Event Logs (SSE Stream)

**Description:**  
Establishes a Server-Sent Events (SSE) connection to stream PKI/CA logs in real-time.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/cert/logs/stream`  
*   **Authentication:** `Bearer JWT (required)`  

**Request Specifications:**  
*   **Headers:**  
    *   `Authorization: Bearer <JWT_TOKEN>` (Required)
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK (Connection**
        keep-alive, Content-Type: text/event-stream):
        ```
        data: [2026-07-09 07:30:00] INFO: Leaf cert signed by ICA key: ...
        ```
        
        ---



[↑ Back to Table of Contents](#table-of-contents)

---


## 9. Public Forms & Health API


### 9.1 Submit Contact Request

**Description:**  
Public endpoint to submit contact and support form requests.

**HTTP Specification:**  
*   **Method:** `POST`  
*   **URL:** `/requests`  
*   **Authentication:** `None`  

**Request Specifications:**  
*   **Headers:**  
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:**  

    | Parameter | Type | Required | Validation Rules & Description |
    | :--- | :--- | :--- | :--- |
    | `fullName` | `string` | **Yes** | Full Name and Company Name string |
    | `email` | `string` | **Yes** | Client email address |
    | `serviceOffering` | `string` | No | Tier selection (e.g. Free, Enterprise) |
    | `mobile` | `string` | No | Contact number |
    | `message` | `string` | No | Message description |
    | `agreePrivacy` | `boolean` | No | Privacy terms agreement flag |
    | `subscribeUpdates` | `boolean` | No | Updates subscription agreement flag |

*   **JSON Payload Example:**  
```json
{
    "fullName": "Bob Builder - Builder Inc",
    "email": "bob@builder.com",
    "serviceOffering": "Enterprise",
    "mobile": "9999999999",
    "message": "Interested in post-quantum VPN adapters",
    "agreePrivacy": true,
    "subscribeUpdates": true
}
```

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "message": "Contact request submitted successfully!",
            "data": {
                "success": true,
                "leadId": "external-crm-lead-id"
            }
        }
        ```

*   **Error Responses:**  

    | Status Code | Error Message / Code | Trigger Condition |
    | :--- | :--- | :--- |
    | `400 Bad Request` | `"Full Name and Email are required"` | Either field is empty or missing |
    | `500 Internal Server Error` | `"Server configuration error..."` | CONTACT_API_URL is missing in .env config |
    | `502 Bad Gateway` | `"Failed to contact external service"` | Network error connecting to CRM backend |


---


### 9.2 System Health Check

**Description:**  
Simple system pulse endpoint for status checking.

**HTTP Specification:**  
*   **Method:** `GET`  
*   **URL:** `/api/health`  
*   **Authentication:** `None`  

**Request Specifications:**  
*   **Headers:**  
    *   `Content-Type: application/json` (Required)
*   **Body Parameters:** None

**Response Specifications:**  
*   **Success Responses:**  
    *   **HTTP 200 OK**
        ```json
        {
            "status": "ok",
            "timestamp": "2026-07-09T07:45:00.000Z"
        }
        ```


---

[↑ Back to Table of Contents](#table-of-contents)
