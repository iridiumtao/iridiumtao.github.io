# Iridium Portfolio

A modern, responsive portfolio website built with Next.js, featuring a clean design, dark mode support, and dynamic content management.

## 🚀 Features

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Dynamic Content**: Easy content management through JSON configuration
- **Blog System**: Markdown-based blog posts with syntax highlighting
- **Resume Section**: Dedicated resume page with detailed experience
- **Static Export**: Optimized for static hosting and deployment
- **Modern Stack**: Built with Next.js, React, and Tailwind CSS

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 16 or higher)
- npm or yarn package manager

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd iridium-portfolio
   ```

2. **Install dependencies:**
   ```bash
   # Using npm
   npm install

   # Using yarn
   yarn install
   ```

3. **Start the development server:**
   ```bash
   # Using npm
   npm run dev

   # Using yarn
   yarn dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the portfolio.

## 🔧 Building for Production

### Development Build
```bash
npm run dev
# or
yarn dev
```

### Production Build
```bash
npm run build
# or
yarn build
```

### Start Production Server
```bash
npm run start
# or
yarn start
```

### Start Server Mode (without static export)
```bash
# Build and start in server mode using environment variable
NODE_ENV=development yarn build && NODE_ENV=development yarn start
```

### Static Export (for hosting on GitHub Pages, Netlify, etc.)
The project is configured to generate a static export by default in production:
```bash
npm run build
```
This will create an `out` directory with static files ready for deployment.

## 📝 Content Management

### Editing Personal Information & Experiences

The main content is managed through the `data/portfolio.json` file. This file contains all your personal information, projects, work experiences, and resume data.

#### Key sections to edit:

1. **Personal Information:**
   ```json
   {
     "name": "Your Name",
     "headerTaglineOne": "Hi there (ﾉ´∀｀*)",
     "headerTaglineTwo": "I'm Your Name,",
     "headerTaglineThree": "Your Title/Position",
     "headerTaglineFour": "Your description"
   }
   ```

2. **Social Links:**
   ```json
   "socials": [
     {
       "title": "Github",
       "link": "https://github.com/yourusername"
     },
     {
       "title": "LinkedIn", 
       "link": "https://linkedin.com/in/yourprofile"
     }
   ]
   ```

3. **Projects:**
   ```json
   "projects": [
     {
       "id": "1",
       "title": "Project Title",
       "subtitle": "Project Subtitle",
       "description": "Project description",
       "imageSrc": "Image URL",
       "url": "Project URL"
     }
   ]
   ```

4. **Work Experience:**
   ```json
   "services": [
     {
       "id": "1",
       "title": "Job Title, Company Name",
       "description": "Job description and achievements"
     }
   ]
   ```

5. **Resume Experiences:**
   ```json
   "resume": {
     "experiences": [
       {
         "id": "1",
         "dates": "Start Date - End Date",
         "type": "Job Type (Internship/Full-time)",
         "position": "Position at Company",
         "location": "Location",
         "bullets": [
           "Achievement or responsibility 1",
           "Achievement or responsibility 2"
         ]
       }
     ]
   }
   ```

6. **Education:**
   ```json
   "education": [
     {
       "universityName": "University Name",
       "universityDate": "Graduation Date",
       "location": "Location",
       "degree": "Degree Name",
       "gpa": "GPA",
       "relevantCoursework": ["Course 1", "Course 2"]
     }
   ]
   ```

7. **Skills:**
   ```json
   "skills": {
     "languages": ["Python", "JavaScript", "Java"],
     "softwareAndOS": ["Docker", "AWS", "Git"]
   }
   ```

### Adding Blog Posts

Blog posts are stored in the `_posts/` directory as Markdown files. To add a new blog post:

1. Create a new `.md` file in the `_posts/` directory
2. Add front matter at the top of the file:
   ```markdown
   ---
   title: "Your Blog Post Title"
   date: "2024-01-01"
   excerpt: "A brief description of your post"
   ---
   
   # Your Blog Content
   
   Write your blog content here using Markdown syntax.
   ```

