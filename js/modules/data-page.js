
/* =====================================================
   ECOSORT - DATA MANAGEMENT MODULE
   Source: src/App.tsx
   Original components:
   - DataPage
   - ItemDetail
   - Modal

   Pure JavaScript ES Modules
===================================================== */

import {
  readLocal,
  writeLocal,
  seedForKind,
  downloadFile,
  toCsv
} from "../core/database.js";

import { Icon } from "../components/ui.js";

/* =====================================================
   CONSTANTS
===================================================== */

const PER_PAGE = 5;

const META = {
  users: [
    "Manajemen Pengguna",
    "Kelola akun dan hak akses seluruh pengguna EcoSort.",
    "Tambah pengguna"
  ],

  waste: [
    "Data Sampah",
    "Kelola jenis, karakteristik, dan kategori sampah.",
    "Tambah data sampah"
  ],

  guides: [
    "Panduan Penanganan",
    "Kelola rekomendasi penanganan untuk setiap jenis sampah.",
    "Tambah panduan"
  ],

  dataset: [
    "Dataset Pelatihan",
    "Kelola data berlabel untuk pelatihan dan pengujian model.",
    "Tambah data"
  ]
};

/* =====================================================
   HELPERS
===================================================== */

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function iconHTML(name, size = 18) {
  return Icon({ name, size }).outerHTML;
}

function badgeHTML(text, tone = "green") {
  return `
    <span class="badge badge-${escapeHTML(tone)}">
      <i class="badge-dot"></i>
      ${escapeHTML(text)}
    </span>
  `;
}

function buttonHTML(text, options = {}) {
  const {
    variant = "primary",
    icon = "",
    action = "",
    type = "button",
    disabled = false
  } = options;

  return `
    <button
      type="${type}"
      class="btn btn-${variant}"
      ${action ? `data-action="${escapeHTML(action)}"` : ""}
      ${disabled ? "disabled" : ""}
    >
      ${icon ? iconHTML(icon, 18) : ""}
      ${escapeHTML(text)}
    </button>
  `;
}

/* =====================================================
   DATA VALIDATION
===================================================== */

function isValidKind(kind) {
  return Object.prototype.hasOwnProperty.call(META, kind);
}

function getInitialItems(kind) {
  return readLocal(
    `data-${kind}`,
    seedForKind(kind)
  );
}

/* =====================================================
   COMPONENT: PAGE TITLE
===================================================== */

function renderPageTitle(kind) {
  const meta = META[kind];

  return `
    <div class="page-title">

      <div>
        <h1>${escapeHTML(meta[0])}</h1>
        <p>${escapeHTML(meta[1])}</p>
      </div>

      <div class="page-title-actions">

        <a class="btn btn-outline" href="../export.html">Pusat Ekspor CSV</a>

        ${buttonHTML("Ekspor", {
          variant: "outline",
          action: "export"
        })}

        ${buttonHTML(meta[2], {
          icon: "plus",
          action: "add"
        })}

      </div>

    </div>
  `;
}

/* =====================================================
   COMPONENT: DATASET SUMMARY
===================================================== */

function renderDatasetSummary(items) {
  const total = items.length;
  const training = Math.round(total * 0.8);
  const testing = Math.round(total * 0.2);

  return `
    <div class="dataset-summary">

      <div>
        <b>${total}</b>
        <span>Total data berlabel</span>
      </div>

      <div>
        <b>${training}</b>
        <span>Data pelatihan · 80%</span>
      </div>

      <div>
        <b>${testing}</b>
        <span>Data pengujian · 20%</span>
      </div>

      <div class="split-bar">
        <span></span>
        <i></i>
      </div>

    </div>
  `;
}

/* =====================================================
   COMPONENT: TOOLBAR
===================================================== */

