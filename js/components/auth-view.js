/* =====================================================
   ECOSORT - AUTHENTICATION VIEWS
   Original source: src/App.tsx
   Original components:
   - Auth
   - SuperAdminLogin
   - Field integration

   Migration: Pure JavaScript
===================================================== */

import {
  Icon,
  Logo,
  Button
} from "./ui.js";

/* =====================================================
   HTML HELPERS
===================================================== */

// Mengamankan teks sebelum dimasukkan ke HTML agar karakter khusus tidak dibaca sebagai tag atau kode HTML.
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

// Mengubah komponen ikon menjadi string HTML agar dapat disisipkan ke dalam template.
function iconHTML(name, size = 20) {
  return Icon({ name, size }).outerHTML;
}

// Menghasilkan elemen logo EcoSort; parameter light menentukan variasi tampilannya.
function logoHTML(light = false) {
  return Logo({ light }).outerHTML;
}

// Membuat tombol submit dengan opsi lebar penuh dan status loading.
function buttonHTML(text, {
  full = false,
  loading = false
} = {}) {
  return Button({
    children: text,
    full,
    loading,
    type: "submit"
  }).outerHTML;
}

/* =====================================================
   FIELD HTML
   Original source: Field()
===================================================== */

// Membuat satu elemen input lengkap dengan label, ikon, nilai awal, dan pesan kesalahan.
// Parameter name memberi nama unik pada input agar browser tidak mengisi otomatis dari mode lain.
// Parameter readonly dipakai untuk mencegah autofill; atributnya dilepas saat input difokus.
function fieldHTML({
  label,
  placeholder,
  type = "text",
  icon,
  value = "",
  error = "",
  autoComplete = "",
  action = "",
  name = "",
  readonly = false
}) {
  return `
    <label class="field">

      <span>${escapeHTML(label)}</span>

      <div class="input-wrap ${error ? "input-error" : ""}">

        ${icon ? iconHTML(icon, 18) : ""}

        <input
          type="${escapeHTML(type)}"
          ${name ? `name="${escapeHTML(name)}"` : ""}
          placeholder="${escapeHTML(placeholder)}"
          value="${escapeHTML(value)}"
          autocomplete="${escapeHTML(autoComplete)}"
          ${readonly ? "readonly" : ""}
          aria-invalid="${Boolean(error)}"
        />

        ${action}

      </div>

      ${error
      ? `<small class="field-error">${escapeHTML(error)}</small>`
      : ""
    }

    </label>
  `;
}

/* =====================================================
   AUTH VIEW
   Original source: Auth()
===================================================== */