## 🚀 Deployment

### GitHub Pages with GitHub Actions

To set up automatic deployment to GitHub Pages using GitHub Actions:

1. **Create the workflow directory:**
   ```bash
   mkdir -p .github/workflows
   ```

2. **Create the deployment workflow file:**
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main, master ]
     pull_request:
       branches: [ main, master ]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       
       steps:
       - name: Checkout
         uses: actions/checkout@v4

       - name: Setup Node.js
         uses: actions/setup-node@v4
         with:
           node-version: '18'
           cache: 'npm'

       - name: Install dependencies
         run: npm ci

       - name: Build
         run: npm run build

       - name: Deploy to GitHub Pages
         uses: peaceiris/actions-gh-pages@v3
         if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
         with:
           github_token: ${{ secrets.GITHUB_TOKEN }}
           publish_dir: ./out
           cname: your-custom-domain.com  # Optional: add your custom domain
   ```

3. **Configure GitHub Pages:**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set source to "Deploy from a branch"
   - Select `gh-pages` branch and `/ (root)` folder
   - Save the settings

4. **Update next.config.js for GitHub Pages:**
   If deploying to a repository that's not your username.github.io, update the `next.config.js`:
   ```javascript
   const isProd = process.env.NODE_ENV === 'production'
   const nextConfig = {
     basePath: isProd ? '/your-repository-name' : '',
     assetPrefix: isProd ? '/your-repository-name/' : '',
     // ... rest of config
   }
   ```

### Other Deployment Options

- **Vercel**: Connect your GitHub repository to Vercel for automatic deployments
- **Netlify**: Deploy the `out` folder to Netlify
- **Static Hosting**: Upload the `out` folder to any static hosting service

## 📁 Project Structure

```
iridium-portfolio/
├── _posts/                 # Blog posts (Markdown files)
├── animations/             # Animation utilities
├── components/             # React components
│   ├── BlogEditor/         # Blog editing interface
│   ├── Button/             # Reusable button component
│   ├── ContentSection/     # Content layout component
│   ├── Cursor/             # Custom cursor component
│   ├── Footer/             # Footer component
│   ├── Header/             # Header/navigation component
│   ├── ProjectCard/        # Project display cards
│   ├── ProjectResume/      # Resume project section
│   ├── Socials/            # Social media links
│   └── WorkCard/           # Work experience cards
├── data/
│   └── portfolio.json      # Main content configuration
├── docs/                   # Documentation and assets
├── pages/                  # Next.js pages
│   ├── api/                # API routes
│   ├── blog/               # Blog pages
│   ├── _app.js             # App wrapper
│   ├── edit.js             # Content editing page
│   ├── index.js            # Homepage
│   └── resume.js           # Resume page
├── public/                 # Static assets
├── styles/                 # CSS styles
├── utils/                  # Utility functions
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies and scripts
└── tailwind.config.js      # Tailwind CSS configuration
```

## 🎨 Customization

### Styling
- The project uses Tailwind CSS for styling
- Global styles are in `styles/globals.css`
- Markdown styles are in `styles/markdown.css`
- Dark mode is handled by `next-themes`

### Components
- All components are modular and located in the `components/` directory
- Each component has its own directory with an `index.js` file

### Configuration
- `next.config.js`: Next.js configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `postcss.config.js`: PostCSS configuration

## 🛠️ Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📦 Dependencies

### Main Dependencies
- **Next.js 15.1.5** - React framework
- **React 19.0.0** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **next-themes** - Dark mode support
- **gray-matter** - Front matter parser for blog posts
- **react-markdown** - Markdown renderer
- **GSAP** - Animation library

### Development Dependencies
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🙏 Acknowledgments

This portfolio is built upon the excellent [React Portfolio Template](https://github.com/chetanverma16/react-portfolio-template) created by [@chetanverma16](https://github.com/chetanverma16) (Chetan Verma). Special thanks for providing such a clean and well-structured foundation for building modern portfolio websites.

---

Built with ❤️ by Chun-Ju (Iridium) Tao
