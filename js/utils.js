export function showPage(pageId,number) {
  const pages = document.querySelectorAll(`.page${number}`);
  console.log(pages);
  pages.forEach(page => {
      page.classList.remove('active');
  });
  const targetPage = document.querySelector(`[name='${pageId}']`);
  console.log(targetPage);
  
  targetPage.classList.add('active');
}
// pageid是导航栏的id属性值，number是页面大类的值
// 比如主页面（动态，闪聊...是第一个大页面，小森林，关注，推荐是第二个大页面）
// 导航栏的id属性值与下面大盒子的class标签值相同