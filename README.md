# 康氏家族族谱

传统风格的家族族谱系统，包含微信小程序版和网页版。

## 项目信息

- **族谱名称**：康氏家族族谱
- **祖籍地址**：山东省聊城市高唐县赵寨子乡康口村
- **编制人**：第二代 康迪

## 功能特点

- ✅ 传统族谱风格设计（竖排文字、印章、古典装饰）
- ✅ 树形结构展示家族世系
- ✅ 成员详细资料查看
- ✅ 照片展示功能
- ✅ 成员搜索功能
- ✅ 支持微信小程序和网页双平台

## 项目结构

```
├── genealogy-miniprogram/     # 微信小程序版本
│   ├── pages/
│   │   ├── home/             # 首页
│   │   ├── tree/             # 族谱树
│   │   ├── member/           # 成员详情
│   │   └── search/           # 搜索页面
│   ├── app.js
│   ├── app.json
│   └── app.wxss
│
└── genealogy-web/            # 网页版本
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── data.js          # 数据配置文件
    │   └── app.js           # 应用逻辑
    ├── images/              # 图片资源
    └── index.html
```

## 使用方法

### 微信小程序版

1. 下载安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具，选择"导入项目"
3. 选择 `genealogy-miniprogram` 文件夹
4. 填写 AppID（可选择"测试号"）
5. 点击导入即可预览

### 网页版

1. 直接打开 `genealogy-web/index.html` 文件即可在浏览器中查看
2. 或部署到任何 Web 服务器（Apache、Nginx、GitHub Pages 等）

## 添加家族成员数据

### 方法一：修改数据文件（推荐）

**微信小程序版**：编辑 `genealogy-miniprogram/app.js` 文件中的 `globalData.familyData`

**网页版**：编辑 `genealogy-web/js/data.js` 文件中的 `familyData.members`

### 数据格式示例

```javascript
{
    id: 1,                          // 唯一ID
    name: '康XX',                    // 姓名
    generation: 1,                  // 第几代
    gender: '男',                    // 性别
    birthDate: '1920年1月1日',       // 出生日期
    deathDate: '2000年12月31日',     // 逝世日期（在世可省略）
    birthPlace: '山东省聊城市高唐县', // 出生地
    spouse: '李氏',                  // 配偶
    children: [2, 3],               // 子女ID数组
    parents: [0],                   // 父母ID数组
    photo: 'images/members/1.jpg',  // 照片路径
    bio: '生平简介...'               // 生平介绍
}
```

## 添加照片

### 微信小程序版

将照片放入 `genealogy-miniprogram/images/members/` 目录下，文件名建议使用ID编号（如 `1.jpg`、`2.jpg`）

### 网页版

将照片放入 `genealogy-web/images/members/` 目录下

## 网页部署

### 本地测试
直接双击打开 `genealogy-web/index.html` 文件

### 部署到服务器

1. **上传到 Web 服务器**
   - 将 `genealogy-web` 文件夹上传到服务器
   - 确保服务器支持静态网页（HTML/CSS/JS）
   - 访问服务器地址即可

2. **使用 GitHub Pages（免费）**
   - 在 GitHub 创建仓库
   - 上传 `genealogy-web` 文件夹内容
   - 在仓库设置中启用 GitHub Pages
   - 访问 `https://你的用户名.github.io/仓库名/`

3. **使用 Vercel/Netlify（免费）**
   - 注册账号并连接 GitHub 仓库
   - 自动部署，获得免费域名

## 自定义修改

### 修改颜色和样式

- 微信小程序：编辑 `app.wxss` 和各页面的 `.wxss` 文件
- 网页版：编辑 `genealogy-web/css/style.css`

### 修改首页信息

- 微信小程序：编辑 `app.js` 中的 `globalData`
- 网页版：编辑 `js/data.js` 中的基本信息

## 注意事项

1. **照片建议**：使用 JPG 或 PNG 格式，建议尺寸 500x500 像素
2. **数据备份**：定期备份 `data.js` 或 `app.js` 中的家族数据
3. **隐私保护**：如果包含敏感信息，请注意访问权限设置
4. **浏览器兼容**：网页版推荐使用 Chrome、Firefox、Safari 等现代浏览器

## 下一步

请提供您的家族成员信息，格式可以是：

1. Excel 表格
2. 文字描述
3. 或任何您方便的格式

我会帮您整理并添加到系统中。

## 技术支持

如有问题或需要定制功能，请联系编制人。
