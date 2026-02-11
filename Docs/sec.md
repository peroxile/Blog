# Mastering Critical Web Application Security Risks

I've been actually studying the OWASP Top 10 and here is a comprehensive note to master the critical security risks that threatens modern web applications and learn practical mitigation strategies.

# A01:2021 - Broken Access Control 
## Overview
Broken Access control has risen from fifth position to become the number one security risk in 2021. This category occurs when users can act outside of their intended permissions, allowing unauthorized access to sensitive data, modification of user data or execution of privileged functions.


## Common Vulnerabilities

### 1. Insecure Direct Object References (IDOR)
Occurs when applications expose internal implementation objects like database keys in URLS or parameters. Attackers can manipulate these references to access unauthorized data.

Example: 
``` https://example.com/account?id=12345```


### 2. Missing Function Level Access Control
Administrative functions are not properly protected, allowing regular users to access privileged operations by simply navigating to the right URL or API endpoint.


### 3. Path Traversal
Attackers manipulate file paths to access files and directories outside the intended directory structure, potentially reading sensitive system files.


## Real-World
Access control failures can lead to severe consequences including unauthorized data disclosure, data modification or destruction, business function abuse, and complete account takeover. In 2019, a major social media platform experienced a data breach affecting 540 million user records due to improperly configured access controls on cloud storage.


## Mitigation Strategies
Implement these security controls:
- Enforce access controls at the trusted server-side code or severless API
- Use Deny-by-default principle: deny access except for public resources 
- Implement attribute-based or role-based access control(RBAC/ABAC)
- Use indirect object references (random tokens) instead of exposing database keys 
- Disable directory listing and ensure metadata is not accessible
- Log access control failures and alert administrators for repeated failures.
- Rate limit API access to minimize automated attacks.


## Testing Techniques 
Test for broken access control by attempting to access resources with different user roles, manipulating URL parameters, testing API endpoints with different authentication tokens, and using automated tools like OWASP ZAP or Burp Suite to identify authorization bypass opportunities.


# A02:2021 - Cryptographic Failures
## Overview

Previously known as Sensitive Data Exposure, this category focuses on failures related to cryptography that often lead to exposure of sensitive data. It encompasses issues with encryption, hashing, key management, and secure communication protocols.

## Common Vulnerabilities

### 1. Transmitting Data in Clear Text
Using protocols like HTTP, SMTP, FTP without TLS/SSL encryption exposes sensitive data during transmission. This makes data vulnerable to man-in-the-middle attacks and network sniffing.


### 2. Weak or Outdated Cryptographic Algorithms
Using deprecated algorithms like MD5, SHA1 for hashing, or DES, RC4 for encryption. These algorithms have known vulnerabilities and can be broken with modern computing power.


### 3. Improper Key Management
Hardcoded encryption keys, using default keys, storing keys in version control, or failing to rotate keys regularly. Poor key management can compromise even the strongest encryption.


### 4. Insecure Storage of Sensitive Data
Storing passwords, credit includes improper database encryption and unencrypted backups.
card numbers, or personal information without proper encryption at rest. This i


## Real-World Impact
Cryptographic failures have resulted in massive data breaches. In 2013, a major retailer suffered a breach affecting 40 million credit card due to weak encryption. In 2017, a credit reporting agency's breach exposed 147 million records partly due to unencrypted sensitive data.


## Mitigation Strategies 
## Data Protection Best Practices
- Classify data and apply appropriate protection based on sensitivity
- Encrypt all sensitive data at rest using algorithms (AES-256)
- Enforce TLS 1.2 or higher for all data in transit with proper certificate validation.
- Use strong adaptive hashing algorithms like Argon2, bcrypt, or PBKDF2 for passwords
- Disable caching for responses containing sensitive data
- Store cryptographic keys in secure key management systems (KMS)
- Implement Perfect Forward Secrecy (PFS) cipher suites.
- Use authenticated encryption with associated data (AEAD)


## Testing Approaches 
Access cryptographic implementation by reviewing TLS configuration with tools like SSL Labs, examining password storage mechanisms, verifying encryption at rest, testing for mixed content issues, and analyzing network traffic for cleartext transmission of sensitive data.


