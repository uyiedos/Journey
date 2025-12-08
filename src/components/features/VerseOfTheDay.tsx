'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, RefreshCw, Share2, Heart } from 'lucide-react'

interface Verse {
  book: string
  chapter: number
  verse: number
  text: string
}

const bibleVerses: Verse[] = [
  {
    book: "Proverbs",
    chapter: 3,
    verse: 5,
    text: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."
  },
  {
    book: "Jeremiah",
    chapter: 29,
    verse: 11,
    text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future."
  },
  {
    book: "Philippians",
    chapter: 4,
    verse: 13,
    text: "I can do all this through him who gives me strength."
  },
  {
    book: "Isaiah",
    chapter: 41,
    verse: 10,
    text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand."
  },
  {
    book: "Romans",
    chapter: 8,
    verse: 28,
    text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose."
  },
  {
    book: "Psalm",
    chapter: 23,
    verse: 1,
    text: "The LORD is my shepherd, I lack nothing."
  },
  {
    book: "Matthew",
    chapter: 11,
    verse: 28,
    text: "Come to me, all you who are weary and burdened, and I will give you rest."
  },
  {
    book: "Joshua",
    chapter: 1,
    verse: 9,
    text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go."
  },
  {
    book: "2 Corinthians",
    chapter: 5,
    verse: 7,
    text: "For we live by faith, not by sight."
  },
  {
    book: "Galatians",
    chapter: 2,
    verse: 20,
    text: "I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live in the body, I live by faith in the Son of God, who loved me and gave himself for me."
  }
]

export function VerseOfTheDay() {
  const [verse, setVerse] = useState<Verse | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    // Get verse based on today's date for consistency
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
    const verseIndex = dayOfYear % bibleVerses.length
    
    setVerse(bibleVerses[verseIndex])
    setLoading(false)
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    // Get a random verse
    const randomIndex = Math.floor(Math.random() * bibleVerses.length)
    setTimeout(() => {
      setVerse(bibleVerses[randomIndex])
      setLoading(false)
    }, 500)
  }

  const handleLike = () => {
    setLiked(!liked)
  }

  const handleShare = () => {
    if (verse) {
      const text = `${verse.text} - ${verse.book} ${verse.chapter}:${verse.verse}`
      if (navigator.share) {
        navigator.share({
          title: 'Verse of the Day',
          text: text
        })
      } else {
        navigator.clipboard.writeText(text)
      }
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!verse) return null

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl text-blue-900">Verse of the Day</CardTitle>
            <p className="text-sm text-blue-700">Daily inspiration from Scripture</p>
          </div>
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            <BookOpen className="mr-1 h-3 w-3" />
            {verse.book} {verse.chapter}:{verse.verse}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <blockquote className="text-lg leading-relaxed text-blue-900 italic font-medium">
          "{verse.text}"
        </blockquote>
        
        <div className="flex items-center justify-between pt-4 border-t border-blue-200">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`text-blue-700 hover:text-blue-900 hover:bg-blue-100 ${liked ? 'text-blue-900' : ''}`}
            >
              <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-current' : ''}`} />
              {liked ? 'Liked' : 'Like'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            New Verse
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