function renderToolbar(state) {
  const { kind, query, category, status } = state;

  return `
    <div class="table-toolbar">

      <div class="table-search">

        ${iconHTML("search")}

        <input
          type="search"
          data-input="query"
          value="${escapeHTML(query)}"
          placeholder="Cari ${
            kind === "users"
              ? "nama atau email"
              : "data sampah"
          }..."
          aria-label="Cari data"
        />

      </div>

      <select
        data-input="category"
        aria-label="Filter kategori"
      >
        ${[
          "Semua kategori",
          ...(kind === "users"
            ? ["User", "Sub Admin"]
            : kind === "dataset"
              ? ["Organik", "Anorganik", "B3", "Residu"]
              : ["Organik", "Anorganik", "Residu"])
        ].map(value => `
          <option
            ${category === value ? "selected" : ""}
          >${value}</option>
        `).join("")}
      </select>

      <select
        data-input="status"
        aria-label="Filter status"
      >
        ${[
          "Semua status",
          "Aktif",
          "Draft",
          "Nonaktif"
        ].map(value => `
          <option
            ${status === value ? "selected" : ""}
          >${value}</option>
        `).join("")}
      </select>

      ${(query ||
        category !== "Semua kategori" ||
        status !== "Semua status")
        ? `
          <button
            class="text-button toolbar-reset"
            data-action="reset"
          >
            Reset filter
          </button>
        `
        : ""
      }

    </div>
  `;
}

/* =====================================================
   COMPONENT: TABLE ROW
===================================================== */

function renderTableRow(item, kind, index, selected) {
  const isUser = kind === "users";

  const initials = (item.name || "")
    .split(" ")
    .map(part => part[0] || "")
    .join("")
    .slice(0, 2);

  const categoryTone =
    item.category === "Organik"
      ? "green"
      : item.category === "Anorganik"
        ? "blue"
        : item.category === "Sub Admin"
          ? "blue"
          : item.category === "B3"
            ? "red"
            : "gray";

  const statusTone =
    item.status === "Aktif"
      ? "green"
      : isUser
        ? "gray"
        : "yellow";

  return `
    <tr>

      <td>
        <input
          type="checkbox"
          data-select-id="${escapeHTML(item.id)}"
          ${selected.includes(item.id) ? "checked" : ""}
          aria-label="Pilih ${escapeHTML(item.name)}"
        />
      </td>

      ${isUser
        ? `
          <td>
            <div class="table-name">

              <span class="tiny-avatar">
                ${escapeHTML(initials)}
              </span>

              <p>
                <b>${escapeHTML(item.name)}</b>
                <small>${escapeHTML(item.email || "")}</small>
              </p>

            </div>
          </td>

          <td>
            ${badgeHTML(item.category, categoryTone)}
          </td>

          <td>
            ${badgeHTML(item.status, statusTone)}
          </td>

          <td>${escapeHTML(item.joined || "Hari ini")}</td>
        `
        : `
          <td>
            <div class="table-name">

              <span class="waste-thumb t${index % 3}">
                ${iconHTML(
                  item.category === "Organik"
                    ? "logo"
                    : item.category === "Anorganik"
                      ? "waste"
                      : item.category === "B3"
                        ? "bell"
                        : "close",
                  18
                )}
              </span>

              <p>
                <b>${escapeHTML(item.name)}</b>
                <small>ID: ${escapeHTML(item.id)}</small>
              </p>

            </div>
          </td>

          <td>${escapeHTML(item.type)}</td>

          <td>
            ${badgeHTML(item.category, categoryTone)}
          </td>

          <td>
            ${badgeHTML(item.status, statusTone)}
          </td>
        `
      }

      <td>
        <div class="row-actions">

          <button
            type="button"
            title="Lihat"
            aria-label="Lihat ${escapeHTML(item.name)}"
            data-action="view"
            data-id="${escapeHTML(item.id)}"
          >
            ${iconHTML("eye", 17)}
          </button>

          <button
            type="button"
            title="Edit"
            aria-label="Edit ${escapeHTML(item.name)}"
            data-action="edit"
            data-id="${escapeHTML(item.id)}"
          >
            ${iconHTML("edit", 17)}
          </button>

          <button
            type="button"
            title="Hapus"
            aria-label="Hapus ${escapeHTML(item.name)}"
            data-action="delete"
            data-id="${escapeHTML(item.id)}"
          >
            ${iconHTML("waste", 17)}
          </button>

        </div>
      </td>

    </tr>
  `;
}