// Menyusun tampilan autentikasi berdasarkan mode login, registrasi, atau lupa kata sandi.
// Data yang diterima melalui parameter digunakan untuk mengisi nilai dan status pada formulir.
export function renderAuthView({
  mode = "login",
  role = "User",
  name = "",
  email = "",
  password = "",
  remember = false,
  showPassword = false,
  loading = false,
  errors = {},
  message = ""
} = {}) {

  // Menentukan mode aktif agar bagian formulir yang ditampilkan sesuai kebutuhan pengguna.
  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isForgot = mode === "forgot";

  const kicker = isLogin
    ? "SELAMAT DATANG KEMBALI"
    : isRegister
      ? "BERGABUNG DENGAN ECOSORT"
      : "PULIHKAN AKUN";

  const title = isLogin
    ? "Masuk ke akun Anda"
    : isRegister
      ? "Buat akun baru"
      : "Lupa kata sandi?";

  const description = isLogin
    ? "Lanjutkan perjalanan Anda menuju kebiasaan memilah sampah yang lebih baik."
    : isRegister
      ? "Mulai kenali dan pilah sampah dengan lebih tepat."
      : "Masukkan email dan kami akan mengirim tautan pemulihan.";

  // Tombol untuk mengubah visibilitas kata sandi pada kolom password.
  const passwordAction = `
    <button
      type="button"
      class="field-action"
      data-action="toggle-password"
      aria-label="${showPassword
      ? "Sembunyikan kata sandi"
      : "Tampilkan kata sandi"}"
    >
      ${showPassword ? "Sembunyikan" : "Lihat"}
    </button>
  `;

  return `
    <div class="auth-shell">

      <!-- LEFT BRAND PANEL -->

      <div class="auth-brand">

        ${logoHTML(true)}

        <div class="auth-quote">

          <span class="quote-mark">“</span>

          <h2>
            Perubahan besar dimulai dari cara kita memperlakukan hal-hal kecil.
          </h2>

          <p>
            Pilah hari ini, jaga bumi esok hari.
          </p>

        </div>

        <div class="auth-art">

          <div class="auth-circle">
            ${iconHTML("logo", 72)}
          </div>

        </div>

        <span class="auth-copy">
          © 2026 EcoSort. Sistem klasifikasi sampah.
        </span>

      </div>

      <!-- RIGHT FORM PANEL -->

      <div class="auth-form-wrap">

        <div class="mobile-auth-logo">
          ${logoHTML()}
        </div>

        <form
          class="auth-form"
          data-form="auth"
          autocomplete="${isRegister ? "off" : "on"}"
          novalidate
        >

          <span class="auth-kicker">
            ${kicker}
          </span>

          <h1>${title}</h1>

          <p>${description}</p>

          <!-- DECOY FIELDS: menampung autofill browser agar tidak mengisi kolom asli saat daftar -->

          ${isRegister
      ? `
              <div
                aria-hidden="true"
                style="position:absolute;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;"
              >
                <input
                  type="text"
                  name="decoy-username"
                  autocomplete="username"
                  tabindex="-1"
                />
                <input
                  type="password"
                  name="decoy-password"
                  autocomplete="current-password"
                  tabindex="-1"
                />
              </div>
            `
      : ""
    }

          <!-- REGISTER NAME -->

          ${isRegister
      ? fieldHTML({
        label: "Nama lengkap",
        placeholder: "Masukkan nama lengkap",
        value: name,
        error: errors.name,
        autoComplete: "off",
        name: "register-name",
        readonly: true
      })
      : ""
    }

          <!-- EMAIL -->

          ${fieldHTML({
      label: "Alamat email",
      placeholder: "nama@email.com",
      type: "email",
      icon: "profile",
      // Jangan membawa email dari mode login ke form daftar.
      value: isRegister ? "" : email,
      error: errors.email,
      autoComplete: isRegister ? "off" : "email",
      name: isRegister ? "register-email" : "email",
      // Dilepas otomatis saat input difokus (lihat bindAuthView).
      readonly: isRegister
    })}

          <!-- PASSWORD -->

          ${!isForgot
      ? fieldHTML({
        label: "Kata sandi",
        placeholder: "Minimal 8 karakter",
        type: showPassword ? "text" : "password",
        icon: "settings",
        // Jangan membawa kata sandi dari mode login ke form daftar.
        value: isRegister ? "" : password,
        error: errors.password,
        autoComplete: isRegister
          ? "new-password"
          : "current-password",
        action: passwordAction,
        name: isRegister ? "register-password" : "password",
        // Dilepas otomatis saat input difokus (lihat bindAuthView).
        readonly: isRegister
      })
      : ""
    }

          <!-- REMEMBER AND FORGOT -->

          ${isLogin
      ? `
              <div class="form-meta">

                <label>
                  <input
                    type="checkbox"
                    data-input="remember"
                    ${remember ? "checked" : ""}
                  />
                  Ingat saya
                </label>

                <button
                  type="button"
                  data-mode="forgot"
                >
                  Lupa kata sandi?
                </button>

              </div>
            `
      : ""
    }

          <!-- ROLE PICKER -->

          ${isLogin || isRegister
      ? `
              <div class="role-picker">

                <span>${isLogin ? "Masuk sebagai" : "Daftar sebagai"}</span>

                <div>

                  <button
                    type="button"
                    data-role="User"
                    class="${role === "User" ? "active" : ""}"
                  >
                    User
                  </button>

                  <button
                    type="button"
                    data-role="Sub Admin"
                    class="${role === "Sub Admin" ? "active" : ""}"
                  >
                    Sub Admin
                  </button>

                </div>

              </div>
            `
      : ""
    }

          <!-- MESSAGE -->

          ${message
      ? `
              <div class="form-message" role="status">
                ${escapeHTML(message)}
              </div>
            `
      : ""
    }

          <!-- PROTOTYPE NOTE -->

          <p class="prototype-note">
            Mode prototipe lokal: autentikasi server belum terhubung
            dan kata sandi tidak disimpan.
          </p>

          <!-- SUBMIT -->

          ${buttonHTML(
      isForgot
        ? "Kirim tautan pemulihan"
        : isRegister
          ? "Daftar sekarang"
          : "Masuk ke EcoSort",
      {
        full: true,
        loading
      }
    )}

          <!-- GOOGLE LOGIN -->

          ${!isForgot
      ? `
              <div class="auth-divider">
                <span>atau</span>
              </div>

              <button
                class="google-button"
                type="button"
                data-action="google-login"
              >
                ${iconHTML("google", 19)}
                Lanjutkan dengan Google
              </button>
            `
      : ""
    }

          <!-- AUTH SWITCH -->

          <div class="auth-switch">

            ${isLogin
      ? "Belum memiliki akun?"
      : isRegister
        ? "Sudah memiliki akun?"
        : "Ingat kata sandi Anda?"
    }

            <button
              type="button"
              data-mode="${isLogin ? "register" : "login"}"
            >
              ${isLogin ? "Daftar gratis" : "Masuk"}
            </button>

          </div>

          <!-- SUPER ADMIN ENTRY -->

          ${isLogin
      ? `
              <button
                class="superadmin-entry"
                type="button"
                data-action="superadmin"
              >
                Login Super Admin
                ${iconHTML("arrow", 14)}
              </button>
            `
      : ""
    }

        </form>

      </div>

    </div>
  `;
}

