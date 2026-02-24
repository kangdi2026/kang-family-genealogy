// 族谱树功能

// 编辑密码
const TREE_EDIT_PASSWORD = 'kang2026'

// 状态
let isTreeEditMode = false
let treeCloudbaseInitialized = false
let treeCollection = null
let familyTreeData = []
let selectedMember = null

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化腾讯云开发
    const cloudbase = initCloudBase()
    if (cloudbase) {
        treeCollection = cloudbase.db.collection('family_members')
        treeCloudbaseInitialized = true
        console.log('族谱数据库已连接')

        // 加载族谱数据
        loadFamilyTree()
    } else {
        console.log('云数据库未初始化，显示示例数据')
        displaySampleTree()
    }
})

// 显示示例数据
function displaySampleTree() {
    const sampleData = [
        {
            _id: 'member_001',
            generation: 1,
            title: '始祖',
            name: '康某某',
            wives: ['李氏'],
            parentId: null,
            children: []
        }
    ]
    familyTreeData = sampleData
    renderFamilyTree()
}

// 加载族谱数据
async function loadFamilyTree() {
    if (!treeCloudbaseInitialized) {
        displaySampleTree()
        return
    }

    try {
        const res = await treeCollection.orderBy('generation', 'asc').get()

        if (res.data && res.data.length > 0) {
            familyTreeData = res.data
            console.log('族谱数据已加载:', familyTreeData.length, '位成员')
        } else {
            // 没有数据，显示空状态
            familyTreeData = []
            console.log('暂无族谱数据')
        }

        renderFamilyTree()
    } catch (error) {
        console.error('加载族谱数据失败:', error)
        displaySampleTree()
    }
}

// 渲染族谱树
function renderFamilyTree() {
    const container = document.getElementById('tree-content')
    if (!container) return

    if (familyTreeData.length === 0) {
        container.innerHTML = `
            <div class="waiting-data">
                <p class="waiting-text">暂无族谱数据</p>
                <p class="waiting-hint">点击右上角"编辑"开始添加始祖</p>
            </div>
        `
        return
    }

    // 清空容器
    container.innerHTML = ''

    // 创建树状结构容器
    const treeWrapper = document.createElement('div')
    treeWrapper.className = 'tree-wrapper'
    treeWrapper.style.cssText = 'padding: 40px; overflow: auto; min-height: 600px;'

    // 找到所有第一代成员（根节点）
    const rootMembers = familyTreeData.filter(m => !m.parentId || m.generation === 1)

    if (rootMembers.length === 0) {
        container.innerHTML = `
            <div class="waiting-data">
                <p class="waiting-text">数据异常</p>
                <p class="waiting-hint">未找到第一代始祖</p>
            </div>
        `
        return
    }

    // 渲染每个根节点及其子树
    rootMembers.forEach(rootMember => {
        const treeNode = createTreeNode(rootMember)
        treeWrapper.appendChild(treeNode)
    })

    container.appendChild(treeWrapper)
}

// 创建树节点
function createTreeNode(member) {
    // 创建节点容器
    const nodeContainer = document.createElement('div')
    nodeContainer.className = 'tree-node-container'
    nodeContainer.style.cssText = 'display: inline-block; vertical-align: top; margin: 0 20px;'

    // 创建成员卡片
    const memberCard = createMemberCard(member)
    nodeContainer.appendChild(memberCard)

    // 查找子节点
    const children = familyTreeData.filter(m => m.parentId === member._id)

    if (children.length > 0) {
        // 创建子节点容器
        const childrenContainer = document.createElement('div')
        childrenContainer.className = 'tree-children'
        childrenContainer.style.cssText = 'margin-top: 40px; padding-left: 40px; border-left: 2px solid #D2691E; display: flex; flex-wrap: wrap; gap: 20px;'

        children.forEach(child => {
            const childNode = createTreeNode(child)
            childrenContainer.appendChild(childNode)
        })

        nodeContainer.appendChild(childrenContainer)
    }

    return nodeContainer
}

