<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
       v-model="listQuery.title"
       clearable
       placeholder="书名"
       style="width: 200px"
       class="filter-item" 
       @keyup.enter.native="handleFilter"
       @blur="handleFilter"
       />
       <el-input
       v-model="listQuery.author"
       clearable
       placeholder="作者"
       style="width: 200px;margin-left: 5px;"
       class="filter-item" 
       @keyup.enter.native="handleFilter"
       @blur="handleFilter"
       />
       <el-select 
       v-model="listQuery.category"
       clearable
       placeholder="分类"
       class="filter-item"
       style="margin-left: 5px"
       @change="handleFilter"
       >
        <el-option 
        v-for="item in categoryList" 
        :key="item.value" 
        :value="item.label" 
        :label="item.label + `(${item.num})`">
        </el-option>
      </el-select>

      <el-button
       class="filter-item"
       v-waves
       style="margin-left: 10px"
       type="primary"
       icon="el-icon-search"
       @click="handleFilter"
      >
        查询
      </el-button>

      <el-button
       class="filter-item"
       style="margin-left: 5px"
       type="primary"
       icon="el-icon-edit"
       @click="handleCreate"
      >
        添加
      </el-button>

      <el-checkbox
      v-model="showCover"
      style="margin-left: 5px"
      @change="changeShowCover"
      >展示图片
      </el-checkbox>

      <!-- 电子书列表 -->
      <el-table
      :data="list"
      :key="tableKey"
      :default-sort="defaultSort"
      border
      fit
      highlight-current-row
      v-loading="listLoading"
      style="width: 100%"
      @sort-change="sortChange"
      >
      <!-- id -->
       <el-table-column 
       prop="id" 
       label="ID"
       sortable="custom"
       align="center"
       width="80"
       ></el-table-column>
       <!-- 书名 -->
       <el-table-column label="书名" width="150" align="center"> 
        <template slot-scope="{row:{ titleWrapper }}">
          <span v-html="titleWrapper" />
        </template>
       </el-table-column>
        <!-- 作者 -->
        <el-table-column label="作者" width="150" align="center">
          <template slot-scope="{row:{ authorWrapper }}">
          <span v-html="authorWrapper" />
          </template>
        </el-table-column>
      <el-table-column  label="出版社" prop="publisher" width="150" align="center" />
      <el-table-column label="分类" prop="categoryText" width="100" align="center" />
      <el-table-column label="语言" prop="language"  align="center" />
      <el-table-column v-if='showCover' label="封面图片" width="150" >
        <template slot-scope="scope">
         <a :href="scope.row.cover" target="_blank">
          <img :src="scope.row.cover"
            style="width: 120px; height:180px" />
         </a>
        </template>
      </el-table-column>
      <el-table-column label="文件名" prop="fileName" width="100" align="center" />
      <el-table-column label="文件路径" prop="filePath" width="100" align="center" >
        <template slot-scope="{ row: { filePath }}">
          <span>{{ filePath | valueFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="封面路径" prop="coverPath" width="100" align="center" >
        <template slot-scope="{ row: { coverPath }}">
          <span>{{ coverPath | valueFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="解压路径" prop="unzipPath" width="100" align="center">
        <template slot-scope="{ row: { unzipPath }}">
          <span>{{ unzipPath | valueFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上传人" prop="createUser" width="100" align="center" >
        <template slot-scope="{ row: { createUser }}">
          <span>{{ createUser | valueFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上传时间" prop="createDt" width="100" align="center" >
         <template slot-scope="{ row: { createDt }}">
          <span>{{ createDt | timeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center" >
        <template slot-scope="{row}">
         <el-button type="text" icon="el-icon-edit" @click="handleUpdate(row)"></el-button>
         <el-button type="text" icon="el-icon-delete" style="color:#f56c6c " @click="handleDelete(row)"></el-button>
        </template>
       </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
      v-show="total > 0"
      :total="total"
      :page.sync = 'listQuery.page'
      :limit.sync = 'listQuery.pageSize'
      @pagination = 'refresh'
      />
    </div>
  </div>
</template>

<script>
//按钮点击样式
import waves from '@/directive/waves'
import pagination from '@/components/Pagination'
import { getCategory, listBook, deleteBook } from '@/api/book'
import { parseTime } from '@/utils'
export default {
  name:'list',
  directives: { waves },
  filters: {
    valueFilter(value) {
       return value || '无'
    },
    timeFilter(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}') : '无'
    }
  },
  components: { pagination },
  data() {
    return {
      // 查询参数
      listQuery:{},
      // 分类列表
      categoryList:[],
      // 展示封面
      showCover: true,
      tableKey: 0,
      listLoading: true,
      // 电子书列表
      list: [],
      total: 0,
      defaultSort:{}
    }
  },
  created() {
    this.parseQuery()
  },
  mounted() {
   this.getCategoryList()
   this.getList()
  },
  // 路由发生变化要发起请求更新列表
  beforeRouteUpdate(to, from, next) {
    if(to.path === from.path) {
      const newQuery = Object.assign({}, to.query)
      const oldQuery = Object.assign({},from.query)
      if(JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
        this.getList()
      }
    }
    next()
  },
  methods: {
    // 初始化listQuery
    parseQuery() {
      //刷新查询条件保存
      const query = Object.assign({}, this.$route.query)
      let sort = '+id'
      const listQuery ={
        page: 1 ,//页数
        pageSize:20 ,//每页显示数目
        sort
      }
      if(query) {
         query.page && (query.page = +query.page)
         query.pageSize && (query.pageSize = +query.pageSize)
         query.sort && (sort = query.sort)
      }
      const sortSymbol = sort[0]
      const sortColumn = sort.slice(1,sort.length)
      this.defaultSort = {
        prop:sortColumn,
        order: sortSymbol === '+' ? 'ascending' : 'descending'
      }
      this.listQuery = {...listQuery, ...query}
    },
    // 获取电子书列表
    getList() {
      this.listLoading = true
      listBook(this.listQuery).then(response => {
        const {list, count} =response.data
        this.list = list
        this.total = count
        this.listLoading = false
        this.list.forEach(book => {
          book.titleWrapper = this.wrapperKeyword('title', book.title)
          book.authorWrapper = this.wrapperKeyword('author', book.author)
        })
      })
    },
    //发送请求获取分类
    getCategoryList() {
      getCategory().then(response => {
        // console.log(response);
        this.categoryList = response.data
      })
    },
    //输入框按enter或者失去焦点时触发,点击查询按钮
    handleFilter() {
      console.log('handelFilter',this.listQuery);
      // this.getList()
      this.listQuery.page = 1
      this.refresh()
    },
    refresh() {
      this.$router.push({
        path:'/book/list',
        query:this.listQuery
      })
    },
    // 点击添加按钮触发
    handleCreate() {
      this.$router.push('/book/create')
    },
    // 展示封面
    changeShowCover(value) {
      this.showCover = value
    },
    // 排序发生变化触发
    sortChange(data) {
      console.log('sortChange',data);
      const {prop, order} = data
      this.sortBy(prop, order)
    },
    // 排序功能,传递参数
    sortBy(prop,order) {
      if(order === 'ascending') {
        this.listQuery.sort = `+${prop}`
      } else {
        this.listQuery.sort = `-${prop}`
      }
      this.handleFilter()
    },
    // 点击每一行的编辑按钮触发
    handleUpdate(row) {
      //  console.log('handleUpdate',row);
       this.$router.push(`/book/edit/${row.fileName}`)
    },
    // 点击每一行的删除按钮触发
    handleDelete(row) {
      this.$confirm('此操作将永久删除电子书，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBook(row.fileName).then((response) => {
          this.$notify({
            title:'成功',
            message: response.msg || '删除成功',
            type: 'success'
          })
          this.getList()
        })
      })
    },
    // 模糊查询关键字高亮
    wrapperKeyword(k, v) {
      function highLight(value) {
        return `<span style="color: #1890ff">${value}</span>`
      }
      if(!this.listQuery[k]) {
        return v
      } else {
        //利用正则表达式匹配到需要高亮的部分，用highLight函数返回的span替换 i表示不区分大小写，g表示全局查询
        return v.replace(new RegExp(this.listQuery[k],'ig'),v => highLight(v))
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>

