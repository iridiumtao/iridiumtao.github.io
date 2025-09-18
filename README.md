# Iridium Portfolio

A modern, responsive portfolio website built with Next.js, featuring a clean design, dark mode support, and dynamic content management.

## 🚀 Features

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Dynamic Content**: Easy content management through JSON configuration
- **Blog System**: Markdown-based blog posts with syntax highlighting
- **Development-Only Editor**: Live-edit content in your local development environment
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
   # Using yarn
   yarn install
   ```

3. **Start the development server:**
   ```bash
   yarn dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the portfolio. In this mode, the live editor will be available.

## 🔧 Building for Production

### Development Mode (with Live Editor)
To run the site locally with the live editor enabled, use:
```bash
yarn dev
```

### Production Build (Static Export)
To generate the static files for deployment, use:
```bash
yarn build
```
This will create an `out` directory with static files ready for deployment. The editor is disabled in this build.

### Running a Local Production Server
To preview the production build locally, you can use a simple server after building:
```bash
yarn build
npx serve out # preview the production build locally
```
*Note: `yarn start` will not work with a static export. `serve` is a simple alternative for local testing.*

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

### Deploying to GitHub Pages

This project is configured for easy deployment to a GitHub Pages User site (e.g., `username.github.io`).

1. **Run the deploy script:**
   ```bash
   yarn deploy
   ```
   This command will automatically build the static site and push the contents of the `out` directory to the `gh-pages` branch of your repository.

2. **Configure GitHub Pages (One-Time Setup):**
   - In your repository settings on GitHub, navigate to the "Pages" section.
   - For the source, select "Deploy from a branch".
   - Set the branch to `gh-pages` and the folder to `/ (root)`.
   - Save the settings.

Your site will be deployed and live after a few moments.

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

- `yarn dev` - Start development server with live editor
- `yarn build` - Build for production (static export)
- `yarn deploy` - Build and deploy to GitHub Pages
- `yarn lint` - Run ESLint

## 📦 Dependencies

### Main Dependencies
- **Next.js 15.5.3** - React framework
- **React 19.1.1** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **next-themes** - Dark mode support
- **gray-matter** - Front matter parser for blog posts
- **react-markdown** - Markdown renderer
- **GSAP** - Animation library

### Development Dependencies
- **ESLint 9.18.0** - Code linting
- **gh-pages** - Helper for deploying to GitHub Pages
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🙏 Acknowledgments

This portfolio is built upon the excellent [React Portfolio Template](https://github.com/chetanverma16/react-portfolio-template) created by [@chetanverma16](https://github.com/chetanverma16) (Chetan Verma). Special thanks for providing such a clean and well-structured foundation for building modern portfolio websites.

---

Built with ❤️ by Chun-Ju (Iridium) Tao
