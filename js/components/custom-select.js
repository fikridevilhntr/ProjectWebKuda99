/* =====================================================
   ECOSORT - CUSTOM SELECT COMPONENT
   Consistent dropdown UI for all authenticated roles.
   Keeps the original <select> as the real form control.
===================================================== */

// Nomor unik untuk setiap menu dropdown agar atribut aria-controls tidak saling bertabrakan.
let selectId = 0;

// Mengubah elemen <select> biasa menjadi dropdown kustom pada elemen root.
// Fungsi mengembalikan fungsi cleanup untuk melepas seluruh perubahan dan event listener.
export function mountCustomSelects(root) {
  // Hentikan proses jika elemen root tidak tersedia atau tidak mendukung pencarian elemen.
  if (!root || !root.querySelectorAll) {
    return () => { };
  }

  // Gunakan document dan window milik root agar tetap sesuai jika komponen berada di iframe.
  const documentRef = root.ownerDocument || document;
  const windowRef = documentRef.defaultView || window;
  // Menyimpan data setiap select yang sudah diubah menjadi dropdown kustom.
  const records = new Set();

  // Hanya satu dropdown yang dapat terbuka pada satu waktu.
  let activeRecord = null;
  let destroyed = false;

  // Mengambil teks label dari sebuah opsi dan menghapus spasi di awal/akhir.
  function getOptionLabel(option) {
    return String(option?.textContent || "").trim();
  }

  // Menentukan nama aksesibilitas dropdown dari aria-label, label HTML, atau atribut name.
  function getAccessibleLabel(select) {
    const explicit = select.getAttribute("aria-label");

    if (explicit) return explicit;

    const labels = select.labels
      ? Array.from(select.labels)
        .map(label => label.textContent.trim())
        .filter(Boolean)
      : [];

    return labels.join(" ") || select.name || "Pilih opsi";
  }

  // Menyamakan tampilan dropdown kustom dengan kondisi select asli.
  // Termasuk nilai terpilih, status disabled, required, dan validasi.
  function syncRecord(record) {
    const { select, trigger, label, wrapper, menu } = record;

    if (!select.isConnected) return;

    // Ambil opsi yang sedang dipilih pada select asli.
    const selectedOption = select.options[select.selectedIndex];

    label.textContent = getOptionLabel(selectedOption) || "Pilih opsi";

    // Opsi tanpa nilai dianggap sebagai placeholder, bukan pilihan yang valid.
    const isPlaceholder =
      !selectedOption ||
      selectedOption.value === "";

    trigger.classList.toggle("is-placeholder", isPlaceholder);
    trigger.disabled = select.disabled;
    trigger.setAttribute("aria-disabled", String(select.disabled));
    trigger.setAttribute("aria-required", String(select.required));

    wrapper.classList.toggle("is-disabled", select.disabled);
    wrapper.classList.toggle(
      "is-invalid",
      Boolean(record.invalidShown && !select.validity.valid)
    );

    // Jika menu sedang tampil, perbarui penanda opsi yang sedang dipilih.
    if (menu.isConnected) {
      menu.querySelectorAll("[data-option-index]").forEach(button => {
        const index = Number(button.dataset.optionIndex);
        const selected = index === select.selectedIndex;

        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-selected", String(selected));
      });
    }
  }

  // Membuat daftar tombol opsi berdasarkan isi select asli.
  function buildMenu(record) {
    const { select, menu } = record;

    // Kosongkan menu terlebih dahulu agar opsi tidak terduplikasi.
    menu.replaceChildren();

    Array.from(select.options).forEach((option, index) => {
      if (option.hidden) return;

      // Setiap opsi dibuat sebagai tombol agar dapat dioperasikan dengan keyboard maupun mouse.
      const item = documentRef.createElement("button");

      item.type = "button";
      item.className = "ecosort-select-option";
      item.setAttribute("role", "option");
      item.dataset.optionIndex = String(index);
      item.textContent = getOptionLabel(option);
      item.disabled = option.disabled;

      const selected = index === select.selectedIndex;

      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-selected", String(selected));

      // Saat opsi dipilih, perbarui select asli dan kirim event change.
      item.addEventListener("click", () => {
        if (item.disabled) return;

        select.selectedIndex = index;

        select.dispatchEvent(
          new windowRef.Event("change", { bubbles: true })
        );

        const canReturnFocus = record.trigger.isConnected;
        closeMenu(record, canReturnFocus);
      });

      menu.appendChild(item);
    });
  }

  // Mengatur posisi dan ukuran menu agar tetap terlihat di dalam area layar.
  function positionMenu(record) {
    const rect = record.trigger.getBoundingClientRect();
    const menu = record.menu;

    // Jarak menu dari tombol pemicu serta batas aman dari tepi layar.
    const gap = 6;
    const viewportPadding = 10;
    const maxMenuHeight = 250;

    const spaceBelow = Math.max(
      0,
      windowRef.innerHeight - rect.bottom - viewportPadding
    );

    const spaceAbove = Math.max(
      0,
      rect.top - viewportPadding
    );

    const estimatedHeight = Math.min(
      menu.scrollHeight,
      maxMenuHeight
    );

    // Menu dibuka ke atas jika ruang di bawah tidak cukup dan ruang atas lebih luas.
    const openAbove =
      spaceBelow < Math.min(estimatedHeight, 150) &&
      spaceAbove > spaceBelow;

    const availableSpace = openAbove
      ? spaceAbove
      : spaceBelow;

    const finalMaxHeight = Math.max(
      80,
      Math.min(maxMenuHeight, availableSpace)
    );

    menu.style.maxHeight = `${finalMaxHeight}px`;
    menu.style.width = `${rect.width}px`;

    const measuredHeight = Math.min(
      menu.scrollHeight,
      finalMaxHeight
    );

    const left = Math.max(
      viewportPadding,
      Math.min(
        rect.left,
        windowRef.innerWidth - rect.width - viewportPadding
      )
    );

    let top = openAbove
      ? rect.top - measuredHeight - gap
      : rect.bottom + gap;

    top = Math.max(
      viewportPadding,
      Math.min(
        top,
        windowRef.innerHeight - measuredHeight - viewportPadding
      )
    );

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }

  // Menutup dropdown, memperbarui atribut aksesibilitas, dan opsional mengembalikan fokus.
  function closeMenu(record = activeRecord, returnFocus = false) {
    if (!record) return;

    record.menu.remove();
    record.wrapper.classList.remove("is-open");
    record.trigger.setAttribute("aria-expanded", "false");

    if (activeRecord === record) {
      activeRecord = null;
    }

    if (returnFocus && record.trigger.isConnected) {
      record.trigger.focus();
    }
  }

  // Memindahkan fokus keyboard ke opsi terpilih atau opsi pertama yang aktif.
  function focusSelectedOption(record, fallbackToFirst = true) {
    const options = Array.from(
      record.menu.querySelectorAll(
        ".ecosort-select-option:not(:disabled)"
      )
    );

    if (!options.length) return;

    const selected = options.find(option =>
      Number(option.dataset.optionIndex) ===
      record.select.selectedIndex
    );

    (selected || (fallbackToFirst ? options[0] : null))?.focus();
  }

  // Membuka dropdown dan memastikan dropdown lain ditutup terlebih dahulu.
  function openMenu(record) {
    if (record.select.disabled || !record.select.isConnected) {
      return;
    }

    if (activeRecord && activeRecord !== record) {
      closeMenu(activeRecord, false);
    }

    if (activeRecord === record) {
      closeMenu(record, false);
      return;
    }

    // Pastikan isi menu sesuai dengan kondisi select sebelum ditampilkan.
    syncRecord(record);
    buildMenu(record);

    documentRef.body.appendChild(record.menu);

    record.wrapper.classList.add("is-open");
    record.trigger.setAttribute("aria-expanded", "true");

    activeRecord = record;

    positionMenu(record);
    focusSelectedOption(record);
  }

  // Menangani tombol keyboard ketika fokus berada pada tombol dropdown.
  function handleTriggerKeydown(record, event) {
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      if (activeRecord !== record) {
        if (activeRecord) {
          closeMenu(activeRecord, false);
        }

        buildMenu(record);
        documentRef.body.appendChild(record.menu);

        record.wrapper.classList.add("is-open");
        record.trigger.setAttribute("aria-expanded", "true");

        activeRecord = record;
        positionMenu(record);
      }

      focusSelectedOption(record);
    }
  }

  // Mendukung navigasi opsi menggunakan Escape, Tab, panah, Home, dan End.
  function handleMenuKeydown(record, event) {
    const options = Array.from(
      record.menu.querySelectorAll(
        ".ecosort-select-option:not(:disabled)"
      )
    );

    if (!options.length) return;

    const currentIndex = options.indexOf(documentRef.activeElement);

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(record, true);
      return;
    }

    if (event.key === "Tab") {
      closeMenu(record, false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      options[Math.min(currentIndex + 1, options.length - 1)].focus();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      options[Math.max(currentIndex - 1, 0)].focus();
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      options[0].focus();
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      options[options.length - 1].focus();
    }
  }

  // Menutup dropdown ketika pengguna menekan area di luar dropdown aktif.
  function handleOutsidePointer(event) {
    if (!activeRecord) return;

    if (
      activeRecord.wrapper.contains(event.target) ||
      activeRecord.menu.contains(event.target)
    ) {
      return;
    }

    closeMenu(activeRecord, false);
  }

  // Menutup menu saat ukuran atau posisi viewport berubah agar posisi tidak keliru.
  function handleViewportChange() {
    if (activeRecord) {
      closeMenu(activeRecord, false);
    }
  }

  // Membungkus select asli dengan tampilan dropdown kustom tanpa mengganti kontrol form aslinya.
  function enhance(select) {
    if (
      !(select instanceof windowRef.HTMLSelectElement) ||
      select.multiple ||
      select.dataset.ecosortEnhanced === "true" ||
      select.closest("[data-ecosort-select]")
    ) {
      return;
    }

    const parent = select.parentNode;
    if (!parent) return;

    const wrapper = documentRef.createElement("div");
    wrapper.className = "ecosort-select";
    wrapper.dataset.ecosortSelect = "true";

    // Pertahankan kebutuhan layout khusus dari select tertentu.
    if (select.classList.contains("period-select")) {
      wrapper.classList.add("ecosort-select-period");
    }

    // Tombol ini menjadi pemicu untuk membuka dan menutup menu dropdown.
    const trigger = documentRef.createElement("button");
    trigger.type = "button";
    trigger.className = "ecosort-select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", getAccessibleLabel(select));

    const label = documentRef.createElement("span");
    label.className = "ecosort-select-label";

    const arrow = documentRef.createElement("i");
    arrow.className = "ecosort-select-arrow";
    arrow.setAttribute("aria-hidden", "true");

    trigger.append(label, arrow);

    // Elemen menu berisi seluruh opsi yang dibuat oleh buildMenu().
    const menu = documentRef.createElement("div");
    menu.className = "ecosort-select-menu";
    menu.id = `ecosort-select-menu-${++selectId}`;
    menu.setAttribute("role", "listbox");

    trigger.setAttribute("aria-controls", menu.id);

    // Simpan referensi elemen dan event handler agar mudah diperbarui serta dibersihkan.
    const record = {
      select,
      wrapper,
      trigger,
      label,
      menu,
      form: select.form,
      onChange: null,
      onInvalid: null,
      onReset: null,
      originalTabIndex: select.getAttribute("tabindex"),
      originalAriaHidden: select.getAttribute("aria-hidden")
    };

    // Penanda apakah pesan/status validasi pernah ditampilkan untuk select ini.
    record.invalidShown = false;

    // Ketika nilai select berubah, hapus status invalid lama dan sinkronkan tampilan.
    record.onChange = () => {
      record.invalidShown = false;
      syncRecord(record);
    };

    // Tangani validasi bawaan browser dan arahkan fokus ke tombol dropdown kustom.
    record.onInvalid = event => {
      event.preventDefault();
      record.invalidShown = true;
      syncRecord(record);
      trigger.focus();
    };

    // Sinkronkan ulang tampilan setelah form di-reset ke nilai awal.
    record.onReset = () => {
      windowRef.queueMicrotask(() => syncRecord(record));
    };

    select.addEventListener("change", record.onChange);
    select.addEventListener("invalid", record.onInvalid);

    if (record.form) {
      record.form.addEventListener("reset", record.onReset);
    }

    // Klik tombol pemicu akan membuka atau menutup menu.
    trigger.addEventListener("click", event => {
      event.preventDefault();

      if (activeRecord === record) {
        closeMenu(record, false);
      } else {
        openMenu(record);
      }
    });

    trigger.addEventListener("keydown", event => {
      handleTriggerKeydown(record, event);
    });

    menu.addEventListener("keydown", event => {
      handleMenuKeydown(record, event);
    });

    // Tandai select agar tidak diproses berulang dan sembunyikan tampilan aslinya.
    // Select asli tetap digunakan sebagai kontrol form yang menyimpan nilai sebenarnya.
    select.dataset.ecosortEnhanced = "true";
    select.classList.add("ecosort-select-native");
    select.setAttribute("aria-hidden", "true");
    select.setAttribute("tabindex", "-1");

    parent.insertBefore(wrapper, select);
    wrapper.append(select, trigger);

    records.add(record);
    syncRecord(record);
  }

  // Memeriksa root untuk menemukan select baru dan membersihkan elemen yang sudah dilepas.
  function scan() {
    if (destroyed) return;

    root.querySelectorAll("select:not([multiple])").forEach(enhance);

    if (activeRecord && !activeRecord.select.isConnected) {
      closeMenu(activeRecord, false);
    }

    // Bersihkan setiap select: lepas listener, keluarkan dari wrapper, dan pulihkan atribut awal.
    records.forEach(record => {
      if (record.select.isConnected) {
        syncRecord(record);
        return;
      }

      record.select.removeEventListener("change", record.onChange);
      record.select.removeEventListener("invalid", record.onInvalid);

      if (record.form) {
        record.form.removeEventListener("reset", record.onReset);
      }

      records.delete(record);
    });
  }

  // Jalankan pemindaian pertama untuk memasang dropdown pada select yang sudah tersedia.
  scan();

  // Pantau perubahan DOM agar select yang ditambahkan secara dinamis ikut diubah.
  const observer = new windowRef.MutationObserver(() => {
    scan();
  });

  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden", "disabled", "required", "selected"]
  });

  // Klik di luar dropdown akan menutup menu yang sedang aktif.
  documentRef.addEventListener(
    "pointerdown",
    handleOutsidePointer,
    true
  );

  // Perubahan ukuran layar menutup menu agar posisi dropdown tetap akurat.
  windowRef.addEventListener(
    "resize",
    handleViewportChange
  );

  // Scroll halaman juga menutup menu untuk mencegah posisi menu tertinggal.
  windowRef.addEventListener(
    "scroll",
    handleViewportChange
  );

  // Fungsi cleanup untuk mengembalikan select ke kondisi semula saat komponen dilepas.
  return function unmountCustomSelects() {
    if (destroyed) return;
    destroyed = true;

    // Hentikan pemantauan perubahan DOM dan lepaskan listener global.
    observer.disconnect();

    documentRef.removeEventListener(
      "pointerdown",
      handleOutsidePointer,
      true
    );

    windowRef.removeEventListener(
      "resize",
      handleViewportChange
    );

    windowRef.removeEventListener(
      "scroll",
      handleViewportChange
    );

    if (activeRecord) {
      closeMenu(activeRecord, false);
    }

    records.forEach(record => {
      const {
        select,
        wrapper,
        trigger,
        onChange,
        onInvalid,
        onReset
      } = record;

      select.removeEventListener("change", onChange);
      select.removeEventListener("invalid", onInvalid);

      if (record.form) {
        record.form.removeEventListener("reset", onReset);
      }

      // Kembalikan select ke posisi DOM semula sebelum wrapper dihapus.
      if (wrapper.isConnected && select.isConnected) {
        wrapper.parentNode.insertBefore(select, wrapper);
        wrapper.remove();
      }

      select.classList.remove("ecosort-select-native");
      delete select.dataset.ecosortEnhanced;

      // Pulihkan atribut aksesibilitas sesuai nilai sebelum dropdown dipasang.
      if (record.originalTabIndex === null) {
        select.removeAttribute("tabindex");
      } else {
        select.setAttribute("tabindex", record.originalTabIndex);
      }

      if (record.originalAriaHidden === null) {
        select.removeAttribute("aria-hidden");
      } else {
        select.setAttribute("aria-hidden", record.originalAriaHidden);
      }

      trigger.remove();
    });

    // Kosongkan seluruh catatan komponen setelah proses cleanup selesai.
    records.clear();
  };
}


