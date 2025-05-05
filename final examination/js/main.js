const ul = document.querySelector('.main .header ul');
const line = document.querySelector('.line');
const item=document.querySelectorAll('.main .tab-content .item')
import {showPage} from './utils.js'
// function showPage(pageId) {
//   const pages = document.querySelectorAll('.page');
//   pages.forEach(page => {
//       page.classList.remove('active');
//   });
//   const targetPage = document.querySelector(`.tab-content [name='${pageId}']`);
//   targetPage.classList.add('active');
//   console.log(targetPage);
// }

// 头部导航栏
ul.addEventListener('click', function (e) {
  if (e.target.tagName === 'A') {
    const itemLeft = e.target.offsetLeft;
    const itemWidth = e.target.offsetWidth;
    const lineWidth = line.offsetWidth;
    const targetLeft = itemLeft + (itemWidth / 2) - (lineWidth / 2);
    line.style.left = targetLeft + 'px';

    document.querySelector('.main .header .active').classList.remove('active')
    e.target.classList.add('active')
    console.log(e.target.id);
    showPage(e.target.id,1)
    content('精选')
  }
});

// 推荐页导航栏
const ul2=document.querySelector('.recommend .nav ul')
ul2.addEventListener('click',function(e){
  document.querySelector('.recommend .nav .active').classList.remove('active')
  e.target.classList.add('active')
})
const xhr= new XMLHttpRequest()
xhr.open('GET','http://101.33.224.224:3000/post/getTopicList')
xhr.addEventListener('loadend',function(){
  console.log(xhr.response);
  const topic=JSON.parse(xhr.response)
  const names = ['精选','同城']
  topic.data.forEach((item)=>{
    names.push(item.name)
  })
  const title=names.map((item,index)=>{
    if(index===0){
      return `<li><a href="javascript:;" class="active">${item}</a></li>`
    }else{
      return `<li><a href="javascript:;">${item}</a></li>`
    }
  }).join('')
  console.log(title)
  document.querySelector('.recommend .nav ul').innerHTML=title
})
xhr.send()


function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

// 瀑布流
async function renderWaterfall(data) {
  const contentDiv = document.querySelector('.recommend .content');
  contentDiv.innerHTML = ''; // 清空旧内容
  // 创建两列容器
  const columns = [document.createElement('div'), document.createElement('div')];
  columns.forEach((col, index) => {
    col.className = `column column-${index + 1}`;
    contentDiv.appendChild(col);
    // console.log(document.querySelectorAll('.column').length);
  });
  // 按顺序加载内容
  for (const item of data) {
    const { pic, title, like_count ,post_id} = item
    const imgUrl = `http://101.33.224.224:3000/${pic[0]}` // 修正图片路径
    console.log(imgUrl);
    try {
      await loadImage(imgUrl); // 等待图片加载完成
      const card = createCardElement({
        imgUrl,
        title,
        like_count,
        post_id
      });
      // 寻找当前最短列
      // 使用更精确的 getBoundingClientRect()
      const getColumnHeight = (col) => 
        col.getBoundingClientRect().height + 
        parseInt(window.getComputedStyle(col).marginTop);

      const minHeightColumn = columns.reduce((prev, curr) => 
        getColumnHeight(curr) < getColumnHeight(prev) ? curr : prev
      );
      // console.log(curr.offsetHeight);
      // console.log(prev.offsetHeight);
      
      // console.log(minHeightColumn);
      minHeightColumn.appendChild(card)
    } catch (error) {
      console.error('图片加载失败:', imgUrl)
    }
  }
}

