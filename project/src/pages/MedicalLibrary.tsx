import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, BookOpen, Bookmark, BookmarkCheck, ArrowLeft, Tag,
  Calendar, Wifi, FileText, ChevronRight, X,
} from 'lucide-react';
import { Card, PageHeader, Badge, EmptyState, SectionTitle } from '@/components/ui';
import { useData } from '@/context/DataContext';
import { libraryArticles } from '@/data/demoData';
import { formatDate } from '@/lib/medUtils';
import type { LibraryArticle } from '@/types';

const categories = ['All', ...Array.from(new Set(libraryArticles.map((a) => a.category)))];

export default function MedicalLibrary() {
  const { bookmarks, toggleBookmark } = useData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [selected, setSelected] = useState<LibraryArticle | null>(null);

  const filtered = useMemo(() => {
    let list = [...libraryArticles];
    if (category !== 'All') list = list.filter((a) => a.category === category);
    if (showBookmarked) list = list.filter((a) => bookmarks.some((b) => b.articleId === a.id));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.content.toLowerCase().includes(q),
      );
    }
    return list;
  }, [search, category, showBookmarked, bookmarks]);

  const bookmarkedIds = new Set(bookmarks.map((b) => b.articleId));

  if (selected) {
    const related = libraryArticles.filter((a) => a.category === selected.category && a.id !== selected.id).slice(0, 3);
    return (
      <div>
        <button onClick={() => setSelected(null)} className="btn btn-ghost mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Library
        </button>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="primary">{selected.category}</Badge>
              <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{selected.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(selected.publishedDate)}</span>
                <span className="flex items-center gap-1"><Wifi className="h-3 w-3" /> Available offline</span>
              </div>
            </div>
            <button onClick={() => toggleBookmark(selected.id)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800" aria-label="Toggle bookmark">
              {bookmarkedIds.has(selected.id) ? <BookmarkCheck className="h-5 w-5 text-primary-500" /> : <Bookmark className="h-5 w-5" />}
            </button>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">{selected.summary}</p>
          <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {selected.content}
          </div>
          <div className="mt-6 border-t border-gray-100 pt-4 dark:border-slate-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">Source: {selected.source}</p>
          </div>
        </Card>

        {related.length > 0 && (
          <div className="mt-6">
            <SectionTitle className="mb-3">Related Articles</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((a) => (
                <button key={a.id} onClick={() => setSelected(a)} className="card p-4 text-left transition hover:border-primary-300 hover:shadow-md">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{a.title}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{a.summary}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">Read <ChevronRight className="h-3 w-3" /></span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Offline Medical Library" subtitle="Browse health articles bundled with the app. Available without internet after initial load." />

      <div className="mb-4 flex items-center gap-2">
        <Badge variant="success"><Wifi className="h-3 w-3" /> All articles available offline</Badge>
        <span className="text-xs text-gray-500 dark:text-gray-400">{libraryArticles.length} articles bundled</span>
      </div>

      {/* Search & filters */}
      <Card className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input className="input pl-10" placeholder="Search by title, keyword or content..." value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X className="h-4 w-4" /></button>}
          </div>
          <button onClick={() => setShowBookmarked((v) => !v)} className={`btn whitespace-nowrap ${showBookmarked ? 'btn-primary' : 'btn-outline'}`}>
            {showBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {showBookmarked ? 'Bookmarked' : 'Show Saved'}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${category === c ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300'}`}>
              {c}
            </button>
          ))}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-10 w-10" />} title="No articles found" message="Try a different search or category." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <Card key={article.id} className="flex flex-col">
              <div className="flex items-start justify-between">
                <Badge variant="primary">{article.category}</Badge>
                <button onClick={() => toggleBookmark(article.id)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800" aria-label="Toggle bookmark">
                  {bookmarkedIds.has(article.id) ? <BookmarkCheck className="h-4 w-4 text-primary-500" /> : <Bookmark className="h-4 w-4" />}
                </button>
              </div>
              <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">{article.title}</h3>
              <p className="mt-1 flex-1 text-sm text-gray-600 dark:text-gray-400">{article.summary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {article.tags.slice(0, 3).map((t) => (
                  <span key={t} className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-slate-800 dark:text-gray-400">
                    <Tag className="h-2 w-2" /> {t}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">{formatDate(article.publishedDate)}</span>
                <button onClick={() => setSelected(article)} className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                  Read more <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-start gap-2 rounded-xl bg-secondary-50 p-3 text-xs text-secondary-700 dark:bg-secondary-700/10 dark:text-secondary-400">
        <FileText className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Articles are bundled sample educational content, not clinically verified medical advice. Always consult a qualified healthcare professional for medical concerns.</p>
      </div>
    </div>
  );
}
