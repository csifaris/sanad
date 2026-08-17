# 🩵 SANAD --- Social Support Management Platform

```{=html}
<p align="center">
```
`<strong>`{=html}SANAD Social Support Platform`</strong>`{=html}
```{=html}
</p>
```
```{=html}
<p align="center">
```
A digital platform for managing social support requests and connecting
beneficiaries, specialists, and supervisors through an organized
workflow.
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js">`{=html}
`<img src="https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript" alt="TypeScript">`{=html}
`<img src="https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite" alt="SQLite">`{=html}
`<img src="https://img.shields.io/badge/Status-In%20Development-2FAE9E?style=for-the-badge" alt="Status">`{=html}
```{=html}
</p>
```
```{=html}
<p align="center">
```
🇸🇦 `<a href="./README.ar.md">`{=html}النسخة العربية`</a>`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

## 📌 About the Project

**SANAD** is a web-based social support management platform designed to
simplify the process of submitting, reviewing, assigning, and tracking
support requests.

The platform provides role-based interfaces for:

-   👤 Beneficiaries
-   🧑‍💼 Specialists
-   🧑‍💼 Supervisors

The project aims to provide a simple, organized, and user-friendly
digital experience for managing social support requests.

## 🎯 Project Objectives

-   Simplify the process of submitting support requests.
-   Digitally organize beneficiary requests.
-   Allow specialists to review and manage requests.
-   Allow supervisors to assign requests to specialists.
-   Provide role-based access.
-   Track request statuses.
-   Provide a clean Arabic RTL interface.
-   Protect sensitive configuration and local database files.

## 👥 User Roles

### 👤 Beneficiary

-   Create a new support request.
-   Select the request type and priority.
-   View submitted requests.
-   View request details.
-   Track request status.

### 🧑‍💼 Specialist

-   View requests.
-   Review request details.
-   Manage assigned requests.
-   Update request status.

### 🧑‍💼 Supervisor

-   View requests.
-   Review request details.
-   Assign requests to specialists.
-   Follow up on the request workflow.

## 🔄 Request Workflow

``` text
Beneficiary
    │
    ▼
Create Request
    │
    ▼
Supervisor
Assign Specialist
    │
    ▼
Specialist
Review / Update
    │
    ▼
Request Status
```

## ✨ Main Features

-   🔐 Role-based authentication
-   👤 Beneficiary dashboard
-   🧑‍💼 Specialist dashboard
-   🧑‍💼 Supervisor dashboard
-   📝 Support request creation
-   📋 Request management
-   🔄 Request status updates
-   👥 Specialist assignment
-   📄 Request details
-   🎨 Arabic RTL interface
-   📱 Responsive design
-   🔒 Environment-based configuration
-   🗄️ SQLite database for local development

## 🛠️ Technologies

  Technology   Purpose
  ------------ ---------------------------
  Next.js      Web application framework
  React        User interface
  TypeScript   Application development
  CSS          Styling
  SQLite       Local database
  bcrypt       Password hashing
  Git          Version control
  GitHub       Source code hosting

## 📂 Project Structure

``` text
sanad/
├── app/
│   ├── api/
│   ├── beneficiary/
│   ├── login/
│   ├── register/
│   ├── specialist/
│   └── supervisor/
├── components/
├── lib/
├── public/
│   └── images/
├── .env.example
├── .gitignore
├── middleware.ts
├── package.json
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

``` bash
git clone https://github.com/csifaris/sanad.git
cd sanad
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Configure environment variables

Create:

``` text
.env.local
```

Use `.env.example` as a reference.

> ⚠️ Never upload `.env.local` to GitHub.

### 4. Run the development server

``` bash
npm run dev
```

Open:

``` text
http://localhost:3000
```

## 🔐 Security

Sensitive information is intentionally excluded from the repository.

The following are ignored:

``` text
.env.local
data/
.next/
node_modules/
scripts/
test-flows.mjs
.claude/
```

Only the template is included:

``` text
.env.example
```

Never commit:

-   Real passwords
-   API keys
-   Authentication secrets
-   Private keys
-   Production database files
-   Personal user data

> **Important:** If a real secret was ever committed to Git, consider it
> exposed and rotate/replace it even if the file was later deleted.

## 🖼️ Screenshots

Add project screenshots here when available:

``` md
![SANAD Login](./public/images/screenshots/login.png)
![Beneficiary Dashboard](./public/images/screenshots/beneficiary.png)
![Specialist Dashboard](./public/images/screenshots/specialist.png)
![Supervisor Dashboard](./public/images/screenshots/supervisor.png)
```

## 👨‍💻 Project Team

  -----------------------  ---------------------------------------------------------------
  Name                      GitHub
  -----------------------  ------------------------------------------
  **Faris**                [@csifaris](https://github.com/csifaris)
                                          

  **Name**                 [@username](https://github.com/username)

  **Name**                 [@username](https://github.com/username)

  **Name**               [@username](https://github.com/username)
  
   **Name**               [@username](https://github.com/username)

   **Name**               [@username](https://github.com/username)

     **Name**               [@username](https://github.com/username)
  ------------------------------------------------------------------------------------------

> Replace the placeholder rows with the actual project members.

## 🔗 Links

 


دد




------------------------------------------------------------------------

```{=html}
<p align="center">
```
`<strong>`{=html}SANAD`</strong>`{=html}`<br>`{=html} Social Support
Management Platform`<br>`{=html}`<br>`{=html} Built with ❤️ using
Next.js & TypeScript
```{=html}
</p>
```