function createCardElement({ imgUrl, title, like_count ,post_id}) {
  const card = document.createElement('div')
  card.className = 'artical'
  card.dataset.postId=post_id
  card.innerHTML = `
    <img src="${imgUrl}" alt="${title}" >
    <div class="text">
      <div class="title">${title}</div>
      <div class="like">
        <span class="number">${like_count}</span>
        <span class="iconfont icon-aixin"></span>
      </div>
    </div>
  `
  // 点赞功能
  const likeBtn = card.querySelector('.icon-aixin')
  likeBtn.addEventListener('click', () => {
    const countSpan = card.querySelector('.number')
    const isLiked = likeBtn.classList.toggle('liked')
    countSpan.textContent = isLiked ? +like_count + 1 : like_count
  })
  return card;
}
// 加载图片
async function content(location) {
  try {
    let apiUrl=''
    if(location==='精选'){
      apiUrl= 'http://101.33.224.224:3000/post/getCurationPostList?page=1&size=5'
    }else if(location ==='广州'){
      apiUrl= `http://101.33.224.224:3000/post/postLocationList?page=1&size=5&location=%E5%B9%BF%E5%B7%9E`
    }else{
      apiUrl = `http://101.33.224.224:3000/post/postTopicsList?page=1&size=5&topic=${location}&actionType=0`
    }
    const response = await fetch(apiUrl);
    const { data } = await response.json();
    console.log(data);
    renderWaterfall(data);
  } catch (err) {
    console.error('加载失败:', err);
  }
}
//点击跳转文章详情页
document.querySelector('.recommend .content').addEventListener('click', e => {
  const card = e.target.closest('.artical');
  if (card) {
    document.querySelector('.app main').style.display='none'
    document.querySelector('.app .article11').style.display='block'
    // 一个传入post_id的函数
    loadPostDetail(card.dataset.postId)
  }
});
// 退出文章详情页
document.querySelector('.article11 header .user .back-btn').addEventListener('click',()=>{
  document.querySelector('.app main').style.display='block'
  document.querySelector('.app .article11').style.display='none'
})


// 文章详情页
async function loadPostDetail(postId) {
  try {
      const response = await fetch(`http://101.33.224.224:3000/post/getPostDetail?post_id=${postId}`);
      const { code, data } = await response.json();
      if (code === 0) {
          // 动态生成轮播图
          renderCarousel(data.pic);
          // 填充文章内容
          updateArticleContent(data);
          // 初始化交互事件
          initCarouselControls(data.pic.length);
          userinfor(data.user_id)
          setupFollowButton(data.user_id);
          userinfor(data.user_id);
          like(postId)
          select(postId)
          loadComments(postId,data.user_id)
      }
  } catch (error) {
      console.error('加载失败:', error);
  }
}

// 关注功能
function setupFollowButton(followedId) {
  const followBtn = document.querySelector('.article11 header .user .follow1');
  const newFollowBtn = followBtn.cloneNode(true);
  followBtn.parentNode.replaceChild(newFollowBtn, followBtn);
  newFollowBtn.addEventListener('click', async function() {
      const isFollowing = this.classList.contains('active');
      const followId = localStorage.getItem('userId');
      try {
          const endpoint = isFollowing 
              ? 'http://101.33.224.224:3000/user/cancelFocusUser' 
              : 'http://101.33.224.224:3000/user/focusUser';
          const formData = new FormData();
          formData.append('follow_id', followId);
          formData.append('followed_id', followedId);
          const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: formData
          });
      
          if (!response.ok) throw new Error('请求失败');
          const result = await response.json();
          console.log(result);
          this.classList.toggle('active');
          this.innerHTML = this.classList.contains('active') ? '已关注' : '关注';
         
      } catch (error) {
          console.error('关注操作失败:', error);
      }
  });
}
// 点赞
function like(postId) {
  const likeBtn = document.querySelector('.article11 .interactions .likes');
  const newlikeBtn = likeBtn.cloneNode(true);
  likeBtn.parentNode.replaceChild(newlikeBtn, likeBtn);
  newlikeBtn.addEventListener('click', async function() {
      const islikeing = this.classList.contains('active');
      const likeId = localStorage.getItem('userId');
      try {
          const endpoint = islikeing 
              ? 'http://101.33.224.224:3000/user/cancelLikePost' 
              : 'http://101.33.224.224:3000/user/likePost';
          const formData = new FormData();
          formData.append('post_id', postId);
          formData.append('user_id', likeId);
          const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: formData
          });
          if (!response.ok) throw new Error('请求失败');
          const result = await response.json();
              this.classList.toggle('active');
              this.innerHTML = this.classList.contains('active') ? '已关注' : '关注';
      } catch (error) {
          console.error('点赞操作失败:', error);
      }
  });
}
//收藏
function select(postId) {
  const selectBtn = document.querySelector('.article11 .interactions .collects');
  const newselectBtn = selectBtn.cloneNode(true);
  selectBtn.parentNode.replaceChild(newselectBtn, selectBtn);
  newselectBtn.addEventListener('click', async function() {
      const isselecting = this.classList.contains('active');
      const selectId = localStorage.getItem('userId');
      try {
          const endpoint = isselecting 
              ? 'http://101.33.224.224:3000/user/cancelCollectPost' 
              : 'http://101.33.224.224:3000/user/collectPost';
          const formData = new FormData();
          formData.append('post_id', postId);
          formData.append('user_id', selectId);
          const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: formData
          });
          if (!response.ok) throw new Error('请求失败');
          const result = await response.json();
              this.classList.toggle('active');
              this.innerHTML = this.classList.contains('active') ? '已关注' : '关注';
      } catch (error) {
          console.error('点赞操作失败:', error);
      }
  });
}

