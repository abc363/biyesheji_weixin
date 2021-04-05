
var app = getApp() 
Page({
  data: {
    formats: {},
    readOnly: false,
    news_intro:'',
    placeholder: '开始输入...',
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
    content:'',
    news_title:'',
    pictureName:'',
    news_keywords:'',
    date:'',
    form:{},
  },
  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly
    })
  },
  onLoad() {
    const platform = wx.getSystemInfoSync().platform
    const isIOS = platform === 'ios'
    this.setData({ isIOS})
    const that = this
    this.updatePosition(0)
    let keyboardHeight = 0
    wx.onKeyboardHeightChange(res => {
      if (res.height === keyboardHeight) return
      const duration = res.height > 0 ? res.duration * 1000 : 0
      keyboardHeight = res.height
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            that.updatePosition(keyboardHeight)
            that.editorCtx.scrollIntoView()
          }
        })
      }, duration)

    })
  },
  updatePosition(keyboardHeight) {
    const toolbarHeight = 50
    const { windowHeight, platform } = wx.getSystemInfoSync()
    let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight
    this.setData({ editorHeight, keyboardHeight })
  },
  setInputTagValue(e){
    this.setData({
      ['form.news_tag']:e.detail.value
    })
  },
  calNavigationBarAndStatusBar() {
    const systemInfo = wx.getSystemInfoSync()
    const { statusBarHeight, platform } = systemInfo
    const isIOS = platform === 'ios'
    const navigationBarHeight = isIOS ? 44 : 48
    return statusBarHeight + navigationBarHeight
  },
  onEditorReady() {
    const that = this
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context
    }).exec()
  },
  blur() {
    this.editorCtx.blur()
  },
  uploadImage(){
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
                  ['form.news_image']:data.data.path,
                  pictureName:data.data.name,
                })
                //服务器返回格式: { "Catalog": "testFolder", "FileName": "1.jpg", "Url": "https://test.com/1.jpg" }
                console.log(data);
              },
              fail: function (res) {
                wx.hideToast();
                wx.showModal({
                  title: '错误提示',
                  content: '上传图片失败',
                  showCancel: false,
                  success: function (res) { }
                })
              }
            });
          }
        })
  },
  sendMessage(){
    var {form} = this.data;
    wx.request({
      url: app.globalData._server+'/news/add', 
      data:form,
      method:'post',
      success (res) {
       
        wx.showToast({
          title: '添加成功',
          icon: 'success',
          mask: true,
          duration: 1000
        })
        setTimeout(function(){
          wx.navigateTo({
            //跳转页面的路径，可带参数 ，用?隔开，不同参数用&分隔；
            url:`../index/index`
          })
        })
        
      }
    })
  },
  setTextareaValue(e){
    this.setData({
      ['form.news_intro']:e.detail.value
    })
  },
  bindDateChange: function(e) {
    this.setData({
      ['form.news_date']: e.detail.value
    })
  },
  getEditorValue(e) {
    this.setData({
      ['form.news_content']: e.detail.html
    })
  },
  setInputValue(e){
    this.setData({
      ['form.news_title']:e.detail.value
    })
  },
  setInputKeywordValue(e){
    this.setData({
      ['form.news_keywords']:e.detail.value
    })
  },
  format(e) {
    let { name, value } = e.target.dataset
    if (!name) return
    this.editorCtx.format(name, value)

  },
  onStatusChange(e) {
    const formats = e.detail
    this.setData({ formats })
  },
  insertDivider() {
    this.editorCtx.insertDivider({
      success: function () {
        console.log('insert divider success')
      }
    })
  },
  clear() {
    this.editorCtx.clear({
      success: function (res) {
        console.log("clear success")
      }
    })
  },
  removeFormat() {
    this.editorCtx.removeFormat()
  },
  insertDate() {
    const date = new Date()
    const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    this.editorCtx.insertText({
      text: formatDate
    })
  },
  insertImage() {
    const that = this
    this.uploadImage();
    that.editorCtx.insertImage({
      src: this.data.form.news_image,
      data: {
        id: 'abcd',
        role: 'god'
      },
      width: '80%',
      success: function () {
        console.log('insert image success')
      }
    })
  }
})
