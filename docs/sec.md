# Mastering Critical Web Application Security Risks

This note uses the **OWASP Top 10:2021** categories. The OWASP Top 10 is an awareness framework, not a complete vulnerability taxonomy. A single vulnerability or incident can involve more than one category.

# A01:2021 - Broken Access Control

## Overview

Broken Access control occurs when an application fails to properly enforce what an authenticated or unauthenticated subject is permitted to access or perform.

The important distinction is:

- **Authentication:** Who are you?
- **Authorization:** What are you allowed to access or do?

An attacker does not necessarily need to bypass authentication to exploit broken access control. A legitimate low-privileged user may simply access another user's object or perform an administrative operation that they should not be allowed to perform.

## Common Vulnerabilities

### 1. Insecure Direct Object References (IDOR)

Occurs when applications exposes a reference to an object and fails to verify that the requesting user is authorized to access that object.

Example:
` https://example.com/account?id=12345`

The problem is **not the existence of `12345` itself**. Numeric or predictable identifiers can be perfectly acceptable. The vulnerability exists when changing the identifier allows a user to access another user's account without an authorization check.

Using random or indirect identifiers can reduce enumeration risk, but it must not be treated as a substitute for authorization.

### 2. Missing Function Level Authorization

An application may correctly authenticate a user but fail to verify whether that user is allowed to invoke a privileged operation.

For example, a average user may discover an administrative API endpoint and successfully invoke it because the server checks only whether the user logged in.

Authorization must therefore be enforced on the server for every protected operation.

### 3. Path Traversal

Path traversal occurs when an attacker manipulates file paths to access resources outside the application's intended directory.

It becomes an access-control concern when the application fails to enforce which files the user is authorized to access.

## Mitigation

- Enforce authorization on the server or trusted backend for every protected resource and operation.
- Deny access by default and explicitly grant required permissions.
- Enforce object-level authorization rather than trusting identifiers supplied by clients.
- Apply least privilege to users, services, and database accounts.
- Do not treat hidden URLs, random identifiers, or client-side checks as authorization controls.
- Log security-relevant authorization failures and investigate repeated violations.
- Use rate limiting as an additional abuse-control mechanism, not as a replacement for authorization.

## Testing

Test authorization separately from authentication. Use accounts with different privilege levels and verify that each account can access only the resources and operations assigned to it.

Test object identifiers, API endpoints, administrative functions, HTTP methods, and direct requests to protected resources. 

--- 

# A02:2021 - Cryptographic Failures

## Overview

Cryptographic Failures occur when sensitive information is inadequately protected because encryption, hashing, key management, secure transport, randomness, certificate validation, or related cryptographic controls are missing or incorrectly implemented. OWASP formerly described this category as " Sensitive Data Exposure. "

## Common Vulnerabilities

### 1. Cleartext Transmission

Sensitive information transmitted without appropriate transport protection can be intercepted or modified. 

Examples include using HTTP instead of HTTPS or insecure legacy protocols for sensitive communication.

The issue is not simply that a protocol name is old; the important question is whether sensitive data us protected using a correctly configured, modern secure transport mechanism. 

### 2. Weak or Deprecated Cryptography 

Examples include obsolete algorithms such as MD5, SHA-1 where collision resistance is required, DES, or RC4. 

The correct cryptographic algorithms also depends on its purpose. A cryptographic hash, password hash, message authentication code, and encryption algorithm solve different problems.

### 3. Improper Key Management

Examples include: 
- Hard-coded encryption keys
- Keys committed to source control
- Default or shared keys 
- Weak key generation 
- Reusing keys where separation is required
- Poor rotation or revocation procedures
- Incorrect storage of cryptographic secrets

Strong encryption does not compensate for compromised keys. 

### 4. Improper Password Storage

Passwords should not be stored using ordinary fast hashes such as SHA-256 or MD5. 

Use a dedicated password hashing scheme such as Argon2id, bcrypt, or an appropriate PBKDF2 configuration, with unique salts and an appropriate work factor. 


## Mitigation

## Data Protection Best Practices

