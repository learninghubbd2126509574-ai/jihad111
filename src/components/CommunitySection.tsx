import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Heart,
  Send,
  Trash2,
  X,
  Camera,
  Lock,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import {
  db,
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
  getDocs,
  limit,
  serverTimestamp
} from '../services/supabaseDb';
import CartoonAvatar from './CartoonAvatar';
import { Member, UserRegistration } from '../types';

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
  approvedUsers?: UserRegistration[];
  members?: Member[];
  onToggleActive?: (active: boolean) => void;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({
  currentUser,
  isAdmin,
  communityActive,
  approvedUsers = [],
  members = [],
  onToggleActive
}) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [postLimit, setPostLimit] = useState(12);
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

  const resolveLiveAvatar = (userId?: string, name?: string, fallback?: string) => {
    const cleanId = (userId || '').replace(/\s+/g, '');
    const cleanName = (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const memberMatch = members.find(
      (m) =>
        (cleanId && m.whatsapp && m.whatsapp.replace(/\s+/g, '') === cleanId) ||
        (cleanName && m.name?.trim().toLowerCase().replace(/\s+/g, ' ') === cleanName)
    );
    if ((memberMatch as any)?.profilePic) return (memberMatch as any).profilePic as string;
    const userMatch = approvedUsers.find(
      (u) =>
        (cleanId && u.whatsapp && u.whatsapp.replace(/\s+/g, '') === cleanId) ||
        (cleanName && u.fullName?.trim().toLowerCase().replace(/\s+/g, ' ') === cleanName)
    );
    return userMatch?.profilePic || fallback || '';
  };

  useEffect(() => {
    if (!communityActive && !isAdmin) return;

    const q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'), limit(postLimit));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as CommunityPost[];
      setPosts(fetchedPosts);
    }, (error) => {
      console.error("Error loading community posts:", error);
    });

    return () => unsubscribe();
  }, [communityActive, isAdmin, postLimit]);

  const checkedPostsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const userId = currentUser?.whatsapp || currentUser?.uid;
    if (!userId || !posts.length) return;

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
            newLikes[post.id] = likeDoc.exists();
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
  }, [currentUser?.whatsapp, currentUser?.uid, posts, userLikes]);

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
    if (!currentUser) return;

    setUploading(true);
    try {
      let imageUrl = '';
      if (newPostImage) {
        imageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(newPostImage);
        });
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
    } finally {
      setUploading(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'communityPosts', postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const toggleLike = async (post: CommunityPost) => {
    if (!currentUser) return;
    const userId = currentUser.whatsapp || currentUser.uid;
    const likeRef = doc(db, 'communityPosts', post.id, 'likes', userId);
    const isCurrentlyLiked = !!userLikes[post.id];
    const newLikedStatus = !isCurrentlyLiked;

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
      <div className="fintech-card py-16 px-6 text-center max-w-xl mx-auto">
        <div className="w-14 h-14 bg-[#F4F6F9] border border-[#E5E7EB] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#64748B]">
          <Lock size={26} />
        </div>
        <h3 className="text-lg font-bold text-[#0F172A] mb-1.5">Community Is Currently Closed</h3>
        <p className="text-[#64748B] text-sm max-w-xs mx-auto leading-relaxed">
          The Admin has temporarily disabled the Community feed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Admin Control */}
      {isAdmin && (
        <div className="fintech-card p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${communityActive ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FEF2F2] text-[#DC2626]'}`}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">Community Control</p>
              <p className="text-xs text-[#64748B]">
                {communityActive ? 'Enabled for members' : 'Currently disabled'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onToggleActive?.(!communityActive)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              communityActive
                ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white'
                : 'bg-[#047857] hover:bg-[#065F46] text-white'
            }`}
          >
            {communityActive ? 'Disable' : 'Enable'}
          </button>
        </div>
      )}

      {/* Post Creator */}
      {communityActive && currentUser && (
        <div className="fintech-card p-4 sm:p-5">
          <div className="flex gap-3.5 mb-3.5">
            <div className="w-10 h-10 rounded-full bg-[#F4F6F9] border border-[#E5E7EB] overflow-hidden shrink-0">
              <CartoonAvatar src={currentUser.profilePic} name={currentUser.fullName} />
            </div>
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share an update or achievement with your team..."
                className="w-full fintech-input rounded-xl p-3.5 text-sm text-[#0F172A] resize-none min-h-[100px] placeholder:text-[#94A3B8]"
              />
            </div>
          </div>

          {imagePreview && (
            <div className="relative mb-4 rounded-xl overflow-hidden border border-[#E5E7EB] aspect-video bg-[#F4F6F9]">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setNewPostImage(null); setImagePreview(null); }}
                aria-label="Remove image"
                className="absolute top-2 right-2 w-8 h-8 bg-slate-900/75 text-white rounded-full flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F4F6F9] hover:bg-[#E5E7EB] border border-[#E5E7EB] font-semibold text-xs text-[#0F172A] transition-colors cursor-pointer"
            >
              <Camera size={15} className="text-[#0B4F9C]" />
              <span>Add Photo</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={createPost}
              disabled={uploading || (!newPostContent.trim() && !newPostImage)}
              className="bg-[#0B4F9C] hover:bg-[#094182] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-colors disabled:opacity-45 cursor-pointer"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>Publish Post</span>
            </button>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="fintech-card py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#F4F6F9] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-3 text-[#64748B]">
              <MessageSquare size={22} />
            </div>
            <p className="text-[#64748B] text-sm font-medium">No posts yet</p>
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
                resolveAvatar={resolveLiveAvatar}
                onLike={() => toggleLike(post)}
                onDelete={() => deletePost(post.id)}
                onCommentToggle={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                isCommentActive={activeCommentsPostId === post.id}
              />
            ))}
            {posts.length >= postLimit && (
              <div className="text-center py-2">
                <button
                  type="button"
                  onClick={() => setPostLimit(prev => prev + 12)}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-bold text-[#0B4F9C] transition-colors cursor-pointer"
                >
                  Load More Posts
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const PostCard = ({ post, currentUser, isAdmin, isLiked, resolveAvatar, onLike, onDelete, onCommentToggle, isCommentActive }: any) => {
  const isAuthor = currentUser && (currentUser.whatsapp === post.authorId || currentUser.uid === post.authorId);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    if (!isCommentActive || commentsLoaded) return;

    const loadComments = async () => {
      try {
        const q = query(collection(db, 'communityPosts', post.id, 'comments'), orderBy('createdAt', 'asc'), limit(50));
        const snapshot = await getDocs(q);
        const fetchedComments = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as PostComment[];
        setComments(fetchedComments);
        setCommentsLoaded(true);
      } catch (error) {
        console.error("Error loading comments:", error);
      }
    };
    loadComments();
  }, [isCommentActive, commentsLoaded, post.id]);

  const addComment = async () => {
    if (!commentText.trim() || !currentUser) return;
    setSendingComment(true);
    const trimmed = commentText;
    try {
      const payload = {
        userId: currentUser.whatsapp || currentUser.uid,
        userName: currentUser.fullName,
        userAvatar: currentUser.profilePic || '',
        text: trimmed,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'communityPosts', post.id, 'comments'), payload);
      setComments(prev => [...prev, { id: docRef.id, ...payload, createdAt: new Date() }]);
      setCommentText('');
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSendingComment(false);
    }
  };

  const deleteComment = async (commentId: string, commentAuthorId: string) => {
    const isCommentAuthor = currentUser && (currentUser.whatsapp === commentAuthorId || currentUser.uid === commentAuthorId);
    if (!isAdmin && !isCommentAuthor) return;

    try {
      await deleteDoc(doc(db, 'communityPosts', post.id, 'comments', commentId));
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const formattedDate = post.createdAt?.toDate
    ? new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(post.createdAt.toDate())
    : 'Just now';

  const postAuthorAvatar = resolveAvatar
    ? resolveAvatar(post.authorId, post.authorName, post.authorAvatar)
    : post.authorAvatar;

  return (
    <article className="fintech-card overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#F4F6F9] border border-[#E5E7EB] overflow-hidden shrink-0">
            <CartoonAvatar src={postAuthorAvatar} name={post.authorName} />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-[#0F172A] text-sm leading-tight truncate">{post.authorName}</h4>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-0.5 truncate">
              <span className="font-medium text-[#0B4F9C]">{post.authorRole}</span>
              <span aria-hidden="true">·</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
        {(isAuthor || isAdmin) && (
          <button
            type="button"
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer shrink-0"
            title="Delete post"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 sm:px-5 pb-4">
          <p className="text-[#1E293B] text-sm leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      )}

      {/* Image */}
      {post.imageUrl && (
        <div className="px-4 sm:px-5 pb-4">
          <div className="rounded-xl overflow-hidden border border-[#E5E7EB] max-h-[400px] bg-[#F4F6F9]">
            <img
              src={post.imageUrl}
              alt={post.authorName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain max-h-[400px]"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 sm:px-5 py-3 border-t border-[#E5E7EB] flex items-center gap-6">
        <button
          type="button"
          onClick={onLike}
          className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
            isLiked ? 'text-[#E11D48]' : 'text-[#64748B] hover:text-[#E11D48]'
          }`}
        >
          <Heart size={17} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={isLiked ? 0 : 2} />
          <span className="font-mono tabular-nums">{post.likesCount || 0}</span>
        </button>
        <button
          type="button"
          onClick={onCommentToggle}
          className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
            isCommentActive ? 'text-[#0B4F9C]' : 'text-[#64748B] hover:text-[#0B4F9C]'
          }`}
        >
          <MessageSquare size={17} />
          <span>Comments ({comments.length})</span>
        </button>
      </div>

      {/* Comments */}
      {isCommentActive && (
        <div className="bg-[#F8FAFC] border-t border-[#E5E7EB] p-4 sm:p-5 space-y-3.5">
          <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
            {comments.length === 0 ? (
              <p className="text-center py-3 text-xs text-[#64748B]">No comments yet</p>
            ) : (
              comments.map((comment) => {
                const isCommentAuthor = currentUser && (currentUser.whatsapp === comment.userId || currentUser.uid === comment.userId);
                const canDeleteComment = isAdmin || isCommentAuthor;

                return (
                  <div key={comment.id} className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] overflow-hidden shrink-0">
                      <CartoonAvatar
                        src={resolveAvatar ? resolveAvatar(comment.userId, comment.userName, comment.userAvatar) : comment.userAvatar}
                        name={comment.userName}
                      />
                    </div>
                    <div className="flex-1 bg-white p-3 rounded-xl border border-[#E5E7EB]">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <h5 className="text-xs font-bold text-[#0F172A] truncate">{comment.userName}</h5>
                        {canDeleteComment && (
                          <button
                            type="button"
                            onClick={() => deleteComment(comment.id, comment.userId)}
                            className="text-[#94A3B8] hover:text-[#DC2626] transition-colors p-0.5 cursor-pointer"
                            title="Delete comment"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-[#334155] leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {currentUser && (
            <div className="flex gap-2 pt-2 border-t border-[#E5E7EB]">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addComment()}
                placeholder="Write a comment..."
                className="flex-1 fintech-input rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
              />
              <button
                type="button"
                onClick={addComment}
                disabled={sendingComment || !commentText.trim()}
                className="bg-[#0B4F9C] hover:bg-[#094182] text-white w-10 h-9 rounded-xl flex items-center justify-center transition-colors disabled:opacity-45 cursor-pointer"
              >
                {sendingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default CommunitySection;
