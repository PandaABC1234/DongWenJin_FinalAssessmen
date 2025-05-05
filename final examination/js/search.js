// 搜索
document.querySelector('.main .header .right .search').addEventListener('click',()=>{
  document.querySelector('main').style.display='none'
  document.querySelector('.app .search0').style.display='block'
})

document.querySelector('.app .search0 .search1 .cancel').addEventListener('click',()=>{
  document.querySelector('.app .search0').style.display='none'
  document.querySelector('main').style.display='block'
})
//搜索推荐
const title = document.querySelector('.app .search0 .recommend1 .content')
const xhr = new XMLHttpRequest()
xhr.open('GET','http://101.33.224.224:3000/post/recommendList?page=2&size=8')
xhr.addEventListener('loadend',()=>{
  console.log(xhr.response);
  const  response= JSON.parse(xhr.response)
  console.log(response);
  const itemNames = response.data.map(item => item.item_name);
  console.log(itemNames); 
  // const str = ''
  const content = itemNames.map((item)=>{
    return `<div class="text">${item}</div>`
  }).join('')
  title.innerHTML=content
})
xhr.send()

//删除历史记录
const del= document.querySelector('.app .search0 .recently .title .delete')
del.addEventListener('click',()=>{
  title.innerHTML=''
})

// 点击搜索记录跳转到搜索结果页
// const text = document.querySelectorAll('.app .search0 .recently .content .tex')
document.addEventListener('DOMContentLoaded', () => {
  title.addEventListener('click',(e)=>{
    if (e.target.classList.contains('text')) {
      document.querySelector('.app .search0').style.display = 'none'
      document.querySelector('.app .searchresult').style.display = 'block'
    }
  })
})


// 搜索结果页
// 退出到搜索页
document.querySelector('.app .searchresult .search2 .cancel').addEventListener('click',()=>{
  document.querySelector('.app .searchresult').style.display='none'
  document.querySelector('.app .search0').style.display='block'
})