var app = getApp()
const md5 = require('md5.js');

Page({
  data: {
   //判断小程序的API，回调，参数，组件等是否在当前版本可用。
   canIUse: wx.canIUse('button.open-type.getUserInfo'),
   isHide: false,
   avatar:'',
   pictureName:'头像图片',
   username:'',
   password:'',
   confirmPassword:''
  },
onLoad:function(){

},
uploadAvatar(){
  var that = this;
  wx.chooseImage({
    count: 1,  //最多可以选择的图片总数
    success: function (res) {
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      var tempFilePaths = res.tempFilePaths;
      //启动上传等待中...
      wx.showToast({
        title: '正在上传...',
        icon: 'loading',
        mask: true,
        duration: 2000
      })
  wx.uploadFile({
    url: `${app.globalData._server}/products/uploadFile`,
    filePath: tempFilePaths[0],
    name: 'file',
    header: {
      "Content-Type": "multipart/form-data"
    },
    success: function (res) {
      var data = JSON.parse(res.data);
      wx.showToast({
        title: '上传成功',
        icon: 'success',
        mask: true,
        duration:500
      })
      that.setData({
        avatar:data.data.path,
      })
    }
  })
}
})
},
regUser(){
  var that = this;
  if(that.data.password === that.data.confirmPassword){
    wx.request({
      url: app.globalData._server+'/userApplication/reg', //仅为示例，并非真实的接口地址
      data:{
        username:that.data.username,
        password:md5.hex_md5(that.data.password),
        user_avatar:that.data.avatar
      },
      method:'post',
      success (res) {
        wx.showToast({
          title: '注册成功',
          icon: 'success',
          mask: true,
          duration: 1000
        })
        setTimeout(function(){
          wx.navigateTo({
            url:`../login/login`
          })
        },1000)
      }
    })
  }else{
    wx.showToast({
      title: '两个密码不一致',
      mask: true,
      icon: 'error',
      duration: 1000
    })
  }
},
usernameChange(e){
  this.setData({
    username:e.detail.value
  })
},
passwordChange(e){
  this.setData({
    password:e.detail.value
  })
},
confirmPasswordChange(e){
  this.setData({
    confirmPassword:e.detail.value
  })
},
toLogin(){
  wx.navigateTo({
    //跳转页面的路径，可带参数 ，用?隔开，不同参数用&分隔；
    url:`../login/login`
  })
}
 })