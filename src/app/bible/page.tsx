'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { books, getBooksByTestament, getBookById } from '@/data/bibles';
import { bibleAPI, BibleVerse, BibleChapter, TRANSLATIONS, TRANSLATION_DISPLAY_NAMES, Translation } from '@/lib/bible-api';
import { Search, BookOpen, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import EnhancedBibleReader from '@/components/features/EnhancedBibleReader';

export default function BiblePage() {
  const [selectedTestament, setSelectedTestament] = useState<'old' | 'new'>('old');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<Translation>('kjv');
  const [isLoading, setIsLoading] = useState(false);
  const [chapterData, setChapterData] = useState<BibleChapter | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testamentBooks = getBooksByTestament(selectedTestament);
  const filteredBooks = testamentBooks.filter(book =>
    book.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentBook = selectedBook ? getBookById(selectedBook) : null;

  // Load chapter data when book and chapter are selected
  useEffect(() => {
    if (selectedBook && selectedChapter) {
      loadChapter();
    }
  }, [selectedBook, selectedChapter, selectedTranslation]);

  const loadChapter = async () => {
    if (!selectedBook || !selectedChapter) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await bibleAPI.getChapter(selectedBook, selectedChapter, selectedTranslation);
      setChapterData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chapter');
      setChapterData(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedBook && selectedChapter) {
    // Render chapter view
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => setSelectedChapter(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chapters
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{currentBook?.name} {selectedChapter}</h1>
              <p className="text-muted-foreground">{chapterData?.translation_name || 'Loading...'}</p>
            </div>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-6 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading chapter...</span>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-red-500">{error}</p>
                <Button className="mt-4" onClick={loadChapter}>Retry</Button>
              </CardContent>
            </Card>
          ) : chapterData ? (
            <Card>
              <CardContent className="p-6">
                <EnhancedBibleReader
                  book={selectedBook}
                  chapter={selectedChapter}
                  translation={selectedTranslation}
                  verses={chapterData.verses}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </Layout>
    );
  }

  if (selectedBook) {
    // Render chapters view
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => setSelectedBook(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Books
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{currentBook?.name}</h1>
              <p className="text-muted-foreground">{selectedTestament === 'old' ? 'Old Testament' : 'New Testament'} • {currentBook?.chapters} chapters</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: currentBook?.chapters || 0 }, (_, i) => (
              <Button
                key={i + 1}
                variant="outline"
                className="h-16"
                onClick={() => setSelectedChapter(i + 1)}
              >
                <div className="text-center">
                  <div className="font-semibold">Chapter {i + 1}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // Render books view
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Bible</h1>
            <p className="text-muted-foreground">
              Read and study Scripture in different translations
            </p>
          </div>
        </div>

        {/* Bible Version Selector */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium">Translation:</label>
          <select
            value={selectedTranslation}
            onChange={(e) => setSelectedTranslation(e.target.value as Translation)}
            className="px-3 py-2 border rounded-md"
          >
            {Object.entries(TRANSLATIONS).map(([key, value]) => (
              <option key={value} value={value}>
                {TRANSLATION_DISPLAY_NAMES[value as Translation]}
              </option>
            ))}
          </select>
        </div>

        {/* Testament Selector */}
        <div className="flex space-x-2">
          <Button
            variant={selectedTestament === 'old' ? 'default' : 'outline'}
            onClick={() => setSelectedTestament('old')}
          >
            Old Testament
          </Button>
          <Button
            variant={selectedTestament === 'new' ? 'default' : 'outline'}
            onClick={() => setSelectedTestament('new')}
          >
            New Testament
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBooks.map((book) => (
            <Card
              key={book.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedBook(book.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{book.name}</CardTitle>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {book.chapters} chapters
                  </Badge>
                  <Badge variant="outline">
                    {book.testament === 'old' ? 'OT' : 'NT'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Click to read
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
