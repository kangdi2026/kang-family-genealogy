// 欢聚照片管理功能

// 编辑密码
const PHOTO_UPLOAD_PASSWORD = 'kang2026'

// 状态
let isPhotoUploadMode = false
let photosCloudbaseInitialized = false
let photosCollection = null
let cloudStorage = null

// 当前选中的文件夹
let currentFolder = null

// 初始化腾讯云
document.addEventListener('DOMContentLoaded', function() {
    // 初始化腾讯云开发
    const cloudbase = initCloudBase()
    if (cloudbase) {
        photosCollection = cloudbase.db.collection('photo_folders')
        cloudStorage = cloudbase.app.uploadFile
        photosCloudbaseInitialized = true
        console.log('照片管理云数据库已连接')

        // 加载照片文件夹
        loadPhotoFolders()
    } else {
        console.log('云数据库未初始化，使用本地模式')
        displayEmptyState()
    }
})

// 显示空状态
function displayEmptyState() {
    const gallery = document.getElementById('photo-gallery')
    if (!gallery) return

    gallery.innerHTML = `
        <div class="photo-empty">
            <p class="photo-empty-text">暂无照片</p>
            <p class="photo-empty-hint">点击右上角"上传照片"开始添加家族照片</p>
        </div>
    `
}

// 加载照片文件夹
async function loadPhotoFolders() {
    if (!photosCloudbaseInitialized) {
        displayEmptyState()
        return
    }

    try {
        const res = await photosCollection.where({
            type: 'folder'
        }).orderBy('createTime', 'desc').get()

        const foldersContainer = document.getElementById('photo-folders')
        if (!foldersContainer) return

        foldersContainer.innerHTML = ''

        if (res.data && res.data.length > 0) {
            res.data.forEach((folder, index) => {
                const folderDiv = document.createElement('div')
                folderDiv.className = 'folder-item'
                if (index === 0 && !currentFolder) {
                    folderDiv.classList.add('active')
                    currentFolder = folder._id
                }
                folderDiv.textContent = folder.name
                folderDiv.onclick = () => selectFolder(folder._id, folder.name)
                foldersContainer.appendChild(folderDiv)
            })

            // 加载第一个文件夹的照片
            if (res.data.length > 0 && !currentFolder) {
                loadPhotosInFolder(res.data[0]._id)
            } else if (currentFolder) {
                loadPhotosInFolder(currentFolder)
            }

            // 更新上传区域的文件夹选择下拉框
            updateFolderSelect(res.data)
        } else {
            displayEmptyState()
        }

        console.log('照片文件夹已加载')
    } catch (error) {
        console.error('加载照片文件夹失败:', error)
        displayEmptyState()
    }
}

// 选择文件夹
function selectFolder(folderId, folderName) {
    currentFolder = folderId

    // 更新文件夹按钮状态
    const folderItems = document.querySelectorAll('.folder-item')
    folderItems.forEach(item => {
        item.classList.remove('active')
        if (item.textContent === folderName) {
            item.classList.add('active')
        }
    })

    // 加载该文件夹的照片
    loadPhotosInFolder(folderId)
}

