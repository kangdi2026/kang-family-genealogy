// 字辈记录编辑功能

// 编辑密码
const GENERATION_EDIT_PASSWORD = 'kang2026'

// 编辑模式状态
let isGenerationEditMode = false
let generationCloudbaseInitialized = false
let generationCollection = null

// 初始化腾讯云
document.addEventListener('DOMContentLoaded', function() {
    // 初始化腾讯云开发
    const cloudbase = initCloudBase()
    if (cloudbase) {
        generationCollection = cloudbase.db.collection('generation_records')
        generationCloudbaseInitialized = true
        console.log('字辈记录云数据库已连接')

        // 加载字辈记录
        loadGenerationRecords()
    } else {
        console.log('云数据库未初始化，使用默认字辈')
        displayDefaultGenerations()
    }
})

// 显示默认字辈（示例数据）
function displayDefaultGenerations() {
    const defaultGenerations = [
        '德文明志勇',
        '仁义礼智信',
        '忠孝廉耻勤'
    ]
    displayGenerations(defaultGenerations)
}

// 加载字辈记录
async function loadGenerationRecords() {
    if (!generationCloudbaseInitialized) {
        displayDefaultGenerations()
        return
    }

    try {
        const res = await generationCollection.where({
            type: 'generation_list'
        }).get()

        if (res.data && res.data.length > 0) {
            const data = res.data[0]
            if (data.generations && data.generations.length > 0) {
                displayGenerations(data.generations)

                // 更新编辑区域的文本
                const textarea = document.getElementById('generation-textarea')
                if (textarea) {
                    textarea.value = data.generations.join('\n')
                }

                console.log('字辈记录已从云端加载')
            } else {
                displayDefaultGenerations()
            }
        } else {
            displayDefaultGenerations()
        }
    } catch (error) {
        console.error('加载字辈记录失败:', error)
        displayDefaultGenerations()
    }
}

// 显示字辈记录
function displayGenerations(generations) {
    const listContainer = document.getElementById('generation-list')
    if (!listContainer) return

    listContainer.innerHTML = ''

    generations.forEach((genGroup, index) => {
        const itemDiv = document.createElement('div')
        itemDiv.className = 'generation-item traditional-border'

        // 生成序号（第一组、第二组...）
        const numberDiv = document.createElement('div')
        numberDiv.className = 'generation-number'
        numberDiv.textContent = `第${numberToChinese(index + 1)}组`

        // 生成字辈字符（每个字分开显示）
        const charsDiv = document.createElement('div')
        charsDiv.className = 'generation-chars'

        for (let char of genGroup) {
            const charSpan = document.createElement('span')
            charSpan.className = 'generation-char'
            charSpan.textContent = char
            charsDiv.appendChild(charSpan)
        }

        itemDiv.appendChild(numberDiv)
        itemDiv.appendChild(charsDiv)
        listContainer.appendChild(itemDiv)
    })
}

// 数字转中文
function numberToChinese(num) {
    const chineseNums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
                         '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十']
    return num <= 20 ? chineseNums[num - 1] : num.toString()
}

// 切换编辑模式
function toggleGenerationEdit() {
    if (isGenerationEditMode) {
        cancelGenerationEdit()
        return
    }

    // 验证密码
    const password = prompt('请输入编辑密码：')
    if (password !== GENERATION_EDIT_PASSWORD) {
        alert('密码错误！')
        return
    }

    // 进入编辑模式
    isGenerationEditMode = true
    document.getElementById('generation-list').style.display = 'none'
    document.getElementById('generation-edit-area').style.display = 'block'
    document.getElementById('generation-save-actions').style.display = 'flex'
    document.getElementById('edit-generation-btn').textContent = '取消编辑'
    document.getElementById('edit-generation-btn').style.backgroundColor = '#999'

    // 获取当前字辈内容填充到编辑框
    const currentItems = document.querySelectorAll('.generation-chars')
    const currentGenerations = []
    currentItems.forEach(item => {
        currentGenerations.push(item.textContent.trim())
    })
    document.getElementById('generation-textarea').value = currentGenerations.join('\n')
}

// 取消编辑
function cancelGenerationEdit() {
    isGenerationEditMode = false
    document.getElementById('generation-list').style.display = 'grid'
    document.getElementById('generation-edit-area').style.display = 'none'
    document.getElementById('generation-save-actions').style.display = 'none'
    document.getElementById('edit-generation-btn').textContent = '编辑'
    document.getElementById('edit-generation-btn').style.backgroundColor = '#D2691E'
}

// 保存字辈记录
async function saveGenerationContent() {
    if (!isGenerationEditMode) return

    // 获取编辑的内容
    const textarea = document.getElementById('generation-textarea')
    const content = textarea.value.trim()

    if (!content) {
        alert('请输入字辈内容！')
        return
    }

    // 按行分割，过滤空行
    const lines = content.split('\n').filter(line => line.trim().length > 0)

    // 验证每行是否为5个字
    const validLines = []
    for (let line of lines) {
        const trimmed = line.trim()
        if (trimmed.length !== 5) {
            alert(`每行必须是5个字！发现不符合的行：${trimmed}（${trimmed.length}个字）`)
            return
        }
        validLines.push(trimmed)
    }

    if (validLines.length === 0) {
        alert('请至少输入一组字辈（5个字）！')
        return
    }

    // 显示保存中
    const saveBtn = document.querySelector('#generation-save-actions .save-button')
    const originalText = saveBtn.textContent
    saveBtn.textContent = '保存中...'
    saveBtn.disabled = true

    try {
        if (generationCloudbaseInitialized) {
            // 保存到云数据库
            const res = await generationCollection.where({
                type: 'generation_list'
            }).get()

            const generationData = {
                type: 'generation_list',
                generations: validLines,
                updateTime: new Date().toISOString()
            }

            if (res.data && res.data.length > 0) {
                // 更新现有记录
                await generationCollection.doc(res.data[0]._id).update(generationData)
            } else {
                // 创建新记录
                await generationCollection.add(generationData)
            }

            console.log('字辈记录已保存到云端')
        }

        // 更新页面显示
        displayGenerations(validLines)

        // 退出编辑模式
        cancelGenerationEdit()

        alert('保存成功！字辈记录已更新。')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败：' + error.message)
    } finally {
        saveBtn.textContent = originalText
        saveBtn.disabled = false
    }
}