/* =====================================================
   AUTH EVENT BINDING
===================================================== */

// Memasang event listener pada tampilan autentikasi dan menghubungkan aksi pengguna
// dengan callback yang disediakan oleh bagian aplikasi lainnya.
export function bindAuthView(root, callbacks = {}) {

  const {
    onSubmit,
    onModeChange,
    onRoleChange,
    onSuperAdmin,
    onGoogleLogin
  } = callbacks;

  if (!root) return () => { };

  const form = root.querySelector(
    '[data-form="auth"]'
  );

  if (!form) return () => { };

  // Menangani pengiriman formulir dan mengambil seluruh nilai input yang dibutuhkan.
  const handleSubmit = event => {
    // Mencegah browser memuat ulang halaman ketika formulir dikirim.
    event.preventDefault();

    // Objek untuk menampung data formulir sebelum dikirim ke callback onSubmit.
    const values = {};

    form.querySelectorAll(".field").forEach(field => {
      const label = field.querySelector(":scope > span");
      const input = field.querySelector("input");

      if (!label || !input) return;

      const labelText = label.textContent.trim();

      if (labelText === "Nama lengkap") {
        values.name = input.value;
      }

      if (labelText === "Alamat email") {
        values.email = input.value;
      }

      if (labelText === "Kata sandi") {
        values.password = input.value;
      }
    });

    values.remember = Boolean(
      form.querySelector(
        '[data-input="remember"]'
      )?.checked
    );

    onSubmit?.(values);
  };

  // Melepas atribut readonly saat input difokus. Trik ini mencegah autofill browser
  // karena browser sering mengabaikan autocomplete="off".
  const handleFocusIn = event => {
    const input = event.target;

    if (input.matches?.("input[readonly]")) {
      input.removeAttribute("readonly");
    }
  };

  // Menangani klik pada tombol pergantian mode, pemilihan peran, dan aksi lainnya.
  const handleClick = event => {

    const modeButton = event.target.closest("[data-mode]");

    if (modeButton) {
      onModeChange?.(modeButton.dataset.mode);
      return;
    }

    const roleButton = event.target.closest("[data-role]");

    if (roleButton) {
      onRoleChange?.(roleButton.dataset.role);
      return;
    }

    const actionButton = event.target.closest("[data-action]");

    if (!actionButton) return;

    // Menjalankan aksi berdasarkan nilai atribut data-action pada tombol yang diklik.
    switch (actionButton.dataset.action) {

      case "toggle-password": {
        // Dipilih lewat name agar tidak salah mengenai kolom nama lengkap (type text) pada mode daftar.
        const input = form.querySelector(
          'input[name="password"], input[name="register-password"]'
        );

        if (!input) return;

        input.type =
          input.type === "password"
            ? "text"
            : "password";

        actionButton.textContent =
          input.type === "password"
            ? "Lihat"
            : "Sembunyikan";

        break;
      }

      case "google-login":
        onGoogleLogin?.();
        break;

      case "superadmin":
        onSuperAdmin?.();
        break;
    }
  };

  // Mendaftarkan fungsi penanganan ketika formulir dikirim.
  form.addEventListener("submit", handleSubmit);
  form.addEventListener("focusin", handleFocusIn);
  root.addEventListener("click", handleClick);

  // Mengembalikan fungsi untuk melepas event listener ketika tampilan tidak lagi digunakan.
  return function unsubscribe() {
    form.removeEventListener("submit", handleSubmit);
    form.removeEventListener("focusin", handleFocusIn);
    root.removeEventListener("click", handleClick);
  };
}

/* =====================================================
   SUPER ADMIN LOGIN VIEW
   Original source: SuperAdminLogin()
===================================================== */

