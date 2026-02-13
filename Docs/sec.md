# Mastering Critical Web Application Security Risks

I've been actually studying the OWASP Top 10 and here is a comprehensive note to master the critical security risks that threatens modern web applications and learn practical mitigation strategies.

# A01:2021 - Broken Access Control

## Overview

Broken Access control has risen from fifth position to become the number one security risk in 2021. This category occurs when users can act outside of their intended permissions, allowing unauthorized access to sensitive data, modification of user data or execution of privileged functions.

## Common Vulnerabilities

### 1. Insecure Direct Object References (IDOR)

Occurs when applications expose internal implementation objects like database keys in URLS or parameters. Attackers can manipulate these references to access unauthorized data.

Example:
` https://example.com/account?id=12345`


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
`SELECT * FROM users WHERE username = '' + username + ''`


**Attack Payload**

` username = admin' OR '1'='1`


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

Failing to implement rate limiting on critical functions like password reset, allowing unlimited purchase of limited inventory, or missing transaction rollback mechanisms that could lead to inconsistent states.

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

# A05:2021 - Security Misconfiguration

## Overview

Security misconfiguration occurs when security settings are not defined, implemented, or maintained properly. This category moved up from sixth position in 2017, as 90% of application were tested for some form of misconfiguration, it now includes XML External Entities (XXE) from the 2017 edition.

## Common Misconfigurations

## 1. Default Configurations

Using default accounts, passwords, or settings in production environments. Default admin credentials, sample applications, and unnecessary features left enabled are common entry points for attackers.

## 2. Incomplete or Ad-Hoc Configurations

Open cloud storage, misconfigured HTTP headers, verbose error messages containing sensitive information, and improperly configured permissions on files and directories.

## 3. Unnecessary Features Enabled

Running services, ports, accounts, or privileges that are not required for the application to function. This expands the attack surface and provides additional opportunities for exploitation.

## 4. Missing Security Headers

Failing to implement HTTP security headers like Content-Security-Policy, X-Frame-Options, Strict-Transport-Security, and X-Content-Type-Options. These headers provide important browser-side security controls.

## XML External Entities (XXE)

XXE vulnerabilities occur when XML parsers process external entity references within XML documents. Attackers can exploit XXE to disclose internal files, perform sever-side request forgery, scan internal networks, or cause denial of service.

**Attack Example:**

```xml
&lt;?xml version="1.0"?&gt;
&lt;!DOCTYPE foo [
  &lt;!ENTITY xxe SYSTEM "file:///etc/passwd"&gt;
]&gt;
&lt;user&gt;
  &lt;name&gt;&amp;xxe;&lt;/name&gt;
&lt;/user&gt;
```



## Mitigation Strategies 
### Configuration Management Best Practices:
- Implement a reputable hardening process for rapid deployment
- Use minimal platform without unnecessary features, components, or documentation
- Review and update configurations as part of patch management 
- Implement a segmented application architecture for effective separation.
- Send security directives to clients using appropriate headers.
- Disable XML external entity processing in all XML parsers
- Use automated processes to verify configuration effectiveness
- Implement infrastructure as code for consistent environment deployment


## Security Hardening Checklist 
Establish a security baseline configuration and regularly audit against it. Remove default accounts, disable unnecessary services, implement proper file permissions, configure firewalls correctly, and ensure all components are updated with security patches. Use configuration management tools to maintain consistency across environments.


# A06:2021 - Vulnerable and Outdated Components 

## Overview
This category focuses on the risks from using components with known vulnerabilities. Modern applications heavily rely on third-party libraries, frameworks, and dependencies. When these components contain vulnerabilities, they can compromise the entire application. This was second place in the 2021 community survey.


## Understanding the Risk 


## Supply Chain Complexity 
A typical web application may include dozens or hundreds of dependencies, each with their own dependencies(transitive dependencies). A vulnerability anywhere in this chain can compromise the application. Package managers make it easy to include components but complicate security management.


## Common Scenarios

Organizations are vulnerable when they don't know component versions, use components that are unsupported or out of date, fail to scan for vulnerabilities regularly, don't fix or upgrade underlying platforms in a timely manner, or fail to secure component configurations.


## Notable Vulnerabilities 

## Apache Struts (CVE-2017-5638)
A critical remote code execution vulnerability in Apache Struts 2 led to one of the largest data breaches in history, affecting 147 million people. The vulnerability existed in the Jakarta Multipart parser and was exploited through the Content-Type header. 