/* =====================================================
   COMPONENT: TABLE
===================================================== */

function renderTable(state, filtered, visible) {
  const {
    kind,
    selected,
    currentPage,
    pageCount
  } = state;

  const allSelected =
    visible.length > 0 &&
    visible.every(item => selected.includes(item.id));

  return `
    <div class="table-scroll">

      <table>

        <thead>
          <tr>

            <th>
              <input
                type="checkbox"
                data-input="select-all"
                ${allSelected ? "checked" : ""}
                aria-label="Pilih semua data pada halaman"
              />
            </th>

            ${kind === "users"
              ? `
                <th>Pengguna</th>
                <th>Role</th>
                <th>Status</th>
                <th>Bergabung</th>
              `
              : `
                <th>
                  ${kind === "guides"
                    ? "Judul panduan"
                    : "Nama sampah"}
                </th>
                <th>Jenis / bentuk</th>
                <th>Kategori</th>
                <th>Status</th>
              `
            }

            <th>Aksi</th>

          </tr>
        </thead>

        <tbody>

          ${visible.length
            ? visible.map((item, index) =>
                renderTableRow(item, kind, index, selected)
              ).join("")
            : `
              <tr>
                <td colspan="6">

                  <div class="table-empty">

                    <b>Tidak ada hasil</b>

                    <span>
                      Ubah kata kunci atau reset filter untuk melihat data.
                    </span>

                    <button data-action="reset">
                      Reset filter
                    </button>

                  </div>

                </td>
              </tr>
            `
          }

        </tbody>

      </table>

    </div>

    ${renderPagination(filtered.length, currentPage, pageCount)}
  `;
}

/* =====================================================
   COMPONENT: PAGINATION
===================================================== */

function renderPagination(total, currentPage, pageCount) {
  const start = total
    ? (currentPage - 1) * PER_PAGE + 1
    : 0;

  const end = Math.min(
    currentPage * PER_PAGE,
    total
  );

  return `
    <div class="pagination">

      <span>
        Menampilkan ${start}–${end} dari ${total} data
      </span>

      <div>

        <button
          data-page="${currentPage - 1}"
          ${currentPage === 1 ? "disabled" : ""}
          aria-label="Halaman sebelumnya"
        >
          ‹
        </button>

        ${Array.from(
          { length: pageCount },
          (_, index) => index + 1
        ).slice(0, 5).map(number => `
          <button
            data-page="${number}"
            class="${currentPage === number ? "active" : ""}"
          >
            ${number}
          </button>
        `).join("")}

        <button
          data-page="${currentPage + 1}"
          ${currentPage === pageCount ? "disabled" : ""}
          aria-label="Halaman berikutnya"
        >
          ›
        </button>

      </div>

    </div>
  `;
}

/* =====================================================
   COMPONENT: SELECTION BAR
===================================================== */

function renderSelectionBar(selected) {
  if (!selected.length) return "";

  return `
    <div class="selection-bar">

      ${selected.length} data dipilih

      <button data-action="clear-selection">
        Batalkan pilihan
      </button>

    </div>
  `;
}

/* =====================================================
   COMPONENT: ITEM DETAIL
===================================================== */

