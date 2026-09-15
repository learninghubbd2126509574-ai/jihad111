import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc, arrayUnion, arrayRemove, where, getDocs } from '../lib/supabaseDb';
import { Send, Image as ImageIcon, Heart, MessageCircle, Trash2, X, Lock, Unlock, ShieldAlert, Sparkles } from 'lucide-react';
import CartoonAvatar from './CartoonAvatar';

interface User {
  id: string;
  fullName: string;
  profilePic?: string;
}

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  imageUrl?: string;
  likes: string[];
  updatedAt: any;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  updatedAt: any;
  replyTo?: string;
}

interface CommunityPageProps {
  currentUser: User | null;
  isAdmin: boolean;
  showMsg: (msg: string, type?: 'success' | 'error') => void;
  communityLocked?: boolean;
  onToggleLock?: () => void;
  onDeleteAllPosts?: () => void;
}

export default function CommunityPage({ 
  currentUser, 
  isAdmin, 
  showMsg, 
  communityLocked = false, 
  onToggleLock, 
  onDeleteAllPosts 
}: CommunityPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string, name: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    type: 'post' | 'comment' | 'all';
    id?: string;
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: 'post',
    id: undefined,
    title: '',
    description: ''
  });
  const [deletingProgress, setDeletingProgress] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'fcmTokens'), where('platform', '==', 'community_post'), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot: any) => {
      const p: Post[] = [];
      snapshot.forEach((docItem: any) => {
        const data = docItem.data();
        p.push({ 
          id: docItem.id, 
          ...data,
          likes: Array.isArray(data.likes) ? data.likes : []
        } as Post);
      });
      setPosts(p);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'fcmTokens'), where('platform', '==', 'community_comment'), orderBy('updatedAt', 'asc'));
    const unsub = onSnapshot(q, (snapshot: any) => {
      const cList: Comment[] = [];
      snapshot.forEach((docItem: any) => cList.push({ id: docItem.id, ...docItem.data() } as Comment));
      
      const cMap: Record<string, Comment[]> = {};
      cList.forEach(c => {
        const pId = c.postId || (c as any).whatsapp;
        if (!cMap[pId]) cMap[pId] = [];
        cMap[pId].push(c);
      });
      setComments(cMap);
    });
    return () => unsub();
  }, []);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showMsg("ছবি ২ MB এর ছোট হতে হবে", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewPostImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!currentUser) return showMsg("আপনাকে প্রথমে লগইন করতে হবে", "error");
    if (!newPostText.trim() && !newPostImage) return;
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'fcmTokens'), {
        platform: 'community_post',
        authorId: currentUser.id,
        authorName: currentUser.fullName,
        authorAvatar: currentUser.profilePic || '',
        text: newPostText.trim(),
        imageUrl: newPostImage || null,
        likes: [],
        updatedAt: new Date().toISOString()
      });
      setNewPostText('');
      setNewPostImage(null);
      showMsg("পোস্ট সফলভাবে প্রকাশিত হয়েছে!");
    } catch (err) {
      showMsg("পোস্ট করতে সমস্যা হয়েছে", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (post: Post) => {
    if (!currentUser) return showMsg("আপনাকে প্রথমে লগইন করতে হবে", "error");
    const likesList = Array.isArray(post.likes) ? post.likes : [];
    const isLiked = likesList.includes(currentUser.id);
    const postRef = doc(db, 'fcmTokens', post.id);
    
    try {
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(currentUser.id) : arrayUnion(currentUser.id)
      });
    } catch (err) {
      showMsg("লাইক করতে সমস্যা হয়েছে", "error");
    }
  };

  const triggerDeletePost = (postId: string) => {
    setConfirmDelete({
      isOpen: true,
      type: 'post',
      id: postId,
      title: "পোস্ট ডিলিট করুন",
      description: "আপনি কি নিশ্চিতভাবে এই পোস্টটি ডিলিট করতে চান? পোস্ট ডিলিট করলে এর সাথে সম্পর্কিত সকল মন্তব্য ও উত্তর চিরতরে মুছে যাবে।"
    });
  };

  const triggerDeleteComment = (commentId: string) => {
    setConfirmDelete({
      isOpen: true,
      type: 'comment',
      id: commentId,
      title: "মন্তব্য ডিলিট করুন",
      description: "আপনি কি নিশ্চিতভাবে এই মন্তব্যটি ডিলিট করতে চান?"
    });
  };

  const triggerDeleteAllPosts = () => {
    setConfirmDelete({
      isOpen: true,
      type: 'all',
      title: "সকল পোস্ট মুছুন",
      description: "আপনি কি নিশ্চিতভাবে কমিউনিটির সকল পোস্ট ও মন্তব্য মুছে ফেলতে চান? এটি আর কোনোভাবেই ফিরিয়ে আনা সম্ভব নয়।"
    });
  };

  const handleConfirmDelete = async () => {
    const { type, id } = confirmDelete;
    setConfirmDelete(prev => ({ ...prev, isOpen: false }));
    setDeletingProgress(true);
    
    try {
      if (type === 'post' && id) {
        // 1. Delete post document
        await deleteDoc(doc(db, 'fcmTokens', id));

        // 2. Delete all associated comments for this post
        const commentSnap = await getDocs(query(collection(db, 'fcmTokens'), where('platform', '==', 'community_comment')));
        for (const commentDoc of commentSnap.docs) {
          const data = commentDoc.data();
          if (data.postId === id || data.whatsapp === id) {
            await deleteDoc(doc(db, 'fcmTokens', commentDoc.id));
          }
        }

        showMsg("পোস্ট এবং সম্পর্কিত সকল কমেন্ট সফলভাবে ডিলিট করা হয়েছে", "success");
      } else if (type === 'comment' && id) {
        await deleteDoc(doc(db, 'fcmTokens', id));
        showMsg("কমেন্ট ডিলিট করা হয়েছে", "success");
      } else if (type === 'all') {
        if (onDeleteAllPosts) {
          await onDeleteAllPosts();
        }
      }
    } catch (err) {
      showMsg("ডিলিট করতে সমস্যা হয়েছে", "error");
    } finally {
      setDeletingProgress(false);
    }
  };

  const handleCreateComment = async (postId: string) => {
    if (!currentUser) return showMsg("আপনাকে প্রথমে লগইন করতে হবে", "error");
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'fcmTokens'), {
        platform: 'community_comment',
        whatsapp: postId,
        postId: postId,
        authorId: currentUser.id,
        authorName: currentUser.fullName,
        authorAvatar: currentUser.profilePic || '',
        text: commentText.trim(),
        replyTo: replyingTo?.id || null,
        updatedAt: new Date().toISOString()
      });
      setCommentText('');
      setReplyingTo(null);
      showMsg("মন্তব্য যোগ করা হয়েছে");
    } catch (err) {
      showMsg("কমেন্ট করতে সমস্যা হয়েছে", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (ts: string | number) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleString('bn-BD', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  // If locked for regular users
  if (communityLocked && !isAdmin) {
    return (
      <div className="w-full max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-[#e0e9f4] rounded-[2rem] p-8 shadow-[15px_15px_30px_rgba(152,170,194,0.65),-15px_-15px_30px_rgba(255,255,255,0.95)] border border-white/80">
          <div className="w-16 h-16 bg-amber-50 border border-amber-200/50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm animate-pulse">
            <Lock size={32} />
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-2">কমিউনিটি লক করা আছে</h2>
          <p className="text-slate-600 text-xs font-bold leading-relaxed">
            কমিউনিটি ফোরামটি বর্তমানে অ্যাডমিন কর্তৃক সাময়িকভাবে লক রাখা হয়েছে। অনুগ্রহ করে পরে চেষ্টা করুন।
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto pb-24 px-3 sm:px-0 animate-fade-in space-y-5">
      {/* Header Banner */}
      <div className="text-center pt-2 pb-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#e0e9f4] text-blue-600 text-[10px] font-black uppercase tracking-wider shadow-[inset_2px_2px_4px_rgba(152,170,194,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.85)] border border-white/40 mb-2">
          <Sparkles size={11} className="text-blue-500 animate-pulse" /> কমিউনিটি আড্ডা ও আলোচনা
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">কমিউনিটি ফোরাম</h1>
        <p className="text-slate-500 text-[10px] mt-0.5 font-bold">সবার সাথে যুক্ত থাকুন, মতামত ও আপডেট শেয়ার করুন</p>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-400" />
            <span className="text-xs font-bold">অ্যাডমিন কন্ট্রোল প্যানেল</span>
          </div>
          <div className="flex items-center gap-2">
            {onToggleLock && (
              <button
                onClick={onToggleLock}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                  communityLocked ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                {communityLocked ? <Lock size={13} /> : <Unlock size={13} />}
                {communityLocked ? 'আনলক করুন' : 'লক করুন'}
              </button>
            )}
            {onDeleteAllPosts && (
              <button
                onClick={triggerDeleteAllPosts}
                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Trash2 size={13} /> সব মুছুন
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create Post Box */}
      {currentUser && (
        <div className="bg-[#e0e9f4] p-4 sm:p-5 rounded-[2rem] border border-white/80 shadow-[12px_12px_24px_rgba(152,170,194,0.55),-12px_-12px_24px_rgba(255,255,255,0.95)] space-y-3">
          <div className="flex gap-3 items-start">
            <div className="w-11 h-11 rounded-xl flex-shrink-0 bg-[#e0e9f4] shadow-[inset_2px_2px_4px_rgba(152,170,194,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] border border-white/40 overflow-hidden flex justify-center items-center">
              <CartoonAvatar src={currentUser.profilePic} name={currentUser.fullName} />
            </div>
            <textarea
              className="flex-1 bg-[#e0e9f4] shadow-[inset_3px_3px_6px_rgba(152,170,194,0.3),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] border border-white/50 rounded-2xl p-3.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-xs sm:text-sm resize-none text-slate-800 placeholder-slate-400 font-medium"
              placeholder={`কী ভাবছেন আজ, ${currentUser.fullName.split(' ')[0]}?`}
              rows={3}
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
            />
          </div>
          
          {newPostImage && (
            <div className="relative ml-14">
              <div className="rounded-2xl overflow-hidden border border-white/80 bg-[#e0e9f4] p-1 shadow-[inset_2px_2px_5px_rgba(152,170,194,0.3)]">
                <img src={newPostImage} alt="Upload preview" className="max-h-44 rounded-xl object-contain w-full" />
              </div>
              <button 
                onClick={() => setNewPostImage(null)}
                className="absolute -top-1.5 -right-1.5 bg-red-600 text-white p-1.5 rounded-full shadow-lg hover:bg-red-700 active:scale-90 transition-all border border-white"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center pt-2.5 border-t border-slate-300/40 ml-14">
            <div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImagePick} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e0e9f4] text-blue-600 hover:text-blue-700 border border-white/80 shadow-[4px_4px_8px_rgba(152,170,194,0.5),-4px_-4px_8px_rgba(255,255,255,0.9)] hover:scale-[1.01] active:scale-95 transition-all text-xs font-black"
              >
                <ImageIcon size={14} className="text-blue-500" /> ছবি যোগ করুন
              </button>
            </div>
            <button
              onClick={handleCreatePost}
              disabled={submitting || (!newPostText.trim() && !newPostImage)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl shadow-[4px_4px_10px_rgba(37,99,235,0.3)] hover:scale-[1.01] active:scale-95 transition-all flex items-center gap-1.5 text-xs disabled:opacity-50"
            >
              {submitting ? 'পোস্ট হচ্ছে...' : <><Send size={13} /> পোস্ট করুন</>}
            </button>
          </div>
        </div>
      )}

      {/* Posts Feed (Newest at top) */}
      <div className="space-y-5">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-[#e0e9f4]/50 rounded-[2rem] border border-white/50 text-slate-400 text-xs font-bold shadow-[inset_3px_3px_6px_rgba(152,170,194,0.2),inset_-3px_-3px_6px_rgba(255,255,255,0.7)]">
            এখনো কোনো পোস্ট করা হয়নি। প্রথম পোস্টটি আপনিই করুন!
          </div>
        ) : (
          posts.map(post => {
            const isAuthor = currentUser && currentUser.id === post.authorId;
            const canDelete = isAdmin || isAuthor;
            const postComments = comments[post.id] || [];
            const showComments = activeCommentPost === post.id;

            return (
              <div key={post.id} className="bg-[#e0e9f4] rounded-[2rem] p-4.5 sm:p-5 shadow-[12px_12px_24px_rgba(152,170,194,0.55),-12px_-12px_24px_rgba(255,255,255,0.95)] border border-white/80 overflow-hidden">
                {/* Post Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex-shrink-0 bg-[#e0e9f4] shadow-[inset_2px_2px_4px_rgba(152,170,194,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] border border-white/40 overflow-hidden flex justify-center items-center">
                      <CartoonAvatar src={post.authorAvatar} name={post.authorName} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight">{post.authorName}</h4>
                        {isAdmin && (
                          <span className="bg-blue-100 text-blue-700 text-[8px] font-black px-1.5 py-0.2 rounded border border-blue-200/50">অ্যাডমিন</span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">{formatTime(post.updatedAt)}</p>
                    </div>
                  </div>

                  {canDelete && (
                    <button 
                      onClick={() => triggerDeletePost(post.id)} 
                      title="ডিলিট করুন"
                      className="px-2.5 py-1.5 bg-[#e0e9f4] text-slate-400 hover:text-red-600 border border-white/60 rounded-xl shadow-[2px_2px_4px_rgba(152,170,194,0.4),-2px_-2px_4px_rgba(255,255,255,0.8)] hover:scale-[1.01] active:scale-95 transition-all flex items-center gap-1 text-[10px] font-black"
                    >
                      <Trash2 size={12} className="shrink-0" />
                      <span>ডিলিট</span>
                    </button>
                  )}
                </div>

                {/* Post Text */}
                {post.text && (
                  <div className="bg-[#e0e9f4]/60 rounded-2xl p-3.5 shadow-[inset_3px_3px_6px_rgba(152,170,194,0.25),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] border border-white/40 mb-3">
                    <p className="text-slate-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-bold break-words">{post.text}</p>
                  </div>
                )}
                
                {/* Post Image */}
                {post.imageUrl && (
                  <div className="mb-3 rounded-2xl overflow-hidden border border-white/80 bg-[#e0e9f4] p-1 shadow-[inset_2px_2px_5px_rgba(152,170,194,0.3)] flex justify-center">
                    <img src={post.imageUrl} alt="Post attachment" className="max-h-80 w-full object-contain rounded-xl" />
                  </div>
                )}

                {/* Like & Comment Bar */}
                <div className="flex items-center gap-3.5 pt-2 mt-2 border-t border-slate-300/30">
                  <button 
                    onClick={() => handleToggleLike(post)}
                    className={`px-4 py-2 bg-[#e0e9f4] rounded-xl text-xs font-black flex items-center gap-1.5 border border-white/50 shadow-[3px_3px_6px_rgba(152,170,194,0.45),-3px_-3px_6px_rgba(255,255,255,0.95)] hover:scale-[1.02] active:scale-95 transition-all ${
                      (post.likes || []).includes(currentUser?.id || '') 
                        ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-[0_4px_10px_rgba(239,68,68,0.25)] border-rose-400/40' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <Heart size={14} fill={(post.likes || []).includes(currentUser?.id || '') ? 'currentColor' : 'none'} className={(post.likes || []).includes(currentUser?.id || '') ? 'text-white' : 'text-rose-500'} />
                    <span>{(post.likes || []).length > 0 ? `${(post.likes || []).length}টি` : 'লাইক'}</span>
                  </button>

                  <button 
                    onClick={() => setActiveCommentPost(showComments ? null : post.id)}
                    className="px-4 py-2 bg-[#e0e9f4] rounded-xl text-slate-600 hover:text-slate-800 font-black text-xs flex items-center gap-1.5 border border-white/50 shadow-[3px_3px_6px_rgba(152,170,194,0.45),-3px_-3px_6px_rgba(255,255,255,0.95)] hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <MessageCircle size={14} className="text-blue-500" />
                    <span>{postComments.length > 0 ? `${postComments.length}টি মন্তব্য` : 'মন্তব্য'}</span>
                  </button>
                </div>

                {/* Comments Section (Hidden by default, shown when showComments is true) */}
                {showComments && (
                  <div className="mt-4 pt-4 border-t border-slate-300/40 space-y-3.5 animate-fade-in">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">সকল মন্তব্য ({postComments.length})</div>
                    
                    {postComments.length === 0 ? (
                      <p className="text-xs text-slate-400/80 italic py-1 pl-1">কোনো মন্তব্য নেই। প্রথম মন্তব্যটি করুন!</p>
                    ) : (
                      postComments.map(comment => {
                        const isCommentAuthor = currentUser && currentUser.id === comment.authorId;
                        const isPostAuthor = currentUser && currentUser.id === post.authorId;
                        const canDeleteComment = isAdmin || isCommentAuthor || isPostAuthor;

                        return (
                          <div key={comment.id} className={`flex gap-2.5 items-start ${comment.replyTo ? 'ml-6 sm:ml-10' : ''}`}>
                            <div className="w-8 h-8 rounded-xl flex-shrink-0 bg-[#e0e9f4] shadow-[inset_1.5px_1.5px_3px_rgba(152,170,194,0.45),inset_-1.5px_-1.5px_3px_rgba(255,255,255,0.85)] border border-white/40 overflow-hidden flex justify-center items-center mt-0.5">
                              <CartoonAvatar src={comment.authorAvatar} name={comment.authorName} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="bg-[#e0e9f4] border border-white/60 rounded-2xl p-3 inline-block max-w-full shadow-[3px_3px_6px_rgba(152,170,194,0.4),-3px_-3px_6px_rgba(255,255,255,0.9)]">
                                <div className="flex items-center justify-between gap-3 mb-1">
                                  <h6 className="font-extrabold text-[10px] text-slate-900 truncate">{comment.authorName}</h6>
                                  <span className="text-[8px] text-slate-400 font-bold shrink-0">{formatTime(comment.updatedAt)}</span>
                                </div>
                                <p className="text-xs text-slate-700 break-words font-bold">
                                  {comment.replyTo && postComments.find(c => c.id === comment.replyTo) && (
                                    <span className="text-blue-600 font-extrabold mr-1">@{postComments.find(c => c.id === comment.replyTo)?.authorName}</span>
                                  )}
                                  {comment.text}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-3.5 mt-1 ml-2 text-[10px] text-slate-500 font-bold">
                                {currentUser && (
                                  <button 
                                    onClick={() => {
                                      setReplyingTo({ id: comment.id, name: comment.authorName });
                                    }} 
                                    className="hover:text-blue-600 transition-colors"
                                  >
                                    রিপ্লাই
                                  </button>
                                )}
                                {canDeleteComment && (
                                  <button 
                                    onClick={() => triggerDeleteComment(comment.id)} 
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                  >
                                    ডিলিট
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* New Comment Input Box */}
                    {currentUser && (
                      <div className="pt-3.5 mt-3.5 border-t border-slate-300/30">
                        {replyingTo && (
                          <div className="flex justify-between items-center bg-blue-50 border border-blue-200/40 text-blue-700 px-3 py-1.5 rounded-xl text-[10px] font-black mb-2 ml-10">
                            <span>@{replyingTo.name}-কে রিপ্লাই দিচ্ছেন</span>
                            <button onClick={() => setReplyingTo(null)} className="hover:text-red-600"><X size={12} /></button>
                          </div>
                        )}
                        <div className="flex gap-2.5 items-center">
                          <div className="w-8 h-8 rounded-xl flex-shrink-0 bg-[#e0e9f4] shadow-[inset_1.5px_1.5px_3px_rgba(152,170,194,0.45),inset_-1.5px_-1.5px_3px_rgba(255,255,255,0.85)] border border-white/40 overflow-hidden flex justify-center items-center">
                            <CartoonAvatar src={currentUser.profilePic} name={currentUser.fullName} />
                          </div>
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="একটি মন্তব্য লিখুন..."
                              className="flex-1 bg-[#e0e9f4] shadow-[inset_2.5px_2.5px_5px_rgba(152,170,194,0.35),inset_-2.5px_-2.5px_5px_rgba(255,255,255,0.85)] border border-white/40 rounded-xl px-3.5 py-2 outline-none focus:border-blue-400 text-xs font-bold text-slate-800 placeholder-slate-400"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && commentText.trim()) handleCreateComment(post.id);
                              }}
                            />
                            <button
                              onClick={() => handleCreateComment(post.id)}
                              disabled={submitting || !commentText.trim()}
                              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white disabled:opacity-50 flex-shrink-0 shadow-md font-bold text-xs rounded-xl flex items-center justify-center"
                            >
                              <Send size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {confirmDelete.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#e0e9f4] rounded-[2rem] p-6 shadow-[15px_15px_35px_rgba(152,170,194,0.7),-15px_-15px_35px_rgba(255,255,255,0.9)] border border-white/80 text-center relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* Warning Icon */}
            <div className="w-14 h-14 bg-red-50 border border-red-150 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Trash2 size={24} />
            </div>

            {/* Content */}
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">
              {confirmDelete.title}
            </h3>
            <p className="text-slate-600 text-xs font-bold leading-relaxed mb-6 px-1">
              {confirmDelete.description}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs tracking-wider uppercase shadow-xs hover:scale-[1.01] transition-all"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-md hover:scale-[1.01] transition-all"
              >
                হ্যাঁ, ডিলিট
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
