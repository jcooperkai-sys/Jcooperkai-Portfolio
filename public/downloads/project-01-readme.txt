HISOKAOS

A 32-bit x86 operating system written from scratch in C and assembly. It boots
on its own kernel -- there is no Linux or BSD underneath -- and comes up into an
interactive text-mode environment with a shell, a windowing layer, and bundled
applications. Roughly 10,000 lines across 115 source files.

KERNEL
  Multiboot entry and custom linker script
  GDT with ring0/ring3 descriptors
  IDT and CPU exception handlers; faults are trapped, not fatal
  IRQs through a remapped 8259 PIC
  Preemptive task switching, context switch written in assembly
  Physical memory manager over a frame bitmap
  Paging
  First-fit kernel heap
  PCI bus enumeration

DRIVERS
  VGA text console with scrolling and colour, plus a graphics mode
  PS/2 keyboard with shift handling and a ring buffer; PS/2 mouse
  PIT timer at 100 Hz, RTC, PC speaker
  Serial output on COM1
  ATA disk
  RTL8139 network interface, reading its own MAC from the card

FILESYSTEM
  RAM filesystem, a /proc-style synthetic filesystem exposing kernel state,
  and persistence to disk.

USERLAND
  27 applications: text editor, file explorer, image viewer, drawing program,
  calculator, clock, media player, settings, backup tool, and games including
  Tetris, Snake, 2048 and tic-tac-toe. A shared UI layer provides the windowing
  and widget primitives.

BUILD
  brew install i686-elf-binutils qemu
  make            # produces hisoka.elf
  make run        # boots in QEMU, serial mirrored to the terminal

KNOWN LIMITATIONS
  The physical memory manager assumes contiguous RAM above 1 MiB rather than
  walking the full Multiboot memory map. The heap coalesces freed blocks forward
  only. printf implements the common conversions without field width. The
  keyboard driver covers US layout and shift only. Applications run in ring 0:
  ring 3 descriptors exist, but userspace isolation needs a TSS and syscall
  boundary that are not wired up.

Repository: github.com/jcooperkai-sys/HisokaOS
