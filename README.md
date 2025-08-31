# Frontend COURSESheet Application

This is the frontend part of the COURSESheet application built using React and TailwindCSS. The application provides a platform for users to learn and practice Data Structures and Algorithms (DSA) through various categories and topics.

## Features

- User authentication with JWT and Google OAuth
- Role-based access control for different user roles (e.g., user, admin)
- Responsive UI built with TailwindCSS
- Dynamic COURSEcontent management

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   ```

2. Navigate to the frontend directory:

   ```
   cd mern-dsa-sheet-app/frontend
   ```

3. Install the dependencies:

   ```
   npm install
   ```

### Running the Application

To start the development server, run:

```
npm start
```

The application will be available at `http://localhost:3000`.

### Folder Structure

- `src/components`: Contains reusable components such as authentication forms, navigation bar, and COURSEcontent display.
- `src/pages`: Contains the main pages of the application, including Home, Dashboard, and Admin.
- `src/tailwind.css`: Contains the TailwindCSS styles for the application.
- `src/App.js`: Main application component that sets up routing.

### Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

### License

This project is licensed under the MIT License. See the LICENSE file for details.
