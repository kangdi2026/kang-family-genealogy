// 主应用逻辑

// 全局变量
let currentPage = 'home'
let searchResults = []

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 设置当前年份
    const currentYear = new Date().getFullYear()
    document.getElementById('current-year').textContent = currentYear

    // 设置家族介绍页面的年份
    const introYear = document.getElementById('intro-year')
    if (introYear) {
        introYear.textContent = currentYear
    }

    // 初始化首页
    showPage('home')
})

// 页面切换函数
function showPage(pageName) {
    // 隐藏所有页面
    const pages = document.querySelectorAll('.page')
    pages.forEach(page => page.classList.remove('active'))

    // 显示目标页面
    const targetPage = document.getElementById(pageName + '-page')
    if (targetPage) {
        targetPage.classList.add('active')
        currentPage = pageName

        // 根据页面执行特定初始化
        if (pageName === 'tree') {
            loadFamilyTree()
        } else if (pageName === 'search') {
            document.getElementById('search-input').focus()
        }
    }
}

// 加载族谱树
function loadFamilyTree() {
    const treeContent = document.getElementById('tree-content')

    if (!familyData.members || familyData.members.length === 0) {
        treeContent.innerHTML = `
            <div class="waiting-data">
                <p class="waiting-text">请提供家族成员信息</p>
                <p class="waiting-hint">以便生成完整的家族树状图</p>
            </div>
        `
        return
    }

    // 按世代分组
    const generationGroups = {}
    familyData.members.forEach(member => {
        if (!generationGroups[member.generation]) {
            generationGroups[member.generation] = []
        }
        generationGroups[member.generation].push(member)
    })

    // 生成树状图HTML
    let html = '<div class="tree-structure">'

    Object.keys(generationGroups).sort((a, b) => a - b).forEach(gen => {
        html += `<div class="generation-group">`
        html += `<div class="generation-label">第 ${gen} 代</div>`
        html += `<div class="generation-members">`

        generationGroups[gen].forEach(member => {
            html += generateMemberNode(member)
        })

        html += `</div></div>`
    })

    html += '</div>'
    treeContent.innerHTML = html
}

// 生成成员节点
function generateMemberNode(member) {
    const photo = member.photo || 'images/default-avatar.png'
    const deathYear = member.deathDate ? `-${extractYear(member.deathDate)}` : ''
    const birthYear = extractYear(member.birthDate) || '?'

    return `
        <div class="member-node traditional-border" onclick="viewMemberDetail(${member.id})">
            <img class="member-photo" src="${photo}" alt="${member.name}" onerror="this.src='images/default-avatar.png'">
            <div class="member-info">
                <div class="member-name">${member.name}</div>
                <div class="member-years">${birthYear}${deathYear}</div>
                ${member.spouse ? `<div class="member-spouse">配偶：${member.spouse}</div>` : ''}
            </div>
        </div>
    `
}

// 提取年份
function extractYear(dateString) {
    if (!dateString) return ''
    const match = dateString.match(/(\d{4})/)
    return match ? match[1] : ''
}

// 搜索功能
function performSearch() {
    const keyword = document.getElementById('search-input').value.trim()

    if (!keyword) {
        alert('请输入搜索内容')
        return
    }

    if (!familyData.members || familyData.members.length === 0) {
        showSearchResults([])
        return
    }

    // 执行搜索
    searchResults = familyData.members.filter(member => {
        return member.name.includes(keyword) ||
               member.generation.toString().includes(keyword) ||
               (member.spouse && member.spouse.includes(keyword)) ||
               (member.birthPlace && member.birthPlace.includes(keyword))
    })

    showSearchResults(searchResults)
}

