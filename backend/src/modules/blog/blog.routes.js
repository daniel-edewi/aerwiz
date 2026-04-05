const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { protect, adminOnly } = require('../../middleware/auth');

// GET /api/blog — public, all published posts
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true, slug: true, title: true, excerpt: true,
        category: true, image: true, readTime: true,
        publishedAt: true, author: true,
      },
    });
    res.json({ success: true, data: posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

// GET /api/blog/:slug — public, single post
router.get('/:slug', async (req, res) => {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { OR: [{ slug: req.params.slug }, { id: parseInt(req.params.slug) || 0 }], published: true },
    });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch post' });
  }
});

// POST /api/blog — admin only, create post
router.post('/', protect, adminOnly, async (req, res) => {
  const { title, slug, excerpt, content, category, image, readTime, published } = req.body;
  if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content are required' });
  try {
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        excerpt: excerpt || '',
        content,
        category: category || 'General',
        image: image || '',
        readTime: readTime || '5 min read',
        published: published !== undefined ? published : true,
        publishedAt: new Date(),
        author: `${req.user.firstName} ${req.user.lastName}`,
      },
    });
    res.json({ success: true, data: post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

// PATCH /api/blog/:id — admin only, update post
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const post = await prisma.blogPost.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update post' });
  }
});

// DELETE /api/blog/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await prisma.blogPost.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
});

module.exports = router;
