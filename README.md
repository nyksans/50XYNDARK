# GeBill - Bill Management System

📃 Modern bill management system that helps you scan, track, and analyze your bills with ease. Built with React, TypeScript, and Python, featuring a clean UI and powerful analytics.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- PWA support

### Backend

- Python
- Excel file processing

## Features

- Bill scanning and processing
- Dashboard with bill analytics
- Template management
- Historical bill tracking
- Responsive design
- Dark/Light mode support

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python 3.x
- npm or bun

### Frontend Setup

```bash
# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:5173`

### Backend Setup

```bash
cd pythonbackend
pip install -r requirements.txt
python main.py
```

## Project Structure

```
├── src/                # Frontend source code
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and API clients
│   └── pages/         # Application pages
├── pythonbackend/     # Python backend
└── public/            # Static assets
```

## Development

- Built with Vite for fast development and optimal production builds
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui for consistent UI components
- Progressive Web App (PWA) capabilities

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