// 发布者信息
function userinfor(user_id){
  const xhr = new XMLHttpRequest()
  xhr.open('GET',`http://101.33.224.224:3000/user/getUserInfo?user_id=${user_id}`)
  xhr.addEventListener('loadend',()=>{
    console.log(xhr.response);
    const {data} = JSON.parse(xhr.response)
    document.querySelector('.article11 header .user .avatar').style.backgroundImage=`url(http://101.33.224.224:3000/${data.avatar})`
    document.querySelector('.article11 header .user .username').innerHTML=data.username
  })
  xhr.send()
}

// 动态生成轮播图结构
function renderCarousel(pics) {
  const carouselInner = document.querySelector('.carousel-inner');
  const dotsContainer = document.querySelector('.carousel-dots');
  carouselInner.innerHTML = pics.map((pic, index) => `
  <div class="carousel-item ${index === 0 ? 'active' : ''}">
      <img src="http://101.33.224.224:3000/${pic}" alt="轮播图">
  </div>
  `).join('');

  dotsContainer.innerHTML = pics.map((_, index) => `
    <div class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
  `).join('');
}

// 填充文章内容
function updateArticleContent(data) {
  document.querySelector('.article11 .content .meta .title').textContent = data.title;
  document.querySelector('.article11 .content .meta .content-text').textContent = data.content;
  document.querySelector('.article11 .content .meta .location').textContent = data.location;
  document.querySelector('.article11 .content .meta .time').textContent = new Date(data.created_time).toLocaleDateString();
  document.querySelector('.article11 .content .meta .comment').textContent =`${data.comment_count}条评论`

  // 动态插入话题标签
  const topicsContainer = document.querySelector('.topics');
  data.topics.forEach(topic => {
      const tag = document.createElement('span');
      tag.className = 'topic-tag';
      tag.textContent = `#${topic}`;
      topicsContainer.appendChild(tag);
  });
}

// 初始化轮播控制逻辑
function initCarouselControls(totalSlides) {
  let currentIndex = 0;
  const container = document.querySelector('.carousel');
  const inner = document.querySelector('.carousel-inner');
  let isDragging = false;
  let startPosX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;
  const swipeThreshold = 50; // 滑动阈值（像素）

  // 鼠标事件处理
  container.addEventListener('mousedown', dragStart);
  container.addEventListener('mousemove', drag);
  container.addEventListener('mouseup', dragEnd);
  container.addEventListener('mouseleave', dragEnd);

  // 触摸事件处理（可选）
  container.addEventListener('touchstart', (e) => dragStart(e.touches[0]));
  container.addEventListener('touchmove', (e) => drag(e.touches[0]));
  container.addEventListener('touchend', dragEnd);

  function dragStart(e) {
      isDragging = true;
      startPosX = e.clientX;
      prevTranslate = currentTranslate;
      inner.style.transition = 'none'; // 禁用过渡效果
      cancelAnimationFrame(animationID);
  }

  function drag(e) {
      if (!isDragging) return;
      const currentPosition = e.clientX;
      const diff = currentPosition - startPosX;
      currentTranslate = prevTranslate + diff;
      // 应用实时拖拽效果
      inner.style.transform = `translateX(${currentTranslate}px)`;
  }

  function dragEnd() {
      if (!isDragging) return;
      isDragging = false;
      // 计算滑动距离
      const movedBy = currentTranslate - prevTranslate;
      // 启用过渡效果
      inner.style.transition = 'transform 0.3s ease-out';
      // 判断滑动方向
      if (Math.abs(movedBy) > swipeThreshold) {
          movedBy > 0 ? goToSlide(currentIndex - 1) : goToSlide(currentIndex + 1);
      } else {
          resetPosition();
      }
  }

  function goToSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      
      currentIndex = index;
      currentTranslate = -index * container.offsetWidth;
      inner.style.transform = `translateX(${currentTranslate}px)`;
      
      // 更新导航圆点
      updateDots(index);
      updataimg(index)
  }

  function resetPosition() {
      inner.style.transform = `translateX(${-currentIndex * container.offsetWidth}px)`;
  }
  function updataimg(index){
    const carousels = document.querySelectorAll('.app .article11 .carousel-inner div');
    carousels.forEach(carousel => carousel.classList.remove('active'));
    carousels[index].classList.add('active');
  }
  function updateDots(index) {
      const dots = document.querySelectorAll('.dot');
      dots.forEach(dot => dot.classList.remove('active'));
      dots[index].classList.add('active');
  }

  // 初始化位置
  resetPosition();
}

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('post_id');
  if (postId) loadPostDetail(postId);
});