- Classify data according to sensitivity and regulatory requirements.
- Avoid collecting and retaining sensitive data unnecessarily.
- Protect sensitive data at rest and in transit. 
- Use modern, well-reviewed cryptographic algorithms and protocols.
- Use authenticated encryption where appropriate. 
- Validate TLS certificates and trust chains correctly.
- Protect cryptographically secure random values for keys, tokens, nonces, and other security-sensitive values.
- Do not use ordinary cryptographic hashes as password-storage mechanisms.

Do not reduce the requirement to "encrypt everything with AES-256." The correct control depends on the data, threat model, cryptographic purpose, implementation, and key-management architecture. 

---


# A03:2021 - Injection

## Overview

Injection occurs when untrusted data us interpreted as part of a command, query, or expression rather than remaining data. 

The fundamental problem is **mixing data with executable language syntax**


## Common Types

#### SQL Injection

SQL injection occurs when untrusted inputs changes the intended structure or meaning of a database query. 

Prefer parameterized queries or prepared statements. 

Conceptually: 

```
SELECT * FROM users WHERE username = ? 
```

The supplied username should be handled as data rather than concatenated into SQL syntax.

#### Cross-Site Scripting (XSS)

XSS occurs when attacker-controlled data is interpreted as executable content in a user's browser.

Types of include:

- Reflected XSS
- Stored XSS
- DOM-based XSS

The exact defense depends on the output context. HTML, HTML attributes, JavaScript, CSS, and URLs require different encoding rules.

### Mitigation

- Use parameterized queries or prepared statements.
- Use safe database APIs and ORM mechanisms correctly.
- Validate input according to the application's expected data format. 
- Apply context-appropriate output encoding.
- Use framework/template auto-escaping where available.
- Avoid dangerous browser APIs such as unsafe HTML insertion unless the input is deliberately sanitized for that exact context.
- Apply a strong Content Security Policy as defense in depth.
- Run services and database accounts with least privilege. 

A WAF can provide additional protection, but it should not be considered the primary fix for injection vulnerabilities. 

---

# AO4:2021 — Insecure Design 

## Overview

Insecure Design concerns weakness in the architecture, business logic, workflows, and security requirements of an application. 

The distinction is important: 

**Insecure design:** the system lacks a security control or has an unsafe design. 

**Insecure implementation:** the intended security control exists but was implemented incorrectly. 

For example, if an application was designed without any control limiting password-reset requests, correctly implementing the rest of the password-reset endpoint does not solve the underlying design problem. 

### Common Design Problems 

- Missing authorization requirements 
- Missing rate or resource limits 
- Unsafe business workflows 
- Missing transaction integrity requirements
- Trusting client-controlled security decisions
- No abuse controls for high-value operations
- Missing security requirements for critical features


### Threat Modeling 

Threat modeling should identify: 

- Assets 
- Trust boundaries 
- Actors
- Security assumptions 
- Abuse cases 
- Attack surfaces
- Required security controls

Security requirements should be defined during design rather than discovered only after deployment. 

### Mitigation 

- Apply secure-by-design principles.
- Conduct threat modeling for critical workflows. 
- Define security requirement s before implementation. 
- Define authorization requirements for sensitive operations.
- Add controls for resource exhaustion and business-logic abuse.
- Test security-critical workflows with unit and integration tests.
- Reassess the design when major architectural or business changes occur. 

---

# A05: 2021 — Security Misconfiguration

## Overview

Security Misconfiguration occurs when security settings are missing, incorrectly configured, insecurely configured, or inconsistently maintained. 

### Common Examples 

- Default credentials 
- Debug features enabled in production
- Unnecessary services or ports
- Excessive permissions
- Verbose error messages 
- Publicly accessible administrative interfaces 
- Incorrect cloud-storage permissions
- Missing or incorrectly configured security headers
- Insecure parser configuration 
- Inconsistent configuration between environments 

### XML External Entities (XXE)

XXE can occur when an XML parser processes attacker-controlled external entity declarations. 

Possible consequences include local file disclosure, server-side requests, or denial of service.

