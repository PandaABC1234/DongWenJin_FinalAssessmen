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



// 精选
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}
// 瀑布流布局
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
    const { pic, title, like_count } = item
    const imgUrl = `http://101.33.224.224:3000/${pic}` // 修正图片路径
    try {
      await loadImage(imgUrl); // 等待图片加载完成
      const card = createCardElement({
        imgUrl,
        title,
        like_count
      });
      // 寻找当前最短列
      const minHeightColumn = columns.reduce((prev, curr) => 
        curr.offsetHeight < prev.offsetHeight ? curr : prev
      )
      minHeightColumn.appendChild(card)
    } catch (error) {
      console.error('图片加载失败:', imgUrl)
      // 可以添加占位图逻辑
    }
  }
}
// 创建文章
function createCardElement({ imgUrl, title, like_count }) {
  const card = document.createElement('div')
  card.className = 'artical'
  card.innerHTML = `
    <img src="${imgUrl}" alt="${title}">
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
// 页面加载时自动获取数据
document.addEventListener('DOMContentLoaded', async () => {
try {
  const response = await fetch(`http://101.33.224.224:3000/post/getCurationPostList?page=1&size=5`)
  const { data } = await response.json()
  renderWaterfall(data)
} catch (error) {
  console.error('数据加载失败:', error)
}
})

function content(address){
  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }
  // 瀑布流布局
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
      const { pic, title, like_count } = item
      const imgUrl = `http://101.33.224.224:3000/${pic}` // 修正图片路径
      try {
        await loadImage(imgUrl); // 等待图片加载完成
        const card = createCardElement({
          imgUrl,
          title,
          like_count
        });
        // 寻找当前最短列
        const minHeightColumn = columns.reduce((prev, curr) => 
          curr.offsetHeight < prev.offsetHeight ? curr : prev
        )
        minHeightColumn.appendChild(card)
      } catch (error) {
        console.error('图片加载失败:', imgUrl)
        // 可以添加占位图逻辑
      }
    }
  }
  // 创建文章
  function createCardElement({ imgUrl, title, like_count }) {
    const card = document.createElement('div')
    card.className = 'artical'
    card.innerHTML = `
      <img src="${imgUrl}" alt="${title}">
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
  // 页面加载时自动获取数据
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch(`http://101.33.224.224:3000/post/postLocationList?page=1&size=5&location=${address}`)
      const { data } = await response.json()
      renderWaterfall(data)
    } catch (error) {
      console.error('数据加载失败:', error)
    }
  })
}


// 推荐页内容切换
document.querySelector('.main .tab-content .recommend .nav ul').addEventListener('click',(e)=>{
  if(e.target.tagName==='A'){
    console.log(e.target.tagName);
    document.querySelector('.main .tab-content .recommend content div').innerHTML=''
    let category = ''
    if(e.target.innerHTML==='同城'){
      category = '广州'
    } else{
      category=e.target.innerHTML
    }
    const encodedLocation = encodeURIComponent(category);//将地名转化成编码形式
    content(encodedLocation)
  }
})
  

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

// 我的页面
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
