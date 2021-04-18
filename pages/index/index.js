var app = getApp() 
Page({
  data: {
    news:[],
    menu_hidden:true,
    products_item:[],
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: false,
    types:[],
    type_re:[],
    searchValue:'',
    arrPraise:[],
    sharePraise:[],
    personalPraise:[],
    arrComment:[],
    type:[],
    nowNews_title:'',
    product:[],
    swiperCurrent: 0,
    sliderHeader:[],
  },
  // onShow: function() {
  //   // 当返回当前页面的时候，会自动调用这个参数，则实现自动返回刷新
  //   this.onLoad()
  // },
  // 开始加载
  onLoad:function(){
    this.getNewsList();
   
  },
  getNewsList(){
    var that = this;
    wx.showLoading({
      title: '加载中，请稍候',
      duration: 2000
    })
    wx.request({
      url: app.globalData._server+'/news/showAllNews', //仅为示例，并非真实的接口地址
      data:{
        startPage:0,
        pageSize:10
      },
      success (res) {
        wx.request({
          url: `${app.globalData._server}/UsersActivity/${app.globalData.userId}/showUsersActivity`, //仅为示例，并非真实的接口地址
          success (res1) {
            var arr = [];
            var arr1 = []
           var arr2 = []
           var arr3 = [];
           var arr6= [];
          let resultInterest =[];//用户爱好矩阵
          let result = [];//新闻相似矩阵
          let newsResult = [];
          let dataResult = [];
          let hotResult = [];
          let slider = [];
          let header = [];
            res.data.data.forEach((e,index)=>{
               arr.push(e)
                arr1.push(e.news_praise)
                arr2.push(e.news_comment)
                arr6.push(e.news_share)
                hotResult[index] = {id:e.nid,value:e.news_comment*3+e.news_praise*2+e.news_share*4+e.news_view};
                result[index] = new Array();
                result[index]= that.diversion(e,index,res.data.data);
                resultInterest[index] = that.diversionInterest(res1.data.data,e);
              const arr4 = JSON.parse(JSON.stringify(e.news_praiseArr)) || [];
              if(arr4.indexOf(app.globalData.userId)!==-1){
               arr3.push(1);
              }else{
                arr3.push(0);
              }
            })
             // 两个矩阵相乘
             let sum = 0;
             res.data.data.forEach((e,index)=>{
              result[index].forEach((elem,i)=>{
                  sum+= elem*resultInterest[i];
              })
              newsResult.push(sum);
            })
            let flag =0;
             // 热点
            slider = that.quickSort(hotResult).slice(hotResult.length-3,hotResult.length);
            let sliderId = [slider[0].id,slider[1].id,slider[2].id]
            resultInterest.forEach((e,index)=>{
              if(e==0 && newsResult[index]>20 && sliderId.indexOf(hotResult[index].id)==-1){
                dataResult.push(res.data.data[index])
              }
              if(e==0){
                flag+=1
              }
              if(sliderId.indexOf(hotResult[index].id)!==-1){
                header.push(res.data.data[index])
              }
            })
            if(flag === newsResult.length){
              dataResult = []
              res.data.data.forEach((e,index)=>{
                if(sliderId.indexOf(hotResult[index].id)==-1){
                  dataResult.push(e)
                }
              })
            }
            that.setData({
              news: dataResult,
              arrPraise:arr1,//
              sharePraise:arr6,//
             arrComment:arr2,//
             personalPraise:arr3,
             sliderHeader:header,
             nowNews_title:header[0].news_title
            })
          }
        })
      }
    })
  },
  diversion(e,index,data){
    //  推荐算法
    let tag = e.news_tag;//A新闻标签
    let resultSim = [];
    let result2 = 0;
    resultSim[index] = new Array();
    const resultKey = e.news_keywords?e.news_keywords.split("、"):'';//A新闻关键词数组
    data.forEach((el,i)=>{
      if(index !==i){
        // 计算相似矩阵
        result2 =0//先初始化为0
        el.news_tag == tag && (result2 +=1);//如果B标签和A标签一致则加1
        const arrKey =  el.news_keywords ? el.news_keywords.split("、"):'';//B新闻关键词数组
        resultKey && resultKey.forEach(element=>{
          if(arrKey.indexOf(element)!==-1){
            result2 +=1;
          }
        })
        resultSim[index][i] = result2;
      }else{
        resultSim[index][i] = 0;
      }
    })
    return resultSim[index]
  },
  // data是用户行为，el是每条新闻数据，index是该条新闻数据的index
  diversionInterest(data,el){
    // 计算用户的兴趣度矩阵
    let isHave = false;
    for(let i in data){
      if(el.nid==data[i].news_id){
        const result3 = el.news_praise*3+el.news_comment*4+el.news_view*1+el.news_share*2;
        isHave = true;
        return result3;
      }
    }
    if(!isHave){
      return 0;
    }
  },
  quickSort(obj){
      for (let i = 0; i < obj.length - 1; i++) {    //排序趟数 注意是小于
        for (let j = 0; j < obj.length - i - 1; j++) {
          if (obj[j].value > obj[j + 1].value) {
            var temp = obj[j].value;
            var id = obj[j].id;
            obj[j].value = obj[j + 1].value;
            obj[j].id = obj[j + 1].id;
            obj[j + 1].value = temp;
            obj[j + 1].id = id;
          }
        }
      }
      return obj
  },
  // 悬浮按钮点击事件
  menuShow: function () {
    var that = this;
    wx.navigateTo({
      //跳转页面的路径，可带参数 ，用?隔开，不同参数用&分隔；
      url:'../editor/editor'
    })
  },
  bindKeyInput(e){
    this.setData({
      searchValue:e.detail.value
    })
  },
  searchNews(){
    var that = this;
    wx.request({
      url: app.globalData._server+'/news/search', //仅为示例，并非真实的接口地址
      data:{
        news_title:this.data.searchValue,
        news_tag:'',
        pageSize:30,
        startPage:0,
      },
      method:'post',
      success (res) {
        that.setData({
          news: res.data.data.tableData
        })
      }
    })
  },
   addPraise(event){
     var that = this;
    let el = event.target.dataset.num
    const index = event.target.dataset.index
    that.setData({
      [`personalPraise[${index}]`]:1
    })
    el.news_praise +=1;
    let arr5 = el.news_praiseArr == '' ? []:JSON.parse(el.news_praiseArr);
    arr5.push(app.globalData.userId);
    el.news_praiseArr = JSON.stringify(arr5);
    wx.request({
      url: `${app.globalData._server}/news/${el.nid}/change_info`, //仅为示例，并非真实的接口地址
      data:el,
      method:'post',
      success (res) {
        that.setData({
          [`arrPraise[${index}]`]:that.data.arrPraise[index]+1,
        })
      }
    })
    // 点赞后添加用户行为
    wx.request({
      url: `${app.globalData._server}/UsersActivity/add`, //仅为示例，并非真实的接口地址
      data:{
        uaid:app.globalData.userId,
        news_id:el.nid,
        add_tag:'tag_praise',
        tag_praise:1,
        tag_share:0,
        tag_comment:0,
        tag_view:0,
      },
      method:'post',
      success (res) {
      }
    })
   },
  //轮播图的切换事件
  swiperChange: function(e){
    //只要把切换后当前的index传给<swiper>组件的current属性即可
    var that = this;
        this.setData({
          swiperCurrent: e.detail.current,
          nowNews_title: that.data.sliderHeader[parseInt(e.detail.current)].news_title,
        })
      },
      //点击指示点切换
      chuangEvent: function(e){
        this.setData({
          swiperCurrent: e.currentTarget.id
        })
      },
      toMore:function(event){
        wx.navigateTo({
          //跳转页面的路径，可带参数 ，用?隔开，不同参数用&分隔；
          url:`../more/more?id=${event.target.dataset.num}`
        })
      },
      addComment(event){
        wx.navigateTo({
          //跳转页面的路径，可带参数 ，用?隔开，不同参数用&分隔；
          url:`../more/more?id=${event.target.dataset.num}&detail=comment`
        })
      },
      onShareAppMessage: function (event) {
        var that = this;
        wx.request({
          url: `${app.globalData._server}/UsersActivity/add`, //仅为示例，并非真实的接口地址
          data:{
            uaid:app.globalData.userId,
            news_id:event.target.dataset.num.nid,
            add_tag:'tag_share',
            tag_share:1,
            tag_praise:0,
            tag_comment:0,
            tag_view:0,
          },
          method:'post',
          success (res) {
            wx.showToast({
              title: '分享成功',
              icon: 'success',
              mask: true,
              duration: 1000
            })
          }
        })
        event.target.dataset.num.news_share +=1;
        wx.request({
          url: `${app.globalData._server}/news/${event.target.dataset.num.nid}/change_info`, //仅为示例，并非真实的接口地址
          data:event.target.dataset.num,
          method:'post',
          success (res) {
            that.setData({
              [`sharePraise[${event.target.dataset.index}]`]:that.data.sharePraise[event.target.dataset.index]+1,
            })
          }
        })
        return {
          title: `${event.target.dataset.num.news_title}`,
          path: `/pages/more/more?id=${event.target.dataset.num.nid}`,
        }
      },
})