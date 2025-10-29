# 🧩 Collab Blog Frontend

Frontend web application for the **Collaborative Multi-Author Blog Platform**, built with **Angular 16+**.  
It features a modern and responsive UI, **role-based access control**, **real-time comments** via **Socket.io**, and **seamless integration** with the Node.js backend service.

---

## 🚀 Features

- 🧠 **Angular 16+** with modular architecture  
- 🔐 **JWT Authentication** and Role-Based Access Control (RBAC)  
- 💬 **Real-time comments** using Socket.io  
- 📊 **Admin and Writer Dashboards**  
- 🌐 **Responsive Material Design UI**  
- 🧩 **Reusable shared components and pipes**  
- 🧰 **Environment-based configuration**  
- 🧾 **RESTful API integration** with backend services

---

## 🎨 Styling and Theming (Tailwind CSS)

This project uses **Tailwind CSS** for standardized, utility-first styling. This replaces custom SCSS for general component styling, focusing on efficiency and consistency.

### 1. Installation

Tailwind CSS and its dependencies are installed using npm:

```bash
npm install -D tailwindcss postcss autoprefixer
```

### 2. Configuration
The configuration files (tailwind.config.js and postcss.config.js) are set up to:

Purge CSS only used utility classes by scanning all files in the content array.

Enable Dark Mode using the class strategy.

tailwind.config.js excerpt:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Use the 'class' strategy for manual dark mode toggling
  darkMode: 'class', 
  content: [
    './src/**/*.{html,ts}',
    // Add other paths if necessary
  ],
  theme: {
    extend: {
      colors: {
        'primary-brand': '#10b981',
        'secondary-brand': '#3b82f6',
        'accent': '#f59e0b',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
      },
    },
  },
  plugins: [],
}
```
### 3. Usage
Utility classes are imported into the global styles file (src/styles/tailwind.css or equivalent) and applied directly to components:

```html
<div class="p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
  <h2 class="text-xl font-bold text-primary-brand dark:text-emerald-400">
    Tailwind Styled Title
  </h2>
</div>
```

---
## 🛠️ Setup Instructions

### 1️⃣ Prerequisites

Ensure you have installed:
- Node.js (v18+)
- Angular CLI (v16+)
- npm or yarn

### 2️⃣ Installation

```bash
# Clone the repository
git clone <your_repo_url>

# Navigate into the project
cd collab-blog-frontend

# Install dependencies
npm install
```

### 3️⃣ Environment Configuration

Create a `.env` file in the project root using the provided `.env.example` template:

```bash
cp .env.example .env
```

### 4️⃣ Run the Development Server

```bash
npm start
```

or with Angular CLI:

```bash
ng serve
```

Then open your browser at:
```
http://localhost:4200
```

---

## 🌍 Environment Variables

These values are managed via `.env` and loaded into Angular’s `environment.ts` file.

| Variable | Description | Example |
|-----------|--------------|----------|
| `API_URL` | Backend API base URL | `http://localhost:5000/api/v1` |
| `SOCKET_URL` | WebSocket server URL | `http://localhost:5000` |
| `APP_NAME` | Application name | `Collab Blog` |
| `TOKEN_KEY` | Access token storage key | `cb_access_token` |
| `REFRESH_TOKEN_KEY` | Refresh token storage key | `cb_refresh_token` |
| `PRODUCTION` | Build mode flag | `false` |

---

## 🧱 Project Structure

```
.
├── angular.json
├── LICENSE
├── package.json
├── public
│   ├── favicon.ico
│   └── images
│       └── blog.jpg
├── README.md
└── src
    ├── app
    │   ├── app.component.ts
    │   ├── app.config.server.ts
    │   ├── app.config.ts
    │   ├── app.html
    │   ├── app.routes.server.ts
    │   ├── app.routes.ts
    │   ├── app-routing.module.ts
    │   ├── app.scss
    │   ├── app.spec.ts
    │   ├── app.ts
    │   ├── articles
    │   │   ├── article-detail
    │   │   ├── articles-list
    │   │   ├── articles.routes.ts
    │   │   ├── edit
    │   │   ├── list
    │   │   └── view
    │   ├── auth
    │   │   ├── auth.module.ts
    │   │   ├── auth.routes.ts
    │   │   ├── auth-routing.module.ts
    │   │   ├── auth.service.ts
    │   │   ├── login
    │   │   └── register
    │   ├── blog
    │   │   ├── blog-detail
    │   │   └── blog.module.ts
    │   ├── core
    │   │   ├── auth.module.ts
    │   │   ├── components
    │   │   ├── core.module.ts
    │   │   ├── guards
    │   │   ├── interceptors
    │   │   ├── models
    │   │   └── services
    │   ├── dashboards
    │   │   ├── admin
    │   │   ├── editor
    │   │   └── writer
    │   ├── home
    │   │   ├── blog-list.component.html
    │   │   ├── blog-list.component.scss
    │   │   ├── blog-list.component.ts
    │   │   ├── blog-list.module.ts
    │   │   └── blog-list-routing.module.ts
    │   ├── material.provider.ts
    │   └── shared
    │       ├── components
    │       ├── pipes
    │       ├── services
    │       └── shared.module.ts
    ├── environments
    │   └── environment.ts
    ├── index.html
    ├── main.ts
    ├── styles
    │   └── variables.scss
    └── styles.scss
```

---

## 📦 Build for Production

```bash
ng build --configuration production
```

The compiled output will be located in the `dist/` folder.

---

## 🧑‍💻 Author

**Raed R’dhaounia**  
Software Engineer • Angular & Node.js Developer

---

## 🪪 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.
```

---

If you want, I can **also give you a ready-to-run terminal command** to create this `.md` file with all ````` code blocks in one shot. Do you want me to do that?
