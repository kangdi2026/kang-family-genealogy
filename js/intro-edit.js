// 家族介绍编辑功能

// 编辑密码
const EDIT_PASSWORD = 'kang2026'

// 编辑模式状态
let isEditMode = false
let cloudbaseInitialized = false
let collection = null

// 初始化腾讯云
document.addEventListener('DOMContentLoaded', function() {
    // 初始化腾讯云开发
    const cloudbase = initCloudBase()
    if (cloudbase) {
        collection = cloudbase.collection
        cloudbaseInitialized = true
        console.log('云数据库已连接')

        // 加载家族介绍内容
        loadIntroContent()
    } else {
        console.log('云数据库未初始化，使用本地内容')
    }
})

// 加载家族介绍内容
async function loadIntroContent() {
    if (!cloudbaseInitialized) return

    try {
        const res = await collection.where({
            type: 'family_intro'
        }).get()

        if (res.data && res.data.length > 0) {
            const data = res.data[0]

            // 更新页面内容
            if (data.ancestralHome) {
                document.getElementById('ancestral-home-text').innerHTML = `<p>${data.ancestralHome}</p>`
                document.getElementById('ancestral-home-edit').value = data.ancestralHome
            }

            if (data.history) {
                const historyHtml = data.history.split('\n').map(p => `<p>${p}</p>`).join('')
                document.getElementById('history-text').innerHTML = historyHtml
                document.getElementById('history-edit').value = data.history
            }

            if (data.spirit) {
                const spiritHtml = data.spirit.split('\n').map(p => `<p>${formatSpirit(p)}</p>`).join('')
                document.getElementById('spirit-text').innerHTML = spiritHtml
                document.getElementById('spirit-edit').value = data.spirit
            }

            if (data.motto) {
                const mottoHtml = data.motto.split('\n').map(p => `<p>${p}</p>`).join('')
                document.getElementById('motto-text').innerHTML = mottoHtml
                document.getElementById('motto-edit').value = data.motto
            }

            console.log('家族介绍内容已从云端加载')
        }
    } catch (error) {
        console.error('加载家族介绍失败:', error)
    }
}

// 格式化家族精神文本
function formatSpirit(text) {
    const match = text.match(/^([\u4e00-\u9fa5]+)\s*-\s*(.+)$/)
    if (match) {
        return `<strong>${match[1]}</strong> - ${match[2]}`
    }
    return text
}

// 切换编辑模式
function toggleEditMode() {
    if (isEditMode) {
        cancelEdit()
        return
    }

    // 验证密码
    const password = prompt('请输入编辑密码：')
    if (password !== EDIT_PASSWORD) {
        alert('密码错误！')
        return
    }

    // 进入编辑模式
    isEditMode = true
    document.getElementById('intro-content').classList.add('edit-mode')
    document.getElementById('save-actions').style.display = 'flex'
    document.getElementById('edit-intro-btn').textContent = '取消编辑'
    document.getElementById('edit-intro-btn').style.backgroundColor = '#999'
}

// 取消编辑
function cancelEdit() {
    isEditMode = false
    document.getElementById('intro-content').classList.remove('edit-mode')
    document.getElementById('save-actions').style.display = 'none'
    document.getElementById('edit-intro-btn').textContent = '编辑'
    document.getElementById('edit-intro-btn').style.backgroundColor = '#D2691E'
}

// 保存内容
async function saveIntroContent() {
    if (!isEditMode) return

    // 获取编辑的内容
    const ancestralHome = document.getElementById('ancestral-home-edit').value.trim()
    const history = document.getElementById('history-edit').value.trim()
    const spirit = document.getElementById('spirit-edit').value.trim()
    const motto = document.getElementById('motto-edit').value.trim()

    if (!ancestralHome || !history || !spirit || !motto) {
        alert('请填写所有内容！')
        return
    }

    // 显示保存中
    const saveBtn = document.querySelector('.save-button')
    const originalText = saveBtn.textContent
    saveBtn.textContent = '保存中...'
    saveBtn.disabled = true

    try {
        if (cloudbaseInitialized) {
            // 保存到云数据库
            const res = await collection.where({
                type: 'family_intro'
            }).get()

            const introData = {
                type: 'family_intro',
                ancestralHome: ancestralHome,
                history: history,
                spirit: spirit,
                motto: motto,
                updateTime: new Date().toISOString()
            }

            if (res.data && res.data.length > 0) {
                // 更新现有记录
                await collection.doc(res.data[0]._id).update(introData)
            } else {
                // 创建新记录
                await collection.add(introData)
            }

            console.log('内容已保存到云端')
        }

        // 更新页面显示
        document.getElementById('ancestral-home-text').innerHTML = `<p>${ancestralHome}</p>`

        const historyHtml = history.split('\n\n').map(p => `<p>${p}</p>`).join('')
        document.getElementById('history-text').innerHTML = historyHtml

        const spiritHtml = spirit.split('\n').map(p => `<p>${formatSpirit(p)}</p>`).join('')
        document.getElementById('spirit-text').innerHTML = spiritHtml

        const mottoHtml = motto.split('\n').map(p => `<p>${p}</p>`).join('')
        document.getElementById('motto-text').innerHTML = mottoHtml

        // 退出编辑模式
        cancelEdit()

        alert('保存成功！内容已更新。')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败：' + error.message)
    } finally {
        saveBtn.textContent = originalText
        saveBtn.disabled = false
    }
}
