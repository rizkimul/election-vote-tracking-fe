# Election Vote Tracking Dashboard

A modern, interactive, and responsive web application designed for visualizing election data, managing participant activities, and tracking attendance in real-time.

## 🌟 Features

- **📊 Comprehensive Analytics:**
  - Real-time visualization of attendance data using **Recharts**.
  - Demographic breakdown (Age groups, Gender distribution).
  - Geographical distribution analysis.
- **🗺 Interactive Mapping:**
  - Map visualization of participation levels by region using **Leaflet**.
  - Geographic markers and heatmaps for field activity tracking.
- **📋 Management Modules:**
  - **Activity Tracking:** Create, edit, and monitor election events and activities.
  - **Participant Management:** Search, filter, and manage participant records (NIK/NIS).
  - **Prioritization Layer:** Data-driven logic to identify focus areas for election strategy.
- **📥 Data Portability:**
  - Bulk import participants from Excel.
  - Export data and reports to **PDF** and **Excel** formats.
- **🔒 Secure Access:**
  - Complete authentication flow (Login, Registration, Protected Routes).
  - Profile management and role-based views.
- **🌓 Modern UI/UX:**
  - Built with **Tailwind CSS** and **Radix UI** for a premium feel.
  - Responsive design supporting Desktop, Tablet, and Mobile.
  - Dark Mode support with seamless transitions.

## 🛠 Tech Stack

- **Framework:** [React 18](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **Maps:** [Leaflet](https://leafletjs.com/)
- **Forms:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn

## ⚙️ Setup Instructions

1. **Clone the repository:**
   ```bash
   cd front-end/Election Vote Tracking Dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file based on `.env.example`:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

## 🏃 Running the Application

Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## 🏗 Building for Production

To create an optimized production build:
```bash
npm run build
```
The output will be in the `dist` directory.

## 🧪 Testing

Run unit tests with Vitest:
```bash
npm test
```
