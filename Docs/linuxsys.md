# Linux 101: Core Root Subdirectories

This entails the minimal Linux filesystem one needs to master if new to the world of Linux. After further research, I drafted this piece to help anyone who's interested in mastering the fundamentals of Linux systems. 

**`/bin`** Contains ready-to-run programs (also known as executables), including most of the basic Unix commands such as `ls` and `cp`. Most programs in `/bin` are in binary format, having been created by a C compiler, though some are shell scripts in modern systems.

**`/dev`** Contains device files that represent hardware devices and special files. Understanding device files is crucial for storage management, permissions, and system configuration.

**`/etc`** This core system configuration directory (pronounced "EHT-see") contains user passwords, boot configurations, device settings, networking parameters, and other setup files. Many items in `/etc` are specific to the machine's hardware. For example, `/etc/X11` contains graphics card and window system configurations. Key administrative files include `/etc/shadow`, `/etc/passwd`, `/etc/sudoers`, and `/etc/hostname`.

**`/home`** Holds personal directories for regular users. Most Unix installations conform to this standard, with each user having a dedicated directory like `/home/username`.

**`/lib`** An abbreviation for library, this directory holds library files containing code that executables can use. There are two types of libraries: static and shared. The `/lib` directory contains only shared libraries, while other directories such as `/usr/lib` contain both varieties as well as auxiliary files.

**`/proc`** Provides system statistics through a browseable directory-and-file interface. Much of the `/proc` subdirectory structure on Linux is unique, though many other Unix variants have similar features. The `/proc` directory contains information about currently running processes and some kernel parameters. It's a virtual filesystem that reflects the current system state in real-time.

**`/sys`** Similar to `/proc`, it provides a device and system interface. This directory exposes kernel and driver information in a hierarchical structure, making it essential for advanced system troubleshooting and monitoring.

**`/sbin`** The place for system executables. Programs in `/sbin` directories relate to system management, so regular users usually do not have `/sbin` components in their command paths. Many utilities found here require root privileges to execute properly.

**`/tmp`** A storage area for smaller, temporary files that you don't care much about. Any user may read from and write to `/tmp`, but users cannot access other users' files there. Many programs use this directory as a workspace. Important note: Don't store critical data in `/tmp` because most distributions clear it on boot, and some even remove old files periodically. Also, don't let `/tmp` fill up with garbage since it's usually shared with critical system components.

**`/usr`** Although pronounced "user," this subdirectory contains no user files. Instead, it holds a large directory hierarchy containing the bulk of the Linux system. Many directory names in `/usr` mirror those in the root directory (like `/usr/bin` and `/usr/lib`), holding the same types of files. This separation is primarily historical—in the past, it helped keep root directory space requirements low.

The `/usr` directory contains substantial content:

- **`/usr/bin`** Contains most user-facing programs and utilities.
- **`/usr/sbin`** Contains system administration programs.
- **`/usr/lib`** Holds libraries used by programs in `/usr/bin` and `/usr/sbin`.
- **`/usr/include`** Contains header files used by the C compiler.
- **`/usr/info`** Contains GNU info manuals.
- **`/usr/local`** Where administrators can install their own software, isolated from the main system.
- **`/usr/man`** Contains manual pages.
- **`/usr/share`** Contains files that should work on other Unix machines with no loss of functionality.

**`/var`** The variable subdirectory, where programs record runtime information. System logging, user tracking, caches, and other files that system programs create and manage are stored here. You'll notice a `/var/tmp` directory here, which the system doesn't wipe on boot, making it slightly safer than `/tmp` for temporary data.

#### Additional Root Subdirectories

**`/boot`** Contains kernel boot loader files. These files pertain only to the very early stage of the Linux startup procedure; you won't find information about how Linux starts its services in this directory.

**`/media`** A base attachment point for removable media such as flash drives, found in many modern distributions.

**`/opt`** May contain additional third-party software. Many systems don't use `/opt`, but it's a standard location for commercial software packages.

**`/root`** The home directory for the root user, separate from `/home` for security reasons.

**`/mnt`** Traditionally used as a temporary mount point for filesystems, though `/media` has become more common for removable media.

**References:**

My Brain for Interconnection :)

How Linux Works -- What every SuperUser Should Know - Brain Ward (2ND EDITION)

CHATGPT 