// 创建成员卡片
function createMemberCard(member) {
    const card = document.createElement('div')
    card.className = 'member-card traditional-border'
    card.style.cssText = `
        background-color: #FFF8DC;
        padding: 15px 20px;
        min-width: 200px;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
    `

    // 第几代
    const generationDiv = document.createElement('div')
    generationDiv.style.cssText = 'font-size: 14px; color: #8B4513; margin-bottom: 5px; font-weight: bold;'
    generationDiv.textContent = `第${numberToChinese(member.generation)}代`

    // 称呼
    const titleDiv = document.createElement('div')
    titleDiv.style.cssText = 'font-size: 16px; color: #A0522D; margin-bottom: 8px;'
    titleDiv.textContent = member.title || ''

    // 名字
    const nameDiv = document.createElement('div')
    nameDiv.style.cssText = 'font-size: 20px; color: #654321; font-weight: bold; margin-bottom: 8px; letter-spacing: 2px;'
    nameDiv.textContent = member.name

    // 夫人
    if (member.wives && member.wives.length > 0) {
        const wivesDiv = document.createElement('div')
        wivesDiv.style.cssText = 'font-size: 14px; color: #8B4513; border-top: 1px dashed #D2B48C; padding-top: 8px; margin-top: 8px;'
        wivesDiv.textContent = '夫人：' + member.wives.join('、')
        card.appendChild(generationDiv)
        card.appendChild(titleDiv)
        card.appendChild(nameDiv)
        card.appendChild(wivesDiv)
    } else {
        card.appendChild(generationDiv)
        card.appendChild(titleDiv)
        card.appendChild(nameDiv)
    }

    // 悬停效果
    card.onmouseover = function() {
        this.style.backgroundColor = '#FFFACD'
        this.style.transform = 'scale(1.05)'
    }
    card.onmouseout = function() {
        this.style.backgroundColor = '#FFF8DC'
        this.style.transform = 'scale(1)'
    }

    // 长按添加子代（仅编辑模式）
    let pressTimer = null
    card.onmousedown = function(e) {
        if (!isTreeEditMode) return

        pressTimer = setTimeout(() => {
            showAddChildDialog(member)
        }, 800) // 长按800毫秒
    }

    card.onmouseup = function() {
        clearTimeout(pressTimer)
    }

    card.onmouseleave = function() {
        clearTimeout(pressTimer)
    }

    // 点击编辑（仅编辑模式）
    card.onclick = function(e) {
        if (!isTreeEditMode) return
        e.stopPropagation()
        showEditMemberDialog(member)
    }

    return card
}

// 数字转中文
function numberToChinese(num) {
    const chineseNums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
                         '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十']
    return num <= 20 ? chineseNums[num - 1] : num.toString()
}

// 切换编辑模式
function toggleTreeEdit() {
    if (isTreeEditMode) {
        exitTreeEditMode()
        return
    }

    // 验证密码
    const password = prompt('请输入编辑密码：')
    if (password !== TREE_EDIT_PASSWORD) {
        alert('密码错误！')
        return
    }

    // 进入编辑模式
    isTreeEditMode = true
    const editBtn = document.getElementById('edit-tree-btn')
    if (editBtn) {
        editBtn.textContent = '退出编辑'
        editBtn.style.backgroundColor = '#999'
    }

    alert('编辑模式已开启\n\n• 点击成员卡片可以编辑信息\n• 长按成员卡片可以添加子代\n• 右上角显示添加始祖按钮')

    // 显示添加始祖按钮
    showAddRootButton()

    // 重新渲染
    renderFamilyTree()
}

// 退出编辑模式
function exitTreeEditMode() {
    isTreeEditMode = false
    const editBtn = document.getElementById('edit-tree-btn')
    if (editBtn) {
        editBtn.textContent = '编辑'
        editBtn.style.backgroundColor = '#D2691E'
    }

    // 隐藏添加始祖按钮
    hideAddRootButton()

    renderFamilyTree()
}

// 显示添加始祖按钮
function showAddRootButton() {
    const header = document.querySelector('#tree-page .page-header')
    if (!header) return

    let addRootBtn = document.getElementById('add-root-btn')
    if (!addRootBtn) {
        addRootBtn = document.createElement('button')
        addRootBtn.id = 'add-root-btn'
        addRootBtn.className = 'edit-button'
        addRootBtn.textContent = '添加始祖'
        addRootBtn.onclick = showAddRootDialog
        header.appendChild(addRootBtn)
    }
    addRootBtn.style.display = 'inline-block'
}