// 显示搜索结果
function showSearchResults(results) {
    const resultsContainer = document.getElementById('search-results')

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="waiting-data">
                <p class="waiting-text">未找到相关成员</p>
                <p class="waiting-hint">请尝试其他关键词</p>
            </div>
        `
        return
    }

    let html = `<div class="result-count">找到 ${results.length} 位成员</div>`
    html += '<div class="result-list">'

    results.forEach(member => {
        const birthYear = extractYear(member.birthDate) || '?'
        html += `
            <div class="result-item" onclick="viewMemberDetail(${member.id})">
                <div class="result-info">
                    <div class="result-name">${member.name}</div>
                    <div class="result-details">
                        <span class="result-gen">第${member.generation}代</span>
                        <span class="result-year">${birthYear}年</span>
                        ${member.spouse ? `<span class="result-spouse">配偶：${member.spouse}</span>` : ''}
                    </div>
                </div>
                <div class="result-arrow">→</div>
            </div>
        `
    })

    html += '</div>'
    resultsContainer.innerHTML = html
}

// 清空搜索
function clearSearch() {
    document.getElementById('search-input').value = ''
    document.getElementById('search-results').innerHTML = ''
    searchResults = []
}

// 搜索框回车事件
function handleSearchEnter(event) {
    if (event.key === 'Enter') {
        performSearch()
    }
}

// 查看成员详情
function viewMemberDetail(memberId) {
    const member = familyData.members.find(m => m.id === memberId)

    if (!member) {
        alert('未找到该成员信息')
        return
    }

    // 构建详情HTML
    const photo = member.photo || 'images/default-avatar.png'
    let html = `
        <div class="member-card traditional-border">
            <img class="member-photo-large" src="${photo}" alt="${member.name}" onerror="this.src='images/default-avatar.png'">
            <div class="member-name-large">${member.name}</div>
            <div class="member-generation">第 ${member.generation} 代</div>

            <div class="detail-card">
                <div class="detail-title">基本信息</div>
                <div class="detail-row">
                    <span class="detail-label">性别：</span>
                    <span class="detail-value">${member.gender || '未知'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">生辰：</span>
                    <span class="detail-value">${member.birthDate || '未知'}</span>
                </div>
                ${member.deathDate ? `
                <div class="detail-row">
                    <span class="detail-label">忌辰：</span>
                    <span class="detail-value">${member.deathDate}</span>
                </div>` : ''}
                ${member.birthPlace ? `
                <div class="detail-row">
                    <span class="detail-label">籍贯：</span>
                    <span class="detail-value">${member.birthPlace}</span>
                </div>` : ''}
                ${member.spouse ? `
                <div class="detail-row">
                    <span class="detail-label">配偶：</span>
                    <span class="detail-value">${member.spouse}</span>
                </div>` : ''}
            </div>
    `

    // 家庭关系
    if ((member.parents && member.parents.length > 0) || (member.children && member.children.length > 0)) {
        html += `<div class="detail-card">
            <div class="detail-title">家庭关系</div>`

        if (member.parents && member.parents.length > 0) {
            const parentNames = member.parents.map(pid => {
                const parent = familyData.members.find(m => m.id === pid)
                return parent ? parent.name : '未知'
            })
            html += `
                <div class="detail-row">
                    <span class="detail-label">父母：</span>
                    <span class="detail-value">${parentNames.join('、')}</span>
                </div>`
        }

        if (member.children && member.children.length > 0) {
            const childrenNames = member.children.map(cid => {
                const child = familyData.members.find(m => m.id === cid)
                return child ? child.name : '未知'
            })
            html += `
                <div class="detail-row">
                    <span class="detail-label">子女：</span>
                    <span class="detail-value">${childrenNames.join('、')}</span>
                </div>`
        }

        html += `</div>`
    }

    // 生平简介
    if (member.bio) {
        html += `
            <div class="detail-card">
                <div class="detail-title">生平简介</div>
                <p class="bio-text">${member.bio}</p>
            </div>
        `
    }

    html += `</div>`

    // 显示详情页面
    document.getElementById('member-detail').innerHTML = html
    showPage('member')
}

// 历史记录管理
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.page) {
        showPage(event.state.page)
    }
})