The key mitigation is to configure XML parsers securely and disable unnecessary external entity processing. The exact configuration depends on the parser and language. 

### Mitigation 

- Establish secure configuration baselines. 
- Remove default accounts and credentials.
- Disable unnecessary features, services, ports, and interfaces.
- Apply least-privilege permissions. 
- Keep security configuration consistent across environments.
- Use infrastructure-as-code and automated configuration validation.
- Disable unnecessary XML external entity processing.
- Avoid exposing detailed production error information.
- Apply appropriate HTTP security headers.

---

# A06:2021 — Vulnerable and Outdated Components

## Overview

This category concerns known vulnerabilities or unsupported components used by an application or its underlying systems. 

The component may be: 

- A direct dependency 
- A transitive dependency 
- A framework
- A runtime 
- A container image 
- A server component
- A client-side library 
- An operating system package 

## Important Point

The problem is not simply "using an old version."

A component becomes a security concern when it is vulnerable, unsupported, improperly configured, or otherwise unsuitable for the application's risk profile.

### Mitigation

- Maintain an inventory of application and infrastructure components.
- Track both direct and transitive dependencies.
- Monitor vulnerability advisories and vendor security announcements.
- Use software composition analysis where appropriate.
- Remove unused dependencies.
- Establish a patch and upgrade process.
- Record component versions in an SBOM where appropriate.
- Verify dependencies and packages originate from trusted sources.

---

# A07:2021 — Identification and Authentication Failures

## Overview 

Authentication determines whether a claimed identity is valid.
Authentication failures occur when identity verification, credential handling, or session management is implemented insecurely.

This category is separate from authorization. 

### Common Vulnerabilities 

#### Credential Stuffing 

Attackers reuse username/password pairs obtained from previous breaches.

#### Weak or Compromised Passwords

Application should prevent the use of commonly used or known-compromised passwords rather than relying primarily on arbitrary complexity rules.

Current NIST guidance recommends checking passwords against a blocklist of common or compromised values and explicitly states that additional composition requirements should not be imposed.


#### Brute-Force and Automated Authentication Attacks 

Authentication endpoints should limit repeated failed attempts through appropriate throttling and abuse controls.

#### Session Management Failures

Examples include:

- Predictable session identifiers
- Sessions exposed unnecessarily in URLs
- Failure to invalidate sessions.
- Failure to rotate identifiers after authentication
- Excessively long-lived sessions.

#### Session Fixation

Session fixation occurs when an attacker can cause a victim to authenticate using a session identifier already known to the attacker.

Applications should issue or rotate the session identifier appropriately after authentication and privilege changes.

### Mitigation

- Use strong, randomly generated server-side session identifiers.
- Regenerate session identifiers after authentication and relevant privilege changes.
- Invalidate sessions when they are explicitly terminated.
- Use appropriate idle and absolute session limits based on risk. 
- Protect session cookies with `Secure`, `HttpOnly`, and an appropriate `SameSite` setting.
- Rate-limit failed authentication attempts.
- Block known compromised passwords.
- Use phishing-resistant MFA where appropriate.
- Do not deploy default credentials. 
- Prefer established authentication libraries and protocols over custom cryptographic authentication implementations.

OAuth 2.0, OpenID Connect, and SAML solve different identity and authorization problems; they should not be treated as interchangeable authentication technologies.

---

# A08:2021 - Software and Data Integrity Failures

## Overview 

This is the category that was incorrectly labelled as A07 in the original note. 

A08 focuses on failures to verify the integrity of software, updates, data, and other critical components.

Examples include: 

- Insecure CI/CD pipelines
- Unsigned or improperly verified updates
- Compromised build systems
- Untrusted deserialization
- Inadequate software or artifact integrity verification.

### 1. Insecure Deserialization

Applications may become vulnerable when untrusted serialized data is deserialized in a way that allows unintended behavior, including manipulation of application state or, in some technologies, code execution.

The safest approach is generally to avoid deserializing untrusted objects whenever practical and to use constrained data formats and strict type validation.

### 2. CI/CD Integrity 

