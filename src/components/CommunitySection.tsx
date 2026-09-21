import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Send, 
  Image as ImageIcon, 
  Trash2, 
  X, 
  Camera, 
  Lock,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  increment,
  setDoc,
  getDoc,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import CartoonAvatar from './CartoonAvatar';

interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
  createdAt: any;
  likesCount: number;
}

interface PostComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: any;
}

interface CommunitySectionProps {
  currentUser: any;
  isAdmin: boolean;
  communityActive: boolean;
  onToggleActive?: (active: boolean) => void;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({ 
  currentUser, 
  isAdmin, 
  communityActive,
  onToggleActive 
}) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [postLimit, setPostLimit] = useState(25);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>(() => {
    const userId = currentUser?.whatsapp || currentUser?.uid;
    if (!userId) return {};
    try {
      return JSON.parse(localStorage.getItem(`unity_likes_${userId}`) || '{}');
    } catch {
      return {};
    }
  });
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load community posts with quota-safe limit
  useEffect(() => {
    if (!communityActive && !isAdmin) return;

    const q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'), limit(postLimit));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityPost[];
      setPosts(fetchedPosts);
    }, (error) => {
      console.error("Error loading community posts:", error);
    });

    return () => unsubscribe();
  }, [communityActive, isAdmin, postLimit]);

  const checkedPostsRef = useRef<Set<string>>(new Set());

  // Fetch likes map efficiently without re-fetching existing checked or cached posts
  useEffect(() => {
    const userId = currentUser?.whatsapp || currentUser?.uid;
    if (!userId || !posts.length) return;

    // Skip checking posts that are already verified or already recorded in userLikes
    const uncheckedPosts = posts.filter(p => !checkedPostsRef.current.has(p.id) && userLikes[p.id] === undefined);
    if (uncheckedPosts.length === 0) return;

    uncheckedPosts.forEach(p => checkedPostsRef.current.add(p.id));

    const fetchNewLikes = async () => {
      const newLikes: Record<string, boolean> = {};
      await Promise.all(
        uncheckedPosts.map(async (post) => {
          try {
            const likeRef = doc(db, 'communityPosts', post.id, 'likes', userId);
            const likeDoc = await getDoc(likeRef);
            if (likeDoc.exists()) {
              newLikes[post.id] = true;
            } else {
              newLikes[post.id] = false;
            }
          } catch (e) {
            console.warn('Error checking like for post:', post.id, e);
          }
        })
      );
      if (Object.keys(newLikes).length > 0) {
        setUserLikes(prev => {
          const next = { ...prev, ...newLikes };
          try {
            localStorage.setItem(`unity_likes_${userId}`, JSON.stringify(next));
          } catch (_) {}
          return next;
        });
      }
    };

    fetchNewLikes();
  }, [currentUser?.whatsapp, currentUser?.uid, posts]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createPost = async () => {
    if (!newPostContent.trim() && !newPostImage) return;
    if (!currentUser) {
      alert("অনুগ্রহ করে আগে লগইন করুন!");
      return;
    }

    setUploading(true);
    try {
      let imageUrl = '';
      if (newPostImage) {
        const imageRef = ref(storage, `community/${Date.now()}_${newPostImage.name}`);
        const uploadResult = await uploadBytes(imageRef, newPostImage);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      await addDoc(collection(db, 'communityPosts'), {
        authorId: currentUser.whatsapp || currentUser.uid,
        authorName: currentUser.fullName,
        authorRole: currentUser.position || 'Member',
        authorAvatar: currentUser.profilePic || '',
        content: newPostContent,
        imageUrl,
        createdAt: serverTimestamp(),
        likesCount: 0
      });

      setNewPostContent('');
      setNewPostImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("পোস্টটি আপলোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setUploading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই পোস্টটি ডিলিট করতে চান?")) return;
    try {
      await deleteDoc(doc(db, 'communityPosts', postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("পোস্টটি ডিলিট করতে ব্যর্থ হয়েছে।");
    }
  };

  const toggleLike = async (post: CommunityPost) => {
    if (!currentUser) return;
    const userId = currentUser.whatsapp || currentUser.uid;
    const likeRef = doc(db, 'communityPosts', post.id, 'likes', userId);
    const isCurrentlyLiked = !!userLikes[post.id];
    const newLikedStatus = !isCurrentlyLiked;
    
    // Immediate optimistic local update + localStorage sync
    setUserLikes(prev => {
      const next = { ...prev, [post.id]: newLikedStatus };
      try {
        localStorage.setItem(`unity_likes_${userId}`, JSON.stringify(next));
      } catch (_) {}
      return next;
    });

    try {
      if (isCurrentlyLiked) {
        await deleteDoc(likeRef);
        await updateDoc(doc(db, 'communityPosts', post.id), {
          likesCount: increment(-1)
        });
      } else {
        await setDoc(likeRef, {
          userId,
          createdAt: serverTimestamp()
        });
        await updateDoc(doc(db, 'communityPosts', post.id), {
          likesCount: increment(1)
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert if write failed
      setUserLikes(prev => {
        const next = { ...prev, [post.id]: isCurrentlyLiked };
        try {
          localStorage.setItem(`unity_likes_${userId}`, JSON.stringify(next));
        } catch (_) {}
        return next;
      });
    }
  };

  if (!communityActive && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
          <Lock size={40} />
        </div>
        <h3 className="text-xl font-black text-[#090d16] mb-2">কমিউনিটি বর্তমানে বন্ধ আছে</h3>
        <p className="text-slate-600 text-sm max-w-xs font-semibold leading-relaxed">
          অ্যাডমিন কমিউনিটি অপশনটি অফ করে রেখেছেন। অনুগ্রহ করে পরে আবার চেষ্টা করুন।
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 px-4 sm:px-0">
      {/* Admin Control */}
      {isAdmin && (
        <div className="neu-card p-4 mb-6 flex items-center justify-between border border-white/60">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${communityActive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-[#090d16] uppercase tracking-wider leading-none">Community Control</p>
              <p className="text-[10px] text-slate-600 font-black mt-1 uppercase tracking-widest">{communityActive ? 'Feature is LIVE' : 'Feature is HIDDEN'}</p>
            </div>
          </div>
          <button 
            onClick={() => onToggleActive?.(!communityActive)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              communityActive 
              ? 'bg-red-600 text-white shadow-lg shadow-red-500/25 active:scale-95' 
              : 'neu-btn-emerald active:scale-95'
            }`}
          >
            {communityActive ? 'Turn Off' : 'Turn On'}
          </button>
        </div>
      )}

      {/* Post Creator */}
      {communityActive && currentUser && (
        <div className="neu-card p-5 mb-8 border border-white/60 relative">
          <div className="flex gap-4 mb-4">
            <div className="w-10 h-10 rounded-2xl neu-inset overflow-hidden flex-shrink-0">
              <CartoonAvatar src={currentUser.profilePic} name={currentUser.fullName} />
            </div>
            <div className="flex-1">
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="টিমের সাথে কোনো খবর বা সুন্দর মূহুর্ত শেয়ার করুন..."
                className="w-full neu-input rounded-2xl p-4 text-sm font-medium text-slate-800 resize-none min-h-[110px] placeholder:text-slate-500"
              />
            </div>
          </div>

          <AnimatePresence>
            {imagePreview && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative mb-4 rounded-2xl overflow-hidden border border-white/60 shadow-md aspect-video group"
              >
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => { setNewPostImage(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-all backdrop-blur-md"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between border-t border-slate-300/40 pt-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl neu-btn font-black text-xs uppercase tracking-wider"
            >
              <Camera size={16} className="text-blue-600" />
              <span>ছবি যোগ করুন</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
            
            <button 
              onClick={createPost}
              disabled={uploading || (!newPostContent.trim() && !newPostImage)}
              className="neu-btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:pointer-events-none hover:scale-102 active:scale-98"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={14} />
              )}
              <span>পোস্ট করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="neu-card py-20 text-center border border-white/60">
            <div className="w-16 h-16 neu-inset rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
              <MessageSquare size={32} />
            </div>
            <p className="text-slate-600 text-sm font-black italic">এখনও কোনো পোস্ট করা হয়নি। প্রথম পোস্টটি আপনিই করুন!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                currentUser={currentUser}
                isAdmin={isAdmin}
                isLiked={!!userLikes[post.id]}
                onLike={() => toggleLike(post)}
                onDelete={() => deletePost(post.id)}
                onCommentToggle={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                isCommentActive={activeCommentsPostId === post.id}
              />
            ))}
            {posts.length >= postLimit && (
              <div className="text-center py-4">
                <button
                  type="button"
                  onClick={() => setPostLimit(prev => prev + 25)}
                  className="px-6 py-2.5 rounded-xl bg-slate-200/60 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-xs font-black text-slate-700 dark:text-slate-300 transition-all border border-black/5 dark:border-white/10 shadow-sm"
                >
                  আরও পোস্ট দেখুন (Load More)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const PostCard = ({ post, currentUser, isAdmin, isLiked, onLike, onDelete, onCommentToggle, isCommentActive }: any) => {
  const isAuthor = currentUser && (currentUser.whatsapp === post.authorId || currentUser.uid === post.authorId);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // Load comments
  useEffect(() => {
    if (!isCommentActive) return;
    
    const q = query(collection(db, 'communityPosts', post.id, 'comments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PostComment[];
      setComments(fetchedComments);
    }, (error) => {
      console.error("Error loading comments:", error);
    });

    return () => unsubscribe();
  }, [isCommentActive, post.id]);

  const addComment = async () => {
    if (!commentText.trim() || !currentUser) return;
    setSendingComment(true);
    try {
      await addDoc(collection(db, 'communityPosts', post.id, 'comments'), {
        userId: currentUser.whatsapp || currentUser.uid,
        userName: currentUser.fullName,
        userAvatar: currentUser.profilePic || '',
        text: commentText,
        createdAt: serverTimestamp()
      });
      setCommentText('');
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("কমেন্ট যোগ করতে ব্যর্থ হয়েছে।");
    } finally {
      setSendingComment(false);
    }
  };

  const deleteComment = async (commentId: string, commentAuthorId: string) => {
    const isCommentAuthor = currentUser && (currentUser.whatsapp === commentAuthorId || currentUser.uid === commentAuthorId);
    if (!isAdmin && !isCommentAuthor) return;
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই কমেন্টটি ডিলিট করতে চান?")) return;
    
    try {
      await deleteDoc(doc(db, 'communityPosts', post.id, 'comments', commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("কমেন্ট ডিলিট করতে ব্যর্থ হয়েছে।");
    }
  };

  const formattedDate = post.createdAt?.toDate ? 
    new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(post.createdAt.toDate()) : 
    'এইমাত্র';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="neu-card overflow-hidden border border-white/60 mb-6"
    >
      {/* Post Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl neu-inset overflow-hidden flex-shrink-0">
            <CartoonAvatar src={post.authorAvatar} name={post.authorName} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-[#090d16] text-sm leading-none">{post.authorName}</h4>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase bg-blue-100 text-blue-700 tracking-wide">
                {post.authorRole}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold mt-1.5 uppercase tracking-wider">{formattedDate}</p>
          </div>
        </div>
        {(isAuthor || isAdmin) && (
          <button 
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-500/10 transition-all active:scale-90"
            title="পোস্ট ডিলিট করুন"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="px-5 pb-4">
        <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
          {post.content}
        </p>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="px-4 pb-4">
          <div className="rounded-2xl overflow-hidden border border-white/50 shadow-sm max-h-[400px] bg-black/5">
            <img 
              src={post.imageUrl} 
              alt="Post" 
              className="w-full h-full object-contain max-h-[400px]" 
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 py-3 border-t border-slate-300/30 flex items-center gap-6">
        <button 
          onClick={onLike}
          className={`flex items-center gap-2 text-sm font-black transition-all ${isLiked ? 'text-pink-600 scale-105' : 'text-slate-600 hover:text-pink-600'}`}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={isLiked ? 0 : 2.5} />
          <span>{post.likesCount || 0}</span>
        </button>
        <button 
          onClick={onCommentToggle}
          className={`flex items-center gap-2 text-sm font-black transition-all ${isCommentActive ? 'text-blue-700 font-extrabold' : 'text-slate-600 hover:text-blue-700'}`}
        >
          <MessageSquare size={18} />
          <span>কমেন্ট ({comments.length})</span>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {isCommentActive && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#dbe5f0]/50 border-t border-slate-300/30"
          >
            <div className="p-5 space-y-4">
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {comments.length === 0 ? (
                  <p className="text-center py-4 text-[10px] text-slate-500 font-black uppercase tracking-widest">No comments yet</p>
                ) : (
                  comments.map((comment) => {
                    const isCommentAuthor = currentUser && (currentUser.whatsapp === comment.userId || currentUser.uid === comment.userId);
                    const canDeleteComment = isAdmin || isCommentAuthor;

                    return (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-xl neu-inset overflow-hidden flex-shrink-0">
                          <CartoonAvatar src={comment.userAvatar} name={comment.userName} />
                        </div>
                        <div className="flex-1 neu-card-sm bg-[#e7eff8] p-3 rounded-2xl rounded-tl-none relative group border border-white/40">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-[11px] font-black text-[#090d16]">{comment.userName}</h5>
                            {canDeleteComment && (
                              <button 
                                onClick={() => deleteComment(comment.id, comment.userId)}
                                className="text-slate-400 hover:text-red-600 transition-all p-1"
                                title="কমেন্ট ডিলিট করুন"
                              >
                                <X size={12} strokeWidth={3} />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 font-medium leading-normal">{comment.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Comment Input */}
              {currentUser && (
                <div className="flex gap-2 pt-2 border-t border-slate-300/20">
                  <input 
                    type="text" 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addComment()}
                    placeholder="আপনার মতামত লিখুন..."
                    className="flex-1 neu-input rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none"
                  />
                  <button 
                    onClick={addComment}
                    disabled={sendingComment || !commentText.trim()}
                    className="neu-btn-primary w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                  >
                    {sendingComment ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CommunitySection;