function renderItemDetail(item, kind) {
  return `
    <div
      class="modal-backdrop"
      data-action="backdrop-close"
      role="presentation"
    >

      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        data-modal-content
      >

        <div class="modal-head">

          <div>

            <span class="detail-kicker">
              DETAIL ${kind === "users" ? "PENGGUNA" : "DATA"}
            </span>

            <h3 id="detail-title">
              ${escapeHTML(item.name)}
            </h3>

            <p>${escapeHTML(item.id)}</p>

          </div>

          <button
            type="button"
            data-action="close-modal"
            aria-label="Tutup detail"
          >
            ${iconHTML("close")}
          </button>

        </div>

        <div class="modal-body detail-grid">

          <div>
            <small>
              ${kind === "users" ? "Email" : "Jenis / bentuk"}
            </small>

            <b>
              ${escapeHTML(
                kind === "users"
                  ? item.email
                  : item.type
              )}
            </b>
          </div>

          <div>
            <small>Kategori / role</small>
            <b>${escapeHTML(item.category)}</b>
          </div>

          <div>
            <small>Status</small>
            <b>${escapeHTML(item.status)}</b>
          </div>

          <div class="detail-wide">
            <small>Deskripsi</small>
            <p>${escapeHTML(item.description)}</p>
          </div>

        </div>

        <div class="modal-actions">

          ${buttonHTML("Tutup", {
            variant: "outline",
            action: "close-modal"
          })}

          ${buttonHTML("Edit data", {
            icon: "edit",
            action: "edit-from-detail"
          })}

        </div>

      </div>

    </div>
  `;
}

/* =====================================================
   COMPONENT: ADD / EDIT / DELETE MODAL
===================================================== */

function renderModal({
  type,
  kind,
  title,
  item
}) {
  if (type === "delete") {
    return `
      <div
        class="modal-backdrop"
        data-action="backdrop-close"
        role="presentation"
      >

        <form
          class="modal"
          data-modal-form
          role="dialog"
          aria-modal="true"
          data-modal-content
        >

          <div class="modal-head">

            <div class="delete-icon">
              ${iconHTML("waste")}

              <h3>${escapeHTML(title)}</h3>

              <p>
                Tindakan ini tidak dapat dibatalkan. Data akan dihapus dari
                penyimpanan lokal.
              </p>
            </div>

            <button
              type="button"
              data-action="close-modal"
              aria-label="Tutup modal"
            >
              ${iconHTML("close")}
            </button>

          </div>

          <div class="modal-actions">

            ${buttonHTML("Batal", {
              variant: "outline",
              action: "close-modal"
            })}

            ${buttonHTML("Ya, hapus", {
              variant: "danger",
              type: "submit"
            })}

          </div>

        </form>

      </div>
    `;
  }

  const form = item || {
    id: "",
    name: "",
    email: "",
    type: kind === "users" ? "User" : "",
    category: kind === "users" ? "User" : "",
    status: "Aktif",
    description: "",
    joined: "Hari ini"
  };

  const isUser = kind === "users";

  return `
    <div
      class="modal-backdrop"
      data-action="backdrop-close"
      role="presentation"
    >

      <form
        class="modal"
        data-modal-form
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        novalidate
        data-modal-content
      >

        <div class="modal-head">

          <div>
            <h3 id="modal-title">${escapeHTML(title)}</h3>
          </div>

          <button
            type="button"
            data-action="close-modal"
            aria-label="Tutup modal"
          >
            ${iconHTML("close")}
          </button>

        </div>

        <div class="modal-body">

          <label class="field">

            <span>${isUser ? "Nama lengkap" : "Nama / judul"}</span>

            <div class="input-wrap">
              <input
                name="name"
                value="${escapeHTML(form.name)}"
                placeholder="Masukkan nama data"
                data-first-input
              />
            </div>

            <small class="field-error" data-error="name"></small>

          </label>

          ${isUser
            ? `
              <label class="field">

                <span>Alamat email</span>

                <div class="input-wrap">
                  <input
                    name="email"
                    type="email"
                    value="${escapeHTML(form.email || "")}"
                    placeholder="nama@email.com"
                  />
                </div>

                <small class="field-error" data-error="email"></small>

              </label>
            `
            : `
              <label class="field">

                <span>Jenis / bentuk</span>

                <div class="input-wrap">
                  <input
                    name="type"
                    value="${escapeHTML(form.type)}"
                    placeholder="Contoh: Botol plastik"
                  />
                </div>

                <small class="field-error" data-error="type"></small>

              </label>
            `
          }

          <label class="field">

            <span>${isUser ? "Role" : "Kategori"}</span>

            <select name="category">

              ${isUser
                ? ["User", "Sub Admin"].map(value => `
                    <option
                      ${form.category === value ? "selected" : ""}
                    >${value}</option>
                  `).join("")
                : `
                  <option value="">Pilih kategori</option>
                  ${(kind === "dataset"
                    ? ["Organik", "Anorganik", "B3", "Residu"]
                    : ["Organik", "Anorganik", "Residu"]).map(value => `
                    <option
                      ${form.category === value ? "selected" : ""}
                    >${value}</option>
                  `).join("")}
                `
              }

            </select>

          </label>

          <label class="field">

            <span>Status</span>

            <select name="status">

              <option ${form.status === "Aktif" ? "selected" : ""}>
                Aktif
              </option>

              <option>
                ${isUser ? "Nonaktif" : "Draft"}
              </option>

            </select>

          </label>

          <label class="field">

            <span>Deskripsi</span>

            <textarea
              name="description"
              placeholder="Tambahkan deskripsi singkat..."
            >${escapeHTML(form.description)}</textarea>

            <small class="field-error" data-error="description"></small>

          </label>

        </div>

        <div class="modal-actions">

          ${buttonHTML("Batal", {
            variant: "outline",
            action: "close-modal"
          })}

          ${buttonHTML("Simpan perubahan", {
            type: "submit"
          })}

        </div>

      </form>

    </div>
  `;
}

