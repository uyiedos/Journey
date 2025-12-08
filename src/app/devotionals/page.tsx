'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { DevotionalCard } from '@/components/features/DevotionalCard';
import { CreateDevotional } from '@/components/features/CreateDevotional';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabaseService } from '@/services/supabaseService';
import { Search, Filter, Heart, Calendar, Plus, PenTool } from 'lucide-react';

export default function DevotionalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [devotionals, setDevotionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevotionals();
  }, []);

  const fetchDevotionals = async () => {
    try {
      setLoading(true);
      
      // Fetch public devotionals from Supabase
      const { data: publicDevotionals, error: publicError } = await supabaseService.getClient()
        .from('devotionals')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (publicError) {
        console.error('Error fetching public devotionals:', publicError);
      }

      // Fetch user's devotionals
      const { data: userDevotionals, error: userError } = await supabaseService.getClient()
        .from('devotionals')
        .select('*')
        .eq('user_id', (await supabaseService.getClient().auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      if (userError) {
        console.error('Error fetching user devotionals:', userError);
      }

      // Combine public and user devotionals, prioritizing user's own and removing duplicates
      const allDevotionals = [
        ...(userDevotionals || []),
        ...(publicDevotionals || [])
      ];

      // Remove duplicates by ID, keeping the first occurrence (user's own devotionals come first)
      const uniqueDevotionals = allDevotionals.filter((devotional, index, self) =>
        index === self.findIndex((d) => d.id === devotional.id)
      );

      setDevotionals(uniqueDevotionals);
    } catch (error) {
      console.error('Error fetching devotionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevotionals = devotionals.filter(devotional => {
    const matchesSearch = devotional.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         devotional.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (devotional.author_name && devotional.author_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = !selectedTag || (devotional.tags && devotional.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(devotionals.flatMap(d => d.tags || [])));

  const handleSaveDevotional = async () => {
    await fetchDevotionals();
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <Layout>
        <div className="py-6">
          <CreateDevotional
            onSave={handleSaveDevotional}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading devotionals...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Devotionals</h1>
            <p className="text-muted-foreground">
              Daily reflections and spiritual insights to deepen your faith
            </p>
          </div>
          <AuthGuard action="devotional">
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Devotional
            </Button>
          </AuthGuard>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search devotionals..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedTag === null ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setSelectedTag(null)}
          >
            All
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSelectedTag(tag)}
            >
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Devotionals Grid */}
        <div className="grid gap-6">
          {filteredDevotionals.map((devotional) => (
            <DevotionalCard key={devotional.id} devotional={devotional} />
          ))}
        </div>

        {filteredDevotionals.length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No devotionals found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you're looking for, or create your own devotional.
            </p>
            <Button className="mt-4" onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Devotional
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