## Log4Shell (CVE-2021-44228)
A critical vulnerability in the widely-used Apache Log4j logging library allowed remote code execution. With a severity score of 10.0, it affected millions of applications worldwide and require immediate patching across the entire software ecosystem.


## Mitigation Strategies 
### Component Management: 
- Remove unused dependencies, unnecessary features, and components
- Continuously inventory versions of client and servers components 
- Monitor sources with CVE and NVD for component vulnerabilities 
- Use software composition analysis tools in the build pipeline
- Only obtain components from official sources over secure channels 
- Monitor for unmaintained libraries and ensure timely patching 
- Implement a patch management process for updates and configuration changes.


## Tools and Resources 
Leverage automated tools for dependency management: OWASP Dependency-Check, Synk, npm audit, Github Dependabot, and commercial Software Composition Analysis(SCA) solutions. Maintain a Software Bill of Materials (SBOM) to track all components an their versions across your application portfolio.


# A07:2021 - Identification and Authentication Failures

## Overview
Previously known as Broken Authentication, this category includes failures in confirming user identity, authentication, and session management. Properly implementing authentication is critical as it's often the first line of defense against unauthorized access. 


## Common Vulnerabilities 

### 1. Credential Stuffing 
Attackers use lists of known username/password combination from breached databases to attempt logins across multiple sites. Without proper protections, this automated attack method can compromise many accounts.


### 2. Weak Password Policies 
Allowing weak, common, or compromised passwords like 'Password123', 'admin', or '123456'. Not implementing password complexity requirements or failing to check against lists of known compromised passwords.


### 3. Improper Session Management 
Session IDs exposed in URLs, session tokens not validated on logout, sessions that don't timeout, or predictable session identifiers. Poor session management can lead to session hijacking or fixation attacks.


### 4. Missing Multi-Factor Authentication (MFA)
Relying solely on passwords for authentication without implementing additional factors like SMS codes, authenticator apps, or biometric verification. MFA significantly reduces the risk of account compromise. 


### Advanced Attack Techniques 
 
### Brute Force Attacks 
Automated attempts to guess credentials through trail and error, Without rate-limiting or account lockout mechanisms, attackers can make unlimited login attempts to crack passwords. 


## Session Fixation
An attacker set's a user's session ID to a known value, then tricks the user into authenticating with that session. The attacker can then use the known session ID 
to impersonate the victim.


## Mitigation Strategies 
### Authentication Security Controls:
- Implement multi-factor authentication for all sensitive operations
- Do not ship or deploy with default credentials 
- Implement weak password checks against top 10,000 worst passwords
- Align passwords policies with NIST 800-63b guidelines
- Limit or delay failed login attempts with exponential backoff
- Use server-side secure sessions managers that generate random random session IDs
- Invalidate session ID after logout, idle timeout, and absolute timeout
- Regenerate session IDs after authentications or privilege elevation.
- Use HttpOnly, Secure, and SameSite attributes for session cookies.


## Modern Authentication Standards 
Consider implementing modern authentication protocols like OAuth 2.0 for third-party authentication, OpenID Connect for identity layer, or SAML for enterprise single sign-on. authentication logic, which is prone to security vulnerabilities.


# A07:2021 - Identification and Authentication Failures

## Overview
This new category focuses on code and infrastructure that doesn't protect against integrity violations. This includes insecure CI/CD pipelines, auto-update mechanisms without integrity verification, and untrusted deserialization. The category highlights the growing importance of software supply chain security.


## Common Vulnerabilities

### 1. Credential Stuffing
Attackers use lists of known username/password combination from breached database to attempt logins across multiple sites. Without proper protections, this automated attack method can compromise many accounts.


### 2. Weak Password Policies
Allowing weak, common, or compromised passwords like 'Password123', 'admin', or '12456'. Not implementing password complexity requirements or failing to check against lists of known compromised passwords.


### 3. Improper Session Management
Session IDs exposed in URLS, session tokens not invalidated on logout, sessions that don't timeout, or predictable session identifiers. Poor session management can lead to session hijacking or fixation attacks. 


### 4. Missing Multi-Factor Authentication (MFA)
Relying solely on passwords for authentication without implementing additional factors like SMS codes, authenticator apps, or biometric verification. MFA significantly reduces the risk of account compromise.