# A03:2021 - Injection 
## Overview
Injection flaws occur when untrusted data is sent to an interpreter as part of a command or query. This category now includes Cross-Site Scripting(XSS), previously a separate category. Injection attacks can result in data loss, corruption, unauthorized access, and complete system compromise.


## Types of Injection Attacks
### 1. SQL Injection (SQLi)
Attackers insert malicious SQL statements into application queries, potentially accessing, modifying, or deleting database data. This remains one of the most dangerous web application vulnerabilities.


**Vulnerable Code Example:**
``` SELECT * FROM users WHERE username = '' + username + '' ```


**Attack Payload**
``` username = admin' OR '1'='1```


### 2. Cross-Site Scripting (XSS)
Injecting malicious scripts into web pages viewed by other users. XSS attacks can steal session tokens , deface websites, or redirect users to malicious sites. 


## Types of XSS: 
- Reflected XSS: Script comes from current HTTP request 
- Stored XSS: Script permanently stored on target server 
- DOM-based XSS: Vulnerability exists in client-side code

### 3. Command Injection
Executing arbitrary systems commands on the host operating system. This can lead to complete system compromise, allowing attackers to read files, install malware, or pivot to other systems. 


### 4. LDAP, XPath, and NOSQL Injection 
Similar to SQL injection but targeting LDAP directories, XML queries, or NOSQL databases. Each has unique syntax but shares the common pattern of injecting malicious input into queries. 


## Mitigation Strategies
## Defense in Depth Approach:
- Use parametrized queries (prepared statements) for all database access
- Implement input validation using whitelist approach for all user inputs
- Use Object Relational Mapping (ORM) frameworks that prevent SQL injection
- Escape special characters in outputs using context-appropriate encoding 
- Implement Content Security Policy (CSP) to prevent XSS attacks
- Use auto-escaping template systems that escape by default
- Apply principle of least privilege to database accounts
- Use Web Application Firewalls (WAF) as an additional defense layer.


## Testing Methodology
Test for injection vulnerabilities using both manual and automated approaches. Use fuzzing techniques with special characters, employ SQL injection tools like sqlmap, test for XSS in all input filed and URL parameters, and conduct code reviews focusing on database queries and user input handling.


# A03:2021 - Insecure Design 
## Overview
Insecure Design is a new category for 2021, focusing on risks related to design and architectural flaws. It represents missing or ineffective security controls in the design phase. This differs from insecure implementation, as even perfect implementation
cannot fix an insecure design.


## Key Concepts 
### Design vs Implementation
Insecure design focuses on flaws in the architecture and business logic before code is written. Insecure implementation refers to bugs and vulnerabilities introduced during coding. Both are critical, but insecure design requires different remediation approaches.


### Threat Modeling 
A structured approach to identifying, quantifying, and addressing security threats. Effective threat modeling during the design phase helps identify potential attack vectors and design appropriate security controls before development begins.

## Common Design Flaws

### 1. Missing Business Logic Security Controls 
Failing to implement rate limiting on critical functions like password reset, allowing unlimited purchase of limited inventory, or missing transaction rollback mechanisms that could lead to  inconsistent states.


### Lack of Secure Development Lifecycle (SDL)
Not integrating security practices throughout the development process, including requirements gathering, design flaws, security testing, and deployment procedures. SDL ensures security is considered at every stage.


### Insufficient Security Requirements 
Failing to define clear security requirements during the requirements phase, leading o missing authentication mechanisms, inadequate access controls, or insufficient data protection.


## Real-World Examples
A cinema chain application allows group booking discounts but fails to validate that the the number of tickets doesn't exceed the number of seats. An attacker exploits this by booking negative tickets, receiving refund instead of payment. This is a business logic flaw resulting from insecure design.


## Mitigation Strategies 
### Secure Design Principles: 
- Establish and use a secure development lifecycle with security professionals.
- Use established secure design patterns and reference architectures.
- Conduct threat modeling for critical authentication, access control, and business logic.
- Integrate security language and controls into user stories. 
- Implement plausibility checks at every tier of the application.
- Write unit and integration tests to validate critical flows.
- Segregate tier layers based on exposure and protection needs.
- Limit resource consumption by user or service with appropriate controls 


## Secure by Design Culture
Building secure applications requires organizational commitment to security-first thinking. This includes training development teams on secure coding practices, conducting regular security design reviews, and fostering collaboration between development, security, and operations teams throughout the entire project lifecycle.


