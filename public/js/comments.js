document.addEventListener('DOMContentLoaded', () => {
    const storyIdInput = document.getElementById('story-id');
    if (!storyIdInput) return; // Not on story page

    const storyId = storyIdInput.value;
    const reactionButtons = document.querySelectorAll('.reaction-btn');
    const sortButtons = document.querySelectorAll('.sort-btn');
    const commentForm = document.getElementById('comment-form');
    const commentsList = document.getElementById('comments-list');

    let currentSort = 'newest';

    // --- Reactions ---
    const loadReactions = async () => {
        try {
            const res = await fetch(`/api/reactions/${storyId}`);
            const data = await res.json();

            if (data.success) {
                // Reset counts
                document.querySelectorAll('.reaction-btn .count').forEach(el => el.textContent = '0');
                let totalReactions = 0;

                // Update counts
                if (data.reactions) {
                    data.reactions.forEach(r => {
                        const btn = document.querySelector(`.reaction-btn[data-type="${r._id}"]`);
                        if (btn) {
                            btn.querySelector('.count').textContent = r.count;
                        }
                        totalReactions += r.count;
                    });
                }
                document.getElementById('total-reactions-count').textContent = totalReactions;

                // Highlight user reaction
                reactionButtons.forEach(btn => btn.classList.remove('active'));
                if (data.userReaction) {
                    const activeBtn = document.querySelector(`.reaction-btn[data-type="${data.userReaction}"]`);
                    if (activeBtn) activeBtn.classList.add('active');
                }
            }
        } catch (err) {
            console.error('Error loading reactions:', err);
        }
    };

    reactionButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const type = btn.getAttribute('data-type');
            try {
                const res = await fetch('/api/reactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ storyId, type })
                });
                const data = await res.json();

                if (!data.success) {
                    alert(data.error || 'Lütfen giriş yapın');
                    return;
                }

                // Reload reactions to get updated counts
                loadReactions();
            } catch (err) {
                console.error('Reaction error:', err);
            }
        });
    });

    // --- Comments ---
    const formatDate = (timestamp) => {
        const d = new Date(timestamp);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    const loadComments = async () => {
        try {
            const res = await fetch(`/api/comments/${storyId}?sort=${currentSort}`);
            const data = await res.json();

            if (data.success) {
                const comments = data.comments || [];
                document.getElementById('total-comments-count').textContent = comments.length;

                if (comments.length === 0) {
                    commentsList.innerHTML = '<p class="empty-comments-message">Henüz yorum yok. İlk sen yaz!</p>';
                    return;
                }

                commentsList.innerHTML = comments.map(c => `
                    <div class="comment-item" id="comment-${c._id}">
                        <div class="comment-avatar">
                            <img src="${c.userInfo && c.userInfo.avatar ? c.userInfo.avatar : '/images/default-avatar.png'}" alt="Avatar">
                        </div>
                        <div class="comment-content-wrapper">
                            <div class="comment-header">
                                <span class="comment-author">${c.userInfo ? c.userInfo.name || c.userInfo.username : 'Anonim'}</span>
                                <span class="comment-date">${formatDate(c.createdAt)}</span>
                            </div>
                            <div class="comment-text">${c.content.replace(/\n/g, '<br>')}</div>
                            <div class="comment-actions">
                                <button class="like-btn" data-id="${c._id}">
                                    <i class="icon ion-md-heart"></i>
                                    <span class="like-count">${c.likes ? c.likes.length : 0}</span>
                                </button>
                                <button class="reply-btn" data-id="${c._id}">Yanıtla</button>
                            </div>
                        </div>
                    </div>
                `).join('');

                // Attach like events
                document.querySelectorAll('.like-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const commentId = btn.getAttribute('data-id');
                        try {
                            const res = await fetch('/api/comments/like', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ commentId })
                            });
                            const data = await res.json();
                            if (data.success) {
                                btn.querySelector('.like-count').textContent = data.likesCount;
                                if (data.isLiked) {
                                    btn.style.color = '#e0245e';
                                } else {
                                    btn.style.color = 'inherit';
                                }
                            } else {
                                alert(data.error);
                            }
                        } catch (err) {
                            console.error('Like error:', err);
                        }
                    });
                });
            }
        } catch (err) {
            console.error('Error loading comments:', err);
        }
    };

    sortButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            sortButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = btn.getAttribute('data-sort');
            loadComments();
        });
    });

    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('comment-content').value;

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storyId, content })
            });
            const data = await res.json();

            if (data.success) {
                document.getElementById('comment-content').value = '';
                // Reload comments and reset to newest
                currentSort = 'newest';
                document.querySelector('[data-sort="newest"]').click(); // Also triggers loadComments
            } else {
                alert(data.error || 'Yorum eklenirken hata oluştu');
            }
        } catch (err) {
            console.error('Submit comment error:', err);
            alert('Bir hata oluştu');
        }
    });

    // Initial load
    loadReactions();
    loadComments();
});