// 评论
let currentParentId = 0; // 当前回复的父评论ID
let currentTargetUserId = 0; // 当前回复的目标用户ID

// 加载评论
async function loadComments(postId,user_id) {
  try {
    const res = await fetch(
      `http://101.33.224.224:3000/comment/getAllComments?post_id=${postId}&page=1&limit=10`
    );
    const { data } = await res.json();
    
    renderComments(data.list,user_id);
    initFoldControl(data.total);
  } catch (err) {
    console.error('评论加载失败:', err);
  }
}

// 渲染评论
function renderComments(comments,user_id) {
  const container = document.querySelector('.comment-main');
  
  comments.forEach(comment => {
    const isAuthor = comment.user_id === parseInt(user_id);
    const isuser = comment.user_id === parseInt(localStorage.getItem('userId'));
    const childComments = comment.child_comments || [];
    
    const commentEl = document.createElement('div');
    commentEl.className = `comment-item${isAuthor ? ' is-author' : ''}`;
    commentEl.dataset.commentId = comment.comment_id;
    commentEl.innerHTML = `
      <div class="comment-header">
        <img class="comment-avatar" src="http://101.33.224.224:3000/${comment.avatar}">
        <span class="username">${comment.username}</span>
        ${isAuthor ? '<span class="badge">PO主</span>' : ''}
      </div>
      <p class="content">${comment.content}</p>
      <div class="comment-actions">
        <span class="time">${formatTime(comment.created_at)}</span>
        <span class="reply-btn">回复</span>
        ${isAuthor ? `<span class="delete-btn">删除</span>` : ''}
      </div>
      ${childComments.length ? `
        <div class="child-comments">
          ${childComments.map(child => `
            <div class="comment-item">
              <div class="comment-header">
                <img class="comment-avatar" src="http://101.33.224.224:3000/${child.avatar}">
                <span>${child.username}</span>
                <span class="reply-to">回复 @${child.target_username}</span>
              </div>
              <p class="content">${child.content}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
    
    // 删除功能
    if(isuser) {
      commentEl.querySelector('.delete-btn').addEventListener('click', () => {
        deleteComment(comment.comment_id);
      });
    }
    
    // 回复功能
    commentEl.querySelector('.reply-btn').addEventListener('click', () => {
      currentParentId = comment.comment_id;
      currentTargetUserId = comment.user_id;
      document.querySelector('.interactions input').placeholder = `回复 @${comment.username}`;
    });
    
    container.appendChild(commentEl);
  });
}


// 推荐页内容切换
document.querySelector('.main .tab-content .recommend .nav ul').addEventListener('click',(e)=>{
  if(e.target.tagName==='A'){
    console.log(e.target.tagName);
    document.querySelector('.main .tab-content .recommend .content').innerHTML=''
    const category = e.target.textContent === '同城' ? '广州' : e.target.textContent
    // 精选不编码，其他参数编码
    console.log(category);
    const encodedLoc = (category === '精选' || '广州') ? category : encodeURIComponent(category)
    content(encodedLoc)
  }
})



// 发布页面
document.querySelector('main footer ul li:nth-child(3)').addEventListener('click',()=>{
  document.querySelector('.app .create1').style.display='block'
  document.querySelector('main').style.display='none'
})

// 上传图片
// 图片管理（支持拖拽排序）
let images = [];
const MAX_IMAGES = 9;

// 关闭按钮
document.querySelector('.app .create1 .close-btn ').addEventListener('click',()=>{
  document.querySelector('.modal').style.display = 'flex';
})

// 模态框操作处理
document.querySelectorAll('.modal-option').forEach(option => {
  option.addEventListener('click', () => {
    const modal = document.querySelector('.modal');
    modal.style.display = 'none';
    
    if(option.textContent === '存草稿') {
      saveDraft();
    } else if(option.textContent === '放弃') {
      resetEditor();
    }
  });
});

// 图片上传功能
document.querySelector('.image-container').addEventListener('click', e => {
  if(e.target.closest('.add-image')) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = e => {
      handleImageUpload(e.target.files);
      input.value = '';
    };
    input.click();
  }
});

// 图片处理逻辑
function handleImageUpload(files) {
  const remainingSlots = MAX_IMAGES - images.length;
  const newFiles = Array.from(files).slice(0, remainingSlots);
  
  newFiles.forEach(file => {
    images.push({
      id: Date.now(),
      url: URL.createObjectURL(file),
      file
    });
  });
  
  renderImages();
}

// 图片渲染与拖拽排序
function renderImages() {
  const container = document.querySelector('.image-container');
  container.innerHTML = '';
  
  images.forEach((img, index) => {
    const item = document.createElement('div');
    item.className = 'image-item';
    item.draggable = true;
    item.innerHTML = `
      <img src="${img.url}">
      <div class="delete-btn" data-index="${index}">×</div>
    `;

    // 拖拽事件处理
    // item.addEventListener('dragstart', e => {
    //   e.dataTransfer.setData('text/plain', index);
    // });
    
    // item.addEventListener('dragover', e => {
    //   e.preventDefault();
    //   item.style.opacity = '0.5';
    // });
    
    // item.addEventListener('drop', e => {
    //   e.preventDefault();
    //   const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    //   const toIndex = index;
    //   [images[fromIndex], images[toIndex]] = [images[toIndex], images[fromIndex]];
    //   renderImages();
    // });

    container.appendChild(item);
  });

  // 添加按钮
  if(images.length < MAX_IMAGES) {
    const addBtn = document.createElement('div');
    addBtn.className = 'image-item add-image';
    addBtn.textContent = '+';
    container.appendChild(addBtn);
  }
}

// 删除图片功能
document.querySelector('.image-container').addEventListener('click', e => {
  if(e.target.classList.contains('delete-btn')) {
    const index = parseInt(e.target.dataset.index);
    images.splice(index, 1);
    renderImages();
  }
});

// 发布功能实现
document.querySelector('.publish-btn').addEventListener('click', async () => {
  if(images.length === 0) {
    showToast('请至少添加一张图片', true);
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('title', document.querySelector('.title-input').value);
    formData.append('content', document.querySelector('.content-editor').innerHTML);
    formData.append('articleCover', images[0].file);
    formData.append('is_published', 1);
    
    // 添加地点
    const location = document.querySelector('.location-tag').textContent;
    if(location) formData.append('location', location);
    
    // 添加主题
    formData.append('topics','头像')

    const response = await fetch('http://101.33.224.224:3000/post/addPost', {
      method: 'POST',
      headers: new Headers({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }), 
      body: formData
    });
    console.log(response);
    
    if (!response.ok) { 
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.response = await response.json();
      throw error;
    }

    const data = await response.json();
    console.log(data);
    
    if (data.code === 0) {
      showToast('发布成功');
      resetEditor();
    } else {
      throw new Error(`API Error: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(error);
    
  }
});

// 草稿保存功能
async function saveDraft() {
  const formData = new FormData();
  formData.append('title', document.querySelector('.title-input').value);
  formData.append('content', document.querySelector('.content-editor').innerHTML);
  formData.append('is_published', 0);
  
  if(images.length > 0) {
    formData.append('articleCover', images[0].file);
  }
  
  try {
    await axios.post('http://101.33.224.224:3000/post/addPost', formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    showToast('草稿已保存至个人页');
    resetEditor();
  } catch (error) {
    handleError(error);
  }
}

// 富文本功能实现
const editor = document.querySelector('.content-editor');
let lastCaretPos = 0;

editor.addEventListener('input', () => {
  const text = editor.textContent;
  const newChar = text[text.length - 1];
  
  if(newChar === '#' || newChar === '@') {
    showSuggestionPanel(newChar);
  }
});

function showSuggestionPanel(type) {
  const panel = document.createElement('div');
  panel.className = 'suggestion-panel';
  
  // 示例数据
  const items = type === '#' 
    ? ['1234', '足球', '壁纸'] 
    : ['用户A', '用户B', '用户C'];
  
  items.forEach(item => {
    const option = document.createElement('div');
    option.className = 'suggestion-item';
    option.textContent = item;
    option.onclick = () => insertSuggestion(item, type);
    panel.appendChild(option);
  });
  
  editor.parentNode.appendChild(panel);
}

function insertSuggestion(text, type) {
  const range = document.createRange();
  range.setStart(editor.childNodes[0], lastCaretPos - 1);
  range.deleteContents();
  
  const tag = document.createElement('span');
  tag.className = `${type === '#' ? 'topic-tag' : 'mention-tag'}`;
  tag.textContent = `${type}${text}`;
  tag.contentEditable = false;
  
  range.insertNode(tag);
  range.collapse(false);
  
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

// 弹框
function showToast(msg, isError = false) {
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : 'success'}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 2000);
}

// 清空内容
function resetEditor() {
  images = [];
  renderImages();
  document.querySelector('.title-input').value = '';
  document.querySelector('.content-editor').innerHTML = '';
  document.querySelector('.create1').style.display = 'none';
  document.querySelector('main').style.display = 'block';

}



// 我的页面
// 上传背景图
document.querySelector('.app .user .bgi .background').addEventListener('change',(e) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const file = e.target.files[0];
  const fd = new FormData()
  fd.append('background_image', file);
  fd.append('user_id', userId);
  const xhr = new XMLHttpRequest();
  // 初始化请求（必须先open再设置header）
  xhr.open('POST', 'http://101.33.224.224:3000/user/upload-background');
  // 设置认证头（必须放在open之后）
  xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  xhr.addEventListener('loadend',()=>{
    const response = JSON.parse(xhr.response);
    const imgUrl = response.data.background_image;
    document.querySelector('.app .user .bgi label').style.backgroundImage = `url(http://101.33.224.224:3000/${imgUrl})`;
    localStorage.setItem('bgimg',imgUrl)
  })
  xhr.send(fd);
});
const bgUrl = localStorage.getItem('bgimg')
console.log(bgUrl)
document.querySelector('.app .user .bgi label').style.backgroundImage = `url(http://101.33.224.224:3000/${bgUrl})`;
// 用户基本信息
const xhr1=new XMLHttpRequest()
const apiUrl = new URL('http://101.33.224.224:3000/user/getUserInfo');
apiUrl.searchParams.append('user_id', localStorage.getItem('userId'));
xhr1.responseType = 'json';
xhr1.open('GET',apiUrl.href,true)
const token = localStorage.getItem('token');
if (token) {
  xhr1.setRequestHeader('Authorization', `Bearer ${token}`);
}
xhr1.addEventListener('loadend',()=>{
  const response = xhr1.response
  const userData = response.data
  const head=document.querySelector('main .user .information .head')
  head.style.backgroundImage=`url(http://101.33.224.224:3000/${userData.avatar})`
  const username=document.querySelector('main .user .information .text .name')
  username.innerHTML=userData.username
  const biography=document.querySelector('main .user .information .text .self')
  biography.innerHTML=userData.biography
})
xhr1.send()


// 设置
const set = document.querySelector('main .user .bgi .set')
const setting=document.querySelector('.app .setting')
set.addEventListener('click',()=>{
  document.querySelector('main').style.display='none'
  setting.classList.add('active')
})
const exit = document.querySelector('.app .setting .function button')
exit.addEventListener('click',()=>{
  document.querySelector('.app').style.display='none'
  document.querySelector('.loginPage').style.display='block'
  location.reload()//刷新
})
// 返回
document.querySelector('.app .setting header span').addEventListener('click',()=>{
  setting.classList.remove('active')
  document.querySelector('main').style.display='block'
})
// 编辑资料
const edit = document.querySelector('.app .setting .function li:first-child')
const editcontent = document.querySelector('.app .edit')
edit.addEventListener('click',()=>{
  setting.classList.remove('active')
  editcontent.classList.add('active')
})
document.querySelector('.app .edit header span').addEventListener('click',()=>{
  editcontent.classList.remove('active')
  setting.classList.add('active')
})


document.getElementById('avatarInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  console.log(file);
  
  if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
          document.querySelector('.avatar-preview').style.backgroundImage = `url(${e.target.result}`;
      }
      reader.readAsDataURL(file);
  }
});

