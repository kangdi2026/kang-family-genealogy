// 族谱数据配置文件
// 请在这里添加您的家族成员数据

const familyData = {
    ancestralHome: '山东省聊城市高唐县赵寨子乡康口村',
    familyName: '康氏家族',
    compiler: '第二十代世孙 康迪',

    // 家族成员数据
    // 数据格式示例：
    members: [
        // {
        //     id: 1,
        //     name: '康XX',
        //     generation: 1,         // 第几代
        //     gender: '男',
        //     birthDate: '1920年1月1日',
        //     deathDate: '2000年12月31日',  // 在世成员可以省略此字段
        //     birthPlace: '山东省聊城市高唐县',
        //     spouse: '李氏',
        //     spouseBirthDate: '1922年3月15日',
        //     children: [2, 3],      // 子女的ID数组
        //     parents: [0],          // 父母的ID数组，0表示始祖
        //     photo: 'images/members/1.jpg',  // 照片路径
        //     bio: '生平简介...'
        // },
        // {
        //     id: 2,
        //     name: '康XX（长子）',
        //     generation: 2,
        //     gender: '男',
        //     birthDate: '1945年5月20日',
        //     spouse: '王氏',
        //     children: [4, 5],
        //     parents: [1],
        //     photo: 'images/members/2.jpg',
        //     bio: '生平简介...'
        // }
    ]
}

// 导出数据供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = familyData
}
