# Manga Reader

A modern, responsive, and feature-rich manga reading web application built with Next.js 15, React 19, and TypeScript.

## ✨ Features

- 🚀 **Modern Stack**: Built with Next.js 15 (App Router), React 19, and TypeScript
- 🎨 **Beautiful UI**: Clean and responsive design with Shadcn UI and Tailwind CSS
- 📱 **Mobile-First**: Fully responsive layout that works on all devices
- 🔍 **Advanced Search**: Powerful search functionality with filters and sorting
- 📚 **Manga Library**: Browse and read thousands of manga titles
- 🔖 **Reading History**: Track your reading progress
- ⚡ **Performance Optimized**: Fast page loads and smooth scrolling
- 🌓 **Dark Mode**: Built-in dark/light theme support

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **UI Components**: Radix UI Primitives
- **Linting/Formatting**: ESLint, Prettier

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/manga-reader.git
   cd manga-reader
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your environment variables:
   ```env
   DATABASE_URL="your_database_url_here"
   NEXTAUTH_SECRET="your_nextauth_secret_here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
src/
├── app/                    # App Router pages and layouts
├── components/             # Reusable UI components
│   ├── feature/           # Feature-specific components
│   ├── layout/            # Layout components
│   └── ui/                # Shadcn UI components
├── lib/                    # Utility functions and configurations
├── public/                 # Static files
└── styles/                 # Global styles
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
