import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Search, Tag } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.aerwiz.com/api';

const CATEGORIES = ['All', 'Travel Tips', 'Destination Guides', 'Flight Deals', 'News', 'Visa & Immigration'];

// Fallback placeholder posts shown while backend is being set up
const PLACEHOLDER_POSTS = [
  {
    id: 1, slug: 'cheapest-flights-lagos-london',
    title: 'How to Find the Cheapest Flights from Lagos to London',
    excerpt: 'With the right strategy and timing, you can save up to 40% on your Lagos to London airfare. Here\'s everything you need to know.',
    category: 'Travel Tips', author: 'Aerwiz Team',
    readTime: '5 min read', publishedAt: '2026-03-15',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
  },
  {
    id: 2, slug: 'dubai-travel-guide-nigerians',
    title: 'Dubai Travel Guide for Nigerians: Visa, Costs & Best Times to Visit',
    excerpt: 'Dubai is one of the most popular destinations from Nigeria. This complete guide covers everything from visa requirements to what to pack.',
    category: 'Destination Guides', author: 'Aerwiz Team',
    readTime: '8 min read', publishedAt: '2026-03-10',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
  },
  {
    id: 3, slug: 'best-airlines-nigeria-2026',
    title: 'Best Airlines Flying Out of Nigeria in 2026',
    excerpt: 'We analysed thousands of flights to bring you the definitive ranking of airlines serving Nigeria — ranked by price, comfort and reliability.',
    category: 'News', author: 'Aerwiz Team',
    readTime: '6 min read', publishedAt: '2026-03-05',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80',
  },
  {
    id: 4, slug: 'uk-visa-nigerians-guide',
    title: 'UK Visa Application Guide for Nigerians (2026)',
    excerpt: 'Step-by-step guide to applying for a UK Standard Visitor Visa from Nigeria, including required documents, fees, and processing times.',
    category: 'Visa & Immigration', author: 'Aerwiz Team',
    readTime: '10 min read', publishedAt: '2026-02-28',
    image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=600&q=80',
  },
  {
    id: 5, slug: 'flight-deals-april-2026',
    title: 'Top Flight Deals from Nigeria This April',
    excerpt: 'April is a great month for affordable international travel from Nigeria. Here are the best deals we\'ve found across all major routes.',
    category: 'Flight Deals', author: 'Aerwiz Team',
    readTime: '4 min read', publishedAt: '2026-02-20',
    image: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=600&q=80',
  },
  {
    id: 6, slug: 'nairobi-weekend-guide',
    title: 'Nairobi in a Weekend: The Nigerian Traveller\'s Guide',
    excerpt: 'Nairobi is just a short hop from Lagos. Here\'s how to make the most of 48 hours in Kenya\'s vibrant capital city.',
    category: 'Destination Guides', author: 'Aerwiz Team',
    readTime: '7 min read', publishedAt: '2026-02-14',
    image: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=600&q=80',
  },
];

const BlogPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState(PLACEHOLDER_POSTS);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${API_URL}/blog`);
        if (res.data?.data?.length > 0) setPosts(res.data.data);
      } catch {
        // Use placeholder posts — backend blog endpoint not yet set up
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filtered = posts.filter(p => {
    const matchCat = category === 'All' || p.category === category;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-white">

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16 px-4 text-center">
        <p className="text-blue-300 text-sm font-bold uppercase tracking-widest mb-3">Aerwiz Blog</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Travel Smarter</h1>
        <p className="text-blue-200 max-w-md mx-auto text-sm leading-relaxed">
          Flight tips, destination guides, visa information, and the best deals — all written for Nigerian travellers.
        </p>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-10">

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${category === c ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 font-semibold">No articles found</p>
            <button onClick={() => { setSearch(''); setCategory('All'); }} className="mt-3 text-blue-600 text-sm font-semibold hover:underline">Clear filters</button>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <div
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden mb-8 cursor-pointer group"
                onClick={() => navigate(`/blog/${featured.slug || featured.id}`)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative h-56 md:h-full overflow-hidden">
                    <img
                      src={featured.image}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80'; }}
                    />
                    <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Featured</span>
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Tag className="w-3 h-3" />{featured.category}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{featured.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(featured.publishedAt)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{featured.readTime}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-blue-600 text-sm font-bold">
                      <span>Read article</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rest of posts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map(post => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden cursor-pointer group"
                  onClick={() => navigate(`/blog/${post.slug || post.id}`)}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80'; }}
                    />
                    <span className="absolute top-3 left-3 bg-white/90 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(post.publishedAt)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