// 隐藏添加始祖按钮
function hideAddRootButton() {
    const addRootBtn = document.getElementById('add-root-btn')
    if (addRootBtn) {
        addRootBtn.style.display = 'none'
    }
}

// 显示添加始祖对话框
function showAddRootDialog() {
    const name = prompt('请输入始祖姓名：')
    if (!name || !name.trim()) return

    const title = prompt('请输入对始祖的称呼（如：始祖、太祖）：', '始祖')
    if (title === null) return

    const wivesInput = prompt('请输入夫人姓名（多个用顿号或逗号分隔）：')
    const wives = wivesInput ? wivesInput.split(/[、，,]/).map(w => w.trim()).filter(w => w) : []

    addMember({
        generation: 1,
        title: title.trim() || '始祖',
        name: name.trim(),
        wives: wives,
        parentId: null
    })
}

// 显示添加子代对话框
function showAddChildDialog(parent) {
    const name = prompt(`为 ${parent.name} 添加子代\n\n请输入姓名：`)
    if (!name || !name.trim()) return

    const title = prompt('请输入称呼（如：长子、次子、长女等）：', '子')
    if (title === null) return

    const wivesInput = prompt('请输入夫人姓名（多个用顿号或逗号分隔，无则留空）：')
    const wives = wivesInput ? wivesInput.split(/[、，,]/).map(w => w.trim()).filter(w => w) : []

    addMember({
        generation: parent.generation + 1,
        title: title.trim(),
        name: name.trim(),
        wives: wives,
        parentId: parent._id
    })
}

// 显示编辑成员对话框
function showEditMemberDialog(member) {
    const action = confirm(`编辑 ${member.name}\n\n确定编辑？点击"取消"删除此成员`)

    if (action) {
        // 编辑
        const name = prompt('姓名：', member.name)
        if (!name) return

        const title = prompt('称呼：', member.title)
        if (title === null) return

        const wivesInput = prompt('夫人姓名（多个用顿号或逗号分隔）：', member.wives ? member.wives.join('、') : '')
        const wives = wivesInput ? wivesInput.split(/[、，,]/).map(w => w.trim()).filter(w => w) : []

        updateMember(member._id, {
            name: name.trim(),
            title: title.trim(),
            wives: wives
        })
    } else {
        // 删除
        if (confirm(`确认删除 ${member.name} 及其所有后代？`)) {
            deleteMember(member._id)
        }
    }
}

// 添加成员
async function addMember(memberData) {
    if (!treeCloudbaseInitialized) {
        alert('云服务未初始化')
        return
    }

    try {
        await treeCollection.add(memberData)
        alert('添加成功！')
        loadFamilyTree()
    } catch (error) {
        console.error('添加成员失败:', error)
        alert('添加失败：' + error.message)
    }
}

// 更新成员
async function updateMember(memberId, updates) {
    if (!treeCloudbaseInitialized) {
        alert('云服务未初始化')
        return
    }

    try {
        await treeCollection.doc(memberId).update(updates)
        alert('更新成功！')
        loadFamilyTree()
    } catch (error) {
        console.error('更新成员失败:', error)
        alert('更新失败：' + error.message)
    }
}

// 删除成员（级联删除所有后代）
async function deleteMember(memberId) {
    if (!treeCloudbaseInitialized) {
        alert('云服务未初始化')
        return
    }

    try {
        // 查找所有后代
        const descendants = findAllDescendants(memberId)
        const idsToDelete = [memberId, ...descendants.map(d => d._id)]

        // 删除所有相关成员
        for (const id of idsToDelete) {
            await treeCollection.doc(id).remove()
        }

        alert(`已删除 ${idsToDelete.length} 位成员`)
        loadFamilyTree()
    } catch (error) {
        console.error('删除成员失败:', error)
        alert('删除失败：' + error.message)
    }
}

// 查找所有后代
function findAllDescendants(memberId) {
    const descendants = []
    const children = familyTreeData.filter(m => m.parentId === memberId)

    children.forEach(child => {
        descendants.push(child)
        const grandChildren = findAllDescendants(child._id)
        descendants.push(...grandChildren)
    })

    return descendants
}