## Advanced Attack Techniques

### Brute Force Attacks
Automated attempts to guess credentials through trial and error. Without rate limiting or account lockout mechanisms, attackers can make unlimited login attempts to crack passwords.


### Session Fixation
An attacker sets a user's session ID to a known value, then tricks the user 
into authenticating with that session. The attacker can then use the known session ID to impersonate the victim.


## Mitigation Strategies 
### Authentication Security Controls: 
- Implement multi-factor authentication for all sensitive operations
- Do not ship or deploy with default credentials
- Implement weak password checks against top 10,000 worst passwords 
- Align password policies with NIST 800-63b guidelines 
- Limit or delay failed login attempts with exponential backoff
- Use server-side secure session managers that generate random sessions IDs
- Invalidate session IDs after logout, idle timeout, and absolute timeout
- Regenerate session IDs after authentication or privilege elevation.
- Use HttpOnly, Secure, and SameSite attributes for session cookies


## Modern Authentication Standards
Consider implementing modern authentication protocols like OAuth 2.0 for third-party authentication, OpenID Connect for identity layer, or SAML for enterprise single sign-on. Use established libraries and frameworks rather than implementing custom authentication logic, which is prone to security vulnerabilities. 


# A07:2021 - Identification and Authentication Failures

## Overview
This new category focuses on code and infrastructure that doesn't protect against integrity violations. This includes insecure CI/CD pipelines, auto-update mechanisms without integrity verification, and untrusted deserialization. The category highlights the growing importance of software supply chain security. 

## Key Vulnerability Areas 

### 1. Insecure Deserialization
Occurs when untrusted data is used to abuse application logic, inflict denial of service attacks, or execute arbitrary code. Serialized objects can contain references to methods and code that execute during deserialization, providing an attack vector.


### 2. CI/CD Pipeline Vulnerabilities 
Compromised build environments, insecure artifact repositories, insufficient access control on deployment pipelines, and lack of code signing can allow attackers to inject malicious code into the software supply chain. 

### 3. Unsigned or Unverified Updates 
Applications that download and install updates without verifying digital signatures or checksums. Attackers can serve malicious updates through man-in-the-middle attacks or by compromising update servers.

## Real-World Incidents 

### SolarWinds Supply Chain Attack 
in 2020, attackers compromised SolarWinds' build system, injecting malicious code into software updates. This affected approximately 18,000 customers, including government agencies and Fortune 500 companies, demonstrating the catastrophic impact of software integrity failures.

### Codecov Bash Uploader Breach 
Attackers modified Codecov's Bash Uploader script, enabling them to exfiltrate environment variables and credentials from CI/CD environments. This incident highlighted vulnerabilities in code coverage tools and CI/CD pipelines. 


## Mitigation Strategies 
### Integrity Protection Measures: 
- Use digital signatures to verify software and data origin 
- Ensure libraries and dependencies are from trusted repositories
- Use software supply chain security tools like OWASP Dependency Check
- Implement proper segregation and access control in CI/CD pipelines
- Ensure unsigned or unencrypted data is not deserialized without integrity checks
- Implement integrity checks on serialized objects with digital signatures
- Enforce strict type constraints during deserialization 
- Isolate code running in low-privilege environments


## Secure Software Development Pipeline
Implement security at every stage of the development pipeline: secure code repositories with branch protection, conduct code reviews, use static analysis security testing(SAST), implement container scanning, employ runtime application self-protection (RASP), and maintain comprehensive audit logs of all build and deployment activities.


# A09:2021 - Security Logging and Monitoring Failures

## Overview
This category helps detect, escalate, and respond to active breaches. Without logging and monitoring and monitoring, breaches cannot be detected. Insufficient logging, detection, monitoring, and active response is often a key factor allowing attackers to further attack systems, maintain persistence, and extract undetected.


## Common Failures 
Not logging auditable events like logins, failed logins, high-value transactions, access control failures, or input validation failures. Logs that contain insufficient to understand what happened or who was responsible. 


## 1. Inadequate Logging
Not logging auditable events like logins, failed logins, high-value transactions, access control failures, or input validation failures. Logs that contain insufficient detail to understand what happened or who was responsible.

## 2. Missing Security Monitoring 
Logs not monitored for suspicious activity, no alerting on critical events, or alerts not acted upon. Organizations that generate logs but never review them gain no security benefit. 