// Menyusun halaman login khusus Super Admin beserta kolom email dan kata sandi.
export function renderSuperAdminLoginView({
  email = "",
  password = "",
  showPassword = false,
  loading = false,
  errors = {}
} = {}) {

  const passwordAction = `
    <button
      type="button"
      class="field-action"
      data-action="toggle-password"
      aria-label="${showPassword
      ? "Sembunyikan password"
      : "Tampilkan password"}"
    >
      ${showPassword ? "Sembunyikan" : "Lihat"}
    </button>
  `;

  return `
    <div class="superadmin-shell">

      <section class="superadmin-aside">

        ${logoHTML(true)}

        <div class="superadmin-aside-copy">

          <span class="superadmin-badge">
            ${iconHTML("settings", 16)}
            AKSES ADMINISTRATOR
          </span>

          <h2>
            Kendali penuh untuk ekosistem yang lebih tertata.
          </h2>

          <p>
            Kelola data, evaluasi model, dan pantau operasional EcoSort
            melalui satu ruang kerja terpusat.
          </p>

        </div>

        <span class="auth-copy">
          © 2026 EcoSort
        </span>

      </section>

      <main class="superadmin-main">

        <div class="superadmin-mobile-logo">
          ${logoHTML()}
        </div>

        <form
          class="superadmin-card"
          data-form="superadmin"
          novalidate
        >

          <div class="superadmin-icon">
            ${iconHTML("profile", 25)}
          </div>

          <span class="auth-kicker">
            AKSES TERBATAS
          </span>

          <h1>Super Admin Portal</h1>

          <p>Halaman Login Administrator Utama</p>

          <div class="superadmin-divider"></div>

          ${fieldHTML({
    label: "Email administrator",
    placeholder: "admin@ecosort.id",
    icon: "profile",
    type: "email",
    value: email,
    error: errors.email,
    autoComplete: "email",
    name: "superadmin-email"
  })}

          ${fieldHTML({
    label: "Password",
    placeholder: "Masukkan password",
    icon: "settings",
    type: showPassword ? "text" : "password",
    value: password,
    error: errors.password,
    autoComplete: "current-password",
    action: passwordAction,
    name: "superadmin-password"
  })}

          <div class="superadmin-notice">

            ${iconHTML("bell", 15)}

            <span>
              Login ini masih berupa simulasi frontend dan belum
              memverifikasi identitas pengguna secara nyata.
            </span>

          </div>

          ${buttonHTML(
    "Login sebagai Super Admin",
    {
      full: true,
      loading
    }
  )}

          <button
            class="back-home"
            type="button"
            data-action="home"
          >
            ${iconHTML("arrow", 15)}
            Kembali ke halaman utama
          </button>

          <div class="superadmin-login-link">

            Bukan Super Admin?

            <button
              type="button"
              data-action="back-login"
            >
              Buka login utama
            </button>

          </div>

        </form>

      </main>

    </div>
  `;
}

/* =====================================================
   SUPER ADMIN EVENT BINDING
===================================================== */

// Menghubungkan formulir Super Admin dengan callback untuk submit, kembali ke login utama,
// dan kembali ke halaman utama aplikasi.
export function bindSuperAdminView(root, callbacks = {}) {

  const {
    onSubmit,
    onBack,
    onHome
  } = callbacks;

  if (!root) return () => { };

  const form = root.querySelector(
    '[data-form="superadmin"]'
  );

  if (!form) return () => { };

  // Mengambil email dan password administrator saat formulir dikirim.
  const handleSubmit = event => {
    // Mencegah pengiriman formulir memicu refresh halaman.
    event.preventDefault();

    const inputs = form.querySelectorAll(".field input");

    onSubmit?.({
      email: inputs[0]?.value || "",
      password: inputs[1]?.value || ""
    });
  };

  // Mengatur aksi tombol kembali dan tombol tampil/sembunyikan kata sandi.
  const handleClick = event => {

    const action = event.target.closest("[data-action]");

    if (!action) return;

    if (action.dataset.action === "back-login") {
      onBack?.();
    }

    if (action.dataset.action === "home") {
      onHome?.();
    }

    if (action.dataset.action === "toggle-password") {
      const input = form.querySelector(
        'input[name="superadmin-password"]'
      );

      if (!input) return;

      input.type =
        input.type === "password"
          ? "text"
          : "password";

      action.textContent =
        input.type === "password"
          ? "Lihat"
          : "Sembunyikan";
    }
  };

  // Mengaktifkan event submit dan click untuk halaman Super Admin.
  form.addEventListener("submit", handleSubmit);
  root.addEventListener("click", handleClick);

  return function unsubscribe() {
    form.removeEventListener("submit", handleSubmit);
    root.removeEventListener("click", handleClick);
  };
}