// 加载文件夹内的照片
async function loadPhotosInFolder(folderId) {
    if (!photosCloudbaseInitialized) return

    try {
        const res = await photosCollection.where({
            type: 'photo',
            folderId: folderId
        }).orderBy('uploadTime', 'desc').get()

        const gallery = document.getElementById('photo-gallery')
        if (!gallery) return

        gallery.innerHTML = ''

        if (res.data && res.data.length > 0) {
            res.data.forEach(photo => {
                const photoDiv = document.createElement('div')
                photoDiv.className = 'photo-item'
                photoDiv.onclick = () => viewPhotoDetail(photo)

                const img = document.createElement('img')
                img.src = photo.url
                img.alt = photo.name || '家族照片'

                const infoDiv = document.createElement('div')
                infoDiv.className = 'photo-info'

                const nameDiv = document.createElement('div')
                nameDiv.className = 'photo-name'
                nameDiv.textContent = photo.name || '未命名'

                const dateDiv = document.createElement('div')
                dateDiv.className = 'photo-date'
                dateDiv.textContent = formatDate(photo.uploadTime)

                infoDiv.appendChild(nameDiv)
                infoDiv.appendChild(dateDiv)

                photoDiv.appendChild(img)
                photoDiv.appendChild(infoDiv)

                gallery.appendChild(photoDiv)
            })
        } else {
            gallery.innerHTML = `
                <div class="photo-empty">
                    <p class="photo-empty-text">该文件夹暂无照片</p>
                    <p class="photo-empty-hint">上传照片到此文件夹</p>
                </div>
            `
        }
    } catch (error) {
        console.error('加载照片失败:', error)
    }
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 查看照片详情（可以扩展为弹窗显示大图）
function viewPhotoDetail(photo) {
    // 简单实现：在新标签页打开图片
    window.open(photo.url, '_blank')
}

// 切换上传照片模式
function togglePhotoUpload() {
    if (isPhotoUploadMode) {
        cancelPhotoUpload()
        return
    }

    // 验证密码
    const password = prompt('请输入上传密码：')
    if (password !== PHOTO_UPLOAD_PASSWORD) {
        alert('密码错误！')
        return
    }

    // 进入上传模式
    isPhotoUploadMode = true
    document.getElementById('photo-upload-area').style.display = 'block'
    document.getElementById('upload-photo-btn').textContent = '取消上传'
    document.getElementById('upload-photo-btn').style.backgroundColor = '#999'

    // 加载文件夹列表到选择框
    loadFolderSelectOptions()
}

// 加载文件夹选择选项
async function loadFolderSelectOptions() {
    if (!photosCloudbaseInitialized) return

    try {
        const res = await photosCollection.where({
            type: 'folder'
        }).get()

        updateFolderSelect(res.data || [])
    } catch (error) {
        console.error('加载文件夹选项失败:', error)
    }
}

// 更新文件夹选择下拉框
function updateFolderSelect(folders) {
    const select = document.getElementById('folder-select')
    if (!select) return

    // 保留第一个默认选项
    select.innerHTML = '<option value="">请选择文件夹</option>'

    folders.forEach(folder => {
        const option = document.createElement('option')
        option.value = folder._id
        option.textContent = folder.name
        select.appendChild(option)
    })
}

// 取消上传
function cancelPhotoUpload() {
    isPhotoUploadMode = false
    document.getElementById('photo-upload-area').style.display = 'none'
    document.getElementById('upload-photo-btn').textContent = '上传照片'
    document.getElementById('upload-photo-btn').style.backgroundColor = '#D2691E'

    // 清空输入
    document.getElementById('folder-name-input').value = ''
    document.getElementById('photo-file-input').value = ''
    document.getElementById('folder-select').value = ''
}

// 创建新文件夹
async function createFolder() {
    const folderName = document.getElementById('folder-name-input').value.trim()

    if (!folderName) {
        alert('请输入文件夹名称！')
        return
    }

    if (!photosCloudbaseInitialized) {
        alert('云服务未初始化，无法创建文件夹')
        return
    }

    try {
        // 检查是否已存在同名文件夹
        const checkRes = await photosCollection.where({
            type: 'folder',
            name: folderName
        }).get()

        if (checkRes.data && checkRes.data.length > 0) {
            alert('该文件夹名称已存在！')
            return
        }

        // 创建文件夹
        const folderData = {
            type: 'folder',
            name: folderName,
            createTime: new Date().toISOString()
        }

        await photosCollection.add(folderData)

        alert('文件夹创建成功！')

        // 清空输入
        document.getElementById('folder-name-input').value = ''

        // 重新加载文件夹列表
        loadPhotoFolders()
        loadFolderSelectOptions()
    } catch (error) {
        console.error('创建文件夹失败:', error)
        alert('创建文件夹失败：' + error.message)
    }
}

// 上传照片
async function uploadPhotos() {
    const folderSelect = document.getElementById('folder-select')
    const folderId = folderSelect.value
    const folderName = folderSelect.options[folderSelect.selectedIndex].text

    const fileInput = document.getElementById('photo-file-input')
    const files = fileInput.files

    if (!folderId) {
        alert('请选择文件夹！')
        return
    }

    if (!files || files.length === 0) {
        alert('请选择要上传的照片！')
        return
    }

    if (!photosCloudbaseInitialized) {
        alert('云服务未初始化，无法上传照片')
        return
    }

    // 显示上传中
    const uploadBtn = document.querySelector('#photo-upload-area .save-button')
    const originalText = uploadBtn.textContent
    uploadBtn.textContent = `上传中 (0/${files.length})...`
    uploadBtn.disabled = true

    try {
        let successCount = 0

        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            // 生成唯一文件名
            const timestamp = Date.now()
            const randomStr = Math.random().toString(36).substring(2, 8)
            const ext = file.name.substring(file.name.lastIndexOf('.'))
            const cloudPath = `photos/${folderId}/${timestamp}_${randomStr}${ext}`

            try {
                // 上传文件到云存储
                const uploadResult = await cloudStorage({
                    cloudPath: cloudPath,
                    filePath: file
                })

                // 保存照片记录到数据库
                const photoData = {
                    type: 'photo',
                    folderId: folderId,
                    folderName: folderName,
                    name: file.name,
                    url: uploadResult.fileID,
                    cloudPath: cloudPath,
                    uploadTime: new Date().toISOString()
                }

                await photosCollection.add(photoData)

                successCount++
                uploadBtn.textContent = `上传中 (${successCount}/${files.length})...`
            } catch (error) {
                console.error(`上传照片 ${file.name} 失败:`, error)
            }
        }

        alert(`成功上传 ${successCount} 张照片！`)

        // 清空文件选择
        fileInput.value = ''

        // 重新加载照片
        if (currentFolder === folderId) {
            loadPhotosInFolder(folderId)
        }

        // 退出上传模式
        cancelPhotoUpload()
    } catch (error) {
        console.error('上传照片失败:', error)
        alert('上传照片失败：' + error.message)
    } finally {
        uploadBtn.textContent = originalText
        uploadBtn.disabled = false
    }
}
