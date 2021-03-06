// pages/projectForm/projectForm.js
Page({

    /**
     * 页面的初始数据
     */
    data: {

        project: {
            proName: '',
            proType: '',
            proInfo: '',
            proStartDate: '',
            proEndDate: '',
            proMembers: [],
        },
        radioItems: [
            { name: 'Course', value: '0' },
            { name: 'Intern', value: '1' },
            { name: 'Work', value: '2' },
            { name: 'Others', value: '3' }
        ],
        date: "2018-01-01",
        date2: "2017-05-04",
        isAgree: false
    },
    onShareAppMessage: function() {

    },
    bindNameChange: function(e) {
        this.setData({
            'project.proName': e.detail.value
        });
    },
    bindInfoChange: function(e) {
        this.setData({
            'project.proInfo': e.detail.value
        });
        
    },
    radioChange: function(e) {
        console.log('radio发生change事件，携带value值为：', e.detail.value);

        var radioItems = this.data.radioItems;
        var index;
        for (var i = 0, len = radioItems.length; i < len; ++i) {
            radioItems[i].checked = radioItems[i].value == e.detail.value;
            if (radioItems[i].checked)
                index = i;
        }
        this.setData({
            radioItems: radioItems,
            'project.proType': radioItems[index]
        });
    },
    bindDateChange1: function(e) {
        this.setData({
            'project.proStartDate': e.detail.value
        });
    },
    bindDateChange2: function(e) {
        this.setData({
            'project.proEndDate': e.detail.value
        });
    },
    bindAgreeChange: function(e) {
        this.setData({
            isAgree: !!e.detail.value.length
        });
    },
    openToast: function() {
        // wx.showToast({
        //   title: 'Success',
        //   icon: 'success',
        //   duration: 3000
        // });
        wx.showLoading({
            title: '正在创建项目……',
            mask: true
        });
        // send the request to the server
        var project_detail = {
            name: project.proName,
            info: project.proInfo || '',
            start_date: project.proStartDate || '',
            end_date: project.proEndDate || '',
            project_type: project.proType
        };

        getApp().request({
            url: '/project',
            method: 'POST',
            data: project_detail,
            success: function() {
                wx.hideLoading();
                getApp().writeHistory(project_detail, 'create', +new Date());
                wx.showToast({
                    title: 'Success',
                    icon: 'success',
                    duration: 3000
                });
                wx.navigateBack();
            }
        });
    },
});