// 表单提交处理
document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  
  // 构建请求参数
  formData.append('user_id', localStorage.getItem('userId')) 
  formData.append('avatar', document.getElementById('avatarInput').files[0])
  formData.append('username', document.getElementById('username').value)
  formData.append('gender', document.querySelector('input[name="gender"]:checked').value)
  formData.append('birthday', document.getElementById('birthday').value)
  formData.append('location', document.getElementById('location').value)
  formData.append('biography', document.getElementById('biography').value)

  try {
      const response = await fetch('http://101.33.224.224:3000/user/editUserInfo', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
      });

      if (response.ok) {
          const result = await response.json();
          if (result.code === 0) {
              alert('资料更新成功');
              // 这里可以添加跳转逻辑
          } else {
              alert(`更新失败: ${result.msg}`);
          }
      } else {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
  } catch (error) {
      console.error('请求失败:', error);
      alert('网络请求异常，请稍后重试');
  }
});

// 初始化性别选择样式
document.querySelectorAll('input[name="gender"]').forEach(radio => {
  radio.addEventListener('change', () => {
      document.querySelectorAll('.gender-option').forEach(div => {
          div.classList.remove('selected');
      });
      if (radio.checked) {
          radio.parentElement.classList.add('selected');
      }
  });
});


// 搜索结果页导航栏
const ul1=document.querySelector('.app .searchresult .categroy ul')
const line2=document.querySelector('.app .searchresult .categroy .line')
ul1.addEventListener('click', function (e) {
  if (e.target.tagName === 'LI') {
    const itemLeft = e.target.offsetLeft;
    const itemWidth = e.target.offsetWidth;
    const lineWidth = line.offsetWidth;
    const targetLeft = itemLeft + (itemWidth / 2) - (lineWidth / 2);
    line2.style.left = targetLeft - 8 + 'px';//有margin-left使计算不准确

    document.querySelector('.app .searchresult .categroy .active ').classList.remove('active')
    e.target.classList.add('active')
    // console.log(e.target.id);
    // showPage(e.target.id,1)
    // content('精选')
  }
});

//底部导航栏
const lis=document.querySelectorAll('.app footer ul li')
const spanSet=document.querySelectorAll('.span1')
const iconfontSet=document.querySelectorAll('.app footer ul .iconfont')
const page0s=document.querySelectorAll('.page0')
lis.forEach((i,index)=>{
  i.addEventListener('click',()=>{
    spanSet.forEach((j)=>{
      j.classList.remove('active')
    })
    iconfontSet.forEach((k)=>{
      k.classList.remove('active')
    })
    page0s.forEach((k)=>{
      k.classList.remove('active')
    })
    spanSet[index].classList.add('active')
    iconfontSet[index].classList.add('active')
    page0s[index].classList.add('active')
    console.log( page0s[index].classList);
  })
})

// ul3.addEventListener('click',function(e){
//   console.log(e);
//   if(e.target.tagName==='A'){
//     console.log(e.target.tagName);
//     document.querySelector('.app footer .active').classList.remove('active')
//     const aElement = e.target.querySelector('span');
//     aElement.classList.add('active');
//     showPage(aElement.id, 0);
//   }
// })