var sliderWidth = 108; // 需要设置slider的宽度，用于计算中间位置
const util = require('../../utils/util.js')
const app = getApp() //获得小程序实例

Page({
    data: {
        files: [],
        tabs: ["Project", "Document", "Logs"],
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,

        project: {},
        tasks_length: 0,

        logs: [],
        leftCount: 0,

    },
    onShareAppMessage: function(res) {
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        return {
            title: 'Invite some people',
            path: '/page/project/project?id=' + this.data.project.projectID
        }
    },

    save: function() {
        var key1 = this.data.project.projectID + '-tasks'
        var key2 = this.data.project.projectID + '-logs'
        wx.setStorageSync(key1, this.data.project.tasks)
        wx.setStorageSync(key2, this.data.project.logs)
    },

    load: function() {
        var key1 = this.data.project.projectID + '-tasks'
        var key2 = this.data.project.projectID + '-logs'
        var tasks = wx.getStorageSync(key1)
        if (this.data.project.tasks) {
            var leftCount = project.tasks.filter(function(item) {
                return !item.completed
            }).length
            this.setData({ 'project.tasks': tasks, leftCount: leftCount })
        }
        var logs = wx.getStorageSync(key2)
        if (logs) {
            this.setData({ 'project.logs': logs })
        }
    },

    onLoad: function(opt) {
        var that = this;
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
                    sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
                });
            }
        });
        this.load()
            //get the project id from the router
        this.data.project.projectID = opt.id
            //get project info by local storage or wx request 
        this.getData();
        //check if it is member 
        this.addMember();

        var that = this
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
                    sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
                })
            }
        })
    },

    //check member 
    addMember: function() {
        var isMember = false
        for (var i = 0 ; i < this.data.project.proMembers.length; i++) {
          if (this.data.project.proMembers[i].name == app.globalData.userInfo.nickName)
                isMember = true
        }
        if (!isMember) {
            var members = this.data.project.proMembers
            if (app.globalData.userInfo.nickName)
            members.push({ name: app.globalData.userInfo.nickName, avatarUrl: app.globalData.userInfo.avatarUrl })
            this.setData({
                'project.proMembers': members
            })
            console.log('Add Member ' + app.globalData.userInfo.nickName)
            var logs = this.data.project.logs
            logs.push({ timestamp: util.formatTime(new Date()), action: 'Become New Member', actionInfo: '', userInfo: app.globalData.userInfo })
            this.setData({
                'project.logs': logs
            })
            this.save()
        }
    },
    //get Data and refresh
    upper: function() {
        wx.showNavigationBarLoading()
        this.refresh();
        console.log("upper");
        setTimeout(function() {
            wx.hideNavigationBarLoading();
            wx.stopPullDownRefresh();
        }, 2000);
    },
    lower: function(e) {
        wx.showNavigationBarLoading();
        var that = this;
        setTimeout(function() {
            wx.hideNavigationBarLoading();
            that.nextLoad();
        }, 1000);
        console.log("lower")
    },
    //scroll: function (e) {
    //  console.log("scroll")
    //},

    //网络请求数据, 实现首页刷新
    refresh0: function() {
        var index_api = '';
        util.getData(index_api)
            .then(function(data) {
                //this.setData({
                //
                //});
                console.log(data);
            });
    },

    //使用本地 fake 数据实现刷新效果
    getData: function() {
        var feed = util.getAProjectFake();
        console.log("get a project");
        console.log(feed);
        this.setData({
            project: feed,
            tasks_length: feed.tasks.length
        });
    },
    refresh: function() {
        wx.showToast({
            title: '刷新中',
            icon: 'loading',
            duration: 3000
        });
        var feed = util.getAProjectFake();
        console.log("refresh to get a project");
        var feed = feed;
        this.setData({
            project: feed,
            tasks_length: feed.tasks.length
        });
        setTimeout(function() {
            wx.showToast({
                title: '刷新成功',
                icon: 'success',
                duration: 2000
            })
        }, 3000)

    },

    //使用本地 fake 数据实现继续加载效果
    nextLoad: function() {
        wx.showToast({
            title: '加载中',
            icon: 'loading',
            duration: 4000
        })
        var next = util.getAProjectFake();
        console.log("continueload");

        this.setData({
            'project.tasks': this.data.project.tasks.concat(next),
            tasks_length: this.data.tasks_length + next.length
        });
        setTimeout(function() {
            wx.showToast({
                title: '加载成功',
                icon: 'success',
                duration: 2000
            })
        }, 3000)
    },



    //onShow function for Logs 
    onShow: function() {
        var key2 = this.data.project.projectID + '-logs'
        var logs = wx.getStorageSync(key2)
        if (logs) {
            this.setData({ 'project.logs': logs.reverse() })
        }
    },

    tabClick: function(e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id
        });
    },

    //Navigate to newTask Page
    createTask: function() {
        wx.navigateTo({
            url: '../newTask/newTask?id=' + this.data.project.projectID
        })
    },

    chooseImage: function(e) {
        var that = this;
        wx.chooseImage({
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function(res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                that.setData({
                    files: that.data.files.concat(res.tempFilePaths)
                });
                //上传图片至服务器
                var tempFilePaths = res.tempFilePaths
                    /* 上传图片接口
                    wx.uploadFile({
                      url: 'https://example.weixin.qq.com/upload', //仅为示例，非真实的接口地址
                      filePath: tempFilePaths[0],
                      name: 'file',
                      formData: {
                        'user': 'test'
                      },
                      success: function (res) {
                        var data = res.data
                        //do something
                      }
                    }) */

            }
        })
    },
    previewImage: function(e) {
        if (!this.data.showDeleteIcon) {
            var that = this
            var file_id = e.currentTarget.id
            var file_index = file_id.lastIndexOf('.')
            file_id = file_id.substring(file_index + 1)
            console.log(file_id)
            console.log(e.currentTarget)
            wx.getImageInfo({
                src: e.currentTarget.id,
                success: function(res) {
                    //The file is an Image 
                    console.log(res.type)
                    wx.previewImage({
                        current: e.currentTarget.id, // 当前显示图片的http链接
                        urls: that.data.files // 需要预览的图片http链接列表
                    })
                },
                fail: function() {
                    wx.openDocument({
                        filePath: e.currentTarget.id,
                        success: function(res) {
                            console.log("打开文件成功")
                        },
                        fail: function() {
                            console.log("不支持打开该文件")
                        }
                    })
                }
            })
        } else {
            this.deleteFile(e)
        }
    },
    onShareAppMessage: function() {
        return {
            path: 'pages/project/project?id=' + this.data.project.projectID,
            success: res => {
                console.log(res)
            }
        }
    },

    deleteFile: function(e) {
        console.log(e.currentTarget.id)
        this.data.files.splice(e.currentTarget.id, 1)
        this.setData({
            files: this.data.files
        })
    },

    showDelete: function(e) {
        this.setData({
            showDeleteIcon: true
        })
    },
    hideDelete: function() {
        this.setData({
            showDeleteIcon: false
        })
    }
});