A CI/CD environment can become part of the application's attack surface.

Security controls should cover:

- Source repositories 
- Build systems
- Package dependencies 
- Build artifacts
- Deployment credentials
- Artifact repositories 
- Release processes 

### 3. Software Update Integrity 

An updater should not blindly trust downloaded software.

The update mechanism should verify the authenticity and integrity of the artifact before installation, using an appropriately designed signing and verification system.

### Mitigation

- Protect source repositories and release branches. 
- Enforce appropriate code-review and branch-protection controls.
- Restrict CI/CD credentials using least privilege.
- Separate build, signing, and deployment privileges where appropriate. 
- Verify dependencies and artifacts.
- Sign releases and verify signatures before installation.
- Avoid unsafe deserialization of untrusted input.
- Maintain audit logs for build and deployment activities.
- Treat the build environment as a security-sensitive system.

---

# A09:2021 — Security Logging and Monitoring Failures

## Overview 

Security logging and monitoring are necessary to detect, investigate, and respond to attacks.

Logging alone is not monitoring. Monitoring alone is not incident response. 

A useful security capability generally requires:

**Event generation → centralized collection → detection/alerting → investigation → response**

### Important Events 

Depending on the application, log security-relevant events such as: 

- Successful and failed authentication
- Password and credential changes
- Account recovery 
- Authorization failures
- Privilege changes 
- Sensitive administrative operations
- Important transactions
- Security configuration changes
- Application and infrastructure security errors

Logs should contain enough context to reconstruct the event without unnecessarily storing sensitive information.

### Mitigation 

- Centralize relevant security logs.
- Protect logs against unauthorized modification and deletion. 
- Synchronize system clocks.
- Establish appropriate retention periods.
- Create detection rules for suspicious behavior.
- Alert on high-value security events.
- Define incident-response procedures.
- Regularly test whether important attacks actually produce detectable signals.

A SIEM can help centralize and analyze security telemetry, but simply deploying a SIEM does not create an effective monitoring capability. 

---

# A10:2021 — Server-Side Request Forgery (SSRF)

## Overview 

SSRF occurs when an application makes a server-side request using attacker-influenced input and fails to sufficiently restrict where that request can go. 

The key issue is that the application server may have network access that the external attacker does not. 


### Common Sources 

SSRF risks commonly appear in functionality such as:

- URL based image importers
- Webhook configuration 
- URL preview services 
- Document fetchers
- Remote resources processors 
- Proxy-like application features.

### Cloud Metadata 

A server with access to a cloud metadata service may unintentionally expose sensitive information when attacker-controlled URLs are fetched.

The important security principle is not simply "block one metadata IP." Applications should restrict outbound destinations and use cloud-native controls that reduce the impact of a compromised workload. 

### Mitigation 

- Avoid arbitrary server-side fetching when the feature does not require it. 
- Define explicit destination allowlists for legitimate remote resources.
- Validate the URL scheme, host, port, and resolved destination.
- Consider DNS rebinding and redirects when designing validation.
- Restrict outbound network access using firewall or network-policy controls.
- Separate high-risk fetching functionality from sensitive internal systems.
- Do not expose raw internal responses unnecessarily.
- Apply cloud-specific protections to metadata services.

Input validation is only one layer. SSRF defense should combine application-level destination validation with network-level restrictions.

---

## Important Terminology Rule

Throughout this document, avoid using these terms interchangeably:

**Authentication** = establishing the identity of a subject.

**Authorization** = deciding what that subject is allowed to access or perform.

**Encryption** = protecting confidentiality through reversible cryptographic transformation with a key.

**Hashing** = one-way transformation generally used for integrity or password verification; it is not encryption.

**Encoding** = representing data in another format; encoding does not provide confidentiality.

**Sanitization** = transforming or removing dangerous content according to a specific security context; it is not a universal defense against every injection or SSRF vulnerability.

**Validation** = determining whether input conforms to the expected format, range, or allowed values.

These distinctions are important because saying "sanitize the input" or "encrypt the data" without specifying the security property can lead to implementing the wrong control.
