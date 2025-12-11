'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Phone, 
  Video, 
  Info, 
  Smile, 
  Paperclip, 
  MoreVertical,
  Users,
  UserPlus
} from 'lucide-react';
import { communityService, Conversation, Message, UserProfile } from '@/services/communityService';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export function EnhancedChatInterface() {
  const { user: authUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authUser) {
      fetchConversations();
    }
  }, [authUser]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!authUser) return;
    
    setLoading(true);
    try {
      const data = await communityService.getUserConversations(authUser.id);
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const data = await communityService.getMessages(conversationId);
      setMessages(data.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !authUser) return;
    
    setSendingMessage(true);
    try {
      const message = await communityService.sendMessage(
        selectedConversation.id,
        authUser.id,
        newMessage.trim()
      );
      
      if (message) {
        setMessages([...messages, message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const createNewConversation = async (friendId: string) => {
    if (!authUser) return;
    
    try {
      const conversation = await communityService.createDirectConversation(authUser.id, friendId);
      if (conversation) {
        setConversations([conversation, ...conversations]);
        setSelectedConversation(conversation);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getMessageIcon = (type: Message['message_type']) => {
    switch (type) {
      case 'verse':
        return '📖';
      case 'prayer':
        return '🙏';
      case 'testimony':
        return '✝️';
      case 'image':
        return '🖼️';
      default:
        return null;
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle className="mr-2 h-5 w-5" />
              Messages
            </div>
            <AuthGuard action="post">
              <Button size="sm" variant="outline">
                <UserPlus className="h-4 w-4" />
              </Button>
            </AuthGuard>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1 max-h-[450px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold mb-2">No conversations yet</h3>
                <p className="text-xs text-muted-foreground">
                  Start a conversation with a friend
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.avatar} />
                      <AvatarFallback>
                        {conversation.name?.charAt(0) || 
                         (conversation.type === 'direct' ? 'D' : 'G')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {conversation.name || 
                           (conversation.type === 'direct' ? 'Direct Message' : 'Group Chat')}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conversation.updated_at)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.type === 'group' && (
                            <Users className="inline h-3 w-3 mr-1" />
                          )}
                          {conversation.type === 'direct' ? 'Direct message' : 'Group chat'}
                        </p>
                        {conversation.type === 'group' && (
                          <Badge variant="secondary" className="text-xs">
                            Group
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Window */}
      <Card className="lg:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedConversation.avatar} />
                    <AvatarFallback>
                      {selectedConversation.name?.charAt(0) || 
                       (selectedConversation.type === 'direct' ? 'D' : 'G')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedConversation.name || 
                       (selectedConversation.type === 'direct' ? 'Direct Message' : 'Group Chat')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.type === 'direct' ? 'Online' : 'Group chat'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="ghost">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col h-[450px]">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === authUser?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className={`max-w-[70%] ${
                      message.sender_id === authUser?.id ? 'order-2' : 'order-1'
                    }`}>
                      {message.sender_id !== authUser?.id && (
                        <div className="flex items-center space-x-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">User</span>
                        </div>
                      )}
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          message.sender_id === authUser?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {getMessageIcon(message.message_type) && (
                          <span className="mr-2">{getMessageIcon(message.message_type)}</span>
                        )}
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 px-1">
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <AuthGuard action="post">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button size="sm" variant="ghost">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                    >
                      {sendingMessage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </AuthGuard>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