/* =====================================================
   COMPONENT: CSV EXPORT PREVIEW
===================================================== */

function renderExportPreview(items, kind) {
  const columns = kind === "waste"
    ? ["ID", "Nama sampah", "Jenis / bentuk", "Kategori", "Status", "Deskripsi"]
    : ["ID", "Judul panduan", "Jenis / bentuk", "Kategori", "Status", "Deskripsi"];

  const values = item => [
    item.id, item.name, item.type, item.category, item.status, item.description
  ];

  return `
    <div class="modal-backdrop" data-action="backdrop-close" role="presentation">
      <section class="modal export-preview-modal" role="dialog" aria-modal="true" aria-labelledby="export-preview-title" data-modal-content>
        <div class="modal-head">
          <div>
            <span class="detail-kicker">PRATINJAU EKSPOR CSV</span>
            <h3 id="export-preview-title">Tabel data yang akan diekspor</h3>
            <p>${items.length} baris data · ${escapeHTML(kind === "waste" ? "Data Sampah" : "Panduan Penanganan")}</p>
          </div>
          <button type="button" data-action="close-modal" aria-label="Tutup pratinjau">${iconHTML("close")}</button>
        </div>
        <div class="modal-body">
          <div class="export-preview-scroll">
            <table class="export-preview-table">
              <thead><tr>${columns.map(column => `<th>${escapeHTML(column)}</th>`).join("")}</tr></thead>
              <tbody>
                ${items.length ? items.map(item => `<tr>${values(item).map(value => `<td>${escapeHTML(value ?? "-")}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="6">Tidak ada data untuk ditampilkan.</td></tr>`}
              </tbody>
            </table>
          </div>
          <p class="export-preview-note">Pratinjau mengikuti hasil pencarian dan filter yang sedang aktif.</p>
        </div>
        <div class="modal-actions">
          ${buttonHTML("Tutup", { variant: "outline", action: "close-modal" })}
          ${buttonHTML("Unduh CSV", { icon: "download", action: "export-download", disabled: !items.length })}
        </div>
      </section>
    </div>
  `;
}

/* =====================================================
   MAIN DATA PAGE CLASS
===================================================== */

export class DataPage {

  constructor({
    kind,
    onToast = () => {}
  }) {
    if (!isValidKind(kind)) {
      throw new Error(`Jenis data tidak valid: ${kind}`);
    }

    this.kind = kind;
    this.onToast = onToast;

    this.items = getInitialItems(kind);

    this.query = "";
    this.category = "Semua kategori";
    this.status = "Semua status";

    this.selected = [];
    this.pageIndex = 1;

    this.action = null;
    this.activeItem = null;

    this.root = null;
    this.unsubscribe = null;

    this.handleClick = this.handleClick.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  /* ===================================================
     FILTERED DATA
  =================================================== */

  get filtered() {
    const term = this.query.trim().toLowerCase();

    return this.items.filter(item => {

      const matchesQuery =
        !term ||
        [
          item.name,
          item.email,
          item.type,
          item.description
        ]
          .filter(Boolean)
          .some(value =>
            String(value).toLowerCase().includes(term)
          );

      const matchesCategory =
        this.category === "Semua kategori" ||
        item.category === this.category;

      const matchesStatus =
        this.status === "Semua status" ||
        item.status === this.status;

      return (
        matchesQuery &&
        matchesCategory &&
        matchesStatus
      );
    });
  }

  get pageCount() {
    return Math.max(
      1,
      Math.ceil(this.filtered.length / PER_PAGE)
    );
  }

  get currentPage() {
    return Math.min(this.pageIndex, this.pageCount);
  }

  get visible() {
    return this.filtered.slice(
      (this.currentPage - 1) * PER_PAGE,
      this.currentPage * PER_PAGE
    );
  }

  /* ===================================================
     STORAGE
  =================================================== */

  persist() {
    writeLocal(
      `data-${this.kind}`,
      this.items
    );
  }

  /* ===================================================
     RENDER
  =================================================== */

  render() {
    const meta = META[this.kind];

    return `
      ${renderPageTitle(this.kind)}

      ${this.kind === "dataset"
        ? renderDatasetSummary(this.items)
        : ""
      }

      <div class="panel table-panel">

        ${renderToolbar({
          kind: this.kind,
          query: this.query,
          category: this.category,
          status: this.status
        })}

        ${renderSelectionBar(this.selected)}

        ${renderTable(
          {
            kind: this.kind,
            selected: this.selected,
            currentPage: this.currentPage,
            pageCount: this.pageCount
          },
          this.filtered,
          this.visible
        )}

      </div>

      ${this.renderActionModal()}
    `;
  }

  renderActionModal() {
    if (!this.action) return "";

    if (this.action === "export") {
      return renderExportPreview(this.filtered, this.kind);
    }

    if (this.action === "view" && this.activeItem) {
      return renderItemDetail(
        this.activeItem,
        this.kind
      );
    }

    if (this.action === "delete" && this.activeItem) {
      return renderModal({
        type: "delete",
        kind: this.kind,
        title: `Hapus ${this.activeItem.name}?`,
        item: this.activeItem
      });
    }

    if (
      this.action === "add" ||
      this.action === "edit"
    ) {
      return renderModal({
        type: this.action,
        kind: this.kind,
        title: `${this.action === "add" ? "Tambah" : "Edit"} ${
          this.kind === "users"
            ? "pengguna"
            : this.kind === "guides"
              ? "panduan"
              : "data sampah"
        }`,
        item: this.activeItem
      });
    }

    return "";
  }

  mount(root) {
    if (!root) {
      throw new Error("Elemen root DataPage tidak ditemukan.");
    }

    this.destroy();

    this.root = root;

    this.root.addEventListener("click", this.handleClick);
    this.root.addEventListener("input", this.handleInput);
    this.root.addEventListener("change", this.handleChange);
    this.root.addEventListener("submit", this.handleSubmit);

    window.addEventListener("keydown", this.handleKeydown);

    this.update();

    return () => this.destroy();
  }

  update() {
    if (!this.root) return;

    this.root.innerHTML = this.render();

    if (this.action && this.action !== "view") {
      this.root.querySelector("[data-first-input]")?.focus();
    }
  }

  destroy() {
    if (!this.root) return;

    this.root.removeEventListener("click", this.handleClick);
    this.root.removeEventListener("input", this.handleInput);
    this.root.removeEventListener("change", this.handleChange);
    this.root.removeEventListener("submit", this.handleSubmit);

    window.removeEventListener("keydown", this.handleKeydown);

    this.root = null;
  }

  /* ===================================================
     ACTION MANAGEMENT
  =================================================== */

  openAction(action, item = null) {
    this.activeItem = item;
    this.action = action;
    this.update();
  }

  closeAction() {
    this.action = null;
    this.activeItem = null;
    this.update();
  }

  /* ===================================================
     SAVE DATA
  =================================================== */

  saveItem(payload) {
    if (!payload) return;

    if (this.action === "edit" && this.activeItem) {

      this.items = this.items.map(item =>
        item.id === this.activeItem.id
          ? {
              ...payload,
              id: item.id
            }
          : item
      );

      this.onToast(
        `${payload.name} berhasil diperbarui`
      );

    } else {

      const created = {
        ...payload,
        id: `${this.kind.toUpperCase()}-${Date.now()}`
      };

      this.items = [
        created,
        ...this.items
      ];

      this.onToast(
        `${payload.name} berhasil ditambahkan`
      );
    }

    this.persist();

    this.action = null;
    this.activeItem = null;

    this.pageIndex = 1;

    this.update();
  }

  /* ===================================================
     DELETE DATA
  =================================================== */

  deleteItem() {
    if (!this.activeItem) return;

    const name = this.activeItem.name;
    const id = this.activeItem.id;

    this.items = this.items.filter(
      item => item.id !== id
    );

    this.selected = this.selected.filter(
      selectedId => selectedId !== id
    );

    this.persist();

    this.onToast(
      `${name} berhasil dihapus`
    );

    this.action = null;
    this.activeItem = null;

    this.update();
  }

  /* ===================================================
     EXPORT CSV
  =================================================== */

  exportItems() {
    if (!this.filtered.length) {
      this.onToast(
        "Tidak ada data untuk diekspor",
        "error"
      );

      return;
    }

    const rows = this.filtered.map(({
      id,
      name,
      email = "",
      type,
      category,
      status,
      description
    }) => ({
      id,
      name,
      email,
      type,
      category,
      status,
      description
    }));

    downloadFile(
      `ecosort-${this.kind}-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(rows)
    );

    this.onToast(
      `${this.filtered.length} data berhasil diekspor`
    );
  }

  /* ===================================================
     FILTER RESET
  =================================================== */

  resetFilters() {
    this.query = "";
    this.category = "Semua kategori";
    this.status = "Semua status";

    this.pageIndex = 1;

    this.update();
  }

  /* ===================================================
     SELECTION
  =================================================== */

  toggleAll(checked) {
    const visibleIds = this.visible.map(
      item => item.id
    );

    this.selected = checked
      ? Array.from(
          new Set([
            ...this.selected,
            ...visibleIds
          ])
        )
      : this.selected.filter(
          id => !visibleIds.includes(id)
        );

    this.update();
  }

  toggleSelected(id, checked) {
    this.selected = checked
      ? [...new Set([...this.selected, id])]
      : this.selected.filter(
          selectedId => selectedId !== id
        );

    this.update();
  }

  /* ===================================================
     FORM VALIDATION
  =================================================== */

  validateForm(formData) {
    const errors = {};

    if (formData.name.trim().length < 3) {
      errors.name = "Nama minimal 3 karakter.";
    }

    if (
      this.kind === "users" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email || ""
      )
    ) {
      errors.email = "Email tidak valid.";
    }

    if (
      this.kind !== "users" &&
      formData.type.trim().length < 2
    ) {
      errors.type = "Jenis wajib diisi.";
    }

    if (formData.description.trim().length < 5) {
      errors.description = "Deskripsi minimal 5 karakter.";
    }

    return errors;
  }

  /* ===================================================
     EVENT: INPUT
  =================================================== */

  handleInput(event) {
    const target = event.target;

    if (target.dataset.input === "query") {
      this.query = target.value;
      this.pageIndex = 1;

      const position = target.selectionStart;

      this.update();

      const newInput = this.root.querySelector(
        '[data-input="query"]'
      );

      newInput?.focus();

      if (position !== null) {
        newInput?.setSelectionRange(position, position);
      }
    }
  }

  /* ===================================================
     EVENT: CHANGE
  =================================================== */

  handleChange(event) {
    const target = event.target;

    if (target.dataset.input === "category") {
      this.category = target.value;
      this.pageIndex = 1;
      this.update();
    }

    if (target.dataset.input === "status") {
      this.status = target.value;
      this.pageIndex = 1;
      this.update();
    }

    if (target.dataset.input === "select-all") {
      this.toggleAll(target.checked);
    }

    if (target.dataset.selectId) {
      this.toggleSelected(
        target.dataset.selectId,
        target.checked
      );
    }
  }

  /* ===================================================
     EVENT: CLICK
  =================================================== */

  handleClick(event) {
    const pageButton = event.target.closest("[data-page]");

    if (pageButton && this.root.contains(pageButton)) {
      const page = Number(pageButton.dataset.page);

      if (Number.isInteger(page)) {
        this.pageIndex = Math.max(
          1,
          Math.min(this.pageCount, page)
        );

        this.update();
      }

      return;
    }

    const actionButton = event.target.closest("[data-action]");

    if (!actionButton || !this.root.contains(actionButton)) {
      return;
    }

    const action = actionButton.dataset.action;

    switch (action) {

      case "add":
        this.openAction("add");
        break;

      case "export":
        this.openAction("export");
        break;

      case "export-download":
        this.exportItems();
        this.closeAction();
        break;

      case "reset":
        this.resetFilters();
        break;

      case "clear-selection":
        this.selected = [];
        this.update();
        break;

      case "view":
      case "edit":
      case "delete": {
        const item = this.items.find(
          entry => entry.id === actionButton.dataset.id
        );

        if (item) {
          this.openAction(action, item);
        }

        break;
      }

      case "close-modal":
        this.closeAction();
        break;

      case "backdrop-close":
        if (event.target === actionButton) {
          this.closeAction();
        }
        break;

      case "edit-from-detail":
        this.openAction("edit", this.activeItem);
        break;
    }
  }

  /* ===================================================
     EVENT: SUBMIT
  =================================================== */

  handleSubmit(event) {
    if (!event.target.matches("[data-modal-form]")) {
      return;
    }

    event.preventDefault();

    if (this.action === "delete") {
      this.deleteItem();
      return;
    }

    const formData = Object.fromEntries(
      new FormData(event.target).entries()
    );

    const errors = this.validateForm(formData);

    Object.entries(errors).forEach(([field, message]) => {
      const errorElement = event.target.querySelector(
        `[data-error="${field}"]`
      );

      if (errorElement) {
        errorElement.textContent = message;
      }
    });

    if (Object.keys(errors).length) {
      return;
    }

    const payload = {
      ...(this.activeItem || {}),
      ...formData,
      name: formData.name.trim(),
      type:
        this.kind === "users"
          ? formData.category
          : formData.type.trim(),
      description: formData.description.trim()
    };

    this.saveItem(payload);
  }

  /* ===================================================
     EVENT: ESCAPE
  =================================================== */

  handleKeydown(event) {
    if (
      event.key === "Escape" &&
      this.action
    ) {
      this.closeAction();
    }
  }
}

/* =====================================================
   CONVENIENCE RENDERER
===================================================== */

export function createDataPage(options) {
  return new DataPage(options);
}