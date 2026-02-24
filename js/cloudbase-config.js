// 腾讯云开发配置
const cloudbaseConfig = {
    env: 'kang-genealogy-4gl62las1c710ecd'
}

// 初始化云开发
let app = null
let db = null
let auth = null

// 初始化函数
function initCloudBase() {
    try {
        // 初始化云开发
        app = window.cloudbase.init({
            env: cloudbaseConfig.env
        })

        // 获取数据库引用
        db = app.database()

        // 获取集合引用
        const collection = db.collection('family_intro')

        console.log('腾讯云开发初始化成功')

        return { app, db, collection }
    } catch (error) {
        console.error('腾讯云开发初始化失败:', error)
        return null
    }
}

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { cloudbaseConfig, initCloudBase }
}
