const button = document.querySelector('.login button')
const agree = document.querySelector('.other .agree input')
const myalert=document.querySelector('.login .alert')

function alertfn(msg,isSuccess){
  myalert.classList.add('show')
  myalert.innerHTML=msg
  const bgstyle=isSuccess? 'alert-success':'alert-anger'
  myalert.classList.add(bgstyle)//小问题

}

button.addEventListener('click',function(e){
  e.preventDefault()
  // if(!agree.checked){
  //   return alertfn('请勾选同意选项',false)
  // }
  const account=document.querySelector('.login .phone').value
  const password=document.querySelector('.login .password').value
  
  const xhr=new XMLHttpRequest()
  xhr.open('POST','http://101.33.224.224:3000/user/login')
  xhr.addEventListener('loadend',()=>{
  console.log(xhr.response);
  //小问题
  const response = JSON.parse(xhr.response)
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('userId',response.data.user_id)
  const {msg}=response
  if(msg==='登录成功'){
    document.querySelector('.loginPage').style.display='none'
    document.querySelector('.app').style.display='block'
  }else{
    alertfn(msg,false)
  }
  })
  xhr.setRequestHeader('Content-Type','application/json')
  const userobj ={
    account,
    password
  }
  const userstr = JSON.stringify(userobj)
  xhr.send(userstr)
  // 登录成功后应存储token
  
})

// button.addEventListener('click', async function(e) {
//   e.preventDefault();
  
//   if (!agree.checked) {
//     return alertfn('请勾选同意选项', false);
//   }

//   const account=document.querySelector('.login .phone').value
//   const password=document.querySelector('.login .password').value

//     const response = fetch('http://101.33.224.224:3000/user/login', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': localStorage.getItem('token')
//       },
//       body: JSON.stringify({
//         account,
//         password
//       })
//     });
//     const data = response.json();
//     console.log(data);
    
//     if (data.code === 0) {
//       localStorage.setItem('token', data.data.token);
//       document.querySelector('.loginPage').style.display = 'none';
//       document.querySelector('.app').style.display = 'block';
//     } else {
//       alertfn(data.msg || '登录失败', false);
//     }

// });