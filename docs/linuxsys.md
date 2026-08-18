# Linux 101: Core Root Subdirectories

This covers the minimal Linux filesystem hierarchy to understand when getting started with Linux. 

**`/bin`** Contains essential executable programs, including many basic Unix commands such as `ls` and `cp`. Historically, most programs in `/bin` were binary executables compiled from languages such as C, although some were shell scripts. On modern Linux systems, `/bin` is often a symbolic link to `/usr/bin`.

**`/dev`** Contains device files that represent hardware devices and special files. Understanding device files is important for storage management, permissions, and system configuration.

**`/etc`** This core system configuration directory (pronounced "EHT-see") contains system-wide configuration files for services, users, networking, authentication, and other settings. Examples include `/etc/shadow`, `/etc/passwd`, `/etc/sudoers`, and `/etc/hostname`. Some subdirectories may contain configuration specific to particular hardware or software, such as `/etc/X11`

**`/home`** Holds personal directories for regular users. Most Unix-like systems provide a dedicated directory for each user, such as `/home/username`.

**`/lib`** An abbreviation for library, this directory contains essential shared libraries and kernel modules required by programs in `/bin` and `/sbin`. Historically, `/lib` could also contain other library-related files, while `/usr/lib` held libraries used by software under `/usr`. On modern systems, `/lib` is often symbolic link to `/usr/lib`.

**`/proc`** Provides system and process information through browseable directory-and-file interface. It is a virtual filesystem maintained by the Linux kernel, so its contents reflect current state of the system rather than files stored permanently on disk. It contains information about running processes, hardware-related information, and various kernel parameters.

**`/sys`** Similar to `/proc`, it provides a device and system interface. This directory exposes kernel and driver information in a hierarchical structure, making it essential for advanced system troubleshooting and monitoring.

**`/sbin`** The place for system executables. Programs traditionally placed here are primarily concerned with system management and maintainance, and may require elevated priviledge to perform their intended functions. On modern systems, `/sbin`  is often a symbolic link to `/usr/bin`.

**`/tmp`** A directory for temporary files created by users and programs. It is generally writeable by all users, with permissions designed to prevent users from modifying one another's files. Many applications use `/tmp` as temporary workspace. Do not store critical or persistent data here: files may be removed during boot or periodically by the system. Because `/tmp` is shared, excessive accumulation of temporary files can also consume available disk space.

**`/usr`** Although pronounced "user," this directory does primarily contain personal user files. Instead, it contains a large portion of the operating system's user-space programs, libraries, documentation, and other shared resources. Many directories under `/usr` mirror those found directly under `/`, such as `/usr/bin` and `/usr/lib`. This layout has historical roots, although modern Linux distributions commonly treat `/usr` as an integral part of the main system.

The `/usr` directory contains substantial content:

- **`/usr/bin`** Contains most user-facing programs and command-line utilities.
- **`/usr/sbin`** Contains system administration programs.
- **`/usr/lib`** Holds libraries used by programs in `/usr/bin` and `/usr/sbin`.
- **`/usr/include`** Contains header files when compiling C and other software.
- **`/usr/share`** Contains architecture-independent data such as documentation,locale files, and other shared resources.
- **`/usr/local`** Provide a location for software installed locally by the system administrator, separate from software managed by the distribution.
- **`/usr/share/man`** Contains manual pages.
- **`/usr/share/info`** Contains GNU info documentation.

**`/var`** The variable subdirectory, where programs store data that changes during normal  record runtime information. System logging, user tracking, caches, and other files that system programs create and manage are stored here. You'll notice a `/var/tmp` directory here, which the system doesn't wipe on boot, making it slightly safer than `/tmp` for temporary data.

#### Additional Root Subdirectories

**`/boot`** Contains files required during the early stage of the boot process, including the Linux  kernel, initramfs images, and bootloader-related files. It does not generally contain the configuration or runtime data used to start normal system services.

**`/media`** Provides standard mount points for removable media such as USB flash drives, external disks, and optical media. Desktop Linux distributions commonly use this location for automatically mounted removable devices.

**`/opt`** Provides a location for optional or third-party software. It is commonly used by software vendors or administrator's home directory remains available even when `/home` is mounted separately or unavailable.

**`/root`** The home directory for the root user, it is separate from `/home` so that the administrator's home directory remains available even when `/home` is mounted separately or unavailable.

**`/mnt`** Traditionally used as a temporary mount point for  manually mounted filesystems. Unlike `/media`, it is generally intended for administrator-managed mounts rather than automatically mounted removable devices.

**References:**
How Linux Works -- What every SuperUser Should Know - Brain Ward, 2nd Edition