## 3. Ineffective Incident Response 
Lack of incident response plans, inability to escalate detected incidents, or inadequate procedures for evidence preservation. Without effective response, detection capabilities provide limited value.


## Impact of Poor Logging
Studies show that the average time to detect a breach in over 200 days, and this detection often comes from external parties rather than internal monitoring. Poor logging extends dwell time, allowing attackers to cause more damage, establish persistence, and move laterally through networks undetected.


## What to Log

### Authentication Events 
All login attempts (successful and failed), password changes, account lockouts, and privilege escalations. Include user identifiers, timestamps, and source IP addresses.


## Authorization Failures
Attempts to access restricted resources, elevation of privilege attempts, and any access control violations. These often indicate reconnaissance or exploitation attempts.


### Application Error and Warnings
Input validation failures, application exceptions, configuration errors, and system errors. Pattern recognition in errors can reveal attack attempts.


## Mitigation Strategies 
### Logging and Monitoring Best Practices: 
- Ensure all login, access control, and server-side validation are logged 
- Log in a format that centralized log management solutions can consume 
- Include sufficient context to understand security-relevant events
- Ensure log entries have sufficient integrity controls to prevent tampering
- Establish effective monitoring and alerting for suspicious activities
- Establish an incident response and recovery plan (NIST 800-61 or similar)
- Use SIEM (Security Information and Event Management) systems 
- Protect logs from unauthorized access and ensure adequate retention periods


## Build a Security Operation Center (SOC)

Effective security monitoring  requires dedicated resources. Consider implementing a SOC with trained analysts, automated threat detection tools, defined escalation procedures, and integration with incident response teams. Even small organization can benefit from managed security service providers (MSSPs) that offer SOC capabilities.


# A10:2021 - Server-Side Request Forgery (SSRF)

## Overview
SSRF flaws occur when a web application fetches a remote resource without validating the user-supplied URL. This allows attackers to coerce the application o send crafted requests to unexpected destinations, even when protected by firewalls or network access control lists (ACLs). SSRF is increasingly common due to modern application architectures.


### Understanding SSRF 

## How SSRF Works 
Attackers exploit SSRF by providing URLs to backend services that the application will request. Since requests originate from the server, they can access internal resources not directly accessible from the internet. This makes SSRF particularly dangerous in cloud environments with metadata services.

## Common Attack Vectors 
URL parameters in image imports, document fetching features, webhook configurations, URL validators, and any feature that accepts a URL as input. Modern applications increasingly require fetching external resources, expanding the attack surface. 


## Attack Scenarios 
## Cloud Metadata Service Exploitation 
Attackers target cloud metadata APIs (AWS EC2: http://169.254.169.254/latest/meta-data/)  to retrieve instance credentials, configuration data, and sensitive information. These APIs are only accessible from within the cloud environment.

### Example Attack: 

```
 https://vulnerable-site.com/fetch?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/
```

### Internal Network Scanning 
Attackers use SSRF to map internal networks, discover internal services, and identify potential targets for further attacks. The application acts a proxy, bypassing perimeter security controls.


### Bypassing Access Controls
SSRF can access resources protected by IP allowlists, internal APIs without authentication requirements, or services only accessible from localhost. The trusted server context bypasses typical security controls.


## Mitigation Strategies 
### Defense-in-Depth Approach:
- Sanitize and validate all client-supplied input data
- Enforce URL schema, port and destination with positive allowlists 
- Do not send raw responses to clients
- Disable HTTP redirection in client libraries 
- Segment remote resource access functionality in separate networks
- Block private IP ranges and domain name resolution to internal networks 
- Implement network-level controls through firewalls or VPN
- Require IMDsv2 for cloud metadata services (AWS)


## Testing for SSRF 
Test all URL input points by attempting to access internal resources, cloud metadata, services, and localhost addresses. Use various encoding techniques (URL encoding, hex encoding, octal notation) to bypass basic filters. Monitor for changes in response times, error messages, or content that might indicate successful internal requests.


## References and Additional Resources: 
- OWASP Foundation: https://owasp.org
- OWASP Top 10 Project: https://owasp.org/www-project-top-ten/
- OWASP Testing Guide: https://owasp.org/www-project-web-security-testing-guide/
- SANS Institute: https://www.sans.org
- CWE/SANS Top 25: https://cwe.mitre.org/top25/

