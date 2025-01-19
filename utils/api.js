// utils/api.js
import fs from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import markdownToHtml from './markdownToHtml';

const postsDirectory = join(process.cwd(), '_posts');

export function getAllPosts(fields = []) {
    if (!fs.existsSync(postsDirectory)) {
        console.warn('Posts directory does not exist:', postsDirectory);
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPosts = fileNames
        .filter(fileName => fileName.endsWith('.md'))
        .map(fileName => {
            // Remove .md extension to get slug
            const slug = fileName.replace(/\.md$/, '');
            const fullPath = join(postsDirectory, fileName);

            // Read markdown file
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data } = matter(fileContents);

            // Always include slug in the returned data
            const items = { slug };

            // Add other requested fields
            fields.forEach((field) => {
                if (data[field]) {
                    items[field] = data[field];
                }
            });

            return items;
        })
        .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));

    return allPosts;
}

export async function getPostBySlug(slug, fields = []) {
    const fullPath = join(postsDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
        console.error('File does not exist:', fullPath);
        return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const items = {};

    for (const field of fields) {
        if (field === 'slug') {
            items[field] = slug;
        }
        if (field === 'content') {
            items[field] = await markdownToHtml(content);
        }
        if (data[field]) {
            items[field] = data[field];
        }
    }

    return items;
}