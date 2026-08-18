# 🌿 Sanad – Social Services & Support Platform

Sanad is a web-based platform designed to simplify the process of submitting, managing, and tracking social support requests.

The platform connects beneficiaries with the appropriate social specialists and provides an organized workflow for reviewing and following up on requests until they are resolved.

---

## 🎯 Project Overview

The main problem addressed by Sanad is the difficulty beneficiaries may face when trying to reach the appropriate specialist and track the status of their requests.

Sanad provides a centralized platform where beneficiaries can submit their needs, while the system categorizes and routes requests to the appropriate specialist.

---

## 👥 User Roles

### Beneficiary

* Create an account and log in.
* Submit a new request.
* Select the type of support needed.
* View request details.
* Track request status.
* View updates from the specialist.

### Social Worker

* Receive assigned requests.
* Review request details.
* Update request status.
* Add notes and updates.
* Follow up on requests until resolution.

### Supervisor

* Monitor all requests.
* Manage social workers.
* View request statistics.
* Monitor request statuses.

---

## 📝 Request Types

The platform supports five main types of requests:

* 🏠 Housing
* 🏥 Health
* 🧠 Psychological Support
* 💍 Marriage
* 🎓 Education

---

## 🔄 Request Workflow

```text
New Request
     ↓
Under Review
     ↓
Under Follow-up
     ↓
Resolved
     ↓
Closed
```

---

## 🔀 Automatic Request Routing

When a beneficiary submits a request, the system uses the selected request type to direct the request to the appropriate specialist.

### Example

```text
Beneficiary
     ↓
Education Request
     ↓
System Routing
     ↓
Education Specialist
     ↓
Review & Follow-up
     ↓
Resolved
```

---

## ⭐ Main Features

* Submit social support requests.
* Automatic request routing.
* Request status tracking.
* Specialist request management.
* Beneficiary dashboard.
* Supervisor dashboard.
* Request updates and follow-up.
* Local database management.

---

## 🛠️ Technologies

* Next.js
* React
* TypeScript
* Tailwind CSS
* Node.js
* SQLite
* better-sqlite3

---

## 📂 Project Structure

```text
sanad/
├── app/
├── components/
├── lib/
├── public/
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/csifaris/sanad.git
```

### 2. Open the Project

```bash
cd sanad
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a local environment file from `.env.example`.

**Windows:**

```bash
copy .env.example .env.local
```

**macOS / Linux:**

```bash
cp .env.example .env.local
```



### 5. Run the Project

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

---

## 🗄️ Database

Sanad uses SQLite with `better-sqlite3`.

The local database and sensitive configuration files are excluded from the Git repository to protect private data.

---

## 🎓 Academic Affiliation

Developed as part of the **SDAIA Academy** program.

<p align="center">
  <a href="https://github.com/SDAIAAcademy">
    <img src="https://img.shields.io/badge/SDAIA%20Academy-GitHub-181717?style=for-the-badge&logo=github" alt="SDAIA Academy on GitHub">
  </a>
</p>

---

## 👨‍💻 Project Team

### 1. FARIS ALMUSHRAFI

<p align="center">
  <a href="https://github.com/csifaris">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Team Member 1 GitHub">
  </a>
</p>

---

### 2. Khalid saleh

<p align="center">
  <a href="(https://github.com/khaledsaleh1424-sudo)">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Team Member 2 GitHub">
  </a>
</p>

---

### 3. Salman Alhammad

<p align="center">
  <a href="https://github.com/engalhammad">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Team Member 3 GitHub">
  </a>
</p>

---

### 4. Rana Alzhrani

<p align="center">
  <a href="https://github.com/RiixR1">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Team Member 4 GitHub">
  </a>
</p>

---

### 5. Rand Alanazi

<p align="center">
  <a href="Team Member 5 GitHub URL">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Team Member 5 GitHub">
  </a>
</p>

---

### 6. Raeed Alharbi

<p align="center">
  <a href="https://github.com/RaeedAlharbi">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Team Member 6 GitHub">
  </a>
</p>

---

### 7. Afaf AlMutairi

<p align="center">
  <a href="Team Member 7 GitHub URL">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Team Member 7 GitHub">
  </a>
</p>


---

<p align="center">
  <strong>Sanad – Social Services & Support Platform</strong>
</p>
